import React, { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Save, Send, AlertCircle, ArrowLeft, Layout, Info,
  Shield, Briefcase, CheckCircle2, Ban, Loader2, ChevronDown, Check
} from 'lucide-react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import SearchableDropdown from '../components/SearchableDropdown';

// ── Valuation mapping (unchanged) ──────────────────────────────────────────
const VALUATION_MAPPING = {
  'ZMIS': { department: 'Mechanical', category: 'M', class: 'ZMID' },
  'ZEIS': { department: 'Electrical', category: 'E', class: 'ZEID' },
  'ZCOM': { department: 'Consumable', category: 'C', class: 'ZCOD' },
  'ZPAC': { department: '-', category: '-', class: 'ZPAC' },
  'ZNVA': { department: '-', category: '-', class: 'ZNVA' },
  'ZNVM': { department: '-', category: '-', class: 'ZNVM' },
  'ZRET': { department: '-', category: '-', class: 'ZRET' },
  'ZPRT': { department: 'Production', category: 'T', class: 'ZPRP' },
};

// ── Read-only description box ───────────────────────────────────────────────
const DescriptionBox = ({ label, value, placeholder = '—' }) => (
  <div className="space-y-1">
    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">{label}</label>
    <div className="w-full px-3 py-2 bg-gradient-to-r from-slate-50 to-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 min-h-[36px] flex items-center shadow-sm">
      {value ? <span className="font-medium">{value}</span> : <span className="text-gray-400 italic text-xs">{placeholder}</span>}
    </div>
  </div>
);

// ── Material Type premium dropdown ────────────────────────────────────────
const MT_STYLE_ID = 'mtd-styles';
if (typeof document !== 'undefined' && !document.getElementById(MT_STYLE_ID)) {
  const s = document.createElement('style');
  s.id = MT_STYLE_ID;
  s.textContent = `
    @keyframes mtd-in  { from { opacity:0; transform:scale(.97) translateY(-6px); } to { opacity:1; transform:scale(1) translateY(0); } }
    @keyframes mtd-out { from { opacity:1; transform:scale(1) translateY(0); } to { opacity:0; transform:scale(.97) translateY(-6px); } }
    .mtd-panel         { animation: mtd-in  .18s cubic-bezier(.16,1,.3,1) forwards; }
    .mtd-panel-closing { animation: mtd-out .14s ease forwards; }
  `;
  document.head.appendChild(s);
}

const MaterialTypeDropdown = ({ value, onChange, options, error }) => {
  const [open, setOpen]       = useState(false);
  const [closing, setClosing] = useState(false);
  const [pos, setPos]         = useState({ top: 0, left: 0, width: 0 });
  const triggerRef            = useRef(null);
  const wrapperRef            = useRef(null);

  const closePanel = () => { setClosing(true); setTimeout(() => { setOpen(false); setClosing(false); }, 140); };

  useEffect(() => {
    const handler = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target) &&
          !document.getElementById('mtd-portal')?.contains(e.target)) closePanel();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleOpen = () => {
    if (triggerRef.current) {
      const r = triggerRef.current.getBoundingClientRect();
      setPos({ top: r.bottom + 6, left: r.left, width: r.width });
    }
    setOpen(true); setClosing(false);
  };

  const isOpen = open || closing;

  const DESCRIPTIONS = {
    ZMIS: 'Mechanical Inventory Spare',
    ZEIS: 'Electrical Inventory Spare',
    ZCOM: 'Consumable',
    ZPAC: 'Packing Material',
    ZNVA: 'Non-Valuated',
    ZNVM: 'Non-Valuated Material',
    ZRET: 'Returnable',
    ZPRT: 'Production Tool',
  };

  const panel = isOpen ? (
    <div
      id="mtd-portal"
      className={`mtd-panel${closing ? ' mtd-panel-closing' : ''}`}
      style={{
        position: 'fixed', top: pos.top, left: pos.left, width: pos.width,
        zIndex: 9999, borderRadius: 16, overflow: 'hidden',
        background: 'rgba(255,255,255,0.97)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        border: '1px solid rgba(226,232,240,0.8)',
        boxShadow: '0 24px 64px -12px rgba(0,0,0,.22), 0 8px 24px -4px rgba(0,0,0,.12), 0 0 0 1px rgba(255,255,255,.6) inset',
      }}
    >
      <ul style={{ padding: '4px 0' }}>
        {options.map((opt) => {
          const isSelected = value === opt;
          return (
            <li
              key={opt}
              onMouseDown={(e) => { e.preventDefault(); onChange(opt); closePanel(); }}
              style={{
                padding: '9px 14px', cursor: 'pointer', display: 'flex',
                alignItems: 'center', gap: 10, margin: '0 4px', borderRadius: 10,
                background: isSelected ? 'linear-gradient(135deg,#eff6ff,#e0f2fe)' : 'transparent',
                transition: 'background .1s ease',
              }}
              onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = 'linear-gradient(135deg,#f8faff,#f0f9ff)'; }}
              onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'transparent'; }}
            >
              <span style={{ width: 14, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {isSelected && <Check size={12} style={{ color: '#2563eb' }} />}
              </span>
              <span style={{ fontSize: 12.5, fontWeight: 700, color: isSelected ? '#1d4ed8' : '#334155', minWidth: 44, letterSpacing: '-0.01em' }}>{opt}</span>
              <span style={{ fontSize: 11.5, color: '#94a3b8', flex: 1 }}>{DESCRIPTIONS[opt] || ''}</span>
            </li>
          );
        })}
      </ul>
    </div>
  ) : null;

  return (
    <div ref={wrapperRef} className="space-y-1">
      <label style={{ display: 'block', marginBottom: 6, fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '.06em' }}>
        Material Type <span style={{ color: '#ef4444' }}>*</span>
      </label>
      <div
        ref={triggerRef}
        onClick={handleOpen}
        style={{
          display: 'flex', alignItems: 'center', width: '100%',
          background: '#ffffff',
          border: `1.5px solid ${error ? '#ef4444' : open ? '#2563eb' : '#e2e8f2'}`,
          borderRadius: 12,
          boxShadow: open
            ? '0 0 0 3px rgba(37,99,235,.12), 0 1px 3px rgba(0,0,0,.06)'
            : error ? '0 0 0 3px rgba(239,68,68,.1)' : '0 1px 3px rgba(0,0,0,.05)',
          cursor: 'pointer',
          transition: 'border-color .15s ease, box-shadow .15s ease',
          padding: '9px 12px',
          userSelect: 'none',
        }}
      >
        <span style={{ flex: 1, fontSize: 13.5, fontWeight: value ? 600 : 400, color: value ? '#0f172a' : '#94a3b8' }}>
          {value || 'Select Type'}
        </span>
        <ChevronDown size={14} style={{
          color: open ? '#2563eb' : '#94a3b8',
          transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
          transition: 'transform .2s cubic-bezier(.16,1,.3,1), color .15s ease',
          flexShrink: 0,
        }} />
      </div>
      {error && <p style={{ fontSize: 10, color: '#ef4444', fontWeight: 700, marginTop: 4 }}>{error}</p>}
      {typeof document !== 'undefined' && isOpen
        ? createPortal(panel, document.body)
        : null}
    </div>
  );
};

// NOTE: This is the backup snapshot of the current (possibly broken) file.
// Next we will repair only JSX structure in MaterialRequestForm.jsx.

const MaterialRequestForm = () => null;

export default MaterialRequestForm;

