import React from 'react';

const PaywallModal = ({ used = 40, limit = 40, onClose, onUpgrade }) => {
  return (
    <div className="ocr-scanner-overlay">
      <div className="ocr-scanner-modal">
        <div className="ocr-scanner-header">
          <h3>已达内测OCR额度</h3>
          <button onClick={onClose} className="close-btn">×</button>
        </div>
        <div className="ocr-scanner-content">
          <p style={{ marginBottom: 12 }}>本月已使用 {used}/{limit} 次 OCR 识别。</p>
          <p style={{ marginBottom: 20 }}>升级为高级版可继续使用，并解锁更高额度与高级功能。</p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <button className="btn-secondary" onClick={onClose}>稍后再说</button>
            <button className="btn" style={{ background: 'var(--sage-green)', color: '#fff' }} onClick={onUpgrade}>去升级</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaywallModal;
