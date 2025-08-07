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
  '6901234567894': {
    name: '阿司匹林肠溶片',
    brand: '拜耳',
    category: '药品',
    description: '解热镇痛，预防心血管疾病',
    commonTags: ['止痛', '心血管', '预防'],
    defaultExpiryDays: 730
  },
  '6901234567895': {
    name: '钙片',
    brand: '钙尔奇',
    category: '药品',
    description: '补充钙质，强健骨骼',
    commonTags: ['钙质', '骨骼', '保健'],
    defaultExpiryDays: 1095
  },
  '6901234567896': {
    name: '藿香正气水',
    brand: '同仁堂',
    category: '药品',
    description: '解暑化湿，理气和中',
    commonTags: ['解暑', '化湿', '理气'],
    defaultExpiryDays: 730
  },
  '6901234567897': {
    name: '创可贴',
    brand: '邦迪',
    category: '药品',
    description: '伤口保护，防水透气',
    commonTags: ['伤口', '保护', '急救'],
    defaultExpiryDays: 1095
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
  '6909876543214': {
    name: '眼霜',
    brand: '兰蔻',
    category: '护肤品',
    description: '淡化细纹，紧致眼周',
    commonTags: ['眼霜', '抗皱', '紧致'],
    defaultExpiryDays: 1095
  },
  '6909876543215': {
    name: '面膜',
    brand: 'SK-II',
    category: '护肤品',
    description: '深层补水，提亮肤色',
    commonTags: ['面膜', '补水', '提亮'],
    defaultExpiryDays: 730
  },
  '6909876543216': {
    name: '爽肤水',
    brand: '倩碧',
    category: '护肤品',
    description: '温和清洁，平衡肌肤',
    commonTags: ['爽肤水', '清洁', '平衡'],
    defaultExpiryDays: 1095
  },
  '6909876543217': {
    name: '护手霜',
    brand: '欧舒丹',
    category: '护肤品',
    description: '滋润保湿，修复干裂',
    commonTags: ['护手霜', '滋润', '修复'],
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
  '6905555555559': {
    name: '苹果',
    brand: '红富士',
    category: '食品',
    description: '新鲜苹果，脆甜可口',
    commonTags: ['苹果', '水果', '维生素'],
    defaultExpiryDays: 14
  },
  '6905555555560': {
    name: '橙子',
    brand: '赣南脐橙',
    category: '食品',
    description: '甜橙，富含维生素C',
    commonTags: ['橙子', '水果', '维生素C'],
    defaultExpiryDays: 14
  },
  '6905555555561': {
    name: '香蕉',
    brand: '海南香蕉',
    category: '食品',
    description: '香甜软糯，营养丰富',
    commonTags: ['香蕉', '水果', '钾元素'],
    defaultExpiryDays: 7
  },
  '6905555555562': {
    name: '西红柿',
    brand: '圣女果',
    category: '食品',
    description: '新鲜西红柿，酸甜可口',
    commonTags: ['西红柿', '蔬菜', '番茄红素'],
    defaultExpiryDays: 7
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
  },
  '6907777777781': {
    name: '卫生纸',
    brand: '清风',
    category: '日用品',
    description: '柔软舒适，三层加厚',
    commonTags: ['卫生纸', '清洁', '生活'],
    defaultExpiryDays: 1095
  },
  '6907777777782': {
    name: '垃圾袋',
    brand: '洁柔',
    category: '日用品',
    description: '加厚垃圾袋，结实耐用',
    commonTags: ['垃圾袋', '清洁', '生活'],
    defaultExpiryDays: 1095
  },
  '6907777777783': {
    name: '洗洁精',
    brand: '立白',
    category: '日用品',
    description: '去油污，不伤手',
    commonTags: ['洗洁精', '清洁', '厨房'],
    defaultExpiryDays: 1095
  },
  '6907777777784': {
    name: '消毒液',
    brand: '滴露',
    category: '日用品',
    description: '杀菌消毒，安全有效',
    commonTags: ['消毒液', '杀菌', '清洁'],
    defaultExpiryDays: 1095
  },

  // 饮料类
  '6908888888888': {
    name: '可乐',
    brand: '可口可乐',
    category: '饮料',
    description: '经典可乐，清爽解渴',
    commonTags: ['可乐', '碳酸', '饮料'],
    defaultExpiryDays: 180
  },
  '6908888888889': {
    name: '雪碧',
    brand: '雪碧',
    category: '饮料',
    description: '柠檬味汽水，清爽怡人',
    commonTags: ['雪碧', '碳酸', '柠檬'],
    defaultExpiryDays: 180
  },
  '6908888888890': {
    name: '矿泉水',
    brand: '农夫山泉',
    category: '饮料',
    description: '天然矿泉水，健康饮水',
    commonTags: ['矿泉水', '天然', '健康'],
    defaultExpiryDays: 365
  },
  '6908888888891': {
    name: '绿茶',
    brand: '康师傅',
    category: '饮料',
    description: '清香绿茶，解腻提神',
    commonTags: ['绿茶', '茶饮', '健康'],
    defaultExpiryDays: 180
  },

  // 零食类
  '6909999999999': {
    name: '薯片',
    brand: '乐事',
    category: '零食',
    description: '香脆薯片，多种口味',
    commonTags: ['薯片', '零食', '香脆'],
    defaultExpiryDays: 180
  },
  '6909999999998': {
    name: '巧克力',
    brand: '德芙',
    category: '零食',
    description: '丝滑巧克力，甜蜜享受',
    commonTags: ['巧克力', '零食', '甜蜜'],
    defaultExpiryDays: 365
  },
  '6909999999997': {
    name: '饼干',
    brand: '奥利奥',
    category: '零食',
    description: '经典夹心饼干',
    commonTags: ['饼干', '零食', '夹心'],
    defaultExpiryDays: 180
  },
  '6909999999996': {
    name: '坚果',
    brand: '三只松鼠',
    category: '零食',
    description: '混合坚果，营养美味',
    commonTags: ['坚果', '零食', '营养'],
    defaultExpiryDays: 180
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