import React from 'react';
import { formatBytes } from '../utils/format';

function StatCard({ icon, label, value, sublabel, color, bgColor }) {
  return (
    <div className="card p-5 flex items-center gap-4 hover:shadow-card-hover transition-shadow duration-200">
      <div className={`w-12 h-12 ${bgColor} rounded-2xl flex items-center justify-center flex-shrink-0`}>
        <span className={`${color}`}>{icon}</span>
      </div>
      <div>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">{label}</p>
        <p className="text-2xl font-bold text-slate-900 leading-tight">{value}</p>
        {sublabel && <p className="text-xs text-slate-400 mt-0.5">{sublabel}</p>}
      </div>
    </div>
  );
}

export default function StatsCards({ documents, notifications }) {
  const totalSize = documents.reduce((sum, d) => sum + (d.size || 0), 0);
  const unread = notifications.filter((n) => !n.read).length;
  const today = documents.filter(
    (d) => new Date(d.createdAt).toDateString() === new Date().toDateString()
  ).length;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        label="Total Documents"
        value={documents.length}
        sublabel="PDF files stored"
        icon={
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        }
        color="text-blue-600"
        bgColor="bg-blue-100"
      />
      <StatCard
        label="Storage Used"
        value={formatBytes(totalSize)}
        sublabel="Across all files"
        icon={
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
          </svg>
        }
        color="text-violet-600"
        bgColor="bg-violet-100"
      />
      <StatCard
        label="Uploaded Today"
        value={today}
        sublabel="New documents"
        icon={
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
        }
        color="text-emerald-600"
        bgColor="bg-emerald-100"
      />
      <StatCard
        label="Notifications"
        value={unread}
        sublabel="Unread alerts"
        icon={
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        }
        color="text-amber-600"
        bgColor="bg-amber-100"
      />
    </div>
  );
}
