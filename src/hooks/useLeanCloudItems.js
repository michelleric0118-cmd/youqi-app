import { useState, useEffect, useCallback } from 'react';
import { 
  addItemToLeanCloud, 
  getItemsFromLeanCloud, 
  updateItemInLeanCloud, 
  deleteItemFromLeanCloud
} from '../services/leancloudService';
import { generateTestData } from '../utils/itemUtils';

export const useLeanCloudItems = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [leanCloudConnected, setLeanCloudConnected] = useState(false);
  const [syncStatus, setSyncStatus] = useState('idle'); // idle, syncing, error

  const syncToLeanCloud = useCallback(async (itemsToSync) => {
    if (!leanCloudConnected) return;
    
    setSyncStatus('syncing');
    try {
      console.log('开始同步到LeanCloud，物品数量:', itemsToSync.length);
      
      // 清空现有数据
      const existingItems = await getItemsFromLeanCloud();
      console.log('清空LeanCloud现有数据，数量:', existingItems.length);
      
      for (const item of existingItems) {
        await deleteItemFromLeanCloud(item.id);
      }
      
      // 上传新数据
      console.log('开始上传数据到LeanCloud');
      for (const item of itemsToSync) {
        await addItemToLeanCloud(item);
      }
      
      console.log('同步完成');
      setSyncStatus('idle');
    } catch (error) {
      console.error('同步到LeanCloud失败:', error);
      setSyncStatus('error');
    }
  }, [leanCloudConnected]);

  useEffect(() => {
    const initializeData = async () => {
      try {
        setLoading(true);
        
        const savedItems = localStorage.getItem('youqi-items');
        const localItems = savedItems ? JSON.parse(savedItems) : [];
        
        try {
          const leanCloudItems = await getItemsFromLeanCloud();
          setLeanCloudConnected(true);
          
          if (leanCloudItems.length > 0) {
            console.log('使用LeanCloud数据，数量:', leanCloudItems.length);
            setItems(leanCloudItems);
            localStorage.setItem('youqi-items', JSON.stringify(leanCloudItems));
          } else if (localItems.length > 0) {
            console.log('使用localStorage数据，数量:', localItems.length);
            setItems(localItems);
            await syncToLeanCloud(localItems);
          }
        } catch (error) {
          console.error('LeanCloud连接失败，使用本地数据:', error);
          setLeanCloudConnected(false);
          setItems(localItems);
        }
      } catch (error) {
        console.error('数据初始化失败:', error);
        setItems([]);
      } finally {
        setLoading(false);
      }
    };

    initializeData();
  }, [syncToLeanCloud]);

  const addItem = async (itemData) => {
    try {
      const newItem = {
        ...itemData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString()
      };
      
      const updatedItems = [...items, newItem];
      setItems(updatedItems);
      localStorage.setItem('youqi-items', JSON.stringify(updatedItems));
      
      if (leanCloudConnected) {
        await addItemToLeanCloud(newItem);
      }
      
      return newItem;
    } catch (error) {
      console.error('添加物品失败:', error);
      throw error;
    }
  };

  const deleteItem = async (itemId) => {
    try {
      const updatedItems = items.filter(item => item.id !== itemId);
      setItems(updatedItems);
      localStorage.setItem('youqi-items', JSON.stringify(updatedItems));
      
      if (leanCloudConnected) {
        await deleteItemFromLeanCloud(itemId);
      }
    } catch (error) {
      console.error('删除物品失败:', error);
      throw error;
    }
  };

  const updateItem = async (itemId, updateData) => {
    try {
      const updatedItems = items.map(item => 
        item.id === itemId ? { ...item, ...updateData, updatedAt: new Date().toISOString() } : item
      );
      setItems(updatedItems);
      localStorage.setItem('youqi-items', JSON.stringify(updatedItems));
      
      if (leanCloudConnected) {
        await updateItemInLeanCloud(itemId, updateData);
      }
    } catch (error) {
      console.error('更新物品失败:', error);
      throw error;
    }
  };

  const addTestData = async () => {
    console.log('开始添加测试数据');
    const testItems = generateTestData();
    
    // 检查是否已经有测试数据（基于名称匹配）
    const existingTestItemNames = items.map(item => item.name);
    const newTestItems = testItems.filter(item => 
      !existingTestItemNames.includes(item.name)
    );
    
    if (newTestItems.length === 0) {
      console.log('测试数据已存在，不重复添加');
      return;
    }
    
    console.log('添加新的测试数据，数量:', newTestItems.length);
    const newItems = [...newTestItems, ...items];
    setItems(newItems);
    localStorage.setItem('youqi-items', JSON.stringify(newItems));
    
    // 同步到LeanCloud
    if (leanCloudConnected) {
      await syncToLeanCloud(newItems);
    }
  };

  const clearAllData = async () => {
    try {
      setItems([]);
      localStorage.removeItem('youqi-items');
      
      if (leanCloudConnected) {
        const existingItems = await getItemsFromLeanCloud();
        for (const item of existingItems) {
          await deleteItemFromLeanCloud(item.id);
        }
      }
      
      console.log('所有数据已清空');
    } catch (error) {
      console.error('清空数据失败:', error);
    }
  };

  const forceClearAndRefresh = () => {
    localStorage.removeItem('youqi-items');
    window.location.reload();
  };

  const getStats = () => {
    const now = new Date();
    const total = items.length;
    const expiringSoon = items.filter(item => {
      if (!item.expiryDate) return false;
      const expiryDate = new Date(item.expiryDate);
      const diffTime = expiryDate - now;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 7 && diffDays >= 0;
    }).length;
    const expired = items.filter(item => {
      if (!item.expiryDate) return false;
      const expiryDate = new Date(item.expiryDate);
      return expiryDate < now;
    }).length;
    
    return { total, expiringSoon, expired };
  };

  const getExpiringItems = (filterType = 'all') => {
    const now = new Date();
    return items.filter(item => {
      if (!item.expiryDate) return false;
      const expiryDate = new Date(item.expiryDate);
      const diffTime = expiryDate - now;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      switch (filterType) {
        case 'expired':
          return diffDays < 0;
        case 'expiring-soon':
          return diffDays >= 0 && diffDays <= 7;
        case 'expiring-month':
          return diffDays >= 0 && diffDays <= 30;
        case 'all':
          return diffDays <= 30;
        default:
          return false;
      }
    });
  };

  return {
    items,
    loading,
    leanCloudConnected,
    syncStatus,
    addItem,
    deleteItem,
    updateItem,
    addTestData,
    clearAllData,
    forceClearAndRefresh,
    getStats,
    getExpiringItems,
    syncToLeanCloud
  };
}; 