/**
 * 智能过期提醒系统工具函数
 * 实现双重提醒的规则继承和计算逻辑
 */

// 提醒时间选项配置
export const REMINDER_OPTIONS = {
  firstReminder: [
    { value: 0, label: '不提醒' },
    { value: 7, label: '过期前 7 天' },
    { value: 15, label: '过期前 15 天 (推荐)' },
    { value: 30, label: '过期前 30 天' },
    { value: 90, label: '过期前 90 天' }
  ],
  secondReminder: [
    { value: 0, label: '不提醒' },
    { value: 1, label: '过期前 1 天' },
    { value: 0, label: '过期当天 (推荐)' },
    { value: -1, label: '过期前 1 天' },
    { value: -3, label: '过期前 3 天' }
  ]
};

// 默认提醒设置
export const DEFAULT_REMINDER_SETTINGS = {
  globalFirstReminderDays: 15,  // 全局默认：过期前15天
  globalSecondReminderDays: 0   // 全局默认：过期当天
};

/**
 * 获取提醒规则的继承值
 * 优先级：单个物品 > 分类 > 全局
 * @param {Object} item - 物品对象
 * @param {Object} category - 分类对象
 * @param {Object} globalSettings - 全局设置
 * @param {string} reminderType - 提醒类型 ('first' | 'second')
 * @returns {number} 提醒天数
 */
export const getInheritedReminderDays = (item, category, globalSettings, reminderType) => {
  const fieldName = reminderType === 'first' ? 'firstReminderDays' : 'secondReminderDays';
  const globalFieldName = reminderType === 'first' ? 'globalFirstReminderDays' : 'globalSecondReminderDays';
  
  // 优先级1：单个物品设置
  if (item && item[fieldName] !== undefined && item[fieldName] !== null) {
    return item[fieldName];
  }
  
  // 优先级2：分类设置
  if (category && category[fieldName] !== undefined && category[fieldName] !== null) {
    return category[fieldName];
  }
  
  // 优先级3：全局设置
  if (globalSettings && globalSettings[globalFieldName] !== undefined) {
    return globalSettings[globalFieldName];
  }
  
  // 默认值
  return reminderType === 'first' ? DEFAULT_REMINDER_SETTINGS.globalFirstReminderDays : DEFAULT_REMINDER_SETTINGS.globalSecondReminderDays;
};

/**
 * 计算物品的提醒日期
 * @param {Date} expiryDate - 过期日期
 * @param {number} reminderDays - 提醒天数
 * @returns {Date|null} 提醒日期，如果不提醒则返回null
 */
export const calculateReminderDate = (expiryDate, reminderDays) => {
  if (!expiryDate || reminderDays === 0) {
    return null;
  }
  
  const expiry = new Date(expiryDate);
  const reminderDate = new Date(expiry);
  
  if (reminderDays > 0) {
    // 过期前N天
    reminderDate.setDate(expiry.getDate() - reminderDays);
  } else if (reminderDays < 0) {
    // 过期前N天（负数）
    reminderDate.setDate(expiry.getDate() + reminderDays);
  }
  // reminderDays === 0 表示过期当天
  
  return reminderDate;
};

/**
 * 检查物品是否需要发送提醒
 * @param {Object} item - 物品对象
 * @param {Object} category - 分类对象
 * @param {Object} globalSettings - 全局设置
 * @param {Date} checkDate - 检查日期（默认为今天）
 * @returns {Array} 需要发送的提醒数组
 */
