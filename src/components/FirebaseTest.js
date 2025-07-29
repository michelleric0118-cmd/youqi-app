import React, { useState, useEffect } from 'react';
import { addItemToFirebase, getItemsFromFirebase, deleteItemFromFirebase } from '../services/itemService';
import { generateTestData } from '../utils/itemUtils';

const FirebaseTest = () => {
  const [connectionStatus, setConnectionStatus] = useState('testing');
  const [testItems, setTestItems] = useState([]);
  const [loading, setLoading] = useState(false);

  // 测试Firebase连接
  useEffect(() => {
    const testConnection = async () => {
      try {
        setConnectionStatus('testing');
        await getItemsFromFirebase();
        setConnectionStatus('connected');
      } catch (error) {
        console.error('Firebase connection failed:', error);
        setConnectionStatus('failed');
      }
    };

    testConnection();
  }, []);

  // 添加测试数据到Firebase
  const addTestDataToFirebase = async () => {
    setLoading(true);
    try {
      const testData = generateTestData();
      const results = [];
      
      for (const item of testData) {
        const result = await addItemToFirebase(item);
        results.push(result);
      }
      
      setTestItems(results);
      alert(`成功添加 ${results.length} 个测试物品到Firebase`);
    } catch (error) {
      console.error('Error adding test data:', error);
      alert('添加测试数据失败: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // 从Firebase获取物品
  const fetchItemsFromFirebase = async () => {
    setLoading(true);
    try {
      const items = await getItemsFromFirebase();
      setTestItems(items);
      alert(`从Firebase获取到 ${items.length} 个物品`);
    } catch (error) {
      console.error('Error fetching items:', error);
      alert('获取物品失败: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // 删除所有测试物品
  const clearAllItems = async () => {
    if (!window.confirm('确定要删除所有Firebase中的物品吗？')) {
      return;
    }
    
    setLoading(true);
    try {
      for (const item of testItems) {
        await deleteItemFromFirebase(item.id);
      }
      setTestItems([]);
      alert('已删除所有物品');
    } catch (error) {
      console.error('Error clearing items:', error);
      alert('删除物品失败: ' + error.message);
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
      <h3>Firebase连接测试</h3>
      
      <div style={{ marginBottom: '20px' }}>
        <strong>连接状态：</strong>
        <span style={{ color: getStatusColor(), marginLeft: '10px' }}>
          {getStatusText()}
        </span>
      </div>

      {connectionStatus === 'failed' && (
        <div style={{ 
          padding: '15px', 
          background: '#ffebee', 
          border: '1px solid #f44336', 
          borderRadius: '8px',
          marginBottom: '20px'
        }}>
          <h4>⚠️ Firebase连接失败</h4>
          <p>可能的原因：</p>
          <ul>
            <li>Firebase配置信息不正确</li>
            <li>网络连接问题</li>
            <li>Firebase项目未正确设置</li>
          </ul>
          <p><strong>解决方案：</strong></p>
          <ol>
            <li>检查 <code>src/firebase/config.js</code> 中的配置信息</li>
            <li>确保Firebase项目已创建并启用了Firestore</li>
            <li>检查网络连接</li>
          </ol>
        </div>
      )}

      {connectionStatus === 'connected' && (
        <div>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
            <button 
              className="btn" 
              onClick={addTestDataToFirebase}
              disabled={loading}
            >
              {loading ? '添加中...' : '添加测试数据到Firebase'}
            </button>
            
            <button 
              className="btn btn-secondary" 
              onClick={fetchItemsFromFirebase}
              disabled={loading}
            >
              {loading ? '获取中...' : '从Firebase获取物品'}
            </button>
            
            <button 
              className="btn btn-danger" 
              onClick={clearAllItems}
              disabled={loading || testItems.length === 0}
            >
              清空所有物品
            </button>
          </div>

          {testItems.length > 0 && (
            <div>
              <h4>Firebase中的物品 ({testItems.length})</h4>
              <div className="items-list">
                {testItems.slice(0, 5).map(item => (
                  <div key={item.id} className="item">
                    <div className="item-header">
                      <div className="item-name">{item.name}</div>
                      <div className="item-category">{item.category}</div>
                    </div>
                    <div className="item-details">
                      {item.brand && `品牌: ${item.brand} | `}
                      数量: {item.quantity} | 过期: {item.expiryDate}
                    </div>
                  </div>
                ))}
                {testItems.length > 5 && (
                  <p style={{ textAlign: 'center', color: '#666' }}>
                    还有 {testItems.length - 5} 个物品...
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FirebaseTest; 