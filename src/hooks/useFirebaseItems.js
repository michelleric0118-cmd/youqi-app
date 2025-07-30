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
      console.log('开始同步到Firebase，物品数量:', itemsToSync.length);
      
      // 清空Firebase现有数据
      const existingItems = await getItemsFromFirebase();
      console.log('清空Firebase现有数据，数量:', existingItems.length);
      
      for (const item of existingItems) {
        await deleteItemFromFirebase(item.id);
      }
      
      // 上传本地数据到Firebase
      console.log('开始上传数据到Firebase');
      for (const item of itemsToSync) {
        await addItemToFirebase(item);
      }
      
      console.log('同步完成');
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
        console.log('localStorage数据数量:', localItems.length);
        
        // 2. 尝试从Firebase获取数据
        try {
          const firebaseItems = await getItemsFromFirebase();
          setFirebaseConnected(true);
          console.log('Firebase数据数量:', firebaseItems.length);
          
          // 3. 数据源选择逻辑
          let finalItems = [];
          
          if (firebaseItems.length > 0) {
            console.log('使用Firebase数据');
            finalItems = firebaseItems;
          } else if (localItems.length > 0) {
            console.log('使用localStorage数据');
            finalItems = localItems;
            // 上传到Firebase
            await syncToFirebase(localItems);
          } else {
            console.log('没有数据，设置为空数组');
            finalItems = [];
          }
          
          // 4. 去重处理
          const uniqueItems = finalItems.filter((item, index, self) => 
            index === self.findIndex(t => t.id === item.id)
          );
          
          console.log('去重后数据数量:', uniqueItems.length);
          setItems(uniqueItems);
          localStorage.setItem('youqi-items', JSON.stringify(uniqueItems));
          
        } catch (error) {
          console.error('Firebase连接失败，使用本地数据:', error);
          setFirebaseConnected(false);
          
          // 使用localStorage数据，并去重
          const uniqueItems = localItems.filter((item, index, self) => 
            index === self.findIndex(t => t.id === item.id)
          );
          setItems(uniqueItems);
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