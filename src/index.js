import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { initLeanCloud } from './leancloud/config';

// 初始化LeanCloud
initLeanCloud();

// 标记一次新的前端构建，用于绕过边缘缓存
// 仅日志，不影响功能
// eslint-disable-next-line no-console
console.info('[YOUQI] frontend build id v2:', 'cache-bust-', new Date().toISOString());

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
