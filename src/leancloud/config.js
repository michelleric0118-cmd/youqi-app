// LeanCloud配置
import AV from 'leancloud-storage';

// 初始化LeanCloud
const initLeanCloud = () => {
  console.log('🔧 正在初始化LeanCloud...');
  
  // 临时硬编码配置（测试用）
  const config = {
    appId: "D6XZYikpA2suStDXoZl0dI7q-gzGzoHsz",
    appKey: "50BUt5vs3MsCOmPOlcSoU3Jo",
    serverURL: "https://d6xzyikp.lc-cn-n1-shared.com"
  };
  
  console.log('AppID:', config.appId);
  console.log('AppKey: 已设置');
  console.log('ServerURL:', config.serverURL);
  
  AV.init(config);
  
  console.log('✅ LeanCloud初始化完成');
};

// 导出初始化函数和AV实例
export { initLeanCloud, AV }; 