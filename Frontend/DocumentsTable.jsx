import React, { useState } from 'react';
import { formatBytes, formatDate, formatDateTime } from '../utils/format';
import toast from 'react-hot-toast';

function SkeletonRow() {
  return (
    <tr>
      {[1, 2, 3, 4, 5].map((i) => (
        <td key={i} className="px-5 py-4">
          <div className="h-4 skeleton rounded-md" style={{ width: `${60 + i * 10}%` }} />
        </td>
      ))}
    </tr>
  );
}

export default function DocumentsTable({ documents, loading, onDelete }) {
  const [deletingId, setDeletingId] = useState(null);
  const [search, setSearch] = useState('');

  const filtered = documents.filter((d) =>
    d.originalName?.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (doc) => {
    if (!window.confirm(`Delete "${doc.originalName}"?`)) return;
    setDeletingId(doc._id);
    try {
      await onDelete(doc._id);
      toast.success('Document deleted');
    } catch (err) {
      toast.error(err.message || 'Delete failed');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="card overflow-hidden">
      {/* Table header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4 border-b border-slate-100">
        <div>
          <h2 className="font-bold text-slate-900">All Documents</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {loading ? 'Loading…' : `${filtered.length} document${filtered.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search documents…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-9 text-sm py-2 w-full sm:w-56"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50/70 border-b border-slate-100">
              <th className="text-left px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wide">Document</th>
              <th className="text-left px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wide hidden sm:table-cell">Size</th>
              <th className="text-left px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wide hidden md:table-cell">Type</th>
              <th className="text-left px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wide hidden lg:table-cell">Uploaded</th>
              <th className="text-left px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wide">Status</th>
              <th className="text-right px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wide">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} />)
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-16 text-center">
                  <div className="flex flex-col items-center gap-3 text-slate-400">
                    <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center">
                      <svg className="w-7 h-7 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                          d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-semibold text-slate-600">
                        {search ? 'No documents match your search' : 'No documents yet'}
                      </p>
                      <p className="text-sm mt-0.5">
                        {search ? 'Try a different keyword' : 'Upload your first PDF to get started'}
                      </p>
                    </div>
                  </div>
                </td>
              </tr>
            ) : (
              filtered.map((doc) => (
                <tr
                  key={doc._id}
                  className="hover:bg-blue-50/20 transition-colors group"
                >
                  {/* Name */}
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-800 truncate max-w-[180px] sm:max-w-xs">
                          {doc.originalName}
                        </p>
                        <p className="text-xs text-slate-400 sm:hidden">{formatBytes(doc.size)}</p>
                      </div>
                    </div>
                  </td>

                  {/* Size */}
                  <td className="px-5 py-3.5 hidden sm:table-cell">
                    <span className="text-sm text-slate-600">{formatBytes(doc.size)}</span>
                  </td>

                  {/* Type */}
                  <td className="px-5 py-3.5 hidden md:table-cell">
                    <span className="badge bg-red-100 text-red-600">PDF</span>
                  </td>

                  {/* Date */}
                  <td className="px-5 py-3.5 hidden lg:table-cell">
                    <span className="text-sm text-slate-500">{formatDateTime(doc.createdAt)}</span>
                  </td>

                  {/* Status */}
                  <td className="px-5 py-3.5">
                    <span className="badge badge-success">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-1.5" />
                      Complete
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                      <a
                        href={`/api/documents/download/${doc._id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors"
                        title="Download"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                      </a>
                      <button
                        onClick={() => handleDelete(doc)}
                        disabled={deletingId === doc._id}
                        className="p-2 hover:bg-red-100 text-red-400 hover:text-red-600 rounded-lg transition-colors disabled:opacity-50"
                        title="Delete"
                      >
                        {deletingId === doc._id ? (
                          <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
