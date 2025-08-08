// 离线存储管理
class OfflineStorage {
  constructor() {
    this.dbName = 'YouQiOfflineDB';
    this.version = 1;
    this.db = null;
    this.init();
  }

  // 初始化数据库
  async init() {
    try {
      this.db = await this.openDB();
      console.log('离线存储初始化成功');
    } catch (error) {
      console.error('离线存储初始化失败:', error);
    }
  }

  // 打开IndexedDB
  openDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // 创建物品存储
        if (!db.objectStoreNames.contains('items')) {
          const itemsStore = db.createObjectStore('items', { keyPath: 'id' });
          itemsStore.createIndex('category', 'category', { unique: false });
          itemsStore.createIndex('expiryDate', 'expiryDate', { unique: false });
          itemsStore.createIndex('updatedAt', 'updatedAt', { unique: false });
        }

        // 创建操作队列存储
        if (!db.objectStoreNames.contains('operations')) {
          const operationsStore = db.createObjectStore('operations', { 
            keyPath: 'id', 
            autoIncrement: true 
          });
          operationsStore.createIndex('type', 'type', { unique: false });
          operationsStore.createIndex('timestamp', 'timestamp', { unique: false });
        }

        // 创建设置存储
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'key' });
        }
      };
    });
  }

  // 保存物品数据
  async saveItems(items) {
    if (!this.db) return;

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['items'], 'readwrite');
      const store = transaction.objectStore('items');

      // 清空现有数据
      const clearRequest = store.clear();
      
      clearRequest.onsuccess = () => {
        // 添加新数据
        const promises = items.map(item => {
          return new Promise((resolve, reject) => {
            const request = store.add(item);
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
          });
        });

        Promise.all(promises)
          .then(() => resolve())
          .catch(reject);
      };

      clearRequest.onerror = () => reject(clearRequest.error);
    });
  }

  // 获取所有物品
  async getItems() {
    if (!this.db) return [];

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['items'], 'readonly');
      const store = transaction.objectStore('items');
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // 添加物品
  async addItem(item) {
    if (!this.db) return;

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['items'], 'readwrite');
      const store = transaction.objectStore('items');
      const request = store.add(item);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // 更新物品
  async updateItem(item) {
    if (!this.db) return;

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['items'], 'readwrite');
      const store = transaction.objectStore('items');
      const request = store.put(item);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // 删除物品
  async deleteItem(id) {
    if (!this.db) return;

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['items'], 'readwrite');
      const store = transaction.objectStore('items');
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // 添加离线操作到队列
  async addOperation(operation) {
    if (!this.db) return;

    const operationData = {
      ...operation,
      timestamp: Date.now(),
      id: Date.now() + Math.random()
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['operations'], 'readwrite');
      const store = transaction.objectStore('operations');
      const request = store.add(operationData);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // 获取所有待同步操作
  async getPendingOperations() {
    if (!this.db) return [];

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['operations'], 'readonly');
      const store = transaction.objectStore('operations');
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // 删除已同步的操作
  async removeOperation(id) {
    if (!this.db) return;

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['operations'], 'readwrite');
      const store = transaction.objectStore('operations');
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // 保存设置
  async saveSetting(key, value) {
    if (!this.db) return;

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['settings'], 'readwrite');
      const store = transaction.objectStore('settings');
      const request = store.put({ key, value });

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // 获取设置
  async getSetting(key) {
    if (!this.db) return null;

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['settings'], 'readonly');
      const store = transaction.objectStore('settings');
      const request = store.get(key);

      request.onsuccess = () => resolve(request.result?.value || null);
      request.onerror = () => reject(request.error);
    });
  }

  // 检查网络状态
  isOnline() {
    return navigator.onLine;
  }

  // 监听网络状态变化
  onNetworkChange(callback) {
    window.addEventListener('online', () => callback(true));
    window.addEventListener('offline', () => callback(false));
  }

  // 同步数据到服务器
  async syncToServer(syncFunction) {
    if (!this.isOnline()) {
      console.log('网络离线，跳过同步');
      return;
    }

    try {
      const pendingOperations = await this.getPendingOperations();
      
      for (const operation of pendingOperations) {
        try {
          await syncFunction(operation);
          await this.removeOperation(operation.id);
        } catch (error) {
          console.error('同步操作失败:', error);
        }
      }

      console.log('数据同步完成');
    } catch (error) {
      console.error('数据同步失败:', error);
    }
  }

  // 获取存储使用情况
  async getStorageInfo() {
    if (!this.db) return null;

    try {
      const items = await this.getItems();
      const operations = await this.getPendingOperations();
      
      return {
        itemsCount: items.length,
        pendingOperations: operations.length,
        lastSync: await this.getSetting('lastSync'),
        isOnline: this.isOnline()
      };
    } catch (error) {
      console.error('获取存储信息失败:', error);
      return null;
    }
  }

  // 清理过期数据
  async cleanup() {
    if (!this.db) return;

    try {
      // 清理30天前的操作记录
      const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
      const operations = await this.getPendingOperations();
      
      for (const operation of operations) {
        if (operation.timestamp < thirtyDaysAgo) {
          await this.removeOperation(operation.id);
        }
      }

      console.log('数据清理完成');
    } catch (error) {
      console.error('数据清理失败:', error);
    }
  }
}

// 创建单例实例
const offlineStorage = new OfflineStorage();

export default offlineStorage; 