// 多语言支持
const translations = {
  'zh-CN': {
    save: '保存',
    cancel: '取消',
    delete: '删除',
    edit: '编辑',
    add: '添加',
    search: '搜索',
    filter: '筛选',
    clear: '清除',
    confirm: '确认',
    loading: '加载中...',
    error: '错误',
    success: '成功',
    home: '首页',
    items: '物品',
    addItem: '添加',
    expiring: '过期',
    statistics: '统计',
    settings: '设置',
    itemName: '物品名称',
    category: '分类',
    brand: '品牌',
    quantity: '数量',
    unit: '单位',
    productionDate: '生产日期',
    expiryDate: '过期日期',
    location: '位置',
    notes: '备注',
    noItems: '暂无物品',
    totalItems: '共 {count} 个物品',
    expiringSoon: '即将过期',
    expired: '已过期',
    normal: '正常',
    food: '食品',
    medicine: '药品',
    cosmetics: '化妆品',
    household: '日用品',
    electronics: '电子产品',
    clothing: '服装',
    books: '书籍',
    other: '其他',
    piece: '个',
    box: '盒',
    bottle: '瓶',
    bag: '袋',
    kg: '千克',
    g: '克',
    l: '升',
    ml: '毫升',
    expiringIn: '还有 {days} 天过期',
    expiredDays: '已过期 {days} 天',
    noExpiry: '无过期日期',
    backupSuccess: '备份成功',
    backupFailed: '备份失败',
    networkError: '网络连接失败',
    operationFailed: '操作失败',
    itemAdded: '物品添加成功',
    itemUpdated: '物品更新成功',
    itemDeleted: '物品删除成功',
    deleteItemConfirm: '确定要删除这个物品吗？',
    deleteItemsConfirm: '确定要删除选中的 {count} 个物品吗？',
    clearDataConfirm: '确定要清空所有数据吗？此操作不可撤销。'
  },

  'en-US': {
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    add: 'Add',
    search: 'Search',
    filter: 'Filter',
    clear: 'Clear',
    confirm: 'Confirm',
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    home: 'Home',
    items: 'Items',
    addItem: 'Add',
    expiring: 'Expiring',
    statistics: 'Statistics',
    settings: 'Settings',
    itemName: 'Item Name',
    category: 'Category',
    brand: 'Brand',
    quantity: 'Quantity',
    unit: 'Unit',
    productionDate: 'Production Date',
    expiryDate: 'Expiry Date',
    location: 'Location',
    notes: 'Notes',
    noItems: 'No items found',
    totalItems: '{count} items total',
    expiringSoon: 'Expiring Soon',
    expired: 'Expired',
    normal: 'Normal',
    food: 'Food',
    medicine: 'Medicine',
    cosmetics: 'Cosmetics',
    household: 'Household',
    electronics: 'Electronics',
    clothing: 'Clothing',
    books: 'Books',
    other: 'Other',
    piece: 'piece',
    box: 'box',
    bottle: 'bottle',
    bag: 'bag',
    kg: 'kg',
    g: 'g',
    l: 'L',
    ml: 'ml',
    expiringIn: 'Expires in {days} days',
    expiredDays: 'Expired {days} days ago',
    noExpiry: 'No expiry date',
    backupSuccess: 'Backup successful',
    backupFailed: 'Backup failed',
    networkError: 'Network connection failed',
    operationFailed: 'Operation failed',
    itemAdded: 'Item added successfully',
    itemUpdated: 'Item updated successfully',
    itemDeleted: 'Item deleted successfully',
    deleteItemConfirm: 'Are you sure you want to delete this item?',
    deleteItemsConfirm: 'Are you sure you want to delete {count} selected items?',
    clearDataConfirm: 'Are you sure you want to clear all data? This action cannot be undone.'
  }
};

class I18n {
  constructor() {
    this.currentLocale = this.getDefaultLocale();
    this.translations = translations;
  }

  getDefaultLocale() {
    const savedLocale = localStorage.getItem('youqi_language');
    if (savedLocale && this.translations[savedLocale]) {
      return savedLocale;
    }
    return 'zh-CN';
  }

  setLocale(locale) {
    if (!this.translations[locale]) {
      console.warn(`Unsupported locale: ${locale}`);
      return false;
    }

    this.currentLocale = locale;
    localStorage.setItem('youqi_language', locale);
    window.dispatchEvent(new CustomEvent('languageChanged', { detail: locale }));
    return true;
  }

  getCurrentLocale() {
    return this.currentLocale;
  }

  t(key, params = {}) {
    const translation = this.translations[this.currentLocale][key];
    
    if (!translation) {
      console.warn(`Translation key not found: ${key}`);
      return key;
    }

    return translation.replace(/\{(\w+)\}/g, (match, param) => {
      return params[param] !== undefined ? params[param] : match;
    });
  }

  getSupportedLocales() {
    return [
      { code: 'zh-CN', name: 'Chinese (Simplified)', nativeName: '简体中文' },
      { code: 'en-US', name: 'English (US)', nativeName: 'English' }
    ];
  }
}

const i18n = new I18n();
export default i18n; 