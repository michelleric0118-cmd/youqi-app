// Firebase配置
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// 配置信息 - 你的Firebase项目配置
const firebaseConfig = {
  apiKey: "AIzaSyBcZlsz3HRS5CQA7a4ScxwhIuIkEuSm1Vw",
  authDomain: "youqi-app-2d40f.firebaseapp.com",
  projectId: "youqi-app-2d40f",
  storageBucket: "youqi-app-2d40f.firebasestorage.app",
  messagingSenderId: "820230929445",
  appId: "1:82030929445:web:ccaf51dcd5ce87f6a553cc",
  measurementId: "G-63YHPFFM81"
};

// 初始化Firebase
const app = initializeApp(firebaseConfig);

// 获取Firestore实例
export const db = getFirestore(app);

// 导出Firebase应用实例（如果需要其他服务）
export default app; 