import React, { useState, useEffect } from 'react';
import { Bell, X, CheckCircle, AlertCircle, Info, Clock } from 'lucide-react';
import { sendLocalNotification, sendExpiryReminder } from '../utils/pushNotificationUtils';

const LocalNotificationManager = () => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    initializeNotificationManager();
  }, []);

  const initializeNotificationManager = () => {
    if (!('Notification' in window)) {
      console.log('浏览器不支持通知');
      return;
    }

    if (Notification.permission === 'granted') {
      console.log('通知权限已获取');
    }
  };

  const showNotification = (title, options = {}) => {
    try {
      const notification = sendLocalNotification(title, options);
      if (notification) {
        const newNotification = {
          id: Date.now(),
          title,
          options,
          timestamp: new Date(),
          status: 'active'
        };
        
        setNotifications(prev => [...prev, newNotification]);
        
        setTimeout(() => {
          hideNotification(newNotification.id);
        }, options.duration || 5000);
        
        return notification;
      }
    } catch (error) {
      console.error('显示通知失败:', error);
    }
    return null;
  };

  const hideNotification = (notificationId) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, status: 'hidden' }
          : notification
      )
    );
    
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
    }, 300);
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle size={20} color="#10b981" />;
      case 'error':
        return <AlertCircle size={20} color="#ef4444" />;
      case 'warning':
        return <AlertCircle size={20} color="#f59e0b" />;
      case 'info':
        return <Info size={20} color="#3b82f6" />;
      case 'expiry':
        return <Clock size={20} color="#ef4444" />;
      default:
        return <Bell size={20} color="#6b7280" />;
    }
  };

  const getNotificationStyle = (type) => {
    switch (type) {
      case 'success':
        return { borderLeft: '4px solid #10b981', background: '#f0fdf4' };
      case 'error':
        return { borderLeft: '4px solid #ef4444', background: '#fef2f2' };
      case 'warning':
        return { borderLeft: '4px solid #f59e0b', background: '#fffbeb' };
      case 'info':
        return { borderLeft: '4px solid #3b82f6', background: '#eff6ff' };
      case 'expiry':
        return { borderLeft: '4px solid #ef4444', background: '#fef2f2' };
      default:
        return { borderLeft: '4px solid #6b7280', background: '#f9fafb' };
    }
  };

  const testNotification = (type = 'info') => {
    const testData = {
      success: { title: '操作成功', body: '您的操作已成功完成！' },
      error: { title: '操作失败', body: '抱歉，操作未能完成，请重试。' },
      warning: { title: '注意事项', body: '请注意，这个操作可能会影响其他功能。' },
      info: { title: '信息提示', body: '这是一条普通的信息提示。' },
      expiry: { title: '过期提醒', body: '您有物品即将过期，请及时处理。' }
    };

    const data = testData[type];
    showNotification(data.title, {
      body: data.body,
      type,
      icon: '/logo192.png',
      tag: `test-${type}`,
      requireInteraction: false
    });
  };

  const testExpiryReminder = () => {
    const testItem = {
      id: 'test-001',
      name: '测试物品',
      daysUntilExpiry: 3
    };
    
    sendExpiryReminder(testItem, 'first');
  };

  return (
    <div className="local-notification-manager">
      <style>
        {`
          .local-notification-manager {
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 1000;
            max-width: 400px;
          }
          
          .notification-controls {
            display: flex;
            gap: 8px;
            margin-bottom: 16px;
            flex-wrap: wrap;
          }
          
          .test-btn {
            padding: 8px 12px;
            border: none;
            border-radius: 6px;
            font-size: 12px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s ease;
            display: flex;
            align-items: center;
            gap: 6px;
          }
          
          .test-btn.success {
            background: #10b981;
            color: white;
          }
          
          .test-btn.error {
            background: #ef4444;
            color: white;
          }
          
          .test-btn.warning {
            background: #f59e0b;
            color: white;
          }
          
          .test-btn.info {
            background: #3b82f6;
            color: white;
          }
          
          .test-btn.expiry {
            background: #ef4444;
            color: white;
          }
          
          .test-btn:hover {
            transform: translateY(-1px);
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
          }
          
          .notification-list {
            display: flex;
            flex-direction: column;
            gap: 12px;
          }
          
          .notification-item {
            background: white;
            border-radius: 8px;
            padding: 16px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            display: flex;
            align-items: flex-start;
            gap: 12px;
            transition: all 0.3s ease;
            animation: slideIn 0.3s ease-out;
          }
          
          .notification-item.hidden {
            opacity: 0;
            transform: translateX(100%);
          }
          
          @keyframes slideIn {
            from {
              opacity: 0;
              transform: translateX(100%);
            }
            to {
              opacity: 1;
              transform: translateX(0);
            }
          }
          
          .notification-icon {
            flex-shrink: 0;
            margin-top: 2px;
          }
          
          .notification-content {
            flex: 1;
            min-width: 0;
          }
          
          .notification-title {
            font-size: 14px;
            font-weight: 600;
            color: #1f2937;
            margin: 0 0 4px 0;
            line-height: 1.4;
          }
          
          .notification-body {
            font-size: 13px;
            color: #6b7280;
            margin: 0;
            line-height: 1.4;
          }
          
          .notification-time {
            font-size: 11px;
            color: #9ca3af;
            margin-top: 8px;
          }
          
          .notification-close {
            background: none;
            border: none;
            color: #9ca3af;
            cursor: pointer;
            padding: 4px;
            border-radius: 4px;
            transition: all 0.2s ease;
            flex-shrink: 0;
          }
          
          .notification-close:hover {
            background: #f3f4f6;
            color: #6b7280;
          }
          
          .clear-all-btn {
            background: #6b7280;
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 6px;
            font-size: 12px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s ease;
            margin-bottom: 16px;
          }
          
          .clear-all-btn:hover {
            background: #4b5563;
            transform: translateY(-1px);
          }
          
          @media (max-width: 768px) {
            .local-notification-manager {
              top: 16px;
              right: 16px;
              left: 16px;
              max-width: none;
            }
            
            .notification-controls {
              justify-content: center;
            }
            
            .test-btn {
              flex: 1;
              justify-content: center;
            }
          }
        `}
      </style>

      <div className="notification-controls">
        <button 
          className="test-btn success"
          onClick={() => testNotification('success')}
        >
          <CheckCircle size={14} />
          成功
        </button>
        
        <button 
          className="test-btn error"
          onClick={() => testNotification('error')}
        >
          <AlertCircle size={14} />
          错误
        </button>
        
        <button 
          className="test-btn warning"
          onClick={() => testNotification('warning')}
        >
          <AlertCircle size={14} />
          警告
        </button>
        
        <button 
          className="test-btn info"
          onClick={() => testNotification('info')}
        >
          <Info size={14} />
          信息
        </button>
        
        <button 
          className="test-btn expiry"
          onClick={testExpiryReminder}
        >
          <Clock size={14} />
          过期提醒
        </button>
      </div>

      {notifications.length > 0 && (
        <button 
          className="clear-all-btn"
          onClick={clearAllNotifications}
        >
          清除所有通知
        </button>
      )}

      <div className="notification-list">
        {notifications.map((notification) => (
          <div 
            key={notification.id}
            className={`notification-item ${notification.status === 'hidden' ? 'hidden' : ''}`}
            style={getNotificationStyle(notification.options.type)}
          >
            <div className="notification-icon">
              {getNotificationIcon(notification.options.type)}
            </div>
            
            <div className="notification-content">
              <div className="notification-title">
                {notification.title}
              </div>
              
              {notification.options.body && (
                <div className="notification-body">
                  {notification.options.body}
                </div>
              )}
              
              <div className="notification-time">
                {notification.timestamp.toLocaleTimeString()}
              </div>
            </div>
            
            <button 
              className="notification-close"
              onClick={() => hideNotification(notification.id)}
              aria-label="关闭通知"
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LocalNotificationManager;
