// 为安全起见，前端不再保存百度OCR密钥，统一走后端代理 /api/ocr
// BAIDU_OCR_CONFIG 仅用于运行时检查是否通过 configureBaiduOCR 显式设置（可选）
const BAIDU_OCR_CONFIG = {
  APP_ID: '',
  API_KEY: '',
  SECRET_KEY: '',
  ACCESS_TOKEN: null,
  TOKEN_EXPIRE_TIME: 0
};

// 配置说明：
// APP_ID: 应用唯一标识，格式如 "12345678"
// API_KEY: API访问密钥，格式如 "abcdefghijklmnopqrstuvwxyz"
// SECRET_KEY: 安全密钥，格式如 "abcdefghijklmnopqrstuvwxyz123456"

// 使用示例：
// configureBaiduOCR('7008056', 'eIKgfcznPiVt64bIlQfmroDQ', 'eSHTWnCnSTxIOXRyddln1Xm7LMRdQfWF');

// 免费额度使用建议：
// - 内测20个用户，每人每月使用50次
// - 总计1000次/月，在免费额度范围内
// - 建议优先使用标准版，失败时使用高精度版

// 获取访问令牌
const getAccessToken = async () => {
  const now = Date.now();
  
  // 如果令牌未过期，直接返回
  if (BAIDU_OCR_CONFIG.ACCESS_TOKEN && now < BAIDU_OCR_CONFIG.TOKEN_EXPIRE_TIME) {
    return BAIDU_OCR_CONFIG.ACCESS_TOKEN;
  }

  try {
    const response = await fetch(
      `https://aip.baidubce.com/oauth/2.0/token?grant_type=client_credentials&client_id=${BAIDU_OCR_CONFIG.API_KEY}&client_secret=${BAIDU_OCR_CONFIG.SECRET_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );

    const data = await response.json();
    
    if (data.access_token) {
      BAIDU_OCR_CONFIG.ACCESS_TOKEN = data.access_token;
      BAIDU_OCR_CONFIG.TOKEN_EXPIRE_TIME = now + (data.expires_in - 60) * 1000; // 提前60秒过期
      return data.access_token;
    } else {
      throw new Error('获取访问令牌失败');
    }
  } catch (error) {
    console.error('获取百度OCR访问令牌失败:', error);
    throw error;
  }
};

// 通用文字识别（高精度版）
export const recognizeText = async (imageBase64, { mode = 'standard', sessionToken } = {}) => {
  // 通过后端代理调用，避免暴露密钥（支持 Cloudflare Functions 路由 /api/ocr）
  const headers = { 'Content-Type': 'application/json' };
  if (sessionToken) headers['Authorization'] = `Bearer ${sessionToken}`;
  const res = await fetch('/api/ocr', {
    method: 'POST',
    headers,
    body: JSON.stringify({ imageBase64, mode })
  });
  const data = await res.json();
  if (!res.ok) {
    const err = new Error(data.error || 'OCR代理调用失败');
    if (data.code) err.code = data.code;
    err.status = res.status;
    throw err;
  }
  return data.words_result || [];
};

// 通用文字识别（标准版）
export const recognizeTextStandard = async (imageBase64) => recognizeText(imageBase64, { mode: 'standard' });

// 解析OCR结果，提取商品信息
export const parseProductInfo = (ocrResults) => {
  const text = ocrResults.map(item => item.words).join('\n');
  const lines = text.split('\n');
  
  const productInfo = {
    name: '',
    brand: '',
    productionDate: '',
    expiryDate: '',
    notes: ''
  };

  // 简单的文本解析逻辑
  for (const line of lines) {
    const lowerLine = line.toLowerCase();
    
    // 提取品牌信息
    if (lowerLine.includes('兰蔻') || lowerLine.includes('lancome')) {
      productInfo.brand = '兰蔻';
    } else if (lowerLine.includes('雅诗兰黛') || lowerLine.includes('estee lauder')) {
      productInfo.brand = '雅诗兰黛';
    } else if (lowerLine.includes('欧莱雅') || lowerLine.includes('loreal')) {
      productInfo.brand = '欧莱雅';
    }
    
    // 提取生产日期
    const productionMatch = line.match(/生产日期[：:]\s*(\d{4}[-/]\d{1,2}[-/]\d{1,2})/);
    if (productionMatch) {
      productInfo.productionDate = productionMatch[1];
    }
    
    // 提取过期日期
    const expiryMatch = line.match(/保质期[：:]\s*(\d{4}[-/]\d{1,2}[-/]\d{1,2})/);
    if (expiryMatch) {
      productInfo.expiryDate = expiryMatch[1];
    }
    
    // 提取开封后保质期
    const paoMatch = line.match(/开封后(\d+)个月/);
    if (paoMatch) {
      productInfo.notes = `开封后${paoMatch[1]}个月内用完`;
    }
  }

  // 如果没有找到明确的品牌，尝试从第一行提取
  if (!productInfo.brand && lines.length > 0) {
    const firstLine = lines[0];
    if (firstLine.length > 0 && firstLine.length < 50) {
      productInfo.name = firstLine;
    }
  }

  return productInfo;
};

// 模拟OCR识别（用于开发测试）
export const mockOCRRecognition = async (imageBase64) => {
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // 返回模拟的识别结果
  return [
    { words: '兰蔻小黑瓶精华' },
    { words: 'Lancome Advanced Genifique' },
    { words: '30ml' },
    { words: '生产日期: 2024-01-15' },
    { words: '保质期: 36个月' },
    { words: '开封后6个月内用完' }
  ];
};

// 配置百度OCR
export const configureBaiduOCR = (appId, apiKey, secretKey) => {
  BAIDU_OCR_CONFIG.APP_ID = appId;
  BAIDU_OCR_CONFIG.API_KEY = apiKey;
  BAIDU_OCR_CONFIG.SECRET_KEY = secretKey;
};

// 检查OCR配置
export const checkOCRConfig = () => {
  return {
    isConfigured: !!(BAIDU_OCR_CONFIG.APP_ID && BAIDU_OCR_CONFIG.API_KEY && BAIDU_OCR_CONFIG.SECRET_KEY),
    hasToken: !!(BAIDU_OCR_CONFIG.ACCESS_TOKEN && Date.now() < BAIDU_OCR_CONFIG.TOKEN_EXPIRE_TIME)
  };
}; 