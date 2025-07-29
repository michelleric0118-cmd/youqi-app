// Firebase配置
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// 配置信息（需要替换为真实的Firebase项目配置）
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};

// 初始化Firebase
const app = initializeApp(firebaseConfig);

// 获取Firestore实例
export const db = getFirestore(app);

// 导出Firebase应用实例（如果需要其他服务）
export default app; 