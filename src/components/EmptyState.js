import React from 'react';
import { Package } from 'lucide-react';

const EmptyState = ({ message, onActionClick, actionText = "添加第一个物品" }) => {
  return (
    <div className="text-center py-16 px-4">
      {/* 空状态图标 */}
      <div className="mx-auto h-24 w-24 text-gray-400 mb-4">
        <Package size={96} className="mx-auto" />
      </div>
      
      <h3 className="mt-4 text-lg font-medium text-gray-900">空空如也</h3>
      <p className="mt-2 text-sm text-gray-500">{message}</p>
      
      <div className="mt-6">
        <button
          type="button"
          onClick={onActionClick}
          className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
        >
          + {actionText}
        </button>
      </div>
    </div>
  );
};

export default EmptyState; 