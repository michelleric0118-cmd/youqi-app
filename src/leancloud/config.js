// LeanCloud配置
import AV from 'leancloud-storage';

// 初始化LeanCloud
const initLeanCloud = () => {
  AV.init({
    appId: "你的AppID", // 需要替换为你的LeanCloud AppID
    appKey: "你的AppKey", // 需要替换为你的LeanCloud AppKey
    serverURL: "你的服务器地址" // 需要替换为你的LeanCloud服务器地址
  });
};

// 导出初始化函数和AV实例
export { initLeanCloud, AV }; 