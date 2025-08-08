import { useState, useEffect, useCallback, useRef } from 'react';
import toast from 'react-hot-toast';

// 提醒设置管理
class NotificationSettings {
  constructor() {
    this.settings = this.loadSettings();
  }

  loadSettings() {
    try {
      const saved = localStorage.getItem('youqi-notification-settings');
      return saved ? JSON.parse(saved) : this.getDefaultSettings();
    } catch (error) {
      console.error('加载提醒设置失败:', error);
      return this.getDefaultSettings();
    }
  }

  getDefaultSettings() {
    return {
      enabled: true,
      pushNotifications: true,
      emailNotifications: false,
      reminderDays: [7, 3, 1], // 提前7天、3天、1天提醒
      quietHours: {
        enabled: false,
        start: '22:00',
        end: '08:00'
      },
      email: '',
      lastCheck: null
    };
  }

  saveSettings() {
    try {
      localStorage.setItem('youqi-notification-settings', JSON.stringify(this.settings));
    } catch (error) {
      console.error('保存提醒设置失败:', error);
    }
  }

  updateSettings(newSettings) {
    this.settings = { ...this.settings, ...newSettings };
    this.saveSettings();
  }

  getSettings() {
    return this.settings;
  }
}

// 提醒历史管理
class NotificationHistory {
  constructor() {
    this.history = this.loadHistory();
  }

  loadHistory() {
    try {
      const saved = localStorage.getItem('youqi-notification-history');
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('加载提醒历史失败:', error);
      return [];
    }
  }

  saveHistory() {
    try {
      // 只保留最近100条记录
      const recentHistory = this.history.slice(-100);
      localStorage.setItem('youqi-notification-history', JSON.stringify(recentHistory));
    } catch (error) {
      console.error('保存提醒历史失败:', error);
    }
  }

  addRecord(record) {
    const newRecord = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      ...record
    };
    this.history.push(newRecord);
    this.saveHistory();
    return newRecord.id;
  }

  getHistory() {
    return this.history;
  }

  clearHistory() {
    this.history = [];
    this.saveHistory();
  }
}

