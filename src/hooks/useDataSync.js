import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  addItemToLeanCloud, 
  getItemsFromLeanCloud, 
  updateItemInLeanCloud, 
  deleteItemFromLeanCloud
} from '../services/leancloudService';
import toast from 'react-hot-toast';

// 离线操作队列
class OfflineQueue {
  constructor() {
    this.queue = this.loadQueue();
  }

  loadQueue() {
    try {
      const saved = localStorage.getItem('youqi-offline-queue');
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('加载离线队列失败:', error);
      return [];
    }
  }

  saveQueue() {
    try {
      localStorage.setItem('youqi-offline-queue', JSON.stringify(this.queue));
    } catch (error) {
      console.error('保存离线队列失败:', error);
    }
  }

  add(operation) {
    const queueItem = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      operation
    };
    this.queue.push(queueItem);
    this.saveQueue();
    return queueItem.id;
  }

  remove(id) {
    this.queue = this.queue.filter(item => item.id !== id);
    this.saveQueue();
  }

  getAll() {
    return this.queue;
  }

  clear() {
    this.queue = [];
    this.saveQueue();
  }
}

// 本地存储管理
class LocalStorageManager {
  static saveItems(items) {
    try {
      localStorage.setItem('youqi-items', JSON.stringify(items));
      localStorage.setItem('youqi-last-sync', new Date().toISOString());
    } catch (error) {
      console.error('保存本地数据失败:', error);
    }
  }

  static loadItems() {
    try {
      const saved = localStorage.getItem('youqi-items');
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('加载本地数据失败:', error);
      return [];
    }
  }

  static getLastSyncTime() {
    try {
      return localStorage.getItem('youqi-last-sync');
    } catch (error) {
      return null;
    }
  }

  static saveSyncStatus(status) {
    try {
      localStorage.setItem('youqi-sync-status', status);
    } catch (error) {
      console.error('保存同步状态失败:', error);
    }
  }

  static getSyncStatus() {
    try {
      return localStorage.getItem('youqi-sync-status') || 'idle';
    } catch (error) {
      return 'idle';
    }
  }
}

