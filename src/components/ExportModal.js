import React, { useState } from 'react';

const ExportModal = ({ open, onClose, onConfirm }) => {
  const [format, setFormat] = useState('csv');
  if (!open) return null;
  return (
    <div className="user-management-overlay">
      <div className="user-management-modal">
        <div className="user-management-header">
          <h3>导出选中物品</h3>
          <button onClick={onClose} className="close-btn">×</button>
        </div>
        <div className="user-management-content">
          <div className="invite-section">
            <h4>选择导出格式</h4>
            <div style={{ display: 'flex', gap: 12 }}>
              {['csv','json','xlsx'].map(f => (
                <label key={f} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <input type="radio" name="export-format" checked={format===f} onChange={()=>setFormat(f)} />
                  {f.toUpperCase()}
                </label>
              ))}
            </div>
            <div style={{ textAlign: 'right', marginTop: 12 }}>
              <button className="btn" style={{ background: 'var(--sage-green)', color: '#fff' }} onClick={()=>onConfirm(format)}>开始导出</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportModal;
