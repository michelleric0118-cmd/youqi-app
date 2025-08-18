import React from 'react';
import { Package, Search, Filter, Calendar, AlertTriangle, Plus } from 'lucide-react';

const EmptyState = ({ 
  type = 'default', 
  message, 
  onActionClick, 
  actionText = "添加第一个物品",
  secondaryAction,
  secondaryActionText,
  onSecondaryActionClick,
  showIconOnly = false
}) => {
  const getEmptyStateConfig = () => {
    switch (type) {
      case 'search':
        return {
          icon: <Search size={96} className="mx-auto" />,
          title: '未找到相关物品',
          description: message || '试试更换关键词，或清除筛选条件',
          primaryAction: '清除搜索',
          secondaryAction: '添加新物品',
          iconColor: '#9CA3AF'
        };
      case 'filter':
        return {
          icon: <Filter size={96} className="mx-auto" />,
          title: '筛选结果为空',
          description: message || '当前筛选条件下没有找到物品',
          primaryAction: '清除筛选',
          secondaryAction: '查看全部物品',
          iconColor: '#F59E0B'
        };
      case 'expiring':
        return {
          icon: <Calendar size={96} className="mx-auto" />,
          title: '暂无过期物品',
          description: message || '',
          primaryAction: '查看全部物品',
          secondaryAction: '添加新物品',
          iconColor: 'var(--sage-green)'
        };
      case 'category':
        return {
          icon: <Package size={96} className="mx-auto" />,
          title: '分类下暂无物品',
          description: message || '这个分类还没有添加任何物品',
          primaryAction: '添加物品到此分类',
          secondaryAction: '查看全部物品',
          iconColor: '#8B5CF6'
        };
      case 'error':
        return {
          icon: <AlertTriangle size={96} className="mx-auto" />,
          title: '加载失败',
          description: message || '无法加载物品数据，请检查网络连接',
          primaryAction: '重试',
          secondaryAction: '刷新页面',
          iconColor: '#EF4444'
        };
      default:
        return {
          icon: <Package size={96} className="mx-auto" />,
          title: '开始记录您的第一个物品吧！',
          description: message || '',
          primaryAction: actionText,
          secondaryAction: secondaryActionText,
          iconColor: '#9CA3AF'
        };
    }
  };

  const config = getEmptyStateConfig();

  return (
    <div className="text-center py-16 px-4">
      {/* 空状态图标 */}
      <div className="mx-auto h-24 w-24 mb-4" style={{ color: config.iconColor }}>
        {config.icon}
      </div>
      
      <h3 className="mt-4 text-lg font-medium" style={{ color: '#2c2c2c' }}>
        {config.title}
      </h3>
      <p className="mt-2 text-sm" style={{ color: '#666' }}>
        {config.description}
      </p>
      
      <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center items-center">
        <button
          type="button"
          onClick={onActionClick}
          className="btn"
          style={{ 
            background: 'var(--sage-green)', 
            color: 'white',
            padding: showIconOnly ? '16px' : '12px 24px',
            fontSize: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: showIconOnly ? '0' : '8px',
            borderRadius: showIconOnly ? '50%' : '8px',
            width: showIconOnly ? '56px' : 'auto',
            height: showIconOnly ? '56px' : 'auto',
            minWidth: showIconOnly ? '56px' : 'auto'
          }}
          title={showIconOnly ? "添加物品" : ""}
        >
          <Plus size={showIconOnly ? 24 : 16} />
          {!showIconOnly && config.primaryAction}
        </button>
        
        {secondaryAction && onSecondaryActionClick && (
          <button
            type="button"
            onClick={onSecondaryActionClick}
            className="btn btn-secondary"
            style={{ 
              background: '#f8f9fa',
              color: '#666',
              border: '1px solid #ddd',
              padding: '12px 24px',
              fontSize: '16px'
            }}
          >
            {config.secondaryAction}
          </button>
        )}
      </div>
    </div>
  );
};

export default EmptyState; 