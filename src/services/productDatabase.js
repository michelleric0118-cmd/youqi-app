// 商品数据库服务
const PRODUCT_DATABASE = {
  // 药品类
  '6901234567890': {
    name: '感冒灵颗粒',
    brand: '999',
    category: '药品',
    description: '用于感冒引起的头痛发热',
    commonTags: ['感冒', '发热', '头痛'],
    defaultExpiryDays: 730
  },
  '6901234567891': {
    name: '布洛芬缓释胶囊',
    brand: '芬必得',
    category: '药品',
    description: '用于缓解轻至中度疼痛',
    commonTags: ['止痛', '消炎', '发热'],
    defaultExpiryDays: 730
  },
  '6901234567892': {
    name: '维生素C片',
    brand: '善存',
    category: '药品',
    description: '补充维生素C，增强免疫力',
    commonTags: ['维生素', '免疫力', '保健'],
    defaultExpiryDays: 1095
  },
  '6901234567893': {
    name: '板蓝根颗粒',
    brand: '白云山',
    category: '药品',
    description: '清热解毒，预防感冒',
    commonTags: ['感冒', '清热解毒', '预防'],
    defaultExpiryDays: 730
  },

  // 护肤品类
  '6909876543210': {
    name: '保湿面霜',
    brand: '兰蔻',
    category: '护肤品',
    description: '深层保湿，滋润肌肤',
    commonTags: ['保湿', '面霜', '护肤'],
    defaultExpiryDays: 1095
  },
  '6909876543211': {
    name: '防晒霜SPF50+',
    brand: '安耐晒',
    category: '护肤品',
    description: '高效防晒，防水防汗',
    commonTags: ['防晒', '护肤', '户外'],
    defaultExpiryDays: 730
  },
  '6909876543212': {
    name: '洁面乳',
    brand: '资生堂',
    category: '护肤品',
    description: '温和清洁，不刺激',
    commonTags: ['洁面', '清洁', '护肤'],
    defaultExpiryDays: 1095
  },
  '6909876543213': {
    name: '精华液',
    brand: '雅诗兰黛',
    category: '护肤品',
    description: '修护精华，改善肤质',
    commonTags: ['精华', '修护', '护肤'],
    defaultExpiryDays: 1095
  },

  // 食品类
  '6905555555555': {
    name: '牛奶',
    brand: '蒙牛',
    category: '食品',
    description: '纯牛奶，营养丰富',
    commonTags: ['牛奶', '营养', '早餐'],
    defaultExpiryDays: 7
  },
  '6905555555556': {
    name: '面包',
    brand: '好利来',
    category: '食品',
    description: '新鲜面包，口感松软',
    commonTags: ['面包', '早餐', '主食'],
    defaultExpiryDays: 3
  },
  '6905555555557': {
    name: '酸奶',
    brand: '伊利',
    category: '食品',
    description: '益生菌酸奶，助消化',
    commonTags: ['酸奶', '益生菌', '健康'],
    defaultExpiryDays: 14
  },
  '6905555555558': {
    name: '鸡蛋',
    brand: '德青源',
    category: '食品',
    description: '新鲜鸡蛋，营养丰富',
    commonTags: ['鸡蛋', '蛋白质', '营养'],
    defaultExpiryDays: 30
  },

  // 日用品类
  '6907777777777': {
    name: '洗发水',
    brand: '海飞丝',
    category: '日用品',
    description: '去屑洗发水，清爽控油',
    commonTags: ['洗发', '去屑', '清洁'],
    defaultExpiryDays: 1095
  },
  '6907777777778': {
    name: '牙膏',
    brand: '高露洁',
    category: '日用品',
    description: '防蛀牙膏，清新口气',
    commonTags: ['牙膏', '口腔', '清洁'],
    defaultExpiryDays: 1095
  },
  '6907777777779': {
    name: '沐浴露',
    brand: '舒肤佳',
    category: '日用品',
    description: '温和沐浴露，滋润肌肤',
    commonTags: ['沐浴', '清洁', '护肤'],
    defaultExpiryDays: 1095
  },
  '6907777777780': {
    name: '洗衣液',
    brand: '蓝月亮',
    category: '日用品',
    description: '深层清洁，护色护衣',
    commonTags: ['洗衣', '清洁', '护色'],
    defaultExpiryDays: 1095
  }
};

export const getProductByBarcode = (barcode) => {
  return PRODUCT_DATABASE[barcode] || null;
};

export const generateProductInfo = (barcode) => {
  const product = getProductByBarcode(barcode);
  if (product) {
    return {
      name: product.name,
      brand: product.brand,
      category: product.category,
      notes: product.description,
      medicineTags: product.commonTags || [],
      defaultExpiryDays: product.defaultExpiryDays
    };
  }
  
  return {
    name: `商品${barcode.substring(8)}`,
    brand: `品牌${barcode.substring(6, 8)}`,
    category: '其他',
    notes: `条码: ${barcode}`,
    medicineTags: [],
    defaultExpiryDays: 365
  };
}; 