// 推送通知管理
class NotificationManager {
  constructor() {
    this.permission = 'default';
    this.isSupported = 'Notification' in window;
    this.init();
  }

  // 初始化通知系统
  async init() {
    if (!this.isSupported) {
      console.log('浏览器不支持通知功能');
      return;
    }

    this.permission = Notification.permission;
    
    // 如果权限未设置，请求权限
    if (this.permission === 'default') {
      await this.requestPermission();
    }
  }

  // 请求通知权限
  async requestPermission() {
    if (!this.isSupported) return false;

    try {
      const permission = await Notification.requestPermission();
      this.permission = permission;
      return permission === 'granted';
    } catch (error) {
      console.error('请求通知权限失败:', error);
      return false;
    }
  }

  // 检查是否有通知权限
  hasPermission() {
    return this.permission === 'granted';
  }

  // 发送本地通知
  sendLocalNotification(title, options = {}) {
    if (!this.hasPermission()) {
      console.log('没有通知权限');
      return;
    }

    const defaultOptions = {
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: 'youqi-notification',
      requireInteraction: false,
      silent: false,
      ...options
    };

    try {
      const notification = new Notification(title, defaultOptions);
      
      // 处理通知点击事件
      notification.onclick = (event) => {
        event.preventDefault();
        window.focus();
        notification.close();
        
        // 如果有URL，跳转到指定页面
        if (options.url) {
          window.location.href = options.url;
        }
      };

      // 自动关闭通知
      if (!defaultOptions.requireInteraction) {
        setTimeout(() => {
          notification.close();
        }, 5000);
      }

      return notification;
    } catch (error) {
      console.error('发送通知失败:', error);
    }
  }

  // 发送过期提醒通知
  sendExpiryNotification(items) {
    if (items.length === 0) return;

    const title = '物品过期提醒';
    const body = items.length === 1 
      ? `${items[0].name} 即将过期`
      : `${items.length} 个物品即将过期`;

    this.sendLocalNotification(title, {
      body,
      icon: '/favicon.ico',
      tag: 'expiry-notification',
      requireInteraction: true,
      url: '/expiring',
      actions: [
        {
          action: 'view',
          title: '查看详情'
        },
        {
          action: 'dismiss',
          title: '稍后提醒'
        }
      ]
    });
  }

  // 发送低库存提醒
  sendLowStockNotification(items) {
    if (items.length === 0) return;

    const title = '库存不足提醒';
    const body = items.length === 1 
      ? `${items[0].name} 库存不足`
      : `${items.length} 个物品库存不足`;

    this.sendLocalNotification(title, {
      body,
      icon: '/favicon.ico',
      tag: 'low-stock-notification',
      url: '/items',
      actions: [
        {
          action: 'view',
          title: '查看详情'
        }
      ]
    });
  }

  // 发送操作成功通知
  sendSuccessNotification(message) {
    this.sendLocalNotification('操作成功', {
      body: message,
      icon: '/favicon.ico',
      tag: 'success-notification'
    });
  }

  // 发送操作失败通知
  sendErrorNotification(message) {
    this.sendLocalNotification('操作失败', {
      body: message,
      icon: '/favicon.ico',
      tag: 'error-notification'
    });
  }

  // 检查并发送过期提醒
  async checkExpiryNotifications(items) {
    if (!this.hasPermission()) return;

    const now = new Date();
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    const expiringItems = items.filter(item => {
      if (!item.expiryDate) return false;
      
      const expiryDate = new Date(item.expiryDate);
      return expiryDate <= sevenDaysFromNow && expiryDate > now;
    });

    if (expiringItems.length > 0) {
      this.sendExpiryNotification(expiringItems);
    }
  }

  // 检查并发送低库存提醒
  async checkLowStockNotifications(items) {
    if (!this.hasPermission()) return;

    const lowStockItems = items.filter(item => {
      return item.quantity <= (item.lowStockThreshold || 1);
    });

    if (lowStockItems.length > 0) {
      this.sendLowStockNotification(lowStockItems);
    }
  }

  // 设置定时提醒
  scheduleNotification(title, body, delay) {
    if (!this.hasPermission()) return;

    setTimeout(() => {
      this.sendLocalNotification(title, { body });
    }, delay);
  }

  // 取消所有通知
  clearAllNotifications() {
    if (!this.isSupported) return;

    // 关闭所有当前通知
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(registration => {
        registration.getNotifications().then(notifications => {
          notifications.forEach(notification => {
            notification.close();
          });
        });
      });
    }
  }

  // 获取通知设置
  getNotificationSettings() {
    return {
      enabled: this.hasPermission(),
      supported: this.isSupported,
      permission: this.permission
    };
  }

  // 更新通知设置
  async updateNotificationSettings(settings) {
    if (settings.enabled && !this.hasPermission()) {
      await this.requestPermission();
    }
  }
}

// 创建单例实例
const notificationManager = new NotificationManager();

export default notificationManager; 