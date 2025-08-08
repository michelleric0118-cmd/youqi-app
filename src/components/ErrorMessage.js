import React from 'react';
import { AlertCircle, RefreshCw, WifiOff, Lock, AlertTriangle, Server } from 'lucide-react';
import i18n from '../utils/i18n';
import { ErrorTypes } from '../utils/errorHandler';

const ErrorMessage = ({ error, onRetry, className = '' }) => {
  // 根据错误类型选择图标
  const getIcon = () => {
    switch (error.type) {
      case ErrorTypes.NETWORK:
        return <WifiOff size={24} className="text-red-500" />;
      case ErrorTypes.AUTH:
        return <Lock size={24} className="text-yellow-500" />;
      case ErrorTypes.SERVER:
        return <Server size={24} className="text-red-500" />;
      case ErrorTypes.VALIDATION:
        return <AlertTriangle size={24} className="text-yellow-500" />;
      default:
        return <AlertCircle size={24} className="text-red-500" />;
    }
  };

  // 获取错误背景色
  const getBackgroundColor = () => {
    switch (error.type) {
      case ErrorTypes.NETWORK:
      case ErrorTypes.SERVER:
        return 'bg-red-50';
      case ErrorTypes.AUTH:
      case ErrorTypes.VALIDATION:
        return 'bg-yellow-50';
      default:
        return 'bg-gray-50';
    }
  };

  return (
    <div className={`
      ${getBackgroundColor()}
      rounded-lg 
      p-4 
      mb-4 
      flex 
      items-start 
      gap-3
      border
      ${error.type === ErrorTypes.NETWORK || error.type === ErrorTypes.SERVER ? 'border-red-200' : 'border-yellow-200'}
      ${className}
    `}>
      <div className="flex-shrink-0">
        {getIcon()}
      </div>
      
      <div className="flex-1">
        <h3 className="text-sm font-medium text-gray-900">
          {error.title}
        </h3>
        
        <div className="mt-1 text-sm text-gray-600">
          {error.message}
        </div>

        {onRetry && (
          <button
            onClick={onRetry}
            className="mt-3 flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-500"
          >
            <RefreshCw size={16} />
            {error.action || i18n.t('tryAgainAction')}
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorMessage;