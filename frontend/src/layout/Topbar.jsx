import React from 'react';
import { Bell, Search, Command, HelpCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLocation } from 'react-router-dom';
import virajLogo from '../assets/viraj-logo.png';

const ROUTE_LABELS = {
  '/':            'Dashboard',
  '/request/new': 'New Request',
  '/requests/my': 'My Requests',
  '/approvals':   'All Requests',
  '/users':       'User Management',
  '/import':      'Import Descriptions',
  '/settings':    'Settings',
};

const Topbar = () => {
  const { user } = useAuth();
  const location = useLocation();
  const pageLabel = ROUTE_LABELS[location.pathname] || 'Portal';

  return (
    <header
      className="fixed top-0 right-0 z-30 flex items-center"
      style={{
        left: '220px',
        height: '52px',
        padding: '0 28px',
        background: 'rgba(6,9,26,0.96)',
        backdropFilter: 'blur(20px) saturate(200%)',
        WebkitBackdropFilter: 'blur(20px) saturate(200%)',
        borderBottom: '1px solid rgba(255,255,255,.07)',
        boxShadow: '0 1px 0 rgba(255,255,255,.04), 0 4px 24px rgba(0,0,0,.2)',
      }}
    >
      {/* Page label */}
      <div className="flex items-center gap-2 mr-6">
        <img
          src={virajLogo}
          alt="Viraj"
          style={{ height: '22px', width: 'auto', objectFit: 'contain', filter: 'drop-shadow(0 1px 4px rgba(251,146,60,.3))' }}
        />
        <span style={{ color: '#1e3050', fontSize: 12 }}>/</span>
        <span className="text-[13px] font-semibold" style={{ color: '#8ab0d0' }}>{pageLabel}</span>
      </div>

      {/* Search */}
      <div className="flex-1 max-w-xs">
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2"
            size={13}
            style={{ color: '#3d5a7a' }}
          />
          <input
            type="text"
            placeholder="Search requests, materials..."
            className="w-full rounded-xl pl-8 pr-10 py-1.5 text-[13px] focus:outline-none transition-all"
            style={{
              background: 'rgba(255,255,255,.05)',
              border: '1px solid rgba(255,255,255,.08)',
              color: '#8ab0d0',
            }}
            onFocus={e => {
              e.target.style.background = 'rgba(255,255,255,.07)';
              e.target.style.borderColor = 'rgba(59,130,246,.45)';
              e.target.style.boxShadow = '0 0 0 3px rgba(37,99,235,.1)';
            }}
            onBlur={e => {
              e.target.style.background = 'rgba(255,255,255,.04)';
              e.target.style.borderColor = 'rgba(255,255,255,.07)';
              e.target.style.boxShadow = 'none';
            }}
          />
          <div
            className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-0.5 px-1.5 py-0.5 rounded"
            style={{ background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.08)' }}
          >
            <Command size={9} style={{ color: '#2d4060' }} />
            <span className="text-[9px]" style={{ color: '#2d4060' }}>K</span>
          </div>
        </div>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-2 ml-auto">

        {/* Help */}
        <button
          className="p-1.5 rounded-lg transition-all"
          style={{ color: '#2d4060' }}
          onMouseEnter={e => { e.currentTarget.style.color = '#7a9cc0'; e.currentTarget.style.background = 'rgba(255,255,255,.05)'; }}
          onMouseLeave={e => { e.currentTarget.style.color = '#2d4060'; e.currentTarget.style.background = 'transparent'; }}
        >
          <HelpCircle size={16} />
        </button>

        {/* Notifications */}
        <button
          className="relative p-1.5 rounded-lg transition-all"
          style={{ color: '#2d4060' }}
          onMouseEnter={e => { e.currentTarget.style.color = '#7a9cc0'; e.currentTarget.style.background = 'rgba(255,255,255,.05)'; }}
          onMouseLeave={e => { e.currentTarget.style.color = '#2d4060'; e.currentTarget.style.background = 'transparent'; }}
        >
          <Bell size={16} />
          <span
            className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full"
            style={{ background: '#ef4444', boxShadow: '0 0 0 2px #080f1e' }}
          />
        </button>

        {/* Divider */}
        <div className="w-px h-5 mx-1" style={{ background: 'rgba(255,255,255,.07)' }} />

        {/* User */}
        <div className="flex items-center gap-2.5 pl-1">
          <div className="text-right hidden sm:block">
            <p className="text-[12px] font-semibold leading-tight" style={{ color: '#7a9cc0' }}>
              {user?.full_name || user?.username}
            </p>
            <p className="text-[10px] leading-tight" style={{ color: '#2d4060' }}>{user?.role}</p>
          </div>
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[11px] font-bold cursor-pointer"
            style={{
              background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
              boxShadow: '0 2px 8px rgba(59,130,246,.35)',
            }}
          >
            {(user?.full_name || user?.username || '?')[0].toUpperCase()}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
