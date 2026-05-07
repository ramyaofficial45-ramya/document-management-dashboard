import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useNotifications } from '../hooks/useNotifications';
import NotificationPanel from './NotificationPanel';

export default function Header() {
  const location = useLocation();
  const [panelOpen, setPanelOpen] = useState(false);
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearAll, loading } =
    useNotifications();
  const panelRef = useRef(null);
  const bellRef = useRef(null);

  // Close panel on outside click
  useEffect(() => {
    const handler = (e) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(e.target) &&
        bellRef.current &&
        !bellRef.current.contains(e.target)
      ) {
        setPanelOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const navLinks = [
    { to: '/', label: 'Dashboard' },
    { to: '/upload', label: 'Upload' },
    { to: '/documents', label: 'Documents' },
    { to: '/notifications', label: 'Notifications' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <span className="text-xl font-bold text-slate-900 tracking-tight">DocVault</span>
              <span className="hidden sm:block text-xs text-slate-400 font-medium -mt-0.5">Document Management</span>
            </div>
          </Link>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map(({ to, label }) => {
              const active = location.pathname === to;
              return (
                <Link
                  key={to}
                  to={to}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-150 ${
                    active
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-blue-600 hover:bg-blue-50'
                  }`}
                >
                  {label}
                </Link>
              );
            })}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* Notification Bell */}
            <div className="relative">
              <button
                ref={bellRef}
                onClick={() => setPanelOpen((p) => !p)}
                className="relative p-2.5 rounded-xl hover:bg-blue-50 text-slate-500 hover:text-blue-600 transition-all duration-150"
                aria-label="Notifications"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {unreadCount > 0 && (
                  <span className="notification-dot animate-fade-in">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown Panel */}
              {panelOpen && (
                <div ref={panelRef} className="absolute right-0 top-12 w-80 sm:w-96 animate-fade-in">
                  <NotificationPanel
                    notifications={notifications}
                    loading={loading}
                    onMarkAsRead={markAsRead}
                    onMarkAllAsRead={markAllAsRead}
                    onClearAll={clearAll}
                    onClose={() => setPanelOpen(false)}
                  />
                </div>
              )}
            </div>

            {/* Upload CTA */}
            <Link to="/upload" className="btn-primary text-sm py-2 px-4 hidden sm:inline-flex">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              Upload
            </Link>
          </div>
        </div>

        {/* Mobile nav */}
        <div className="md:hidden flex items-center gap-1 pb-2 overflow-x-auto">
          {navLinks.map(({ to, label }) => {
            const active = location.pathname === to;
            return (
              <Link
                key={to}
                to={to}
                className={`whitespace-nowrap px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                  active ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-blue-50'
                }`}
              >
                {label}
              </Link>
            );
          })}
        </div>
      </div>
    </header>
  );
}
