require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const documentRoutes = require('./routes/documents');
const notificationRoutes = require('./routes/notifications');

const app = express();
const server = http.createServer(app);

// Socket.io setup
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Make io accessible in routes
app.set('io', io);

// Middleware
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static file serving for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/documents', documentRoutes);
app.use('/api/notifications', notificationRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Socket.io connection handler
io.on('connection', (socket) => {
  console.log(`[Socket] Client connected: ${socket.id}`);

  socket.on('disconnect', () => {
    console.log(`[Socket] Client disconnected: ${socket.id}`);
  });
});

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI || 'mongodb://localhost:27017/docvault')
  .then(() => {
    console.log('[DB] MongoDB connected');
    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => {
      console.log(`[Server] Running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('[DB] MongoDB connection error:', err.message);
    process.exit(1);
  });

// Global error handler
app.use((err, req, res, next) => {
  console.error('[Error]', err.message);
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ success: false, message: 'File too large. Max 50MB per file.' });
  }
  res.status(500).json({ success: false, message: err.message || 'Internal server error' });
});
