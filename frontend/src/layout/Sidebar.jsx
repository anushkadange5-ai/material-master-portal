import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, FilePlus, ListTodo, CheckSquare,
  Settings, LogOut, Shield, FileSpreadsheet,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import virajLogo from '../assets/viraj-logo.png';

const ROLE_STYLE = {
  'IT Team':        { pill: 'bg-violet-500/15 text-violet-300 border border-violet-500/20', dot: 'bg-violet-400' },
  'Plant Head':     { pill: 'bg-blue-500/15 text-blue-300 border border-blue-500/20',       dot: 'bg-blue-400' },
  'Purchase Team':  { pill: 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/20',       dot: 'bg-cyan-400' },
  'GST Team':       { pill: 'bg-amber-500/15 text-amber-300 border border-amber-500/20',    dot: 'bg-amber-400' },
  'Store Head':     { pill: 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/20', dot: 'bg-emerald-400' },
  'Mechanical Team':{ pill: 'bg-orange-500/15 text-orange-300 border border-orange-500/20', dot: 'bg-orange-400' },
  'Electrical Team':{ pill: 'bg-yellow-500/15 text-yellow-300 border border-yellow-500/20', dot: 'bg-yellow-400' },
  'User':           { pill: 'bg-slate-500/15 text-slate-400 border border-slate-500/20',    dot: 'bg-slate-400' },
};

const NAV_GROUPS = [
  {
    label: 'Main',
    items: [
      { name: 'Dashboard',   path: '/',            icon: LayoutDashboard, roles: ['IT Team','User','Plant Head','Mechanical Team','Electrical Team','Purchase Team','GST Team','Store Head'] },
      { name: 'New Request', path: '/request/new', icon: FilePlus,        roles: ['User'] },
      { name: 'My Requests', path: '/requests/my', icon: ListTodo,        roles: ['User'] },
      { name: 'All Requests',path: '/approvals',   icon: CheckSquare,     roles: ['IT Team','Plant Head','Store Head','Purchase Team','Mechanical Team','Electrical Team','GST Team'] },
    ],
  },
  {
    label: 'Admin',
    items: [
      { name: 'User Management',     path: '/users',    icon: Shield,          roles: ['IT Team'] },
      { name: 'Import Descriptions', path: '/import',   icon: FileSpreadsheet, roles: ['IT Team'] },
    ],
  },
  {
    label: 'System',
    items: [
      { name: 'Settings', path: '/settings', icon: Settings, roles: ['IT Team','User','Plant Head','Mechanical Team','Electrical Team','Purchase Team','GST Team','Store Head'] },
    ],
  },
];

const Sidebar = () => {
  const { logout, role, user } = useAuth();
  const rs = ROLE_STYLE[role] || ROLE_STYLE['User'];
  const initials = (user?.full_name || user?.username || '?')
    .split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  return (
    <aside
      className="flex flex-col fixed left-0 top-0 z-40 h-screen"
      style={{
        width: '220px',
        background: 'linear-gradient(180deg, #06091a 0%, #080d1f 40%, #090e22 100%)',
        borderRight: '1px solid rgba(255,255,255,.06)',
        boxShadow: '1px 0 0 rgba(255,255,255,.03), 4px 0 32px rgba(0,0,0,.35)',
      }}
    >
      {/* ── Logo ─────────────────────────────────────────────────────────── */}
      <div
        className="px-4 pt-5 pb-4"
        style={{ borderBottom: '1px solid rgba(255,255,255,.06)' }}
      >
        <div
          className="group flex flex-col items-center gap-2 cursor-default"
          style={{ transition: 'transform .22s cubic-bezier(.22,1,.36,1)' }}
          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.04)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
        >
          <img
            src={virajLogo}
            alt="Viraj"
            style={{
              width: '100%',
              maxWidth: '148px',
              height: 'auto',
              objectFit: 'contain',
              display: 'block',
              filter: 'drop-shadow(0 3px 12px rgba(251,146,60,.4))',
              transition: 'filter .22s ease',
            }}
            onMouseEnter={e => e.target.style.filter = 'drop-shadow(0 4px 18px rgba(251,146,60,.65))'}
            onMouseLeave={e => e.target.style.filter = 'drop-shadow(0 3px 12px rgba(251,146,60,.4))'}
          />
          <p
            className="text-[9px] font-bold uppercase tracking-widest text-center w-full"
            style={{ color: 'rgba(255,255,255,.18)', letterSpacing: '0.14em' }}
          >
            Material Master Portal
          </p>
        </div>
      </div>

      {/* ── Navigation ───────────────────────────────────────────────────── */}
      <nav className="flex-1 overflow-y-auto py-4 space-y-0.5 px-2">
        {NAV_GROUPS.map(group => {
          const visibleItems = group.items.filter(l => l.roles.includes(role));
          if (visibleItems.length === 0) return null;
          return (
            <div key={group.label} className="mb-3">
              <p
                className="px-3 pt-1 pb-1.5 text-[9px] font-bold uppercase tracking-widest"
                style={{ color: '#253550' }}
              >
                {group.label}
              </p>
              {visibleItems.map(link => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  end={link.path === '/'}
                  className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                >
                  {({ isActive }) => (
                    <>
                      <link.icon
                        size={15}
                        style={{
                          color: isActive ? '#60a5fa' : '#3d5a7a',
                          transition: 'color .15s',
                        }}
                      />
                      <span className="flex-1 text-[13px]">{link.name}</span>
                      {isActive && (
                        <div
                          className="w-1.5 h-1.5 rounded-full shrink-0"
                          style={{ background: '#3b82f6' }}
                        />
                      )}
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          );
        })}
      </nav>

      {/* ── User section ─────────────────────────────────────────────────── */}
      <div
        className="p-3 space-y-1"
        style={{ borderTop: '1px solid rgba(255,255,255,.06)' }}
      >
        <div
          className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl"
          style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.05)' }}
        >
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[11px] font-bold shrink-0"
            style={{
              background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
              boxShadow: '0 2px 8px rgba(59,130,246,.4)',
            }}
          >
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[12px] font-semibold truncate leading-tight" style={{ color: '#d0e0f5' }}>
              {user?.full_name || user?.username}
            </p>
            <span className={`inline-flex items-center gap-1 mt-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-bold ${rs.pill}`}>
              <span className={`w-1 h-1 rounded-full ${rs.dot}`} />
              {role}
            </span>
          </div>
        </div>

        {/* Sign out */}
        <button
          onClick={logout}
          className="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg transition-all text-[13px] font-medium group"
          style={{ color: '#2d4060' }}
          onMouseEnter={e => {
            e.currentTarget.style.color = '#f87171';
            e.currentTarget.style.background = 'rgba(239,68,68,.08)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.color = '#2d4060';
            e.currentTarget.style.background = 'transparent';
          }}
        >
          <LogOut size={14} />
          <span>Sign Out</span>
        </button>

        {/* Version */}
        <div className="px-3 pt-1">
          <p className="text-[9px]" style={{ color: '#1a2a40' }}>v2.4.1 · Enterprise Edition</p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
