import React from 'react';

// 最简单的测试组件
const SettingsTest = ({ onClose }) => {
  console.log('🔍 SettingsTest组件已渲染');
  
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        background: 'white',
        padding: '20px',
        borderRadius: '8px',
        maxWidth: '400px',
        width: '90%'
      }}>
        <h2>设置测试</h2>
        <p>如果您能看到这个组件，说明基本渲染正常</p>
        <button 
          onClick={onClose}
          style={{
            background: '#10b981',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          关闭
        </button>
      </div>
    </div>
  );
};

export default SettingsTest; 