import { useState, useEffect } from 'react';
import { generateTestData } from '../utils/itemUtils';

// 物品数据管理Hook
export const useItems = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // 从localStorage加载数据
  useEffect(() => {
    const savedItems = localStorage.getItem('youqi-items');
    if (savedItems) {
      setItems(JSON.parse(savedItems));
    }
    setLoading(false);
  }, []);

  // 保存数据到localStorage
  const saveItems = (newItems) => {
    localStorage.setItem('youqi-items', JSON.stringify(newItems));
    setItems(newItems);
  };

  // 添加物品
  const addItem = (item) => {
    const newItem = {
      ...item,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    const newItems = [newItem, ...items];
    saveItems(newItems);
    return newItem;
  };

  // 删除物品
  const deleteItem = (id) => {
    const newItems = items.filter(item => item.id !== id);
    saveItems(newItems);
  };

  // 更新物品
  const updateItem = (id, updates) => {
    const newItems = items.map(item => 
      item.id === id ? { ...item, ...updates } : item
    );
    saveItems(newItems);
  };

  // 添加测试数据
  const addTestData = () => {
    const testItems = generateTestData();
    const newItems = [...testItems, ...items];
    saveItems(newItems);
  };

  // 清空所有数据
  const clearAllItems = () => {
    saveItems([]);
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
      // 文本搜索
      const searchFields = [
        item.name,
        item.brand,
        item.category,
        item.notes,
        ...(item.medicineTags || [])
      ].filter(Boolean).join(' ').toLowerCase();
      
      const matchesSearch = !searchTerm || searchFields.includes(searchTerm.toLowerCase());
      
      // 分类筛选
      const matchesCategory = !categoryFilter || item.category === categoryFilter;
      
      // 药品标签筛选
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
      const expiry = new Date(item.expiryDate);
      const diffDays = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));
      
      switch (filter) {
        case 'expired':
          return diffDays < 0;
        case 'expiring-soon':
          return diffDays >= 0 && diffDays <= 7;
        case 'expiring-week':
          return diffDays >= 0 && diffDays <= 7;
        case 'expiring-month':
          return diffDays >= 0 && diffDays <= 30;
        default:
          return diffDays <= 30;
      }
    });
  };

  return {
    items,
    loading,
    addItem,
    deleteItem,
    updateItem,
    addTestData,
    clearAllItems,
    getStats,
    searchItems,
    getExpiringItems
  };
}; 