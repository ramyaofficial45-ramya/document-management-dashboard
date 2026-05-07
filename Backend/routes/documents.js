const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const Document = require('../models/Document');
const Notification = require('../models/Notification');
const upload = require('../middleware/upload');

// GET all documents
router.get('/', async (req, res) => {
  try {
    const documents = await Document.find({ status: 'complete' }).sort({ createdAt: -1 });
    res.json({ success: true, data: documents });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST upload files (single or bulk)
router.post('/upload', upload.array('files', 20), async (req, res) => {
  const io = req.app.get('io');

  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ success: false, message: 'No files uploaded' });
  }

  const files = req.files;
  const fileCount = files.length;
  const isBulk = fileCount > 3;
  const batchId = uuidv4();

  try {
    // Save document metadata to MongoDB
    const savedDocs = await Promise.all(
      files.map((file) =>
        Document.create({
          name: file.filename,
          originalName: file.originalname,
          size: file.size,
          mimeType: file.mimetype,
          path: file.path,
          status: 'complete',
          uploadBatchId: batchId,
        })
      )
    );

    // If bulk upload (>3 files), send real-time notification
    if (isBulk) {
      const notification = await Notification.create({
        message: `${fileCount} files uploaded successfully`,
        type: 'success',
        batchId,
        metadata: {
          fileCount,
          files: savedDocs.map((d) => ({ id: d._id, name: d.originalName })),
          timestamp: new Date().toISOString(),
        },
      });

      // Emit via Socket.io
      io.emit('notification:new', {
        _id: notification._id,
        message: notification.message,
        type: notification.type,
        read: notification.read,
        createdAt: notification.createdAt,
        metadata: notification.metadata,
      });

      io.emit('upload:bulk-complete', {
        batchId,
        fileCount,
        files: savedDocs,
        timestamp: new Date().toISOString(),
      });
    } else {
      // For small uploads, also emit a completion event
      io.emit('upload:complete', {
        batchId,
        files: savedDocs,
      });
    }

    res.json({
      success: true,
      isBulk,
      batchId,
      fileCount,
      data: savedDocs,
    });
  } catch (err) {
    // Create error notification
    try {
      const errNotif = await Notification.create({
        message: `Upload failed: ${err.message}`,
        type: 'error',
        metadata: { error: err.message },
      });
      io.emit('notification:new', errNotif);
    } catch (_) {}

    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE a document
router.delete('/:id', async (req, res) => {
  try {
    const doc = await Document.findById(req.params.id);
    if (!doc) return res.status(404).json({ success: false, message: 'Document not found' });

    // Remove file from disk
    if (fs.existsSync(doc.path)) {
      fs.unlinkSync(doc.path);
    }

    await doc.deleteOne();
    res.json({ success: true, message: 'Document deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET download a document
router.get('/download/:id', async (req, res) => {
  try {
    const doc = await Document.findById(req.params.id);
    if (!doc) return res.status(404).json({ success: false, message: 'Document not found' });

    if (!fs.existsSync(doc.path)) {
      return res.status(404).json({ success: false, message: 'File not found on disk' });
    }

    res.download(doc.path, doc.originalName);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
