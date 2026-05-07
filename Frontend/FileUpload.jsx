import React, { useState, useRef, useCallback } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { formatBytes } from '../utils/format';

const BULK_THRESHOLD = 3;

function FileItem({ file, progress, status }) {
  const statusConfig = {
    pending: { label: 'Pending', color: 'text-slate-400', barColor: 'bg-slate-300' },
    uploading: { label: 'Uploading…', color: 'text-blue-600', barColor: 'bg-blue-500' },
    complete: { label: 'Complete', color: 'text-emerald-600', barColor: 'bg-emerald-500' },
    failed: { label: 'Failed', color: 'text-red-500', barColor: 'bg-red-400' },
  };

  const cfg = statusConfig[status] || statusConfig.pending;

  return (
    <div className={`flex items-center gap-3 p-3 rounded-xl border transition-all duration-200 ${
      status === 'complete' ? 'bg-emerald-50 border-emerald-200' :
      status === 'failed' ? 'bg-red-50 border-red-200' :
      status === 'uploading' ? 'bg-blue-50 border-blue-200' :
      'bg-slate-50 border-slate-200'
    }`}>
      {/* PDF Icon */}
      <div className="w-9 h-9 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
        <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
        </svg>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-1">
          <p className="text-sm font-semibold text-slate-800 truncate">{file.name}</p>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-xs text-slate-400">{formatBytes(file.size)}</span>
            <span className={`text-xs font-semibold ${cfg.color}`}>{cfg.label}</span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="progress-bar-track">
          <div
            className={`h-full rounded-full transition-all duration-300 ease-out ${
              status === 'complete' ? 'bg-emerald-500' :
              status === 'failed' ? 'bg-red-400' :
              'bg-gradient-to-r from-blue-500 to-blue-400'
            } ${status === 'uploading' ? 'animate-progress-pulse' : ''}`}
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex items-center justify-between mt-1">
          <span className="text-xs text-slate-400">PDF</span>
          <span className="text-xs font-medium text-slate-500">{progress}%</span>
        </div>
      </div>

      {/* Status icon */}
      <div className="flex-shrink-0">
        {status === 'complete' && (
          <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
            <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )}
        {status === 'failed' && (
          <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
            <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        )}
        {status === 'uploading' && (
          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        )}
      </div>
    </div>
  );
}

