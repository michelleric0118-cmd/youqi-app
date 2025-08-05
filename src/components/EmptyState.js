import React from 'react';
import { Package } from 'lucide-react';

const EmptyState = ({ message, onActionClick, actionText = "添加第一个物品" }) => {
  return (
    <div className="text-center py-16 px-4">
      {/* 空状态图标 */}
      <div className="mx-auto h-24 w-24 text-gray-400 mb-4">
        <Package size={96} className="mx-auto" />
      </div>
      
      <h3 className="mt-4 text-lg font-medium" style={{ color: '#2c2c2c' }}>空空如也</h3>
      <p className="mt-2 text-sm" style={{ color: '#666' }}>{message}</p>
      
      <div className="mt-6">
        <button
          type="button"
          onClick={onActionClick}
          className="btn"
          style={{ 
            background: 'var(--sage-green)', 
            color: 'white',
            padding: '12px 24px',
            fontSize: '16px'
          }}
        >
          + {actionText}
        </button>
      </div>
    </div>
  );
};

export default EmptyState; 