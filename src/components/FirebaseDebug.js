import React, { useState, useEffect } from 'react';
import { addItemToFirebase, getItemsFromFirebase } from '../services/itemService';

const FirebaseDebug = () => {
  const [debugInfo, setDebugInfo] = useState({
    connectionTest: 'pending',
    itemsCount: 0,
    lastError: null
  });

  const testConnection = async () => {
    try {
      setDebugInfo(prev => ({ ...prev, connectionTest: 'testing' }));
      
      // 测试获取数据
      const items = await getItemsFromFirebase();
      setDebugInfo({
        connectionTest: 'success',
        itemsCount: items.length,
        lastError: null
      });
      
      console.log('Firebase连接测试成功，获取到', items.length, '个物品');
    } catch (error) {
      console.error('Firebase连接测试失败:', error);
      setDebugInfo({
        connectionTest: 'failed',
        itemsCount: 0,
        lastError: error.message
      });
    }
  };

  const testAddItem = async () => {
    try {
      const testItem = {
        name: '测试物品',
        category: '其他',
        quantity: 1,
        expiryDate: '2025-12-31',
        createdAt: new Date().toISOString()
      };
      
      const result = await addItemToFirebase(testItem);
      console.log('添加测试物品成功:', result);
      
      // 重新测试连接
      await testConnection();
    } catch (error) {
      console.error('添加测试物品失败:', error);
      setDebugInfo(prev => ({ ...prev, lastError: error.message }));
    }
  };

  useEffect(() => {
    testConnection();
  }, []);

  return (
    <div className="card">
      <h3>Firebase调试信息</h3>
      
      <div style={{ marginBottom: '20px' }}>
        <div style={{ marginBottom: '10px' }}>
          <strong>连接状态：</strong>
          <span style={{ 
            color: debugInfo.connectionTest === 'success' ? 'green' : 
                   debugInfo.connectionTest === 'failed' ? 'red' : 'orange',
            marginLeft: '10px'
          }}>
            {debugInfo.connectionTest === 'success' ? '✅ 连接成功' :
             debugInfo.connectionTest === 'failed' ? '❌ 连接失败' :
             debugInfo.connectionTest === 'testing' ? '⏳ 测试中' : '⏳ 待测试'}
          </span>
        </div>
        
        <div style={{ marginBottom: '10px' }}>
          <strong>Firebase中的物品数量：</strong>
          <span style={{ marginLeft: '10px' }}>{debugInfo.itemsCount}</span>
        </div>
        
        {debugInfo.lastError && (
          <div style={{ marginBottom: '10px' }}>
            <strong>最后错误：</strong>
            <span style={{ color: 'red', marginLeft: '10px' }}>{debugInfo.lastError}</span>
          </div>
        )}
      </div>
      
      <div style={{ display: 'flex', gap: '10px' }}>
        <button className="btn" onClick={testConnection}>
          重新测试连接
        </button>
        <button className="btn btn-secondary" onClick={testAddItem}>
          添加测试物品
        </button>
      </div>
    </div>
  );
};

export default FirebaseDebug; 