export default function FileUpload({ onUploadComplete }) {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [fileStates, setFileStates] = useState({});
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const inputRef = useRef(null);

  const handleFiles = useCallback((files) => {
    const pdfs = Array.from(files).filter((f) => f.type === 'application/pdf');
    if (pdfs.length === 0) {
      toast.error('Only PDF files are allowed');
      return;
    }
    if (pdfs.length < files.length) {
      toast('Some non-PDF files were ignored', { icon: '⚠️' });
    }
    setSelectedFiles(pdfs);
    const states = {};
    pdfs.forEach((f) => {
      states[f.name + f.size] = { progress: 0, status: 'pending' };
    });
    setFileStates(states);
    setCollapsed(false);
  }, []);

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      setDragOver(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    const isBulk = selectedFiles.length > BULK_THRESHOLD;
    setUploading(true);

    if (isBulk) {
      toast(
        `Upload in progress — processing ${selectedFiles.length} files in background`,
        {
          icon: '⏳',
          duration: 5000,
          style: { fontFamily: 'Livvic, sans-serif', fontWeight: '600' },
        }
      );
      setCollapsed(true);
    }

    // Mark all as uploading
    setFileStates((prev) => {
      const next = { ...prev };
      selectedFiles.forEach((f) => {
        next[f.name + f.size] = { progress: 0, status: 'uploading' };
      });
      return next;
    });

    const formData = new FormData();
    selectedFiles.forEach((f) => formData.append('files', f));

    try {
      await axios.post('/api/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (event) => {
          const pct = Math.round((event.loaded * 100) / event.total);
          setFileStates((prev) => {
            const next = { ...prev };
            selectedFiles.forEach((f) => {
              next[f.name + f.size] = { progress: pct, status: pct < 100 ? 'uploading' : 'complete' };
            });
            return next;
          });
        },
      });

      // Mark all as complete
      setFileStates((prev) => {
        const next = { ...prev };
        selectedFiles.forEach((f) => {
          next[f.name + f.size] = { progress: 100, status: 'complete' };
        });
        return next;
      });

      if (!isBulk) {
        toast.success(
          `${selectedFiles.length} file${selectedFiles.length > 1 ? 's' : ''} uploaded successfully!`
        );
      }

      if (onUploadComplete) onUploadComplete();

      // Reset after a short delay
      setTimeout(() => {
        setSelectedFiles([]);
        setFileStates({});
        setCollapsed(false);
      }, 3000);
    } catch (err) {
      setFileStates((prev) => {
        const next = { ...prev };
        selectedFiles.forEach((f) => {
          next[f.name + f.size] = { progress: 0, status: 'failed' };
        });
        return next;
      });
      toast.error(err.response?.data?.message || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const removeFile = (file) => {
    setSelectedFiles((prev) => prev.filter((f) => f !== file));
    setFileStates((prev) => {
      const next = { ...prev };
      delete next[file.name + file.size];
      return next;
    });
  };

  const clearAll = () => {
    setSelectedFiles([]);
    setFileStates({});
  };

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <div
        className={`drop-zone border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200 ${
          dragOver
            ? 'border-blue-500 bg-blue-50 drag-over'
            : selectedFiles.length > 0
            ? 'border-blue-300 bg-blue-50/30'
            : 'border-slate-200 bg-slate-50 hover:border-blue-300 hover:bg-blue-50/20'
        }`}
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onClick={() => !uploading && inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept=".pdf,application/pdf"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
          disabled={uploading}
        />

        <div className="flex flex-col items-center gap-3">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${
            dragOver ? 'bg-blue-200' : 'bg-blue-100'
          }`}>
            <svg className={`w-7 h-7 transition-colors ${dragOver ? 'text-blue-700' : 'text-blue-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          <div>
            <p className="text-base font-bold text-slate-700">
              {dragOver ? 'Drop files here' : 'Drag & drop PDF files'}
            </p>
            <p className="text-sm text-slate-400 mt-0.5">
              or <span className="text-blue-600 font-semibold">browse files</span> — PDF only, up to 50MB each
            </p>
          </div>

          {selectedFiles.length > 0 && (
            <div className="flex items-center gap-2 mt-1">
              <span className="badge badge-info">{selectedFiles.length} file{selectedFiles.length !== 1 ? 's' : ''} selected</span>
              {selectedFiles.length > BULK_THRESHOLD && (
                <span className="badge bg-amber-100 text-amber-700">Bulk upload</span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* File List */}
      {selectedFiles.length > 0 && (
        <div className="card p-4 space-y-3">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-800 text-sm">
                {selectedFiles.length} file{selectedFiles.length !== 1 ? 's' : ''} selected
              </h3>
              {selectedFiles.length > BULK_THRESHOLD && (
                <span className="badge bg-amber-100 text-amber-700 text-xs">Background processing</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {selectedFiles.length > BULK_THRESHOLD && (
                <button
                  onClick={() => setCollapsed((c) => !c)}
                  className="btn-ghost text-xs"
                >
                  {collapsed ? 'Expand' : 'Collapse'}
                </button>
              )}
              {!uploading && (
                <button onClick={clearAll} className="btn-ghost text-xs text-red-400 hover:text-red-600 hover:bg-red-50">
                  Clear all
                </button>
              )}
            </div>
          </div>

          {/* Files */}
          {!collapsed && (
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {selectedFiles.map((file) => {
                const key = file.name + file.size;
                const state = fileStates[key] || { progress: 0, status: 'pending' };
                return (
                  <div key={key} className="relative group">
                    <FileItem file={file} progress={state.progress} status={state.status} />
                    {!uploading && state.status === 'pending' && (
                      <button
                        onClick={() => removeFile(file)}
                        className="absolute top-2 right-10 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-100 rounded-lg"
                      >
                        <svg className="w-3 h-3 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {collapsed && (
            <div className="text-center py-2">
              <p className="text-sm text-slate-400">
                {selectedFiles.filter((f) => fileStates[f.name + f.size]?.status === 'complete').length}
                {' '}/ {selectedFiles.length} files processing…
              </p>
            </div>
          )}

          {/* Upload Button */}
          <button
            onClick={handleUpload}
            disabled={uploading || selectedFiles.length === 0}
            className="btn-primary w-full justify-center"
          >
            {uploading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Uploading {selectedFiles.length} file{selectedFiles.length !== 1 ? 's' : ''}…
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                Upload {selectedFiles.length} File{selectedFiles.length !== 1 ? 's' : ''}
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
