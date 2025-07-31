import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { initLeanCloud } from './leancloud/config';

// 初始化LeanCloud
initLeanCloud();

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
