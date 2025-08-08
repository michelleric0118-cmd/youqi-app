// 演示数据，用于测试新功能
export const demoItems = [
  {
    id: '1',
    name: '牛奶',
    category: '食品',
    brand: '蒙牛',
    quantity: 2,
    unit: '盒',
    productionDate: '2025-08-01',
    expiryDate: '2025-08-15',
    location: '冰箱',
    notes: '全脂牛奶',
    createdAt: '2025-08-07T10:00:00Z',
    updatedAt: '2025-08-07T10:00:00Z'
  },
  {
    id: '2',
    name: '感冒药',
    category: '药品',
    brand: '999',
    quantity: 1,
    unit: '盒',
    productionDate: '2025-01-01',
    expiryDate: '2026-01-01',
    location: '药箱',
    notes: '感冒灵颗粒',
    createdAt: '2025-08-07T10:01:00Z',
    updatedAt: '2025-08-07T10:01:00Z'
  },
  {
    id: '3',
    name: '洗发水',
    category: '日用品',
    brand: '海飞丝',
    quantity: 1,
    unit: '瓶',
    productionDate: '2025-06-01',
    expiryDate: '2027-06-01',
    location: '浴室',
    notes: '去屑洗发水',
    createdAt: '2025-08-07T10:02:00Z',
    updatedAt: '2025-08-07T10:02:00Z'
  },
  {
    id: '4',
    name: '苹果',
    category: '食品',
    brand: '红富士',
    quantity: 5,
    unit: '个',
    productionDate: '2025-08-05',
    expiryDate: '2025-08-20',
    location: '冰箱',
    notes: '新鲜苹果',
    createdAt: '2025-08-07T10:03:00Z',
    updatedAt: '2025-08-07T10:03:00Z'
  },
  {
    id: '5',
    name: '维生素C',
    category: '药品',
    brand: '善存',
    quantity: 1,
    unit: '瓶',
    productionDate: '2025-01-01',
    expiryDate: '2026-01-01',
    location: '药箱',
    notes: '维生素C片',
    createdAt: '2025-08-07T10:04:00Z',
    updatedAt: '2025-08-07T10:04:00Z'
  }
];

// 演示设置数据
export const demoSettings = {
  language: 'zh-CN',
  elderMode: false,
  notifications: {
    enabled: true,
    expiryReminder: true,
    lowStockReminder: true
  },
  backup: {
    autoBackup: true,
    backupInterval: 'daily',
    lastBackup: '2025-08-07T10:00:00Z'
  }
};

// 演示备份数据
export const demoBackup = {
  version: '1.0',
  timestamp: '2025-08-07T10:00:00Z',
  items: demoItems,
  settings: demoSettings,
  metadata: {
    totalItems: demoItems.length,
    categories: [...new Set(demoItems.map(item => item.category))],
    brands: [...new Set(demoItems.map(item => item.brand))]
  }
}; 