export const useDataSync = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [leanCloudConnected, setLeanCloudConnected] = useState(false);
  const [syncStatus, setSyncStatus] = useState('idle'); // idle, syncing, error, offline
  const [lastSyncTime, setLastSyncTime] = useState(null);
  const [offlineQueue, setOfflineQueue] = useState([]);
  const [networkStatus, setNetworkStatus] = useState(navigator.onLine);
  
  const offlineQueueRef = useRef(new OfflineQueue());
  const syncInProgressRef = useRef(false);

  // 网络状态监听
  useEffect(() => {
    const handleOnline = () => {
      setNetworkStatus(true);
      if (offlineQueueRef.current.getAll().length > 0) {
        processOfflineQueue();
      }
    };

    const handleOffline = () => {
      setNetworkStatus(false);
      setSyncStatus('offline');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // 处理离线队列
  const processOfflineQueue = useCallback(async () => {
    if (syncInProgressRef.current || !leanCloudConnected) return;

    const queue = offlineQueueRef.current.getAll();
    if (queue.length === 0) return;

    syncInProgressRef.current = true;
    setSyncStatus('syncing');

    try {
      console.log(`处理离线队列，共 ${queue.length} 个操作`);
      
      for (const queueItem of queue) {
        try {
          const { operation } = queueItem;
          
          switch (operation.type) {
            case 'ADD':
              await addItemToLeanCloud(operation.data);
              break;
            case 'UPDATE':
              await updateItemInLeanCloud(operation.id, operation.data);
              break;
            case 'DELETE':
              await deleteItemFromLeanCloud(operation.id);
              break;
            default:
              console.warn('未知操作类型:', operation.type);
          }
          
          // 移除已处理的操作
          offlineQueueRef.current.remove(queueItem.id);
        } catch (error) {
          console.error('处理离线操作失败:', error);
          // 保留失败的操作，稍后重试
        }
      }
      
      // 重新获取最新数据
      const leanCloudItems = await getItemsFromLeanCloud();
      setItems(leanCloudItems);
      LocalStorageManager.saveItems(leanCloudItems);
      
      setSyncStatus('idle');
      setLastSyncTime(new Date().toISOString());
      LocalStorageManager.saveSyncStatus('idle');
      
      if (queue.length > 0) {
        toast.success(`离线操作同步完成，共处理 ${queue.length} 个操作`);
      }
    } catch (error) {
      console.error('处理离线队列失败:', error);
      setSyncStatus('error');
      LocalStorageManager.saveSyncStatus('error');
    } finally {
      syncInProgressRef.current = false;
      setOfflineQueue(offlineQueueRef.current.getAll());
    }
  }, [leanCloudConnected]);

  // 初始化数据
  useEffect(() => {
    const initializeData = async () => {
      try {
        setLoading(true);
        
        // 加载本地数据
        const localItems = LocalStorageManager.loadItems();
        const lastSync = LocalStorageManager.getLastSyncTime();
        const savedSyncStatus = LocalStorageManager.getSyncStatus();
        
        setLastSyncTime(lastSync);
        setSyncStatus(savedSyncStatus);
        
        // 尝试连接LeanCloud
        try {
          const leanCloudItems = await getItemsFromLeanCloud();
          setLeanCloudConnected(true);
          
          if (leanCloudItems.length > 0) {
            console.log('使用LeanCloud数据，数量:', leanCloudItems.length);
            setItems(leanCloudItems);
            LocalStorageManager.saveItems(leanCloudItems);
            setSyncStatus('idle');
            setLastSyncTime(new Date().toISOString());
          } else if (localItems.length > 0) {
            console.log('使用本地数据，数量:', localItems.length);
            setItems(localItems);
            // 异步同步到LeanCloud
            setTimeout(() => syncToLeanCloud(localItems), 1000);
          }
        } catch (error) {
          console.error('LeanCloud连接失败，使用本地数据:', error);
          setLeanCloudConnected(false);
          setSyncStatus('offline');
          setItems(localItems);
        }
        
        // 加载离线队列
        setOfflineQueue(offlineQueueRef.current.getAll());
        
      } catch (error) {
        console.error('数据初始化失败:', error);
        setItems([]);
        setSyncStatus('error');
      } finally {
        setLoading(false);
      }
    };

    initializeData();
  }, []);

  // 同步到LeanCloud
  const syncToLeanCloud = useCallback(async (itemsToSync) => {
    if (!leanCloudConnected || syncInProgressRef.current) return;
    
    syncInProgressRef.current = true;
    setSyncStatus('syncing');
    
    try {
      console.log('开始同步到LeanCloud，物品数量:', itemsToSync.length);
      
      // 清空现有数据
      const existingItems = await getItemsFromLeanCloud();
      for (const item of existingItems) {
        await deleteItemFromLeanCloud(item.id);
      }
      
      // 上传新数据
      for (const item of itemsToSync) {
        const { id, createdAt, updatedAt, ...leanCloudItemData } = item;
        await addItemToLeanCloud(leanCloudItemData);
      }
      
      console.log('同步完成');
      setSyncStatus('idle');
      setLastSyncTime(new Date().toISOString());
      LocalStorageManager.saveSyncStatus('idle');
    } catch (error) {
      console.error('同步到LeanCloud失败:', error);
      setSyncStatus('error');
      LocalStorageManager.saveSyncStatus('error');
    } finally {
      syncInProgressRef.current = false;
    }
  }, [leanCloudConnected]);

  // 添加物品
  const addItem = async (itemData) => {
    try {
      const newItem = {
        ...itemData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString()
      };
      
      const updatedItems = [...items, newItem];
      setItems(updatedItems);
      LocalStorageManager.saveItems(updatedItems);
      
      if (leanCloudConnected && networkStatus) {
        const { id, createdAt, updatedAt, ...leanCloudItemData } = newItem;
        await addItemToLeanCloud(leanCloudItemData);
      } else {
        // 添加到离线队列
        const queueId = offlineQueueRef.current.add({
          type: 'ADD',
          data: leanCloudItemData
        });
        setOfflineQueue(offlineQueueRef.current.getAll());
        setSyncStatus('offline');
      }
      
      toast.success('物品添加成功！');
      return newItem;
    } catch (error) {
      console.error('添加物品失败:', error);
      toast.error('添加物品失败，请重试');
    }
  };

  // 删除物品
  const deleteItem = async (itemId) => {
    try {
      const updatedItems = items.filter(item => item.id !== itemId);
      setItems(updatedItems);
      LocalStorageManager.saveItems(updatedItems);
      
      if (leanCloudConnected && networkStatus) {
        await deleteItemFromLeanCloud(itemId);
      } else {
        // 添加到离线队列
        const queueId = offlineQueueRef.current.add({
          type: 'DELETE',
          id: itemId
        });
        setOfflineQueue(offlineQueueRef.current.getAll());
        setSyncStatus('offline');
      }
      
      toast.success('物品已删除');
    } catch (error) {
      console.error('删除物品失败:', error);
      toast.error('删除物品失败，请重试');
    }
  };

  // 更新物品
  const updateItem = async (itemId, updateData) => {
    try {
      const updatedItems = items.map(item => 
        item.id === itemId ? { ...item, ...updateData, updatedAt: new Date().toISOString() } : item
      );
      setItems(updatedItems);
      LocalStorageManager.saveItems(updatedItems);
      
      if (leanCloudConnected && networkStatus) {
        const { updatedAt, ...leanCloudUpdateData } = updateData;
        await updateItemInLeanCloud(itemId, leanCloudUpdateData);
      } else {
        // 添加到离线队列
        const queueId = offlineQueueRef.current.add({
          type: 'UPDATE',
          id: itemId,
          data: leanCloudUpdateData
        });
        setOfflineQueue(offlineQueueRef.current.getAll());
        setSyncStatus('offline');
      }
      
      toast.success('物品已更新');
    } catch (error) {
      console.error('更新物品失败:', error);
      toast.error('更新物品失败，请重试');
    }
  };

  // 手动同步
  const manualSync = async () => {
    if (syncInProgressRef.current) return;
    
    if (offlineQueueRef.current.getAll().length > 0) {
      await processOfflineQueue();
    } else {
      await syncToLeanCloud(items);
    }
  };

  // 清空离线队列
  const clearOfflineQueue = () => {
    offlineQueueRef.current.clear();
    setOfflineQueue([]);
    toast.success('离线队列已清空');
  };

  return {
    items,
    loading,
    leanCloudConnected,
    syncStatus,
    lastSyncTime,
    offlineQueue,
    networkStatus,
    addItem,
    deleteItem,
    updateItem,
    manualSync,
    clearOfflineQueue,
    processOfflineQueue
  };
}; 