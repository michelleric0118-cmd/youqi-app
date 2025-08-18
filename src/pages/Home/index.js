import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, Plus, Eye } from 'lucide-react';
import { useLeanCloudItems } from '../../hooks/useLeanCloudItems';
import { getExpiryStatus, getExpiryText } from '../../utils/itemUtils';

const Home = () => {
  const { items, getStats } = useLeanCloudItems();
  const stats = getStats();
  const [isElderMode, setIsElderMode] = useState(false);

  // 获取最近添加的物品
  const recentItems = items.slice(0, 5);

  // 切换老年人模式
  const toggleElderMode = () => {
    setIsElderMode(!isElderMode);
    // 可以在这里添加字体大小切换逻辑
    if (!isElderMode) {
      document.body.style.fontSize = '18px';
      document.body.style.lineHeight = '1.8';
      // 更新导航栏字体大小
      const navbarElements = document.querySelectorAll('.navbar-tab, .navbar-title, .navbar-subtitle');
      navbarElements.forEach(element => {
        element.style.fontSize = '18px';
      });
    } else {
      document.body.style.fontSize = '16px';
      document.body.style.lineHeight = '1.6';
      // 恢复导航栏字体大小
      const navbarElements = document.querySelectorAll('.navbar-tab, .navbar-title, .navbar-subtitle');
      navbarElements.forEach(element => {
        element.style.fontSize = '';
      });
    }
  };

  // 导出数据功能已移至DataImport组件

  return (
    <div>
      {/* 老年人模式切换 */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3>老年人模式</h3>
          <button
            onClick={toggleElderMode}
            className="btn"
            style={{ 
              background: isElderMode ? 'var(--sage-green)' : '#f8f9fa',
              color: isElderMode ? 'white' : '#333',
              border: '1px solid var(--sage-green)',
              padding: '8px 16px',
              borderRadius: '6px',
              fontSize: isElderMode ? '16px' : '14px'
            }}
          >
            <Eye size={16} style={{ marginRight: '6px' }} />
            {isElderMode ? '已开启' : '开启'}
          </button>
        </div>
        {/* 冗余提示已删除 - 按钮状态已经足够清晰 */}
      </div>

      {/* 核心统计指标（突出展示） */}
      <div className="core-stats">
        <Link to="/items" className="stat-card core-stat">
          <div className="stat-number">{stats.total}</div>
          <div className="stat-label">总物品</div>
        </Link>
        <Link to="/expiring?filter=soon" className="stat-card core-stat">
          <div className="stat-number">{stats.expiringSoon}</div>
          <div className="stat-label">即将过期</div>
        </Link>
        <Link to="/expiring?filter=expired" className="stat-card core-stat">
          <div className="stat-number">{stats.expired}</div>
          <div className="stat-label">已过期</div>
        </Link>
      </div>

      {/* 悬浮添加按钮 */}
      <Link to="/add" className="fab">
        <Plus size={24} />
      </Link>

      {/* 最近添加的物品 */}
      <div className="card">
        <h3>最近添加的物品</h3>
        <div className="items-list">
          {recentItems.length === 0 ? (
            <p>暂无物品</p>
          ) : (
            recentItems.map((item, index) => {
              const expiryStatus = getExpiryStatus(item.expiryDate);
              const expiryInfo = getExpiryText(item.expiryDate);
              
              return (
                <div key={`${item.id}-${index}`} className={`item ${expiryStatus}`}>
                  <div className="item-header">
                    <div className="item-name">{item.name}</div>
                    <div className="item-category">{item.category}</div>
                  </div>
                  <div className="item-details">
                    {item.brand && `品牌: ${item.brand} | `}
                    数量: {item.quantity} | 
                    <span className={expiryInfo.className}> {expiryInfo.text}</span>
                  </div>
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
        {items.length > 5 && (
          <div style={{ textAlign: 'center', marginTop: '15px' }}>
            <Link to="/items" className="btn btn-secondary">
              <Package size={16} style={{ marginRight: '8px' }} />
              查看所有物品
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home; 