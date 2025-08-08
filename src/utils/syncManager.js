import { AV } from 'leancloud-storage';
import backupManager from './backupManager';

class SyncManager {
  constructor() {
    this.syncQueue = [];
    this.isSyncing = false;
    this.lastSyncTime = null;
    this.syncInterval = 5 * 60 * 1000; // 5分钟同步间隔
    this.conflictResolution = 'server-wins'; // 冲突解决策略
  }

  // 初始化同步
  async initialize() {
    try {
      // 设置同步监听器
      this.setupSyncListeners();
      
      // 启动定期同步
      this.startPeriodicSync();
      
      // 执行初始同步
      await this.performInitialSync();
      
      return true;
    } catch (error) {
      console.error('初始化同步失败:', error);
      return false;
    }
  }

  // 设置同步监听器
  setupSyncListeners() {
    // 监听网络状态变化
    window.addEventListener('online', () => {
      this.performSync();
    });

    // 监听页面可见性变化
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        this.performSync();
      }
    });
  }

  // 启动定期同步
  startPeriodicSync() {
    setInterval(() => {
      this.performSync();
    }, this.syncInterval);
  }

  // 执行初始同步
  async performInitialSync() {
    try {
      const localItems = this.getLocalItems();
      const cloudItems = await this.getCloudItems();
      
      // 合并数据
      const mergedItems = this.mergeItems(localItems, cloudItems);
      
      // 保存合并后的数据
      this.saveLocalItems(mergedItems);
      
      // 上传到云端
      await this.uploadToCloud(mergedItems);
      
      this.lastSyncTime = Date.now();
      return true;
    } catch (error) {
      console.error('初始同步失败:', error);
      return false;
    }
  }

  // 执行同步
  async performSync() {
    if (this.isSyncing) {
      return false;
    }

    this.isSyncing = true;

    try {
      const localItems = this.getLocalItems();
      const cloudItems = await this.getCloudItems();
      
      // 检测冲突
      const conflicts = this.detectConflicts(localItems, cloudItems);
      
      if (conflicts.length > 0) {
        // 解决冲突
        const resolvedItems = await this.resolveConflicts(conflicts, localItems, cloudItems);
        this.saveLocalItems(resolvedItems);
        await this.uploadToCloud(resolvedItems);
      } else {
        // 无冲突，直接合并
        const mergedItems = this.mergeItems(localItems, cloudItems);
        this.saveLocalItems(mergedItems);
        await this.uploadToCloud(mergedItems);
      }

      this.lastSyncTime = Date.now();
      
      // 创建备份
      await backupManager.autoBackup(localItems);
      
      return true;
    } catch (error) {
      console.error('同步失败:', error);
      return false;
    } finally {
      this.isSyncing = false;
    }
  }

  // 获取本地数据
  getLocalItems() {
    try {
      const items = localStorage.getItem('youqi-items');
      return items ? JSON.parse(items) : [];
    } catch (error) {
      console.error('获取本地数据失败:', error);
      return [];
    }
  }

  // 保存本地数据
  saveLocalItems(items) {
    try {
      localStorage.setItem('youqi-items', JSON.stringify(items));
      return true;
    } catch (error) {
      console.error('保存本地数据失败:', error);
      return false;
    }
  }

  // 获取云端数据
  async getCloudItems() {
    try {
      const Item = AV.Object.extend('Item');
      const query = new AV.Query(Item);
      query.descending('updatedAt');
      
      const results = await query.find();
      return results.map(obj => ({
        id: obj.id,
        name: obj.get('name'),
        category: obj.get('category'),
        expiryDate: obj.get('expiryDate'),
        quantity: obj.get('quantity'),
        brand: obj.get('brand'),
        location: obj.get('location'),
        notes: obj.get('notes'),
        createdAt: obj.get('createdAt'),
        updatedAt: obj.get('updatedAt'),
        isCloud: true
      }));
    } catch (error) {
      console.error('获取云端数据失败:', error);
      return [];
    }
  }

  // 上传到云端
  async uploadToCloud(items) {
    try {
      const Item = AV.Object.extend('Item');
      
      for (const item of items) {
        if (!item.isCloud) {
          // 新项目，创建
          const itemObj = new Item();
          this.setItemProperties(itemObj, item);
          await itemObj.save();
        } else if (item.updatedAt > item.cloudUpdatedAt) {
          // 本地更新，更新云端
          const itemObj = AV.Object.createWithoutData('Item', item.id);
          this.setItemProperties(itemObj, item);
          await itemObj.save();
        }
      }
      
      return true;
    } catch (error) {
      console.error('上传到云端失败:', error);
      return false;
    }
  }

  // 设置项目属性
  setItemProperties(itemObj, item) {
    itemObj.set('name', item.name);
    itemObj.set('category', item.category);
    itemObj.set('expiryDate', item.expiryDate);
    itemObj.set('quantity', item.quantity);
    itemObj.set('brand', item.brand);
    itemObj.set('location', item.location);
    itemObj.set('notes', item.notes);
  }

  // 合并数据
  mergeItems(localItems, cloudItems) {
    const merged = [...localItems];
    
    for (const cloudItem of cloudItems) {
      const existingIndex = merged.findIndex(item => item.id === cloudItem.id);
      
      if (existingIndex === -1) {
        // 新项目，添加
        merged.push(cloudItem);
      } else {
        // 已存在，比较时间戳
        const localItem = merged[existingIndex];
        if (cloudItem.updatedAt > localItem.updatedAt) {
          merged[existingIndex] = cloudItem;
        }
      }
    }
    
    return merged;
  }

  // 检测冲突
  detectConflicts(localItems, cloudItems) {
    const conflicts = [];
    
    for (const localItem of localItems) {
      const cloudItem = cloudItems.find(item => item.id === localItem.id);
      
      if (cloudItem && 
          localItem.updatedAt !== cloudItem.updatedAt &&
          Math.abs(new Date(localItem.updatedAt) - new Date(cloudItem.updatedAt)) > 1000) {
        conflicts.push({
          localItem,
          cloudItem,
          type: 'update-conflict'
        });
      }
    }
    
    return conflicts;
  }

  // 解决冲突
  async resolveConflicts(conflicts, localItems, cloudItems) {
    const resolvedItems = [...localItems];
    
    for (const conflict of conflicts) {
      let resolvedItem;
      
      switch (this.conflictResolution) {
        case 'server-wins':
          resolvedItem = conflict.cloudItem;
          break;
        case 'client-wins':
          resolvedItem = conflict.localItem;
          break;
        case 'manual':
          // 手动解决冲突
          resolvedItem = await this.manualResolveConflict(conflict);
          break;
        case 'merge':
          // 合并冲突
          resolvedItem = this.mergeConflict(conflict);
          break;
        default:
          resolvedItem = conflict.cloudItem;
      }
      
      if (resolvedItem) {
        const index = resolvedItems.findIndex(item => item.id === resolvedItem.id);
        if (index !== -1) {
          resolvedItems[index] = resolvedItem;
        }
      }
    }
    
    return resolvedItems;
  }

  // 手动解决冲突
  async manualResolveConflict(conflict) {
    // 这里可以实现用户界面让用户选择
    // 暂时返回云端版本
    return conflict.cloudItem;
  }

  // 合并冲突
  mergeConflict(conflict) {
    const { localItem, cloudItem } = conflict;
    
    return {
      ...localItem,
      name: cloudItem.name || localItem.name,
      category: cloudItem.category || localItem.category,
      expiryDate: cloudItem.expiryDate || localItem.expiryDate,
      quantity: cloudItem.quantity || localItem.quantity,
      brand: cloudItem.brand || localItem.brand,
      location: cloudItem.location || localItem.location,
      notes: cloudItem.notes || localItem.notes,
      updatedAt: new Date().toISOString()
    };
  }

  // 强制同步
  async forceSync() {
    this.lastSyncTime = null;
    return await this.performSync();
  }

  // 获取同步状态
  getSyncStatus() {
    return {
      isSyncing: this.isSyncing,
      lastSyncTime: this.lastSyncTime,
      queueLength: this.syncQueue.length
    };
  }

  // 设置冲突解决策略
  setConflictResolution(strategy) {
    this.conflictResolution = strategy;
  }

  // 添加同步任务到队列
  addToSyncQueue(task) {
    this.syncQueue.push(task);
    this.processSyncQueue();
  }

  // 处理同步队列
  async processSyncQueue() {
    if (this.isSyncing || this.syncQueue.length === 0) {
      return;
    }

    this.isSyncing = true;

    try {
      while (this.syncQueue.length > 0) {
        const task = this.syncQueue.shift();
        await task();
      }
    } catch (error) {
      console.error('处理同步队列失败:', error);
    } finally {
      this.isSyncing = false;
    }
  }
}

export default new SyncManager(); 