export const checkItemReminders = (item, category, globalSettings, checkDate = new Date()) => {
  const reminders = [];
  
  // 检查第一次提醒
  const firstReminderDays = getInheritedReminderDays(item, category, globalSettings, 'first');
  if (firstReminderDays !== 0) {
    const firstReminderDate = calculateReminderDate(item.expiryDate, firstReminderDays);
    if (firstReminderDate && isSameDay(checkDate, firstReminderDate)) {
      reminders.push({
        type: 'first',
        days: firstReminderDays,
        message: `温馨提示：您的「${item.name}」即将在${firstReminderDays}天后过期，请记得使用哦。`
      });
    }
  }
  
  // 检查第二次提醒
  const secondReminderDays = getInheritedReminderDays(item, category, globalSettings, 'second');
  if (secondReminderDays !== 0) {
    const secondReminderDate = calculateReminderDate(item.expiryDate, secondReminderDays);
    if (secondReminderDate && isSameDay(checkDate, secondReminderDate)) {
      let timeText = '今天';
      if (secondReminderDays > 0) {
        timeText = `${secondReminderDays}天后`;
      } else if (secondReminderDays < 0) {
        timeText = `${Math.abs(secondReminderDays)}天后`;
      }
      
      reminders.push({
        type: 'second',
        days: secondReminderDays,
        message: `最后提醒：您的「${item.name}」将在${timeText}过期！`
      });
    }
  }
  
  return reminders;
};

/**
 * 检查两个日期是否为同一天
 * @param {Date} date1 - 日期1
 * @param {Date} date2 - 日期2
 * @returns {boolean} 是否为同一天
 */
export const isSameDay = (date1, date2) => {
  if (!date1 || !date2) return false;
  
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  
  return d1.getFullYear() === d2.getFullYear() &&
         d1.getMonth() === d2.getMonth() &&
         d1.getDate() === d2.getDate();
};

/**
 * 获取提醒设置的显示文本
 * @param {number} reminderDays - 提醒天数
 * @param {string} reminderType - 提醒类型
 * @returns {string} 显示文本
 */
export const getReminderDisplayText = (reminderDays, reminderType) => {
  if (reminderDays === 0) return '不提醒';
  
  const options = reminderType === 'first' ? REMINDER_OPTIONS.firstReminder : REMINDER_OPTIONS.secondReminder;
  const option = options.find(opt => opt.value === reminderDays);
  
  return option ? option.label : `自定义 (${reminderDays}天)`;
};

/**
 * 验证提醒设置的有效性
 * @param {number} firstReminderDays - 第一次提醒天数
 * @param {number} secondReminderDays - 第二次提醒天数
 * @returns {Object} 验证结果
 */
export const validateReminderSettings = (firstReminderDays, secondReminderDays) => {
  const errors = [];
  
  // 检查第一次提醒
  if (firstReminderDays < 0 || firstReminderDays > 365) {
    errors.push('第一次提醒天数必须在0-365天之间');
  }
  
  // 检查第二次提醒
  if (secondReminderDays < -30 || secondReminderDays > 30) {
    errors.push('第二次提醒天数必须在-30到30天之间');
  }
  
  // 检查逻辑合理性（只有当两个提醒都启用时才检查）
  if (firstReminderDays > 0 && secondReminderDays > 0 && firstReminderDays <= secondReminderDays) {
    errors.push('第一次提醒应该早于第二次提醒');
  }
  
  // 允许"不提醒"设置（值为0）
  // 单个物品可以覆盖全局的"不提醒"设置
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * 获取分类变更时的提醒规则冲突信息
 * @param {Object} oldCategory - 原分类
 * @param {Object} newCategory - 新分类
 * @returns {Object} 冲突信息
 */
export const getCategoryChangeConflict = (oldCategory, newCategory) => {
  const conflicts = [];
  
  // 检查第一次提醒
  if (oldCategory.firstReminderDays !== newCategory.firstReminderDays) {
    conflicts.push({
      type: 'first',
      old: oldCategory.firstReminderDays,
      new: newCategory.firstReminderDays,
      oldText: getReminderDisplayText(oldCategory.firstReminderDays, 'first'),
      newText: getReminderDisplayText(newCategory.firstReminderDays, 'first')
    });
  }
  
  // 检查第二次提醒
  if (oldCategory.secondReminderDays !== newCategory.secondReminderDays) {
    conflicts.push({
      type: 'second',
      old: oldCategory.secondReminderDays,
      new: newCategory.secondReminderDays,
      oldText: getReminderDisplayText(oldCategory.secondReminderDays, 'second'),
      newText: getReminderDisplayText(newCategory.secondReminderDays, 'second')
    });
  }
  
  return {
    hasConflict: conflicts.length > 0,
    conflicts
  };
}; 