import React, { useState } from 'react';
import { Clock, AlertTriangle, XCircle } from 'lucide-react';
import { useItems } from '../../hooks/useItems';
import { getExpiryStatus, getExpiryText } from '../../utils/itemUtils';

const Expiring = () => {
  const { getExpiringItems } = useItems();
  const [filter, setFilter] = useState('all');

  const filterOptions = [
    { value: 'all', label: '全部', icon: Clock },
    { value: 'expired', label: '已过期', icon: XCircle },
    { value: 'expiring-soon', label: '7天内过期', icon: AlertTriangle },
    { value: 'expiring-month', label: '30天内过期', icon: Clock }
  ];

  const expiringItems = getExpiringItems(filter);

  const getFilterStats = () => {
    const all = getExpiringItems('all').length;
    const expired = getExpiringItems('expired').length;
    const expiringSoon = getExpiringItems('expiring-soon').length;
    const expiringMonth = getExpiringItems('expiring-month').length;

    return { all, expired, expiringSoon, expiringMonth };
  };

  const stats = getFilterStats();

  return (
    <div>
      <div className="card">
        <h2>过期管理</h2>
        
        {/* 筛选选项 */}
        <div className="tabs">
          {filterOptions.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              className={`tab ${filter === value ? 'active' : ''}`}
              onClick={() => setFilter(value)}
            >
              <Icon size={16} style={{ marginRight: '8px' }} />
              {label}
              {value === 'all' && ` (${stats.all})`}
              {value === 'expired' && ` (${stats.expired})`}
              {value === 'expiring-soon' && ` (${stats.expiringSoon})`}
              {value === 'expiring-month' && ` (${stats.expiringMonth})`}
            </button>
          ))}
        </div>

        {/* 物品列表 */}
        <div className="items-list">
          {expiringItems.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
              <Clock size={48} style={{ marginBottom: '20px', opacity: 0.5 }} />
              <p>暂无{filter === 'all' ? '' : filter === 'expired' ? '已过期' : filter === 'expiring-soon' ? '即将过期' : '30天内过期'}的物品</p>
            </div>
          ) : (
            expiringItems.map(item => {
              const expiryStatus = getExpiryStatus(item.expiryDate);
              const expiryInfo = getExpiryText(item.expiryDate);
              
              return (
                <div key={item.id} className={`item ${expiryStatus}`}>
                  <div className="item-header">
                    <div className="item-name">{item.name}</div>
                    <div className="item-category">{item.category}</div>
                  </div>
                  <div className="item-details">
                    {item.brand && `品牌: ${item.brand} | `}
                    数量: {item.quantity} | 
                    <span className={expiryInfo.className}> {expiryInfo.text}</span>
                  </div>
                  {item.notes && (
                    <div className="item-details" style={{ marginTop: '5px' }}>
                      备注: {item.notes}
                    </div>
                  )}
                  {item.medicineTags && item.medicineTags.length > 0 && (
                    <div className="selected-tags">
                      {item.medicineTags.map(tag => (
                        <span key={tag} className="selected-tag">{tag}</span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {expiringItems.length > 0 && (
          <div style={{ marginTop: '20px', textAlign: 'center' }}>
            <p>共找到 {expiringItems.length} 个{filter === 'all' ? '' : filter === 'expired' ? '已过期' : filter === 'expiring-soon' ? '即将过期' : '30天内过期'}的物品</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Expiring; 