import React, { useState, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Home, Package, Plus, Clock, BarChart3, Loader2 } from 'lucide-react';
import { Toaster } from 'react-hot-toast';
import './App.css';

// 懒加载页面组件
const HomePage = lazy(() => import('./pages/Home'));
const ItemsPage = lazy(() => import('./pages/Items'));
const AddItemPage = lazy(() => import('./pages/AddItem'));
const EditItemPage = lazy(() => import('./pages/EditItem'));
const ExpiringPage = lazy(() => import('./pages/Expiring'));
const StatisticsPage = lazy(() => import('./pages/Statistics'));
const LoginPage = lazy(() => import('./pages/Login'));
const LeanCloudTest = lazy(() => import('./components/LeanCloudTest'));

// 加载中的提示组件
const LoadingSpinner = () => (
  <div style={{ 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    height: '200px',
    flexDirection: 'column',
    gap: '16px'
  }}>
    <Loader2 size={32} className="animate-spin" />
    <p style={{ color: '#666', fontSize: '14px' }}>正在加载...</p>
  </div>
);

// 导航栏组件
const Navbar = () => {
  const location = useLocation();
  
  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  // 检查是否处于老年人模式
  const isElderMode = document.body.style.fontSize === '18px';

  return (
    <nav className="navbar">
      <div className="navbar-header">
        <h1 className="navbar-title" style={{ fontSize: isElderMode ? '24px' : '' }}>有期</h1>
        <p className="navbar-subtitle" style={{ fontSize: isElderMode ? '18px' : '' }}>家庭物品管理系统</p>
      </div>
      
      <div className="navbar-tabs">
        <Link to="/" className="navbar-tab" style={{ textDecoration: 'none' }}>
          <div className={isActive('/') ? 'navbar-tab active' : 'navbar-tab'} style={{ fontSize: isElderMode ? '18px' : '' }}>
            <Home size={20} />
            <span>首页</span>
          </div>
        </Link>
        
        <Link to="/items" className="navbar-tab" style={{ textDecoration: 'none' }}>
          <div className={isActive('/items') ? 'navbar-tab active' : 'navbar-tab'} style={{ fontSize: isElderMode ? '18px' : '' }}>
            <Package size={20} />
            <span>物品</span>
          </div>
        </Link>
        
        <Link to="/add" className="navbar-tab" style={{ textDecoration: 'none' }}>
          <div className={isActive('/add') ? 'navbar-tab active' : 'navbar-tab'} style={{ fontSize: isElderMode ? '18px' : '' }}>
            <Plus size={20} />
            <span>添加</span>
          </div>
        </Link>
        
        <Link to="/expiring" className="navbar-tab" style={{ textDecoration: 'none' }}>
          <div className={isActive('/expiring') ? 'navbar-tab active' : 'navbar-tab'} style={{ fontSize: isElderMode ? '18px' : '' }}>
            <Clock size={20} />
            <span>过期</span>
          </div>
        </Link>

        <Link to="/statistics" className="navbar-tab" style={{ textDecoration: 'none' }}>
          <div className={isActive('/statistics') ? 'navbar-tab active' : 'navbar-tab'} style={{ fontSize: isElderMode ? '18px' : '' }}>
            <BarChart3 size={20} />
            <span>统计</span>
          </div>
        </Link>
      </div>
    </nav>
  );
};

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false); // 简单的用户状态管理

  // 检查是否已登录（这里简化处理，实际应该检查token等）
  const checkLoginStatus = () => {
    const token = localStorage.getItem('user-token');
    return !!token;
  };

  return (
    <Router>
      <div className="App">
        {/* Toast 通知容器 */}
        <Toaster position="top-center" reverseOrder={false} />
        
        <Routes>
          {/* 登录页面路由 */}
          <Route path="/login" element={
            <LoginPage onLogin={() => setIsLoggedIn(true)} />
          } />
          
          {/* 主应用路由 - 需要登录 */}
          <Route path="*" element={
            (!isLoggedIn && !checkLoginStatus()) ? (
              <LoginPage onLogin={() => setIsLoggedIn(true)} />
            ) : (
              <div className="App">
                {/* 导航栏 */}
                <Navbar />

                {/* 主内容区域 */}
                <div className="container">
                  <Suspense fallback={<LoadingSpinner />}>
                    <Routes>
                                          <Route path="/" element={<HomePage />} />
                    <Route path="/items" element={<ItemsPage />} />
                    <Route path="/add" element={<AddItemPage />} />
                    <Route path="/edit/:id" element={<EditItemPage />} />
                    <Route path="/expiring" element={<ExpiringPage />} />
                    <Route path="/statistics" element={<StatisticsPage />} />
                    <Route path="/test" element={<LeanCloudTest />} />
                    </Routes>
                  </Suspense>
                </div>
              </div>
            )
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
