import React, { useState, useEffect } from 'react';
import { addItemToLeanCloud, getItemsFromLeanCloud, deleteItemFromLeanCloud } from '../services/leancloudService';
import { generateTestData } from '../utils/itemUtils';

const LeanCloudTest = () => {
  const [connectionStatus, setConnectionStatus] = useState('testing');
  const [testItems, setTestItems] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const testConnection = async () => {
      try {
        setConnectionStatus('testing');
        await getItemsFromLeanCloud();
        setConnectionStatus('connected');
      } catch (error) {
        console.error('LeanCloud connection failed:', error);
        setConnectionStatus('failed');
      }
    };
    testConnection();
  }, []);

  const addTestDataToLeanCloud = async () => {
    setLoading(true);
    try {
      const testItems = generateTestData();
      for (const item of testItems) {
        // 从item中移除系统字段，避免LeanCloud错误
        const { id, createdAt, updatedAt, ...leanCloudItemData } = item;
        await addItemToLeanCloud(leanCloudItemData);
      }
      alert('测试数据已添加到LeanCloud！');
      fetchItemsFromLeanCloud();
    } catch (error) {
      console.error('Error adding test data:', error);
      alert('添加测试数据失败: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchItemsFromLeanCloud = async () => {
    setLoading(true);
    try {
      const items = await getItemsFromLeanCloud();
      setTestItems(items);
    } catch (error) {
      console.error('Error fetching items:', error);
      alert('获取数据失败: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const clearAllItems = async () => {
    // 添加确认对话框
    if (!window.confirm('⚠️ 警告：此操作将清空LeanCloud中的所有数据！\n\n此操作不可撤销，确定要继续吗？')) {
      return;
    }
    
    setLoading(true);
    try {
      for (const item of testItems) {
        await deleteItemFromLeanCloud(item.id);
      }
      setTestItems([]);
      alert('所有数据已清空！');
    } catch (error) {
      console.error('Error clearing items:', error);
      alert('清空数据失败: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return 'green';
      case 'failed': return 'red';
      default: return 'orange';
    }
  };

  const getStatusText = () => {
    switch (connectionStatus) {
      case 'connected': return '✅ 连接成功';
      case 'failed': return '❌ 连接失败';
      default: return '⏳ 测试中...';
    }
  };

  return (
    <div className="card">
      <h3>LeanCloud连接测试</h3>
      <div style={{ marginBottom: '20px' }}>
        <strong>连接状态：</strong>
        <span style={{ color: getStatusColor(), marginLeft: '10px' }}>
          {getStatusText()}
        </span>
      </div>

      {connectionStatus === 'failed' && (
        <div style={{ 
          background: '#fff3cd', 
          border: '1px solid #ffeaa7', 
          padding: '15px', 
          borderRadius: '5px',
          marginBottom: '20px'
        }}>
          <h4>连接失败，请检查：</h4>
          <ul>
            <li>LeanCloud配置是否正确</li>
            <li>网络连接是否正常</li>
            <li>AppID和AppKey是否正确</li>
            <li>服务器地址是否正确</li>
          </ul>
        </div>
      )}

      {connectionStatus === 'connected' && (
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '20px' }}>
          <button 
            className="btn btn-secondary" 
            onClick={addTestDataToLeanCloud}
            disabled={loading}
          >
            {loading ? '添加中...' : '添加测试数据到LeanCloud'}
          </button>
          <button 
            className="btn btn-secondary" 
            onClick={fetchItemsFromLeanCloud}
            disabled={loading}
          >
            {loading ? '获取中...' : '从LeanCloud获取数据'}
          </button>
          <button 
            className="btn btn-secondary" 
            onClick={clearAllItems}
            disabled={loading}
            style={{ background: '#ff6b6b', color: 'white' }}
          >
            {loading ? '清空中...' : '清空所有数据'}
          </button>
        </div>
      )}

      {testItems.length > 0 && (
        <div>
          <h4>LeanCloud中的数据 ({testItems.length} 个物品):</h4>
          <div className="items-list">
            {testItems.map((item, index) => (
              <div key={`${item.id}-${index}`} className="item">
                <div className="item-header">
                  <div className="item-name">{item.name}</div>
                  <div className="item-category">{item.category}</div>
                </div>
                <div className="item-details">
                  {item.brand && `品牌: ${item.brand} | `}
                  数量: {item.quantity} | 
                  过期日期: {item.expiryDate}
                </div>
                {item.medicineTags && item.medicineTags.length > 0 && (
                  <div className="selected-tags">
                    {item.medicineTags.map(tag => (
                      <span key={tag} className="selected-tag">{tag}</span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LeanCloudTest; 