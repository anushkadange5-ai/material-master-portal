import React, { useState, useEffect, useCallback } from 'react';
import {
  CheckCircle2, CornerUpLeft, Eye, Clock, AlertCircle,
  ChevronRight, User, Mail, Calendar,
  ArrowRight, RefreshCw, Loader2, Download, Printer, ChevronDown
} from 'lucide-react';
import * as XLSX from 'xlsx';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import SearchableDropdown from '../components/SearchableDropdown';

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmt = (iso) =>
  iso ? new Date(iso).toLocaleString('en-IN',{day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'}) : '—';

const statusBadge = (s) => {
  if (!s) return 'badge badge-default';
  if (s.includes('Pending'))   return 'badge badge-pending';
  if (s === 'Approved')        return 'badge badge-approved';
  if (s.includes('Sent Back')) return 'badge badge-sentback';
  if (s === 'Rejected')        return 'badge badge-rejected';
  return 'badge badge-default';
};

const PRIORITY_BADGE = {
  High:'badge badge-rejected', Medium:'badge badge-pending', Low:'badge badge-approved'
};

// ── Build workflow stages ─────────────────────────────────────────────────────
function buildStages(req, history) {
  const dept = req.department;
  const hasDept = ['Mechanical','Electrical'].includes(dept);
  const stageList = [
    { key:'Submitted',    label:'Submitted',       statusKey:null },
    { key:'Plant Head',   label:'Plant Head',      statusKey:'Pending Plant Head' },
    ...(hasDept ? [{ key:'Department', label:dept==='Mechanical'?'Mechanical Team (Deepak Sir)':'Electrical Team (Pradeep Sir)', statusKey:'Pending Department' }] : []),
    { key:'Purchase Team',label:'Purchase Team',   statusKey:'Pending Purchase' },
    { key:'GST Team',     label:'GST Team',        statusKey:'Pending GST' },
    { key:'Store Head',   label:'Store Head',      statusKey:'Pending Store Head' },
    { key:'IT Team',      label:'IT Team (Final)', statusKey:'Pending IT Final Approval' },
  ];
  const currentStatus = req.status;
  return stageList.map(s => {
    const histEntry = history.find(h =>
      h.stage===s.key || (s.key==='Department'&&h.stage==='Department') || (s.key==='Submitted'&&h.action==='SUBMIT')
    );
    let state = 'pending';
    if (s.key==='Submitted') state='done';
    else if (currentStatus==='Approved') state='done';
    else if (currentStatus==='Rejected') state=histEntry?'done':'pending';
    else if (s.statusKey===currentStatus) state='active';
    else if (histEntry) state='done';
    return { ...s, state, actor:histEntry?.approver_name||null, time:histEntry?.created_at||(s.key==='Submitted'?req.created_at:null), comments:histEntry?.comments||null, action:histEntry?.action||null };
  });
}

// ── Timeline ──────────────────────────────────────────────────────────────────
const Timeline = ({ stages }) => (
  <div className="space-y-0">
    {stages.map((s, i) => (
      <div key={i} className="flex gap-3 relative">
        {i < stages.length-1 && (
          <div className={`absolute left-[15px] top-9 bottom-0 w-0.5 ${s.state==='done'?'bg-emerald-300':'bg-slate-100'}`} />
        )}
        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border-2 z-10 mt-0.5 shadow-sm ${
          s.state==='done'  ?'bg-emerald-100 border-emerald-400':
          s.state==='active'?'bg-amber-100 border-amber-400 ring-2 ring-amber-200':
                             'bg-slate-50 border-slate-200'
        }`}>
          {s.state==='done'  ?<CheckCircle2 size={13} className="text-emerald-600"/>:
           s.state==='active'?<Clock size={13} className="text-amber-500 animate-pulse"/>:
                              <div className="w-2.5 h-2.5 rounded-full border-2 border-slate-300"/>}
        </div>
        <div className={`flex-1 pb-5 ${i===stages.length-1?'pb-0':''}`}>
          <div className="flex items-center justify-between gap-2">
            <p className={`text-[12px] font-semibold ${
              s.state==='done'?'text-slate-700':s.state==='active'?'text-amber-700':'text-slate-400'
            }`}>{s.label}</p>
            <span className={`badge shrink-0 ${
              s.state==='done'  ?'badge-approved':
              s.state==='active'?'badge-pending':
                                 'badge-default'
            }`}>
              {s.state==='done'?(s.action==='SEND_BACK'?'Sent Back':s.action==='REJECT'?'Rejected':'Done'):
               s.state==='active'?'Awaiting':'Pending'}
            </span>
          </div>
          {s.actor && (
            <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
              <User size={9}/> {s.actor} · {fmt(s.time)}
            </p>
          )}
          {s.state==='done' && !s.actor && s.time && (
            <p className="text-[11px] text-slate-400 mt-0.5">{fmt(s.time)}</p>
          )}
          {s.comments && (
            <p className="text-[11px] text-slate-500 italic mt-1 bg-slate-50 px-2.5 py-2 rounded-lg border-l-2 border-blue-200 leading-relaxed shadow-sm">
              "{s.comments}"
            </p>
          )}
          {s.state==='active' && (
            <p className="text-[10px] text-amber-600 font-bold uppercase tracking-wider mt-1 flex items-center gap-1">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"/> Awaiting action…
            </p>
          )}
        </div>
      </div>
    ))}
  </div>
);

// ── Detail Panel ──────────────────────────────────────────────────────────────
const DetailPanel = ({ req, onClose, onActionDone, userRole }) => {
  const [comments, setComments] = useState('');
  const [editData, setEditData] = useState({
    material_type:req.material_type||'', description:req.description||'',
    control_code:req.control_code||'', material_group:req.material_group||'',
    long_description:req.long_description||'', plant:req.plant||'',
    storage_location:req.storage_location||'', purchase_group:req.purchase_group||'',
  });
  const [history, setHistory]   = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [actionResult, setActionResult] = useState(null);

  // ── Control Code validation ──────────────────────────────────────────────
  const [ccError, setCcError] = useState('');

  const handleCCChange = (val) => {
    const numeric = val.replace(/[^0-9]/g, '').slice(0, 8);
    setEditData(prev => ({ ...prev, control_code: numeric }));
    if (numeric.length > 0 && numeric.length < 4) setCcError('Minimum 4 digits required');
    else if (numeric.length > 8) setCcError('Maximum 8 digits allowed');
    else setCcError('');
  };

  const handleCCKeyDown = (e) => {
    const allowed = ['Backspace','Delete','ArrowLeft','ArrowRight','Tab','Enter'];
    if (!allowed.includes(e.key) && !/^[0-9]$/.test(e.key)) { e.preventDefault(); return; }
    if (/^[0-9]$/.test(e.key) && editData.control_code.length >= 8) e.preventDefault();
  };

  const handleCCPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/[^0-9]/g, '').slice(0, 8);
    setEditData(prev => ({ ...prev, control_code: pasted }));
    if (pasted.length > 0 && pasted.length < 4) setCcError('Minimum 4 digits required');
    else setCcError('');
  };

  const ccValid = editData.control_code === '' || (editData.control_code.length >= 4 && editData.control_code.length <= 8);

  const canEdit        = userRole==='GST Team'||userRole==='Store Head'||userRole==='IT Team';
  const canEditHSN     = userRole==='GST Team'||userRole==='IT Team';
  const canEditGrp     = userRole==='GST Team'||userRole==='Store Head'||userRole==='IT Team';
  const canEditMatType = userRole==='GST Team'||userRole==='Store Head'||userRole==='IT Team';
  const canSendBack    = userRole!=='GST Team';
  const isGST          = userRole==='GST Team';
  const isIT           = userRole==='IT Team';

  // Track which fields IT Team has modified for badge + highlight
  const editedFields = isIT ? Object.keys(editData).filter(k => {
    if (k === 'material_type') return editData.material_type !== (req.material_type||'');
    if (k === 'description')   return editData.description   !== (req.description||'');
    if (k === 'long_description') return editData.long_description !== (req.long_description||'');
    if (k === 'material_group')   return editData.material_group   !== (req.material_group||'');
    if (k === 'plant')             return editData.plant             !== (req.plant||'');
    if (k === 'storage_location')  return editData.storage_location  !== (req.storage_location||'');
    if (k === 'purchase_group')    return editData.purchase_group    !== (req.purchase_group||'');
    if (k === 'control_code')      return editData.control_code      !== (req.control_code||'');
    return false;
  }) : [];
  const hasEdits = editedFields.length > 0;

  const editStyle = (field) => hasEdits && editedFields.includes(field)
    ? { borderColor: '#f59e0b', background: '#fffbeb', boxShadow: '0 0 0 3px rgba(245,158,11,.12)' }
    : {};

  useEffect(() => {
    api.get(`/workflow/${req.id}/history`)
      .then(r => setHistory(Array.isArray(r.data)?r.data:[]))
      .catch(() => setHistory([]));
  }, [req.id]);

  const stages = buildStages(req, history);

  const handleAction = async (action) => {
    setSubmitting(true);
    try {
      await api.post(`/workflow/${req.id}/approve`, { action, comments, editData: canEdit ? editData : null });
      setActionResult(action);
      setTimeout(() => { onActionDone(); }, 1200);
    } catch (err) { alert(err.response?.data?.error||'Action failed'); }
    finally { setSubmitting(false); }
  };

  if (actionResult) {
    const isApprove = actionResult==='APPROVE';
    return (
      <div className="card flex flex-col items-center justify-center py-20 gap-4">
        {isApprove ? <CheckCircle2 size={44} className="text-emerald-500"/> : <CornerUpLeft size={44} className="text-amber-500"/>}
        <p className="font-bold text-[17px] text-slate-800">{isApprove?'Approved!':'Sent Back!'}</p>
        <p className="text-slate-400 text-[13px]">Refreshing queue…</p>
      </div>
    );
  }

  // ── GST Team: focused view ───────────────────────────────────────────────────
  if (isGST) {
    const approveDisabled = submitting || !!ccError || (editData.control_code.length > 0 && editData.control_code.length < 4);
    return (
      <div className="max-w-lg mx-auto space-y-4 page-enter">

        {/* Header */}
        <div className="card border border-slate-100 shadow-sm">
          <div className="flex justify-between items-start pb-3 mb-4 border-b border-slate-100">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-amber-600 flex items-center gap-1 mb-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse inline-block"/> GST Team Review
              </span>
              <h2 className="text-[15px] font-bold text-slate-800 font-mono tracking-tight">{req.req_number}</h2>
            </div>
            <button onClick={onClose} className="btn btn-ghost btn-sm text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all">✕ Close</button>
          </div>

          {/* Material Code hidden from GST panel per visibility rules */}

          {/* Short Description (editable) */}
          <div className="mb-4">
            <label className="block text-[10px] font-bold uppercase text-slate-400 tracking-widest mb-1">
              Short Description <span className="text-blue-500">(Editable)</span>
            </label>
            <input
              type="text"
              maxLength={40}
              className="input text-[13px]"
              value={editData.description}
              onChange={e => setEditData(prev => ({ ...prev, description: e.target.value }))}
            />
            <p className="text-[10px] text-slate-400 mt-1 text-right">{editData.description.length}/40</p>
          </div>

          {/* Control Code (editable, validated) */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-[10px] font-bold uppercase text-slate-400 tracking-widest">
                Control Code (HSN) <span className="text-blue-500">(Editable)</span>
              </label>
              <span
                className="text-[10px] font-bold tabular-nums"
                style={{ color: ccError ? '#ef4444' : editData.control_code.length >= 4 ? '#16a34a' : '#94a3b8' }}
              >
                {editData.control_code.length}/8
              </span>
            </div>
            <input
              type="text"
              inputMode="numeric"
              maxLength={8}
              className="input text-[13px]"
              placeholder="4–8 digits, e.g. 7210"
              style={{
                borderColor: ccError ? '#ef4444' : editData.control_code.length >= 4 ? '#22c55e' : undefined,
                boxShadow:   ccError ? '0 0 0 3px rgba(239,68,68,.1)' : editData.control_code.length >= 4 ? '0 0 0 3px rgba(34,197,94,.1)' : undefined,
              }}
              value={editData.control_code}
              onChange={e => handleCCChange(e.target.value)}
              onKeyDown={handleCCKeyDown}
              onPaste={handleCCPaste}
            />
            {ccError
              ? <p className="text-[10px] text-red-500 font-bold mt-1 flex items-center gap-1"><AlertCircle size={9}/> {ccError}</p>
              : editData.control_code.length >= 4
              ? <p className="text-[10px] text-emerald-600 font-bold mt-1">✓ Valid</p>
              : null
            }
          </div>
        </div>

        {/* Approve only */}
        <div className="card border border-slate-100 shadow-sm">
          <button
            onClick={() => handleAction('APPROVE')}
            disabled={approveDisabled}
            className="btn btn-success w-full shadow-sm hover:shadow-md transition-shadow"
            style={{ opacity: approveDisabled ? 0.6 : 1, cursor: approveDisabled ? 'not-allowed' : 'pointer' }}
          >
            {submitting ? <><Loader2 size={14} className="animate-spin"/> Approving…</> : <><CheckCircle2 size={14}/> Approve</>}
          </button>
          {approveDisabled && !submitting && editData.control_code.length > 0 && editData.control_code.length < 4 && (
            <p className="text-[11px] text-red-500 font-medium text-center mt-2">Fix Control Code before approving</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      {/* Left: details */}
      <div className="lg:col-span-2 space-y-4">
        <div className="card border border-slate-100 shadow-sm">
          <div className="flex justify-between items-start mb-4 pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-[15px] font-bold text-slate-800 font-mono tracking-tight">{req.req_number}</h2>
              <p className="text-[11px] text-slate-400 mt-0.5 uppercase tracking-wider">
                {req.material_type} · {req.department||'—'} · Submitted by {req.requester_name||'—'}
              </p>
            </div>
            <button onClick={onClose} className="btn btn-ghost btn-sm text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all">✕ Close</button>
          </div>

          {/* Info grid */}
          <div className="grid grid-cols-3 gap-2 mb-2">
            {[
              { label:'Material Type',    value:canEditMatType?editData.material_type:req.material_type },
              { label:'Plant',            value:req.plant },
              { label:'Storage Location', value:req.storage_location },
            ].map(({ label, value }) => (
              <div key={label} className="info-field">
                <p className="info-label">{label}</p>
                <p className="info-value truncate">{value||'—'}</p>
              </div>
            ))}
          </div>

          <div className="info-field mb-2">
            <p className="info-label">Short Description</p>
            <p className="info-value">{canEdit ? editData.description || '—' : req.description || '—'}</p>
          </div>

          <div className="info-field mb-2">
            <p className="info-label">Long Description</p>
            <p className="text-[13px] text-slate-600 leading-relaxed">{req.long_description||'—'}</p>
          </div>

          <div className="grid grid-cols-3 gap-2 mb-4">
            {[
              { label:'Base UOM',       value:req.uom },
              { label:'Purchase Group', value:req.purchase_group },
              { label:'Material Group', value:canEditGrp?editData.material_group:req.material_group },
            ].map(({ label, value }) => (
              <div key={label} className="info-field">
                <p className="info-label">{label}</p>
                <p className="info-value truncate">{value||'—'}</p>
              </div>
            ))}
          </div>

          {/* Current approver */}
          {req.current_approver_name && req.status!=='Approved' && req.status!=='Rejected' ? (
            <div className="rounded-xl p-4 border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 shadow-sm">
              <p className="text-[10px] font-bold uppercase tracking-widest text-amber-600 mb-2.5 flex items-center gap-1">
                <Clock size={10} className="animate-pulse"/> Current Approver
              </p>
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 text-white flex items-center justify-center font-bold text-[12px] shrink-0 shadow-sm">
                  {(req.current_approver_name||'?')[0].toUpperCase()}
                </div>
                <div>
                  <p className="font-bold text-slate-800 text-[13px]">{req.current_approver_name}</p>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider">{req.current_approver_role}</p>
                  {req.current_approver_email && (
                    <p className="text-[10px] text-blue-600 flex items-center gap-1 mt-0.5"><Mail size={9}/> {req.current_approver_email}</p>
                  )}
                </div>
              </div>
              {req.pending_since && (
                <p className="text-[10px] text-slate-400 mt-2.5 pt-2.5 border-t border-amber-200">Since {fmt(req.pending_since)}</p>
              )}
            </div>
          ) : (
            <div className={`rounded-xl p-4 border-2 ${req.status==='Approved'?'bg-emerald-50 border-emerald-200':'bg-slate-50 border-slate-200'}`}>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Workflow Status</p>
              <p className={`font-bold text-[13px] ${req.status==='Approved'?'text-emerald-700':'text-slate-600'}`}>{req.status}</p>
            </div>
          )}

          {/* Editable fields */}
          {canEdit && (
            <div className="mt-4 space-y-3">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-center justify-between gap-2 text-[12px] text-blue-700 font-semibold shadow-sm">
                <div className="flex items-center gap-2">
                  <AlertCircle size={13} className="text-blue-500 shrink-0"/>
                  {isIT ? 'IT Team — full edit access. Changes saved on Approve.' : 'You have edit permissions for this stage. Changes will be saved on Approve.'}
                </div>
                {hasEdits && (
                  <span className="shrink-0 text-[10px] font-black px-2 py-0.5 rounded-full"
                    style={{ background: '#fef3c7', color: '#92400e', border: '1px solid #fde68a' }}>
                    {editedFields.length} Change{editedFields.length > 1 ? 's' : ''} Pending
                  </span>
                )}
              </div>

              {/* Material Type */}
              {canEditMatType && (
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 tracking-widest mb-1">Material Type</label>
                  <div className="relative">
                    <select className="input appearance-none pr-8 text-[13px]" value={editData.material_type}
                      style={editStyle('material_type')}
                      onChange={e => setEditData(p=>({...p,material_type:e.target.value}))}>
                      {['ZMIS','ZEIS','ZCOM','ZPAC','ZPRT'].map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={13}/>
                  </div>
                  {editData.material_type!==req.material_type && (
                    <p className="text-[10px] text-amber-600 font-bold mt-0.5">⚠ Changed from {req.material_type} → {editData.material_type}. Workflow will continue forward.</p>
                  )}
                </div>
              )}

              {/* Short Description */}
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 tracking-widest mb-1">Short Description</label>
                <input type="text" maxLength={40} className="input text-[13px]" value={editData.description}
                  style={editStyle('description')}
                  onChange={e => setEditData(p=>({...p,description:e.target.value}))}/>
                <p className="text-[10px] text-slate-400 mt-0.5 text-right">{editData.description.length}/40</p>
              </div>

              {/* Long Description — IT Team only */}
              {isIT && (
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 tracking-widest mb-1">Long Description</label>
                  <textarea rows={3} maxLength={200} className="input resize-none text-[13px]" value={editData.long_description}
                    style={editStyle('long_description')}
                    onChange={e => setEditData(p=>({...p,long_description:e.target.value}))}/>
                  <p className="text-[10px] text-slate-400 mt-0.5 text-right">{editData.long_description.length}/200</p>
                </div>
              )}

              {/* Plant + Storage Location — IT Team only */}
              {isIT && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-400 tracking-widest mb-1">Plant</label>
                    <input type="text" className="input text-[13px]" value={editData.plant}
                      style={editStyle('plant')}
                      onChange={e => setEditData(p=>({...p,plant:e.target.value}))}/>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-400 tracking-widest mb-1">Storage Location</label>
                    <input type="text" className="input text-[13px]" value={editData.storage_location}
                      style={editStyle('storage_location')}
                      onChange={e => setEditData(p=>({...p,storage_location:e.target.value}))}/>
                  </div>
                </div>
              )}

              {/* Purchasing Group — IT Team only */}
              {isIT && (
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 tracking-widest mb-1">Purchasing Group</label>
                  <input type="text" className="input text-[13px]" value={editData.purchase_group}
                    style={editStyle('purchase_group')}
                    onChange={e => setEditData(p=>({...p,purchase_group:e.target.value}))}/>
                </div>
              )}

              {/* Control Code + Material Group */}
              <div className="grid grid-cols-2 gap-3">
                {canEditHSN && (
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">Control Code (HSN)</span>
                      <span className="text-[10px] font-bold tabular-nums" style={{ color: ccError ? '#ef4444' : editData.control_code.length >= 4 ? '#16a34a' : '#94a3b8' }}>
                        {editData.control_code.length}/8
                      </span>
                    </div>
                    <input
                      type="text" inputMode="numeric" maxLength={8} className="input text-[13px]"
                      placeholder="4–8 digits"
                      style={{ ...editStyle('control_code'), ...(ccError ? { borderColor:'#ef4444', boxShadow:'0 0 0 3px rgba(239,68,68,.1)' } : editData.control_code.length >= 4 ? { borderColor:'#22c55e', boxShadow:'0 0 0 3px rgba(34,197,94,.1)' } : {}) }}
                      value={editData.control_code}
                      onChange={e => handleCCChange(e.target.value)}
                      onKeyDown={handleCCKeyDown}
                      onPaste={handleCCPaste}
                    />
                    {ccError && <p className="text-[10px] text-red-500 font-bold mt-1 flex items-center gap-1"><AlertCircle size={9}/> {ccError}</p>}
                    {!ccError && editData.control_code.length >= 4 && <p className="text-[10px] text-emerald-600 font-bold mt-1">Valid</p>}
                  </div>
                )}
                {canEditGrp && (
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-400 tracking-widest mb-1">Material Group</label>
                    <input type="text" className="input text-[13px]" value={editData.material_group}
                      style={editStyle('material_group')}
                      onChange={e => setEditData(p=>({...p,material_group:e.target.value}))}/>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right: actions + timeline */}
      <div className="space-y-4">
        <div className="card border border-slate-100 shadow-sm space-y-4">
          <h3 className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Your Decision</h3>
          <textarea rows={3} placeholder="Add comments (optional)…"
            className="input resize-none text-[13px] focus:ring-2 focus:ring-blue-200 transition-all"
            value={comments} onChange={e => setComments(e.target.value)}/>
          <div className="space-y-2">
            <button onClick={() => handleAction('APPROVE')} disabled={submitting} className="btn btn-success w-full shadow-sm hover:shadow-md transition-shadow">
              {submitting ? <Loader2 size={14} className="animate-spin"/> : <CheckCircle2 size={14}/>} Approve
            </button>
            {canSendBack && (
              <button onClick={() => handleAction('SEND_BACK')} disabled={submitting} className="btn btn-warning w-full shadow-sm hover:shadow-md transition-shadow">
                <CornerUpLeft size={14}/> Send Back
              </button>
            )}
            <button onClick={onClose} className="btn btn-secondary w-full">
              <Eye size={14}/> View Only / Cancel
            </button>
          </div>
        </div>

        <div className="card border border-slate-100 shadow-sm">
          <h3 className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-4">Approval Timeline</h3>
          <Timeline stages={stages}/>
        </div>
      </div>
    </div>
  );
};

// ── Main Page ─────────────────────────────────────────────────────────────────
const Approvals = () => {
  const { user } = useAuth();
  const [queue, setQueue]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [selected, setSelected] = useState(null);

  const fetchQueue = useCallback(async () => {
    setLoading(true);
    try { const r = await api.get('/workflow/pending'); setQueue(Array.isArray(r.data)?r.data:[]); }
    catch { setQueue([]); } finally { setLoading(false); }
  }, []);
  useEffect(() => { fetchQueue(); }, [fetchQueue]);

  const handleExport = async () => {
    try {
      // ── Today's date boundaries (local midnight → midnight) ──
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const todayEnd = new Date();
      todayEnd.setHours(23, 59, 59, 999);

      const isToday = (iso) => {
        if (!iso) return false;
        const d = new Date(iso);
        return d >= todayStart && d <= todayEnd;
      };

      // ── Filter: Approved or Completed, updated_at must be today ──
      const eligible = queue.filter(req => {
        const statusOk = req.status === 'Approved' || req.current_stage === 'Completed';
        const dateOk   = isToday(req.updated_at) || isToday(req.created_at);
        return statusOk && dateOk;
      });

      if (eligible.length === 0) {
        alert('No approved or completed requests found for today.');
        return;
      }

      // ── Fetch IT Team approver name from history for each request ──
      const rows = [];
      for (const req of eligible) {
        let approvedBy = '';
        let completedTime = '';
        try {
          const hr = await api.get(`/workflow/${req.id}/history`);
          const history = Array.isArray(hr.data) ? hr.data : [];
          // Find the IT Team APPROVE action
          const itEntry = history.slice().reverse().find(
            h => h.action === 'APPROVE' && (h.stage === 'IT Team' || h.approver_role === 'IT Team')
          );
          if (itEntry) {
            approvedBy    = itEntry.approver_name || '';
            completedTime = itEntry.created_at
              ? new Date(itEntry.created_at).toLocaleString('en-IN', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' })
              : '';
          }
        } catch (_) {}

        rows.push({
          'Request ID':       req.req_number,
          'Material Code':    req.req_number,
          'Short Description':req.description || req.material_name || '',
          'Material Type':    req.material_type || '',
          'Control Code':     req.control_code || '',
          'Final Status':     req.status,
          'Approved By':      approvedBy,
          'Completed Time':   completedTime,
        });
      }

      const ws = XLSX.utils.json_to_sheet(rows);

      // Auto-fit column widths
      const colWidths = Object.keys(rows[0] || {}).map(k => ({
        wch: Math.max(k.length, ...rows.map(r => String(r[k] || '').length)) + 2
      }));
      ws['!cols'] = colWidths;

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Approved Today');
      XLSX.writeFile(wb, `Approved_${new Date().toISOString().split('T')[0]}.xlsx`);
    } catch (err) { alert('Export failed: ' + err.message); }
  };

  const handlePrint = () => window.print();
  const handleActionDone = () => { setSelected(null); fetchQueue(); };

  const STAGE_BANNER = ['Submitted','Plant Head','Dept Team*','Purchase Team','GST Team','Store Head','IT Team'];

  return (
    <div className="space-y-5 page-enter">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Approval Queue</h1>
          <p className="page-sub">
            Viewing as: <span className="font-semibold text-blue-600">{user?.role??'Approver'}</span>
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-lg text-blue-700 font-bold text-[12px] shadow-sm">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-400 mr-1.5 align-middle"/>Queue: {queue.length}
          </div>
          <button onClick={fetchQueue} className="btn btn-secondary btn-sm" title="Refresh">
            <RefreshCw size={13}/>
          </button>
          {user?.role==='IT Team' && (
            <>
              <button onClick={handleExport} className="btn btn-secondary btn-sm">
                <Download size={13}/> Export
              </button>
              <button onClick={handlePrint} className="btn btn-secondary btn-sm">
                <Printer size={13}/> Print
              </button>
            </>
          )}
          {selected && (
            <button onClick={() => setSelected(null)} className="btn btn-secondary btn-sm">
              ← Back to Queue
            </button>
          )}
        </div>
      </div>

      {selected ? (
        <DetailPanel req={selected} onClose={() => setSelected(null)} onActionDone={handleActionDone} userRole={user?.role}/>
      ) : (
        <>
          {/* Workflow path banner */}
          <div className="card py-3.5 border border-slate-100 shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">
              Workflow Path <span className="text-slate-300 font-normal normal-case tracking-normal">(*Dept Team only for Mechanical/Electrical)</span>
            </p>
            <div className="flex items-center gap-1 flex-wrap">
              {STAGE_BANNER.map((stage, i, arr) => (
                <React.Fragment key={stage}>
                  <span className={`badge transition-all ${
                    stage.replace('*','')===user?.role||stage===user?.role
                      ? 'badge-info ring-2 ring-blue-200 shadow-sm'
                      : 'badge-default'
                  }`}>{stage}</span>
                  {i < arr.length-1 && <ChevronRight size={12} className="text-slate-300 shrink-0"/>}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Queue table */}
          <div className="card-flat overflow-hidden">
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead><tr>
                  {['Request #','Material','Dept / Type','Current Approver','Stage','Priority','Submitted','Action'].map(h => (
                    <th key={h}>{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan="8" className="py-16 text-center text-slate-400">
                      <Loader2 size={20} className="animate-spin mx-auto mb-2"/>
                      Loading queue…
                    </td></tr>
                  ) : queue.length===0 ? (
                    <tr><td colSpan="8">
                      <div className="empty-state">
                        <div className="empty-icon"><CheckCircle2 size={20} className="text-emerald-500"/></div>
                        <p className="text-[14px] font-semibold text-slate-500 mt-1">Queue is empty</p>
                        <p className="text-[12px] text-slate-400">All caught up — no pending approvals</p>
                      </div>
                    </td></tr>
                  ) : queue.map(req => (
                    <tr key={req.id} className="hover:bg-blue-50/30 transition-colors">
                      <td className="font-bold text-blue-600 text-[12px] font-mono whitespace-nowrap">{req.req_number}</td>
                      <td>
                        <p className="font-semibold text-slate-800 text-[13px]">{req.description||req.material_name}</p>
                        <p className="text-[10px] text-slate-400 uppercase font-medium mt-0.5 tracking-wide">{req.material_type}</p>
                      </td>
                      <td>
                        <p className="font-medium text-slate-700 text-[13px]">{req.department||'—'}</p>
                        <p className="text-[11px] text-slate-400">{req.plant}</p>
                      </td>
                      <td>
                        {req.current_approver_name ? (
                          <div>
                            <p className="font-semibold text-slate-800 text-[13px]">{req.current_approver_name}</p>
                            <p className="text-[11px] text-slate-400">{req.current_approver_role}</p>
                            {req.current_approver_email && (
                              <p className="text-[10px] text-blue-600 flex items-center gap-0.5 mt-0.5">
                                <Mail size={8}/> {req.current_approver_email}
                              </p>
                            )}
                          </div>
                        ) : <span className="text-slate-300 text-[13px]">—</span>}
                      </td>
                      <td><span className={statusBadge(req.status)}>{req.current_stage}</span></td>
                      <td><span className={PRIORITY_BADGE[req.priority]||'badge badge-default'}>{req.priority||'Medium'}</span></td>
                      <td className="text-slate-400 text-[12px] whitespace-nowrap">
                        <span className="flex items-center gap-1"><Calendar size={10}/> {fmt(req.created_at)}</span>
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <button onClick={() => setSelected(req)} className="btn btn-primary btn-sm shadow-sm hover:shadow-md transition-shadow">
                            Review <ArrowRight size={11}/>
                          </button>
                          <button onClick={() => setSelected(req)} className="p-1.5 border border-slate-200 rounded-lg text-slate-400 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50 transition-all" title="View">
                            <Eye size={13}/>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Approvals;
