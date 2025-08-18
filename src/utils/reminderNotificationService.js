/**
 * 过期提醒推送服务
 * 实现本地通知和智能推送调度
 */

import { checkItemReminders } from './reminderUtils';

class ReminderNotificationService {
  constructor() {
    this.isInitialized = false;
    this.hasPermission = false;
  }

  /**
   * 初始化通知服务
   */
  async initialize() {
    if (this.isInitialized) return;

    try {
      // 检查浏览器支持
      if (!('Notification' in window)) {
        console.warn('浏览器不支持通知功能');
        return false;
      }

      // 请求通知权限
      if (Notification.permission === 'default') {
        const permission = await Notification.requestPermission();
        this.hasPermission = permission === 'granted';
      } else {
        this.hasPermission = Notification.permission === 'granted';
      }

      this.isInitialized = true;
      console.log('通知服务初始化完成，权限状态:', this.hasPermission);
      return this.hasPermission;
    } catch (error) {
      console.error('初始化通知服务失败:', error);
      return false;
    }
  }

  /**
   * 检查并发送过期提醒
   */
  async checkAndSendReminders(items, categories, globalSettings) {
    if (!this.hasPermission || !this.isInitialized) {
      console.log('通知服务未初始化或无权限');
      return;
    }

    const today = new Date();
    const reminders = [];

    // 检查所有物品的提醒
    for (const item of items) {
      if (!item.expiryDate) continue;

      const category = categories.find(cat => cat.objectId === item.categoryId);
      const itemReminders = checkItemReminders(item, category, globalSettings, today);
      
      reminders.push(...itemReminders.map(reminder => ({
        ...reminder,
        itemId: item.objectId,
        itemName: item.name,
        categoryName: category?.name || '未分类'
      })));
    }

    // 发送提醒通知
    if (reminders.length > 0) {
      await this.sendReminders(reminders);
    }

    return reminders;
  }

  /**
   * 发送提醒通知
   */
  async sendReminders(reminders) {
    if (!this.hasPermission) return;

    // 按优先级排序：第二次提醒 > 第一次提醒
    const sortedReminders = reminders.sort((a, b) => {
      if (a.type === 'second' && b.type === 'first') return -1;
      if (a.type === 'first' && b.type === 'second') return 1;
      return 0;
    });

    // 发送通知（限制同时发送数量）
    const maxNotifications = 3;
    const notificationsToSend = sortedReminders.slice(0, maxNotifications);

    for (const reminder of notificationsToSend) {
      await this.sendSingleNotification(reminder);
      await this.delay(1000); // 延迟1秒
    }

    // 发送汇总通知
    if (reminders.length > maxNotifications) {
      await this.sendSummaryNotification(reminders.length - maxNotifications);
    }
  }

  /**
   * 发送单个通知
   */
  async sendSingleNotification(reminder) {
    const { type, message, itemName } = reminder;

    const notificationOptions = {
      body: message,
      icon: '/logo192.png',
      tag: `reminder-${reminder.itemId}-${type}`,
      requireInteraction: type === 'second',
      data: {
        itemId: reminder.itemId,
        type: type
      }
    };

    try {
      const notification = new Notification(`过期提醒 - ${itemName}`, notificationOptions);
      
      notification.onclick = (event) => {
        event.preventDefault();
        this.handleNotificationClick(reminder);
      };

      // 自动关闭通知
      const autoCloseTime = type === 'second' ? 10000 : 5000;
      setTimeout(() => {
        if (notification) {
          notification.close();
        }
      }, autoCloseTime);

      console.log(`已发送${type === 'first' ? '临期' : '过期'}提醒:`, itemName);
    } catch (error) {
      console.error('发送通知失败:', error);
    }
  }

  /**
   * 发送汇总通知
   */
  async sendSummaryNotification(remainingCount) {
    const notificationOptions = {
      body: `还有 ${remainingCount} 个物品需要关注，点击查看详情`,
      icon: '/logo192.png',
      tag: 'reminder-summary'
    };

    try {
      const notification = new Notification('过期提醒汇总', notificationOptions);
      
      notification.onclick = (event) => {
        event.preventDefault();
        this.handleSummaryClick();
      };

      setTimeout(() => {
        if (notification) {
          notification.close();
        }
      }, 5000);
    } catch (error) {
      console.error('发送汇总通知失败:', error);
    }
  }

  /**
   * 处理通知点击
   */
  handleNotificationClick(reminder) {
    window.focus();
    const url = `/items/${reminder.itemId}`;
    if (window.location.pathname !== url) {
      window.location.href = url;
    }
  }

  /**
   * 处理汇总通知点击
   */
  handleSummaryClick() {
    window.focus();
    if (window.location.pathname !== '/expiring') {
      window.location.href = '/expiring';
    }
  }

  /**
   * 延迟函数
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 测试通知功能
   */
  async testNotification() {
    if (!this.hasPermission) {
      const granted = await this.requestPermission();
      if (!granted) return false;
    }

    try {
      const notification = new Notification('测试通知', {
        body: '这是一条测试通知，用于验证通知功能是否正常工作',
        icon: '/logo192.png',
        tag: 'test-notification'
      });

      setTimeout(() => {
        if (notification) {
          notification.close();
        }
      }, 3000);

      return true;
    } catch (error) {
      console.error('发送测试通知失败:', error);
      return false;
    }
  }

  /**
   * 请求通知权限
   */
  async requestPermission() {
    if (!('Notification' in window)) {
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      this.hasPermission = permission === 'granted';
      return this.hasPermission;
    } catch (error) {
      console.error('请求通知权限失败:', error);
      return false;
    }
  }
}

// 创建单例实例
const reminderNotificationService = new ReminderNotificationService();

export default reminderNotificationService; 