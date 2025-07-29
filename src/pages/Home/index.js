import React from 'react';
import { Link } from 'react-router-dom';
import { Plus, Package } from 'lucide-react';
import { useFirebaseItems } from '../../hooks/useFirebaseItems';
import { getExpiryStatus, getExpiryText } from '../../utils/itemUtils';

const Home = () => {
  const { items, getStats, addTestData, firebaseConnected, syncStatus } = useFirebaseItems();
  const stats = getStats();

  const recentItems = items.slice(0, 5);

  return (
    <div>
      {/* 统计卡片 */}
      <div className="stats">
        <div className="stat-card">
          <div className="stat-number">{stats.total}</div>
          <div className="stat-label">总物品</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.expiringSoon}</div>
          <div className="stat-label">即将过期</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.expired}</div>
          <div className="stat-label">已过期</div>
        </div>
      </div>

      {/* 数据同步状态 */}
      <div className="card">
        <h3>数据同步状态</h3>
        <div style={{ marginBottom: '15px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
            <span>Firebase连接：</span>
            <span style={{ 
              color: firebaseConnected ? 'green' : 'red',
              fontWeight: 'bold'
            }}>
              {firebaseConnected ? '✅ 已连接' : '❌ 未连接'}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span>同步状态：</span>
            <span style={{ 
              color: syncStatus === 'idle' ? 'green' : syncStatus === 'syncing' ? 'orange' : 'red',
              fontWeight: 'bold'
            }}>
              {syncStatus === 'idle' ? '✅ 已同步' : syncStatus === 'syncing' ? '⏳ 同步中' : '❌ 同步失败'}
            </span>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <Link to="/add" className="btn">
            <Plus size={20} style={{ marginRight: '8px' }} />
            添加新物品
          </Link>
          <button className="btn btn-secondary" onClick={addTestData}>
            添加测试数据
          </button>
        </div>
      </div>

      {/* 最近添加的物品 */}
      <div className="card">
        <h3>最近添加的物品</h3>
        <div className="items-list">
          {recentItems.length === 0 ? (
            <p>暂无物品</p>
          ) : (
            recentItems.map(item => {
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