export const useNotificationSystem = (items) => {
  const [settings, setSettings] = useState(new NotificationSettings().getSettings());
  const [notificationHistory, setNotificationHistory] = useState([]);
  const [permission, setPermission] = useState('default');
  const [checkingNotifications, setCheckingNotifications] = useState(false);
  
  const settingsRef = useRef(new NotificationSettings());
  const historyRef = useRef(new NotificationHistory());
  const checkIntervalRef = useRef(null);

  // 检查浏览器通知权限
  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  // 请求通知权限
  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      toast.error('您的浏览器不支持通知功能');
      return false;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      
      if (result === 'granted') {
        toast.success('通知权限已启用');
        return true;
      } else {
        toast.error('通知权限被拒绝');
        return false;
      }
    } catch (error) {
      console.error('请求通知权限失败:', error);
      toast.error('请求通知权限失败');
      return false;
    }
  }, []);

  // 发送浏览器推送通知
  const sendPushNotification = useCallback((title, options = {}) => {
    if (!('Notification' in window) || Notification.permission !== 'granted') {
      return false;
    }

    try {
      const notification = new Notification(title, {
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: 'youqi-notification',
        requireInteraction: false,
        ...options
      });

      // 点击通知时的处理
      notification.onclick = () => {
        window.focus();
        notification.close();
        // 可以在这里添加跳转到特定页面的逻辑
      };

      return true;
    } catch (error) {
      console.error('发送推送通知失败:', error);
      return false;
    }
  }, []);

  // 发送邮件通知（模拟）
  const sendEmailNotification = useCallback(async (subject, content) => {
    if (!settings.email) {
      console.warn('未设置邮箱地址');
      return false;
    }

    try {
      // 这里可以集成真实的邮件服务
      // 目前只是模拟发送
      console.log('发送邮件通知:', { to: settings.email, subject, content });
      
      // 记录到历史
      historyRef.current.addRecord({
        type: 'email',
        subject,
        content,
        status: 'sent'
      });
      
      return true;
    } catch (error) {
      console.error('发送邮件通知失败:', error);
      
      // 记录失败历史
      historyRef.current.addRecord({
        type: 'email',
        subject,
        content,
        status: 'failed',
        error: error.message
      });
      
      return false;
    }
  }, [settings.email]);

  // 检查是否在免打扰时间
  const isInQuietHours = useCallback(() => {
    if (!settings.quietHours.enabled) return false;

    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    const [startHour, startMin] = settings.quietHours.start.split(':').map(Number);
    const [endHour, endMin] = settings.quietHours.end.split(':').map(Number);
    
    const startTime = startHour * 60 + startMin;
    const endTime = endHour * 60 + endMin;
    
    if (startTime <= endTime) {
      return currentTime >= startTime && currentTime <= endTime;
    } else {
      // 跨夜的情况
      return currentTime >= startTime || currentTime <= endTime;
    }
  }, [settings.quietHours]);

  // 检查过期物品并发送通知
  const checkExpiringItems = useCallback(async () => {
    if (!settings.enabled || checkingNotifications) return;
    
    setCheckingNotifications(true);
    
    try {
      const now = new Date();
      const expiringItems = [];
      
      // 检查每个物品的过期状态
      items.forEach(item => {
        if (!item.expiryDate) return;
        
        const expiryDate = new Date(item.expiryDate);
        const diffTime = expiryDate - now;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        // 检查是否在提醒天数范围内
        if (settings.reminderDays.includes(diffDays) && diffDays >= 0) {
          expiringItems.push({
            ...item,
            daysUntilExpiry: diffDays
          });
        }
      });
      
      if (expiringItems.length === 0) return;
      
      // 生成通知内容
      const notificationTitle = '有期 - 物品过期提醒';
      const notificationBody = `您有 ${expiringItems.length} 个物品即将过期`;
      
      const emailSubject = '有期 - 物品过期提醒';
      const emailContent = `
        <h2>物品过期提醒</h2>
        <p>您有以下物品即将过期：</p>
        <ul>
          ${expiringItems.map(item => `
            <li>
              <strong>${item.name}</strong> 
              (${item.brand || '无品牌'}) - 
              还有 ${item.daysUntilExpiry} 天过期
            </li>
          `).join('')}
        </ul>
        <p>请及时处理这些物品。</p>
      `;
      
      // 发送通知
      let notificationsSent = 0;
      
      // 推送通知
      if (settings.pushNotifications && !isInQuietHours()) {
        const pushSuccess = sendPushNotification(notificationTitle, {
          body: notificationBody,
          data: { expiringItems }
        });
        if (pushSuccess) notificationsSent++;
      }
      
      // 邮件通知
      if (settings.emailNotifications && settings.email) {
        const emailSuccess = await sendEmailNotification(emailSubject, emailContent);
        if (emailSuccess) notificationsSent++;
      }
      
      // 记录通知历史
      if (notificationsSent > 0) {
        historyRef.current.addRecord({
          type: 'expiry_reminder',
          expiringItems,
          notificationsSent,
          timestamp: new Date().toISOString()
        });
        
        // 更新设置中的最后检查时间
        settingsRef.current.updateSettings({ lastCheck: new Date().toISOString() });
        setSettings(settingsRef.current.getSettings());
      }
      
    } catch (error) {
      console.error('检查过期物品失败:', error);
    } finally {
      setCheckingNotifications(false);
    }
  }, [items, settings, checkingNotifications, isInQuietHours, sendPushNotification, sendEmailNotification]);

  // 定期检查过期物品
  useEffect(() => {
    if (!settings.enabled) return;
    
    // 立即检查一次
    checkExpiringItems();
    
    // 设置定期检查（每小时检查一次）
    checkIntervalRef.current = setInterval(checkExpiringItems, 60 * 60 * 1000);
    
    return () => {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
      }
    };
  }, [settings.enabled, checkExpiringItems]);

  // 更新提醒设置
  const updateNotificationSettings = useCallback((newSettings) => {
    settingsRef.current.updateSettings(newSettings);
    setSettings(settingsRef.current.getSettings());
  }, []);

  // 加载通知历史
  useEffect(() => {
    setNotificationHistory(historyRef.current.getHistory());
  }, []);

  // 清空通知历史
  const clearNotificationHistory = useCallback(() => {
    historyRef.current.clearHistory();
    setNotificationHistory([]);
    toast.success('通知历史已清空');
  }, []);

  // 手动检查过期物品
  const manualCheck = useCallback(async () => {
    await checkExpiringItems();
    toast.success('过期检查完成');
  }, [checkExpiringItems]);

  // 测试通知
  const testNotification = useCallback(() => {
    if (settings.pushNotifications) {
      const success = sendPushNotification('有期 - 测试通知', {
        body: '这是一条测试通知，如果您看到这条消息，说明通知功能正常工作。',
        requireInteraction: true
      });
      
      if (success) {
        toast.success('测试通知已发送');
      } else {
        toast.error('发送测试通知失败');
      }
    } else {
      toast.error('请先启用推送通知');
    }
  }, [settings.pushNotifications, sendPushNotification]);

  return {
    settings,
    notificationHistory,
    permission,
    checkingNotifications,
    requestPermission,
    updateNotificationSettings,
    clearNotificationHistory,
    manualCheck,
    testNotification,
    sendPushNotification,
    sendEmailNotification
  };
}; 