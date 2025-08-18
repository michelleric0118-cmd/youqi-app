// 离线数据管理器
class OfflineDataManager {
  constructor() {
    this.isInitialized = false;
  }

  // 初始化
  async init() {
    this.isInitialized = true;
    console.log('Offline data manager initialized');
  }

  // 保存物品数据
  async saveItems(items) {
    try {
      localStorage.setItem('offline_items', JSON.stringify(items));
      localStorage.setItem('offline_items_timestamp', Date.now().toString());
      console.log(`Saved ${items.length} items to offline storage`);
    } catch (error) {
      console.error('Failed to save items:', error);
    }
  }

  // 获取物品数据
  async getItems() {
    try {
      const itemsData = localStorage.getItem('offline_items');
      return itemsData ? JSON.parse(itemsData) : [];
    } catch (error) {
      console.error('Failed to get items:', error);
      return [];
    }
  }

  // 保存分类数据
  async saveCategories(categories) {
    try {
      localStorage.setItem('offline_categories', JSON.stringify(categories));
      console.log(`Saved ${categories.length} categories to offline storage`);
    } catch (error) {
      console.error('Failed to save categories:', error);
    }
  }

  // 获取分类数据
  async getCategories() {
    try {
      const categoriesData = localStorage.getItem('offline_categories');
      return categoriesData ? JSON.parse(categoriesData) : [];
    } catch (error) {
      console.error('Failed to get categories:', error);
      return [];
    }
  }

  // 获取存储状态
  getStorageStatus() {
    try {
      const items = JSON.parse(localStorage.getItem('offline_items') || '[]');
      const categories = JSON.parse(localStorage.getItem('offline_categories') || '[]');
      const timestamp = localStorage.getItem('offline_items_timestamp');
      
      return {
        itemsCount: items.length,
        categoriesCount: categories.length,
        lastUpdated: timestamp ? parseInt(timestamp) : 0,
        isOnline: navigator.onLine,
        storageType: 'localStorage',
        isInitialized: this.isInitialized
      };
    } catch (error) {
      return {
        itemsCount: 0,
        categoriesCount: 0,
        lastUpdated: 0,
        isOnline: navigator.onLine,
        storageType: 'localStorage',
        isInitialized: false
      };
    }
  }
}

export default new OfflineDataManager(); 