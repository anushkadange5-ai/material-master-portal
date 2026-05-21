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

// ── Main Form ───────────────────────────────────────────────────────────────
const MaterialRequestForm = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    material_type: '', plant: '', storage_location: '',
    description: '', long_description: '', uom: '',
    purchase_group: '', material_group: '', control_code: ''
  });

  // Description fields (auto-filled)
  const [uomDesc, setUomDesc] = useState('');
  const [pgDesc, setPgDesc] = useState('');
  const [slocDesc, setSlocDesc] = useState('');
  const [mgShortDesc, setMgShortDesc] = useState('');

  const [valuationInfo, setValuationInfo] = useState({ department: '-', category: '-', class: '-' });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [duplicates, setDuplicates] = useState([]);
  const [isCheckingDuplicate, setIsCheckingDuplicate] = useState(false);
  // Suggestion list state (view-only, shows while typing)
  const [suggestions, setSuggestions] = useState({ list: [], total: 0 });
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);


  // Valuation auto-map
  useEffect(() => {
    const m = VALUATION_MAPPING[formData.material_type?.toUpperCase()] || { department: '-', category: '-', class: '-' };
    setValuationInfo(m);
  }, [formData.material_type]);

  // Duplicate check (debounced 600ms) — blocks submission on high similarity
  useEffect(() => {
    if (!formData.description || formData.description.length < 3) {
      setDuplicates([]); return;
    }
    const t = setTimeout(async () => {
      setIsCheckingDuplicate(true);
      try {
        const res = await api.get(`/duplicate/check?description=${encodeURIComponent(formData.description)}`);
        setDuplicates(res.data?.duplicates || []);
      } catch { setDuplicates([]); }
      finally { setIsCheckingDuplicate(false); }
    }, 600);
    return () => clearTimeout(t);
  }, [formData.description]);

  // Suggestion list (debounced 300ms) — substring search, view-only
  useEffect(() => {
    if (!formData.description || formData.description.length < 2) {
      setSuggestions({ list: [], total: 0 }); return;
    }
    const t = setTimeout(async () => {
      setIsLoadingSuggestions(true);
      try {
      const res = await api.get(`/duplicate/suggest?q=${encodeURIComponent(formData.description)}`);
        const list = res.data?.suggestions || [];
        setSuggestions({
          list: list.map(x => ({
            description: x.description || '',
            material_code: x.material_code || '',
            source: x.source || 'excel',
            material_type: x.material_type || '',
          })),
          total: res.data?.total || 0,
        });
      } catch { setSuggestions({ list: [], total: 0 }); }
      finally { setIsLoadingSuggestions(false); }
    }, 300);

    return () => clearTimeout(t);
  }, [formData.description]);

  // Load draft
  useEffect(() => {
    try {
      const d = localStorage.getItem('mmr_draft');
      if (d) setFormData(JSON.parse(d));
    } catch (_) {}
  }, []);

  const isDuplicateBlocked = duplicates.length > 0 && !isCheckingDuplicate;

  // ── Fetch functions for dropdowns ─────────────────────────────────────────
  const fetchMaterialGroups = useCallback(async (q) => {
    const res = await api.get(`/master/material-groups?q=${encodeURIComponent(q || '')}&limit=60`);
    return res.data;
  }, []);

  const fetchUOM = useCallback(async (q) => {
    const res = await api.get(`/master/uom?q=${encodeURIComponent(q || '')}&limit=60`);
    return res.data;
  }, []);

  const fetchPurchaseGroups = useCallback(async (q) => {
    const res = await api.get(`/master/purchase-groups?q=${encodeURIComponent(q || '')}&limit=60`);
    return res.data;
  }, []);

  const fetchPlants = useCallback(async (q) => {
    const res = await api.get(`/master/plants?q=${encodeURIComponent(q || '')}`);
    return res.data;
  }, []);

  const fetchStorageLocations = useCallback(async (q) => {
    const plant = formData.plant;
    const res = await api.get(`/master/storage-locations?plant=${encodeURIComponent(plant)}&q=${encodeURIComponent(q || '')}`);
    return res.data;
  }, [formData.plant]);

  // ── Field change handlers ──────────────────────────────────────────────────
  const setField = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleUOMChange = (code, item) => {
    setField('uom', code);
    setUomDesc(item?.description || '');
  };

  const handlePGChange = (code, item) => {
    setField('purchase_group', code);
    setPgDesc(item?.description || '');
  };

  const handlePlantChange = (code) => {
    setField('plant', code);
    // Reset storage location when plant changes
    setField('storage_location', '');
    setSlocDesc('');
  };

  const handleSlocChange = (code, item) => {
    setField('storage_location', code);
    setSlocDesc(item?.description || '');
  };

  const handleMGChange = (code, item) => {
    setField('material_group', code);
    setMgShortDesc(item?.description || '');
    // Auto-fill long description from material group long desc
    if (item?.description && !formData.long_description) {
      setField('long_description', item.description.slice(0, 200));
    }
  };

  // HSN: allow only digits, max 8
  const handleHSNChange = (e) => {
    const numeric = e.target.value.replace(/[^0-9]/g, '').slice(0, 8);
    setField('control_code', numeric);
    if (numeric.length > 0 && numeric.length < 4) {
      setErrors(prev => ({ ...prev, control_code: 'Minimum 4 digits required' }));
    } else if (numeric.length > 8) {
      setErrors(prev => ({ ...prev, control_code: 'Maximum 8 digits allowed' }));
    } else {
      setErrors(prev => ({ ...prev, control_code: '' }));
    }
  };

  const handleTextChange = (e) => {
    const { name, value } = e.target;
    setField(name, value);
  };



  // ── Validation ─────────────────────────────────────────────────────────────
  const validate = () => {
    const e = {};
    if (!formData.material_type) e.material_type = 'Required';
    if (!formData.plant) e.plant = 'Required';
    if (!formData.storage_location) e.storage_location = 'Required';
    if (!formData.description) e.description = 'Required';
    if (formData.description.length > 40) e.description = 'Max 40 characters';
    if (formData.long_description.length > 200) e.long_description = 'Max 200 characters';
    if (!formData.uom) e.uom = 'Required';
    if (!formData.purchase_group) e.purchase_group = 'Required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSaveDraft = () => {
    if (isDuplicateBlocked) return;
    localStorage.setItem('mmr_draft', JSON.stringify(formData));
    alert('Draft saved!');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isDuplicateBlocked || !validate()) return;
    setIsSubmitting(true);
    try {
      await api.post('/requests', formData);
      localStorage.removeItem('mmr_draft');
      setSuccess(true);
      setTimeout(() => navigate('/'), 2000);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to submit request');
    } finally {
      setIsSubmitting(false);
    }
  };

  const descBorderClass = () => {
    if (errors.description) return 'border-red-500 ring-1 ring-red-200';
    if (isDuplicateBlocked) return 'border-red-500 ring-2 ring-red-100 bg-red-50';
    if (isCheckingDuplicate) return 'border-blue-300 ring-1 ring-blue-100';
    return 'border-gray-200 focus:border-sap-blue focus:ring-2 focus:ring-blue-100';
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      className="max-w-5xl mx-auto pb-16">


      {/* ── Premium Header ─────────────────────────────────────────────── */}
      <div
        className="rounded-2xl p-6 mb-6 relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #0b1120 0%, #1a2540 60%, #1e3a8a 100%)',
          boxShadow: '0 8px 32px rgba(11,17,32,.25)',
        }}
      >
        {/* Background decoration */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full" style={{ background: 'rgba(59,130,246,.08)' }} />
          <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full" style={{ background: 'rgba(99,102,241,.06)' }} />
        </div>
        <div className="relative z-10 flex items-center gap-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="p-2 rounded-xl transition-all"
            style={{ background: 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.1)' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,.14)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,.08)'}
          >
            <ArrowLeft size={18} className="text-white" />
          </button>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span
                className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full"
                style={{ background: 'rgba(59,130,246,.2)', color: '#93c5fd', border: '1px solid rgba(59,130,246,.3)' }}
              >
                New Request
              </span>
            </div>
            <h1 className="text-[20px] font-bold text-white leading-tight" style={{ letterSpacing: '-0.02em' }}>
              Material Master Request
            </h1>
            <p className="text-[13px] mt-0.5" style={{ color: 'rgba(148,163,184,.7)' }}>
              Create a new material master entry in the enterprise central system
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">

        {/* ── Single compact enterprise container (restructured) ───────────────────────── */}
        <div className="rounded-2xl" style={{ background:'#fff', border:'1px solid #e2e8f2', boxShadow:'0 4px 24px rgba(0,0,0,.08), 0 1px 2px rgba(0,0,0,.04)' }}>
          <div className="flex items-center gap-3 px-5 py-3" style={{ borderBottom:'1px solid #f1f5f9', background:'linear-gradient(135deg,#f8fafd,#f1f5fb)' }}>

            <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background:'linear-gradient(135deg,#2563eb,#4f46e5)', boxShadow:'0 3px 8px rgba(37,99,235,.3)' }}>
              <Layout size={14} className="text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-[13.5px] font-bold" style={{ color:'#0f172a', letterSpacing:'-0.01em' }}>General Data &amp; Organizational Unit</h2>
              <p className="text-[11px]" style={{ color:'#94a3b8' }}>Material type, plant, and storage location</p>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background:'#eff6ff', color:'#1e40af', border:'1px solid #bfdbfe' }}>Step 1</span>
          </div>
          <div className="px-6 py-5 space-y-5">

          {/* Row 1: Material Type */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 items-start">
            <MaterialTypeDropdown
              value={formData.material_type}
              onChange={(val) => { setField('material_type', val); }}
              options={Object.keys(VALUATION_MAPPING)}
              error={errors.material_type}
            />
          </div>

          {/* Row 2: Plant + Storage Location */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SearchableDropdown
              label="Plant"
              required
              value={formData.plant}
              onChange={handlePlantChange}
              fetchOptions={fetchPlants}
              placeholder="Search plant..."
              error={errors.plant}
            />
            <SearchableDropdown
              label="Storage Location"
              required
              value={formData.storage_location}
              onChange={handleSlocChange}
              fetchOptions={fetchStorageLocations}
              placeholder={formData.plant ? 'Search storage loc...' : 'Select plant first'}
              error={errors.storage_location}
              disabled={!formData.plant}
            />
          </div>
          </div>
        </div>

        {/* ── Section 2: Material Identity (restored markup) ── */}
        <div className="rounded-2xl" style={{ background:'#fff', border:'1px solid #e2e8f2', boxShadow:'0 4px 24px rgba(0,0,0,.07)' }}>
          <div className="flex items-center gap-3 px-6 py-4" style={{ borderBottom:'1px solid #f1f5f9', background:'linear-gradient(135deg,#f0f9ff,#e8f4fd)', borderRadius:'16px 16px 0 0' }}>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background:'linear-gradient(135deg,#0ea5e9,#6366f1)', boxShadow:'0 3px 8px rgba(14,165,233,.3)' }}>
              <Info size={14} className="text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-[13.5px] font-bold" style={{ color:'#0f172a', letterSpacing:'-0.01em' }}>Material Identity</h2>
              <p className="text-[11px]" style={{ color:'#94a3b8' }}>Short description, long description, and material group</p>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background:'#f0fdf4', color:'#166534', border:'1px solid #bbf7d0' }}>Step 2</span>
          </div>
          <div className="px-6 py-5 space-y-5">


          {/* Short Description with live suggestions + duplicate detection */}
          <div className="space-y-1 relative">
            <div className="flex justify-between items-center">

              <label className="text-xs font-bold text-gray-500 uppercase">
                Short Description (Max 40) <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-2">
                {(isCheckingDuplicate || isLoadingSuggestions) && (
                  <span className="flex items-center gap-1 text-[10px] text-blue-500 font-bold">
                    <Loader2 size={10} className="animate-spin" /> Checking...
                  </span>
                )}
                {isDuplicateBlocked && (
                  <span className="flex items-center gap-1 text-[10px] text-red-600 font-black uppercase">
                    <Ban size={10} /> DUPLICATE BLOCKED
                  </span>
                )}
                <span className={`text-[10px] font-bold ${formData.description.length > 40 ? 'text-red-500' : 'text-gray-400'}`}>
                  {formData.description.length}/40
                </span>
              </div>
            </div>

            <input
              name="description"
              placeholder="Brief identifying name"
              maxLength={40}
              autoComplete="off"
              className={`w-full px-3 py-2.5 border rounded-xl outline-none transition-all text-sm font-medium shadow-sm hover:border-gray-300 ${descBorderClass()}`}
              value={formData.description}
              onChange={handleTextChange}
            />
            {errors.description && <p className="text-[10px] text-red-500 font-bold">{errors.description}</p>}

            {/* ── Short Description Existing Matches (view-only) ── */}
            <AnimatePresence>
              {suggestions.list.length > 0 && formData.description.trim().length >= 2 && (

                <motion.div
                  key="suggestions"
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="absolute left-0 right-0 mt-1 z-[9999] rounded-lg border border-blue-200 bg-white shadow-lg overflow-hidden animate-in fade-in duration-100"
                >
                  {/* Header */}
                  <div className="flex items-center justify-between px-4 py-2 bg-blue-50 border-b border-blue-100">
                    <span className="text-[11px] font-black text-blue-700 uppercase tracking-wide">
                      EXISTING DESCRIPTIONS CONTAINING &ldquo;{formData.description.toUpperCase()}&rdquo;
                    </span>
                    <span className="text-[10px] font-bold text-blue-500 bg-blue-100 px-2 py-0.5 rounded-full">
                      {suggestions.total} found
                    </span>
                  </div>

                  {/* List */}
                  <ul
                    className="max-h-[320px] overflow-y-auto scroll-smooth"
                  >

                    {suggestions.list.map((s, i) => {
                      const hasCode = typeof s.material_code === 'string' ? s.material_code.trim().length > 0 : !!s.material_code;
                      return (
                        <li
                          key={i}
                          className="px-4 py-3 border-b border-gray-50 select-none border-l-4 border-transparent pl-3"
                        >
                          <div className="flex items-start gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-bold text-gray-900 truncate">
                                {hasCode ? <span className="text-blue-700">[{s.material_code}]</span> : null}
                                {hasCode ? <span className="text-gray-900">&nbsp;</span> : null}
                                {s.description}
                              </div>
                              <div className="text-[11px] text-gray-500 mt-1">
                                <span className="font-semibold">Source:</span> {s.source === 'excel' ? 'Master' : s.source}
                                {s.material_type ? ` · Type: ${s.material_type}` : ''}
                              </div>
                            </div>
                            <div className="shrink-0">
                              <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
                                VIEW ONLY
                              </span>
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>

                  {/* Footer */}
                  <div className="px-4 py-2 bg-gray-50 border-t border-gray-100">
                    <p className="text-[11px] text-gray-600 font-medium">
                      These are existing records for reference. Please type a unique description.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>


            {/* ── Duplicate Blocked Panel (high similarity ≥ 80%) ── */}
            <AnimatePresence>
              {isDuplicateBlocked && (
                <motion.div key="dup" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                  <div className="mt-2 rounded-lg border-2 border-red-300 bg-red-50 overflow-hidden shadow-sm">
                    <div className="flex items-center gap-2 px-3 py-2 bg-red-100 border-b border-red-200">
                      <Ban size={13} className="text-red-600 shrink-0" />
                      <span className="text-xs font-black text-red-700 uppercase tracking-wide">
                        Duplicate Detected — Submission Blocked
                      </span>
                      <span className="ml-auto text-[10px] font-bold text-red-500 bg-red-200 px-2 py-0.5 rounded-full">
                        {duplicates.length} match{duplicates.length > 1 ? 'es' : ''}
                      </span>
                    </div>
                    <div className="divide-y divide-red-100">
                      {duplicates.slice(0, 4).map((dup, i) => (
                        <div key={i} className="px-3 py-2 flex items-center justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-gray-800 truncate">
                              {dup.original_description}{dup.material_code ? ` - ${dup.material_code}` : ''}
                            </p>
                            <p className="text-[10px] text-gray-500">
                              Source: <span className="font-semibold">{dup.source}</span>
                              {dup.material_type ? ` · ${dup.material_type}` : ''}
                              {' · '}
                              <span className={`font-bold ${dup.match_type === 'exact' ? 'text-red-600' : 'text-orange-600'}`}>
                                {dup.match_type === 'exact' ? 'Exact match' : 'Fuzzy match'}
                              </span>
                            </p>
                          </div>
                          <div className={`shrink-0 px-2 py-1 rounded-full text-[11px] font-black border min-w-[44px] text-center
                            ${dup.similarity === 100 ? 'bg-red-600 text-white border-red-700'
                              : dup.similarity >= 90 ? 'bg-orange-500 text-white border-orange-600'
                              : 'bg-yellow-400 text-yellow-900 border-yellow-500'}`}>
                            {dup.similarity}%
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="px-3 py-2 bg-red-50 border-t border-red-100 flex items-center gap-2">
                      <AlertCircle size={11} className="text-red-500 shrink-0" />
                      <p className="text-[10px] text-red-600 font-medium">
                        Change description to make it unique. Submit and Save are disabled.
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Long Description — directly below Short Description */}
          <div className="space-y-1">
            <div className="flex justify-between">
              <label className="text-xs font-bold text-gray-500 uppercase">Long Description (Max 200)</label>
              <span className={`text-[10px] font-bold ${formData.long_description.length > 200 ? 'text-red-500' : 'text-gray-400'}`}>
                {formData.long_description.length}/200
              </span>
            </div>
            <textarea
              name="long_description"
              placeholder="Detailed technical specifications (auto-filled from Material Group)..."
              maxLength={200} rows={3}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-500 focus:bg-blue-50/20 outline-none transition-all text-sm min-h-[80px] shadow-sm hover:border-gray-300 resize-none"
              value={formData.long_description}
              onChange={handleTextChange}
            />
            {errors.long_description && <p className="text-[10px] text-red-500 font-bold">{errors.long_description}</p>}
          </div>

          {/* Material Group */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <SearchableDropdown
              label="Material Group"
              value={formData.material_group}
              onChange={handleMGChange}
              fetchOptions={fetchMaterialGroups}
              placeholder="Search material group..."
              error={errors.material_group}
            />
            <DescriptionBox
              label="Material Group Description"
              value={mgShortDesc}
              placeholder="Auto-fills on selection"
            />
          </div>
          </div>
        </div>

        {/* ── Section 3: Procurement Data ─────────────────────────────────── */}
        <div className="rounded-2xl" style={{ background:'#fff', border:'1px solid #e2e8f2', boxShadow:'0 4px 24px rgba(0,0,0,.07)' }}>
          <div className="flex items-center gap-3 px-6 py-4" style={{ borderBottom:'1px solid #f1f5f9', background:'linear-gradient(135deg,#fdf8f0,#fdf3e3)', borderRadius:'16px 16px 0 0' }}>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background:'linear-gradient(135deg,#f59e0b,#ef4444)', boxShadow:'0 3px 8px rgba(245,158,11,.3)' }}>
              <Briefcase size={14} className="text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-[13.5px] font-bold" style={{ color:'#0f172a', letterSpacing:'-0.01em' }}>Procurement &amp; Unit Data</h2>
              <p className="text-[11px]" style={{ color:'#94a3b8' }}>Unit of measure and purchasing group</p>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background:'#fffbeb', color:'#92400e', border:'1px solid #fde68a' }}>Step 3</span>
          </div>
          <div className="px-6 py-5 space-y-5">

          {/* UOM */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <SearchableDropdown
              label="Base Unit of Measure (UOM)"
              required
              value={formData.uom}
              onChange={handleUOMChange}
              fetchOptions={fetchUOM}
              placeholder="Search UOM (e.g. KG, NOS)..."
              error={errors.uom}
            />
          </div>

          {/* Purchasing Group */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <SearchableDropdown
              label="Purchasing Group"
              required
              value={formData.purchase_group}
              onChange={handlePGChange}
              fetchOptions={fetchPurchaseGroups}
              placeholder="Search purchasing group..."
              error={errors.purchase_group}
            />
          </div>
          </div>
        </div>

        {/* ── Section 4: Optional Classifications ─────────────────────────── */}
        <div className="rounded-2xl" style={{ background:'#fff', border:'1px solid #e2e8f2', boxShadow:'0 4px 24px rgba(0,0,0,.07)' }}>
          <div className="flex items-center gap-3 px-6 py-4" style={{ borderBottom:'1px solid #f1f5f9', background:'linear-gradient(135deg,#f8f8ff,#f3f0ff)', borderRadius:'16px 16px 0 0' }}>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background:'linear-gradient(135deg,#8b5cf6,#a78bfa)', boxShadow:'0 3px 8px rgba(139,92,246,.3)' }}>
              <AlertCircle size={14} className="text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-[13.5px] font-bold" style={{ color:'#0f172a', letterSpacing:'-0.01em' }}>Optional Classifications</h2>
              <p className="text-[11px]" style={{ color:'#94a3b8' }}>HSN/SAC control code and additional tags</p>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background:'#faf5ff', color:'#6b21a8', border:'1px solid #e9d5ff' }}>Step 4</span>
          </div>
          <div className="px-6 py-5 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Control Code (HSN/SAC)</label>
                <span
                  className="text-[10px] font-bold tabular-nums transition-colors"
                  style={{ color: errors.control_code ? '#ef4444' : formData.control_code.length >= 4 ? '#16a34a' : '#94a3b8' }}
                >
                  {formData.control_code.length}/8
                </span>
              </div>
              <div className="relative">
                <input
                  name="control_code"
                  placeholder="Numeric only, e.g. 7210"
                  inputMode="numeric"
                  maxLength={8}
                  autoComplete="off"
                  className="w-full px-3 py-2.5 border rounded-xl outline-none text-sm font-medium shadow-sm transition-all"
                  style={{
                    borderColor: errors.control_code
                      ? '#ef4444'
                      : formData.control_code.length >= 4
                      ? '#22c55e'
                      : '#e2e8f0',
                    boxShadow: errors.control_code
                      ? '0 0 0 3px rgba(239,68,68,.12)'
                      : formData.control_code.length >= 4
                      ? '0 0 0 3px rgba(34,197,94,.12)'
                      : 'none',
                    background: errors.control_code ? 'rgba(254,242,242,0.6)' : '#fff',
                    transition: 'border-color .15s ease, box-shadow .15s ease, background .15s ease',
                  }}
                  value={formData.control_code}
                  onChange={handleHSNChange}
                  onKeyDown={(e) => {
                    const allowed = ['Backspace','Delete','ArrowLeft','ArrowRight','Tab','Enter'];
                    if (!allowed.includes(e.key) && !/^[0-9]$/.test(e.key)) e.preventDefault();
                    if (/^[0-9]$/.test(e.key) && formData.control_code.length >= 8) e.preventDefault();
                  }}
                  onPaste={(e) => {
                    e.preventDefault();
                    const pasted = e.clipboardData.getData('text').replace(/[^0-9]/g, '').slice(0, 8);
                    setField('control_code', pasted);
                    if (pasted.length > 0 && pasted.length < 4) {
                      setErrors(prev => ({ ...prev, control_code: 'Minimum 4 digits required' }));
                    } else {
                      setErrors(prev => ({ ...prev, control_code: '' }));
                    }
                  }}
                />
                {formData.control_code.length >= 4 && formData.control_code.length <= 8 && !errors.control_code && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <CheckCircle2 size={14} style={{ color: '#22c55e' }} />
                  </div>
                )}
              </div>
              <div
                style={{
                  overflow: 'hidden',
                  maxHeight: errors.control_code ? 24 : 0,
                  opacity: errors.control_code ? 1 : 0,
                  transition: 'max-height .18s ease, opacity .15s ease',
                }}
              >
                <p className="flex items-center gap-1 text-[10px] font-bold mt-1" style={{ color: '#ef4444' }}>
                  <AlertCircle size={10} />
                  {errors.control_code}
                </p>
              </div>
            </div>
          </div>
          </div>
        </div>

        {/* ── Section 5: System Assigned ──────────────────────────────────── */}
        <div className="rounded-2xl" style={{ background:'linear-gradient(135deg,#eff6ff,#dbeafe)', border:'1px solid #bfdbfe', boxShadow:'0 4px 24px rgba(37,99,235,.08)' }}>
          <div className="flex items-center gap-3 px-6 py-4" style={{ borderBottom:'1px solid #dbeafe', background:'linear-gradient(135deg,#eff6ff,#dbeafe)', borderRadius:'16px 16px 0 0' }}>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background:'linear-gradient(135deg,#1d4ed8,#2563eb)', boxShadow:'0 3px 8px rgba(29,78,216,.3)' }}>
              <Shield size={14} className="text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-[13.5px] font-bold" style={{ color:'#1e3a8a', letterSpacing:'-0.01em' }}>System Assigned Master Data</h2>
              <p className="text-[11px]" style={{ color:'#60a5fa' }}>Auto-derived from SAP Material Type definitions</p>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background:'#dbeafe', color:'#1e40af', border:'1px solid #93c5fd' }}>Auto</span>
          </div>
          <div className="px-6 py-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { label: 'Department', value: valuationInfo.department },
              { label: 'Valuation Category', value: valuationInfo.category },
              { label: 'Valuation Class', value: valuationInfo.class },
            ].map(({ label, value }) => (
              <div key={label} className="rounded-xl p-4" style={{ background:'rgba(255,255,255,0.8)', border:'1px solid #bfdbfe', boxShadow:'0 2px 8px rgba(37,99,235,.08)' }}>
                <p className="text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color:'#93c5fd' }}>{label}</p>
                <p className="text-[18px] font-bold" style={{ color:'#1e40af', letterSpacing:'-0.02em' }}>{value}</p>
              </div>
            ))}
          </div>
          <p className="text-[10px] font-medium italic" style={{ color:'#60a5fa' }}>
            ※ Synchronized instantly based on SAP Material Type definitions.
          </p>
          </div>
        </div>

        {/* ── Action Buttons ───────────────────────────────────────────────── */}
        <div className="flex justify-end items-center gap-4 sticky bottom-0 px-6 py-4 rounded-2xl" style={{ background:'rgba(248,250,252,0.97)', borderTop:'1px solid #e2e8f2', boxShadow:'0 -4px 24px rgba(0,0,0,.06)' }}>
          <button type="button" onClick={handleSaveDraft} disabled={isDuplicateBlocked}
            className={`flex items-center gap-2 px-6 py-2.5 font-bold text-sm border rounded-xl transition-all shadow-sm ${
              isDuplicateBlocked ? 'border-gray-200 text-gray-300 cursor-not-allowed bg-gray-50' : 'border-blue-300 text-blue-700 bg-white hover:bg-blue-50 hover:border-blue-400 hover:shadow-md'
            }`}>
            <Save size={17} /> SAVE AS DRAFT
          </button>
          <button type="submit" disabled={isDuplicateBlocked || isSubmitting}
            className={`flex items-center gap-2 px-8 py-2.5 font-bold text-sm rounded-xl transition-all ${
              isDuplicateBlocked ? 'bg-red-50 text-red-400 cursor-not-allowed border border-red-200 shadow-none'
                : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl disabled:opacity-50'
            }`} style={(!isDuplicateBlocked && !isSubmitting) ? { boxShadow:'0 4px 14px rgba(37,99,235,.4)' } : {}}>
            {isDuplicateBlocked ? <><Ban size={17} /> BLOCKED — DUPLICATE</>
              : isSubmitting ? <><Loader2 size={17} className="animate-spin" /> PROCESSING...</>
              : <><Send size={17} /> SUBMIT FOR APPROVAL</>}
          </button>
        </div>
      </form>


      {/* Success overlay */}
      <AnimatePresence>
        {success && (
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center z-[200] bg-white/90 backdrop-blur-sm">
            <div className="text-center space-y-4">
              <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 size={48} />
              </div>
              <h2 className="text-3xl font-bold text-gray-800">Request Submitted!</h2>
              <p className="text-gray-500">Redirecting to dashboard...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default MaterialRequestForm;
