import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, Bell, Download, Smartphone, Database } from 'lucide-react';
import offlineDataManager from '../utils/offlineDataManager';
import './PWAFeatureTest.css';

const PWAFeatureTest = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [storageStatus, setStorageStatus] = useState(null);
  const [notificationPermission, setNotificationPermission] = useState('default');
  const [isStandalone, setIsStandalone] = useState(false);
  const [testResults, setTestResults] = useState({});

  useEffect(() => {
    // 监听在线状态变化
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // 检查通知权限
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }

    // 检查是否为PWA模式
    setIsStandalone(
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true
    );

    // 初始化离线数据管理器
    offlineDataManager.init();

    // 获取存储状态
    updateStorageStatus();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // 更新存储状态
  const updateStorageStatus = () => {
    const status = offlineDataManager.getStorageStatus();
    setStorageStatus(status);
  };

  // 测试离线数据访问
  const testOfflineDataAccess = async () => {
    try {
      // 模拟一些测试数据
      const testItems = [
        {
          id: 'test1',
          name: '测试物品1',
          category: '药品',
          expiryDate: '2025-12-31',
          quantity: 1
        },
        {
          id: 'test2',
          name: '测试物品2',
          category: '食品',
          expiryDate: '2025-11-30',
          quantity: 2
        }
      ];

      const testCategories = [
        { id: 'cat1', label: '药品', value: '药品' },
        { id: 'cat2', label: '食品', value: '食品' }
      ];

      // 保存到离线存储
      await offlineDataManager.saveItems(testItems);
      await offlineDataManager.saveCategories(testCategories);

      // 从离线存储读取
      const savedItems = await offlineDataManager.getItems();
      const savedCategories = await offlineDataManager.getCategories();

      const success = savedItems.length === testItems.length && 
                     savedCategories.length === testCategories.length;

      setTestResults(prev => ({
        ...prev,
        offlineDataAccess: {
          success,
          message: success ? '离线数据访问测试通过' : '离线数据访问测试失败',
          details: `保存了${testItems.length}个物品和${testCategories.length}个分类`
        }
      }));

      updateStorageStatus();
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        offlineDataAccess: {
          success: false,
          message: '离线数据访问测试失败',
          details: error.message
        }
      }));
    }
  };

  // 测试推送通知
  const testPushNotification = async () => {
    try {
      if (!('Notification' in window)) {
        throw new Error('浏览器不支持通知');
      }

      if (Notification.permission === 'default') {
        const permission = await Notification.requestPermission();
        setNotificationPermission(permission);
        
        if (permission !== 'granted') {
          throw new Error('用户拒绝了通知权限');
        }
      }

      if (Notification.permission === 'granted') {
        // 显示测试通知
        const notification = new Notification('有期 - 测试通知', {
          body: '这是一个测试推送通知，用于验证PWA功能',
          icon: '/logo192.png',
          badge: '/logo192.png',
          tag: 'test-notification',
          requireInteraction: true,
          data: {
            url: '/pwa-test',
            type: 'test'
          },
          actions: [
            {
              action: 'view',
              title: '查看详情',
              icon: '/logo192.png'
            }
          ]
        });

        // 处理通知点击
        notification.onclick = () => {
          window.focus();
          notification.close();
        };

        setTestResults(prev => ({
          ...prev,
          pushNotification: {
            success: true,
            message: '推送通知测试通过',
            details: '测试通知已发送'
          }
        }));
      } else {
        throw new Error('通知权限被拒绝');
      }
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        pushNotification: {
          success: false,
          message: '推送通知测试失败',
          details: error.message
        }
      }));
    }
  };

  // 测试Service Worker
  const testServiceWorker = async () => {
    try {
      if (!('serviceWorker' in navigator)) {
        throw new Error('浏览器不支持Service Worker');
      }

      const registration = await navigator.serviceWorker.getRegistration();
      
      if (registration) {
        setTestResults(prev => ({
          ...prev,
          serviceWorker: {
            success: true,
            message: 'Service Worker测试通过',
            details: `Service Worker已注册，状态: ${registration.active ? '活跃' : '待激活'}`
          }
        }));
      } else {
        throw new Error('Service Worker未注册');
      }
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        serviceWorker: {
          success: false,
          message: 'Service Worker测试失败',
          details: error.message
        }
      }));
    }
  };

  // 测试缓存功能
  const testCache = async () => {
    try {
      if (!('caches' in window)) {
        throw new Error('浏览器不支持Cache API');
      }

      const cacheNames = await caches.keys();
      const hasCache = cacheNames.some(name => name.includes('youqi'));

      setTestResults(prev => ({
        ...prev,
        cache: {
          success: hasCache,
          message: hasCache ? '缓存功能测试通过' : '缓存功能测试失败',
          details: `找到${cacheNames.length}个缓存，其中${cacheNames.filter(name => name.includes('youqi')).length}个为应用缓存`
        }
      }));
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        cache: {
          success: false,
          message: '缓存功能测试失败',
          details: error.message
        }
      }));
    }
  };

  // 运行所有测试
  const runAllTests = async () => {
    setTestResults({});
    
    await testOfflineDataAccess();
    await testPushNotification();
    await testServiceWorker();
    await testCache();
  };

  // 清除测试数据
  const clearTestData = async () => {
    try {
      localStorage.removeItem('offline_items');
      localStorage.removeItem('offline_categories');
      localStorage.removeItem('offline_items_timestamp');
      
      updateStorageStatus();
      
      alert('测试数据已清除');
    } catch (error) {
      console.error('清除测试数据失败:', error);
    }
  };

  return (
    <div className="pwa-feature-test">
      <div className="pwa-feature-test-header">
        <h2>🧪 PWA功能测试</h2>
        <p>测试离线功能、推送通知和PWA特性</p>
      </div>

      {/* 状态概览 */}
      <div className="pwa-status-overview">
        <div className="pwa-status-item">
          <div className="pwa-status-icon">
            {isOnline ? <Wifi size={20} /> : <WifiOff size={20} />}
          </div>
          <div className="pwa-status-info">
            <span className="pwa-status-label">网络状态</span>
            <span className={`pwa-status-value ${isOnline ? 'online' : 'offline'}`}>
              {isOnline ? '在线' : '离线'}
            </span>
          </div>
        </div>

        <div className="pwa-status-item">
          <div className="pwa-status-icon">
            <Bell size={20} />
          </div>
          <div className="pwa-status-info">
            <span className="pwa-status-label">通知权限</span>
            <span className={`pwa-status-value ${notificationPermission === 'granted' ? 'granted' : 'denied'}`}>
              {notificationPermission === 'granted' ? '已授权' : 
               notificationPermission === 'denied' ? '已拒绝' : '未设置'}
            </span>
          </div>
        </div>

        <div className="pwa-status-item">
          <div className="pwa-status-icon">
            <Smartphone size={20} />
          </div>
          <div className="pwa-status-info">
            <span className="pwa-status-label">PWA模式</span>
            <span className={`pwa-status-value ${isStandalone ? 'standalone' : 'browser'}`}>
              {isStandalone ? '独立应用' : '浏览器'}
            </span>
          </div>
        </div>

        {storageStatus && (
          <div className="pwa-status-item">
            <div className="pwa-status-icon">
              <Database size={20} />
            </div>
            <div className="pwa-status-info">
              <span className="pwa-status-label">离线数据</span>
              <span className="pwa-status-value">
                {storageStatus.itemsCount}个物品, {storageStatus.categoriesCount}个分类
              </span>
            </div>
          </div>
        )}
      </div>

      {/* 测试操作 */}
      <div className="pwa-test-actions">
        <button 
          className="pwa-test-btn primary"
          onClick={runAllTests}
        >
          🚀 运行所有测试
        </button>
        
        <button 
          className="pwa-test-btn"
          onClick={testOfflineDataAccess}
        >
          💾 测试离线数据
        </button>
        
        <button 
          className="pwa-test-btn"
          onClick={testPushNotification}
        >
          🔔 测试推送通知
        </button>
        
        <button 
          className="pwa-test-btn"
          onClick={testServiceWorker}
        >
          ⚙️ 测试Service Worker
        </button>
        
        <button 
          className="pwa-test-btn"
          onClick={testCache}
        >
          📦 测试缓存功能
        </button>
        
        <button 
          className="pwa-test-btn danger"
          onClick={clearTestData}
        >
          🗑️ 清除测试数据
        </button>
      </div>

      {/* 测试结果 */}
      {Object.keys(testResults).length > 0 && (
        <div className="pwa-test-results">
          <h3>📊 测试结果</h3>
          
          {Object.entries(testResults).map(([key, result]) => (
            <div 
              key={key}
              className={`pwa-test-result ${result.success ? 'success' : 'error'}`}
            >
              <div className="pwa-test-result-header">
                <span className="pwa-test-result-title">
                  {result.message}
                </span>
                <span className={`pwa-test-result-status ${result.success ? 'success' : 'error'}`}>
                  {result.success ? '✅ 通过' : '❌ 失败'}
                </span>
              </div>
              <div className="pwa-test-result-details">
                {result.details}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 使用说明 */}
      <div className="pwa-usage-guide">
        <h3>📖 使用说明</h3>
        <div className="pwa-usage-steps">
          <div className="pwa-usage-step">
            <div className="pwa-usage-step-number">1</div>
            <div className="pwa-usage-step-content">
              <h4>离线功能测试</h4>
              <p>测试应用在离线状态下是否能正常访问缓存的数据</p>
            </div>
          </div>
          
          <div className="pwa-usage-step">
            <div className="pwa-usage-step-number">2</div>
            <div className="pwa-usage-step-content">
              <h4>推送通知测试</h4>
              <p>测试推送通知功能是否正常工作，需要用户授权通知权限</p>
            </div>
          </div>
          
          <div className="pwa-usage-step">
            <div className="pwa-usage-step-number">3</div>
            <div className="pwa-usage-step-content">
              <h4>Service Worker测试</h4>
              <p>检查Service Worker是否正确注册和运行</p>
            </div>
          </div>
          
          <div className="pwa-usage-step">
            <div className="pwa-usage-step-number">4</div>
            <div className="pwa-usage-step-content">
              <h4>缓存功能测试</h4>
              <p>验证应用资源是否正确缓存，支持离线访问</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PWAFeatureTest; 