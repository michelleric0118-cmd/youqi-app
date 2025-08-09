import React, { useState } from 'react';

const BatchEditModal = ({ open, onClose, onApply, categories = [] }) => {
  const [form, setForm] = useState({ category: '', brand: '', notesAppend: '' });
  if (!open) return null;
  return (
    <div className="user-management-overlay">
      <div className="user-management-modal">
        <div className="user-management-header">
          <h3>批量编辑</h3>
          <button onClick={onClose} className="close-btn">×</button>
        </div>
        <div className="user-management-content">
          <div className="invite-section">
            <h4>统一设置</h4>
            <div className="form-group">
              <label>分类</label>
              <select value={form.category} onChange={e=>setForm({ ...form, category: e.target.value })}>
                <option value="">不修改</option>
                {categories.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>品牌</label>
              <input value={form.brand} onChange={e=>setForm({ ...form, brand: e.target.value })} placeholder="留空表示不修改" />
            </div>
            <div className="form-group">
              <label>备注追加</label>
              <input value={form.notesAppend} onChange={e=>setForm({ ...form, notesAppend: e.target.value })} placeholder="将追加到现有备注后" />
            </div>
            <div style={{ textAlign: 'right' }}>
              <button className="btn" onClick={()=>onApply(form)} style={{ background: 'var(--sage-green)', color: '#fff' }}>应用</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BatchEditModal;
