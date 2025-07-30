import { useState, useEffect, useCallback } from 'react';
import { 
  addItemToFirebase, 
  getItemsFromFirebase, 
  updateItemInFirebase, 
  deleteItemFromFirebase
} from '../services/itemService';
import { generateTestData } from '../utils/itemUtils';

// 混合数据管理Hook - 支持localStorage和Firebase
export const useFirebaseItems = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [firebaseConnected, setFirebaseConnected] = useState(false);
  const [syncStatus, setSyncStatus] = useState('idle'); // idle, syncing, error

  // 同步数据到Firebase
  const syncToFirebase = useCallback(async (itemsToSync) => {
    if (!firebaseConnected) return;
    
    setSyncStatus('syncing');
    try {
      // 清空Firebase现有数据
      const existingItems = await getItemsFromFirebase();
      for (const item of existingItems) {
        await deleteItemFromFirebase(item.id);
      }
      
      // 上传本地数据到Firebase
      for (const item of itemsToSync) {
        await addItemToFirebase(item);
      }
      
      setSyncStatus('idle');
    } catch (error) {
      console.error('同步到Firebase失败:', error);
      setSyncStatus('error');
    }
  }, [firebaseConnected]);

  // 初始化：从localStorage加载数据，然后尝试同步到Firebase
  useEffect(() => {
    const initializeData = async () => {
      try {
        setLoading(true);
        
        // 1. 从localStorage加载现有数据
        const savedItems = localStorage.getItem('youqi-items');
        const localItems = savedItems ? JSON.parse(savedItems) : [];
        
        // 2. 尝试从Firebase获取数据
        try {
          const firebaseItems = await getItemsFromFirebase();
          setFirebaseConnected(true);
          
          // 3. 如果Firebase有数据，使用Firebase数据
          if (firebaseItems.length > 0) {
            // 去重处理：基于ID去重
            const uniqueItems = firebaseItems.filter((item, index, self) => 
              index === self.findIndex(t => t.id === item.id)
            );
            setItems(uniqueItems);
            // 更新localStorage以保持一致性
            localStorage.setItem('youqi-items', JSON.stringify(uniqueItems));
          } else if (localItems.length > 0) {
            // 4. 如果localStorage有数据但Firebase为空，上传到Firebase
            // 去重处理：基于ID去重
            const uniqueItems = localItems.filter((item, index, self) => 
              index === self.findIndex(t => t.id === item.id)
            );
            setItems(uniqueItems);
            await syncToFirebase(uniqueItems);
          }
        } catch (error) {
          console.error('Firebase连接失败，使用本地数据:', error);
          setFirebaseConnected(false);
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
  }, [syncToFirebase]);

  // 添加物品
  const addItem = async (itemData) => {
    const newItem = {
      ...itemData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };

    // 更新本地状态
    const newItems = [newItem, ...items];
    setItems(newItems);
    localStorage.setItem('youqi-items', JSON.stringify(newItems));

    // 同步到Firebase
    if (firebaseConnected) {
      try {
        await addItemToFirebase(newItem);
      } catch (error) {
        console.error('添加物品到Firebase失败:', error);
        setFirebaseConnected(false);
      }
    }

    return newItem;
  };

  // 删除物品
  const deleteItem = async (id) => {
    const newItems = items.filter(item => item.id !== id);
    setItems(newItems);
    localStorage.setItem('youqi-items', JSON.stringify(newItems));

    // 从Firebase删除
    if (firebaseConnected) {
      try {
        await deleteItemFromFirebase(id);
      } catch (error) {
        console.error('从Firebase删除物品失败:', error);
        setFirebaseConnected(false);
      }
    }
  };

  // 更新物品
  const updateItem = async (id, updates) => {
    const newItems = items.map(item => 
      item.id === id ? { ...item, ...updates } : item
    );
    setItems(newItems);
    localStorage.setItem('youqi-items', JSON.stringify(newItems));

    // 更新Firebase
    if (firebaseConnected) {
      try {
        await updateItemInFirebase(id, updates);
      } catch (error) {
        console.error('更新Firebase物品失败:', error);
        setFirebaseConnected(false);
      }
    }
  };

  // 添加测试数据
  const addTestData = async () => {
    const testItems = generateTestData();
    const newItems = [...testItems, ...items];
    setItems(newItems);
    localStorage.setItem('youqi-items', JSON.stringify(newItems));

    // 同步到Firebase
    if (firebaseConnected) {
      await syncToFirebase(newItems);
    }
  };

  // 清空所有数据
  const clearAllItems = async () => {
    setItems([]);
    localStorage.removeItem('youqi-items');

    // 清空Firebase
    if (firebaseConnected) {
      try {
        const existingItems = await getItemsFromFirebase();
        for (const item of existingItems) {
          await deleteItemFromFirebase(item.id);
        }
      } catch (error) {
        console.error('清空Firebase数据失败:', error);
        setFirebaseConnected(false);
      }
    }
  };

  // 手动同步到Firebase
  const manualSync = async () => {
    if (items.length > 0) {
      await syncToFirebase(items);
    }
  };

  // 获取统计数据
  const getStats = () => {
    const now = new Date();
    const total = items.length;
    
    const expiringSoon = items.filter(item => {
      const expiry = new Date(item.expiryDate);
      const diffDays = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));
      return diffDays > 0 && diffDays <= 30;
    }).length;
    
    const expired = items.filter(item => {
      const expiry = new Date(item.expiryDate);
      return expiry < now;
    }).length;

    return { total, expiringSoon, expired };
  };

  // 搜索和筛选物品
  const searchItems = (searchTerm, categoryFilter, selectedMedicineTags) => {
    return items.filter(item => {
      const searchFields = [
        item.name,
        item.brand,
        item.category,
        item.notes,
        ...(item.medicineTags || [])
      ].filter(Boolean).join(' ').toLowerCase();
      
      const matchesSearch = !searchTerm || searchFields.includes(searchTerm.toLowerCase());
      const matchesCategory = !categoryFilter || item.category === categoryFilter;
      
      let matchesMedicineTags = true;
      if (categoryFilter === '药品' && selectedMedicineTags.length > 0) {
        matchesMedicineTags = item.medicineTags && 
          selectedMedicineTags.some(tag => item.medicineTags.includes(tag));
      }
      
      return matchesSearch && matchesCategory && matchesMedicineTags;
    });
  };

  // 获取过期物品
  const getExpiringItems = (filter = 'all') => {
    const now = new Date();
    
    return items.filter(item => {
      if (!item.expiryDate) return false;
      
      const expiry = new Date(item.expiryDate);
      const diffDays = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));
      
      switch (filter) {
        case 'expired':
          return diffDays < 0;
        case 'expiring-soon':
          return diffDays >= 0 && diffDays <= 7;
        case 'expiring-month':
          return diffDays >= 0 && diffDays <= 30;
        case 'all':
          // "全部"显示所有30天内过期的物品，但不重复显示
          return diffDays <= 30;
        default:
          return diffDays <= 30;
      }
    });
  };

  return {
    items,
    loading,
    firebaseConnected,
    syncStatus,
    addItem,
    deleteItem,
    updateItem,
    addTestData,
    clearAllItems,
    manualSync,
    getStats,
    searchItems,
    getExpiringItems
  };
}; 