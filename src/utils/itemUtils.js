// 物品相关工具函数

// 获取过期状态
export const getExpiryStatus = (expiryDate) => {
  const now = new Date();
  const expiry = new Date(expiryDate);
  const diffDays = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) return 'expired';
  if (diffDays <= 7) return 'expiring-soon';
  if (diffDays <= 30) return 'expiring-week';
  return 'normal';
};

// 格式化过期文本
export const getExpiryText = (expiryDate) => {
  const now = new Date();
  const expiry = new Date(expiryDate);
  const diffDays = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) {
    return { text: `已过期 ${Math.abs(diffDays)} 天`, className: 'expiry-danger' };
  } else if (diffDays === 0) {
    return { text: '今天过期', className: 'expiry-warning' };
  } else if (diffDays <= 7) {
    return { text: `${diffDays} 天后过期`, className: 'expiry-warning' };
  } else {
    return { text: `${diffDays} 天后过期`, className: '' };
  }
};

// 格式化日期
export const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('zh-CN');
};

// 药品标签选项
export const MEDICINE_TAGS = [
  { value: '感冒', label: '感冒' },
  { value: '发烧', label: '发烧' },
  { value: '咳嗽', label: '咳嗽' },
  { value: '头痛', label: '头痛' },
  { value: '胃痛', label: '胃痛' },
  { value: '腹泻', label: '腹泻' },
  { value: '过敏', label: '过敏' },
  { value: '成人', label: '成人' },
  { value: '婴幼儿', label: '婴幼儿' },
  { value: '儿童', label: '儿童' },
  { value: '老人', label: '老人' }
];

// 分类选项
export const DEFAULT_CATEGORIES = [
  { value: '药品', label: '药品' },
  { value: '护肤品', label: '护肤品' },
  { value: '食品', label: '食品' },
  { value: '日用品', label: '日用品' },
  { value: '其他', label: '其他' }
];

// 组合默认分类与用户自定义分类
export const buildCategories = (custom = []) => {
  // 确保custom是数组
  const customArray = Array.isArray(custom) ? custom : [];
  
  // 构建分类映射，避免重复
  const map = new Map();
  
  // 添加默认分类
  DEFAULT_CATEGORIES.forEach(c => {
    map.set(c.value, c);
  });
  
  // 添加用户自定义分类（如果有label字段，使用label作为value）
  customArray.forEach(c => {
    if (c.label && !map.has(c.label)) {
      map.set(c.label, { value: c.label, label: c.label });
    } else if (c.value && !map.has(c.value)) {
      map.set(c.value, c);
    }
  });
  
  // 转换为数组并添加"自定义"选项
  const categories = Array.from(map.values());
  categories.push({ value: 'custom', label: '自定义' });
  
  return categories;
};

// 生成测试数据
export const generateTestData = () => {
  return [
    {
      id: '1',
      name: '兰蔻小黑瓶精华',
      category: '护肤品',
      brand: '兰蔻',
      quantity: 1,
      expiryDate: '2025-12-31',
      notes: '开封后6个月内用完',
      createdAt: new Date().toISOString()
    },
    {
      id: '2',
      name: '阿司匹林肠溶片',
      category: '药品',
      brand: '拜耳',
      quantity: 2,
      expiryDate: '2025-08-15',
      notes: '适用: 感冒, 发烧, 成人 | 感冒发烧时服用',
      medicineTags: ['感冒', '发烧', '成人'],
      createdAt: new Date().toISOString()
    },
    {
      id: '3',
      name: '牛奶',
      category: '食品',
      brand: '蒙牛',
      quantity: 6,
      expiryDate: '2025-07-20',
      notes: '冷藏保存',
      createdAt: new Date().toISOString()
    },
    {
      id: '4',
      name: '牙膏',
      category: '日用品',
      brand: '高露洁',
      quantity: 2,
      expiryDate: '2025-06-30',
      notes: '',
      createdAt: new Date().toISOString()
    },
    {
      id: '5',
      name: '维生素C片',
      category: '药品',
      brand: '汤臣倍健',
      quantity: 1,
      expiryDate: '2025-09-10',
      notes: '适用: 成人, 儿童 | 每日一片',
      medicineTags: ['成人', '儿童'],
      createdAt: new Date().toISOString()
    },
    {
      id: '6',
      name: '面霜',
      category: '护肤品',
      brand: '雅诗兰黛',
      quantity: 1,
      expiryDate: '2025-11-30',
      notes: '早晚使用',
      createdAt: new Date().toISOString()
    },
    {
      id: '7',
      name: '感冒药',
      category: '药品',
      brand: '999',
      quantity: 1,
      expiryDate: '2025-07-25',
      notes: '适用: 感冒, 咳嗽, 成人 | 症状缓解后停止服用',
      medicineTags: ['感冒', '咳嗽', '成人'],
      createdAt: new Date().toISOString()
    },
    {
      id: '8',
      name: '洗发水',
      category: '日用品',
      brand: '海飞丝',
      quantity: 1,
      expiryDate: '2025-03-15',
      notes: '',
      createdAt: new Date().toISOString()
    },
    {
      id: '9',
      name: '酸奶',
      category: '食品',
      brand: '伊利',
      quantity: 4,
      expiryDate: '2025-07-18',
      notes: '冷藏保存',
      createdAt: new Date().toISOString()
    },
    {
      id: '10',
      name: '眼霜',
      category: '护肤品',
      brand: '欧莱雅',
      quantity: 1,
      expiryDate: '2025-10-20',
      notes: '开封后3个月内用完',
      createdAt: new Date().toISOString()
    },
    {
      id: '11',
      name: '即将过期的牛奶',
      category: '食品',
      brand: '蒙牛',
      quantity: 2,
      expiryDate: '2025-01-15',
      notes: '需要尽快饮用',
      createdAt: new Date().toISOString()
    },
    {
      id: '12',
      name: '过期药品',
      category: '药品',
      brand: '感冒灵',
      quantity: 1,
      expiryDate: '2024-12-20',
      notes: '适用: 感冒, 婴幼儿 | 已过期，需要处理',
      medicineTags: ['感冒', '婴幼儿'],
      createdAt: new Date().toISOString()
    },
    {
      id: '13',
      name: '降压药',
      category: '药品',
      brand: '络活喜',
      quantity: 1,
      expiryDate: '2025-10-15',
      notes: '适用: 成人 | 高血压患者专用，每日一片',
      medicineTags: ['成人'],
      createdAt: new Date().toISOString()
    },
    {
      id: '14',
      name: '降糖药',
      category: '药品',
      brand: '二甲双胍',
      quantity: 2,
      expiryDate: '2025-09-20',
      notes: '适用: 成人 | 糖尿病患者，餐前服用',
      medicineTags: ['成人'],
      createdAt: new Date().toISOString()
    }
  ];
}; 