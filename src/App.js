import React, { useState, Suspense, lazy, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Home, Package, Plus, Clock, BarChart3, Loader2, Settings as SettingsIcon } from 'lucide-react';
import { Toaster } from 'react-hot-toast';
import i18n from './utils/i18n';
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

// 懒加载新功能组件
const QRScanner = lazy(() => import('./components/QRScanner'));
const DataImport = lazy(() => import('./components/DataImport'));
const FeatureTest = lazy(() => import('./components/FeatureTest'));
const Settings = lazy(() => import('./components/Settings'));

// 加载中的提示组件
const LoadingSpinner = ({ message = i18n.t('loading'), size = 'default' }) => {
  const spinnerSizes = {
    small: { container: '100px', spinner: 24, font: '12px' },
    default: { container: '200px', spinner: 32, font: '14px' },
    large: { container: '300px', spinner: 48, font: '16px' }
  };

  const currentSize = spinnerSizes[size] || spinnerSizes.default;

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: currentSize.container,
      flexDirection: 'column',
      gap: '16px',
      background: 'rgba(255, 255, 255, 0.9)',
      borderRadius: '8px',
      padding: '20px',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
    }}>
      <div className="loading-spinner-container">
        <Loader2 
          size={currentSize.spinner} 
          className="animate-spin" 
          style={{
            color: '#2563eb',
            filter: 'drop-shadow(0 0 2px rgba(37, 99, 235, 0.2))'
          }}
        />
      </div>
      <p style={{ 
        color: '#4b5563', 
        fontSize: currentSize.font,
        fontWeight: '500',
        textAlign: 'center',
        maxWidth: '200px',
        lineHeight: '1.5'
      }}>
        {message}
      </p>
    </div>
  );
};

// 导航栏组件
const Navbar = ({ onOpenSettings }) => {
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
            <span>{i18n.t('home')}</span>
          </div>
        </Link>
        
        <Link to="/items" className="navbar-tab" style={{ textDecoration: 'none' }}>
          <div className={isActive('/items') ? 'navbar-tab active' : 'navbar-tab'} style={{ fontSize: isElderMode ? '18px' : '' }}>
            <Package size={20} />
            <span>{i18n.t('items')}</span>
          </div>
        </Link>
        
        <Link to="/add" className="navbar-tab" style={{ textDecoration: 'none' }}>
          <div className={isActive('/add') ? 'navbar-tab active' : 'navbar-tab'} style={{ fontSize: isElderMode ? '18px' : '' }}>
            <Plus size={20} />
            <span>{i18n.t('addItem')}</span>
          </div>
        </Link>
        
        <Link to="/expiring" className="navbar-tab" style={{ textDecoration: 'none' }}>
          <div className={isActive('/expiring') ? 'navbar-tab active' : 'navbar-tab'} style={{ fontSize: isElderMode ? '18px' : '' }}>
            <Clock size={20} />
            <span>{i18n.t('expiring')}</span>
          </div>
        </Link>

        <Link to="/statistics" className="navbar-tab" style={{ textDecoration: 'none' }}>
          <div className={isActive('/statistics') ? 'navbar-tab active' : 'navbar-tab'} style={{ fontSize: isElderMode ? '18px' : '' }}>
            <BarChart3 size={20} />
            <span>{i18n.t('statistics')}</span>
          </div>
        </Link>

        <button 
          className="navbar-settings-btn" 
          onClick={onOpenSettings}
          style={{ fontSize: isElderMode ? '18px' : '' }}
        >
          <SettingsIcon size={20} />
          <span>{i18n.t('settings')}</span>
        </button>
      </div>
    </nav>
  );
};

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [showDataImport, setShowDataImport] = useState(false);

  // 检查是否已登录（这里简化处理，实际应该检查token等）
  const checkLoginStatus = () => {
    const token = localStorage.getItem('user-token');
    return !!token;
  };

  // 监听语言变化
  useEffect(() => {
    const handleLanguageChange = () => {
      // 强制重新渲染以应用新语言
      window.location.reload();
    };

    window.addEventListener('languageChanged', handleLanguageChange);
    return () => {
      window.removeEventListener('languageChanged', handleLanguageChange);
    };
  }, []);

  return (
    <Router>
      <div className="App">
        {/* Toast 通知容器 */}
        <Toaster 
          position="top-center" 
          reverseOrder={false}
          toastOptions={{
            style: {
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif',
              fontSize: '14px',
              color: '#2c2c2c',
              background: 'white',
              border: '1px solid rgba(0,0,0,0.05)',
              boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
              borderRadius: '8px',
              padding: '12px 16px'
            },
            success: {
              style: {
                background: 'var(--sage-green-light)',
                color: 'var(--sage-green-dark)',
                border: '1px solid var(--sage-green)'
              }
            },
            error: {
              style: {
                background: '#fef2f2',
                color: '#dc2626',
                border: '1px solid #fecaca'
              }
            }
          }}
        />
        
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
                <Navbar onOpenSettings={() => setShowSettings(true)} />

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
                      <Route path="/feature-test" element={
                        <FeatureTest 
                          onOpenQRScanner={() => setShowQRScanner(true)}
                          onOpenDataImport={() => setShowDataImport(true)}
                          onOpenLanguageSettings={() => setShowSettings(true)}
                        />
                      } />
                    </Routes>
                  </Suspense>
                </div>

                {/* 设置面板 */}
                {showSettings && (
                  <Suspense fallback={<LoadingSpinner />}>
                    <Settings 
                      onClose={() => setShowSettings(false)}
                      onOpenLanguageSettings={() => {
                        setShowSettings(false);
                        // 这里可以打开语言设置
                      }}
                      onOpenDataImport={() => {
                        setShowSettings(false);
                        setShowDataImport(true);
                      }}
                    />
                  </Suspense>
                )}

                {/* 扫码组件 */}
                {showQRScanner && (
                  <Suspense fallback={<LoadingSpinner />}>
                    <QRScanner 
                      onScan={(result) => {
                        console.log('扫码结果:', result);
                        setShowQRScanner(false);
                      }}
                      onClose={() => setShowQRScanner(false)}
                      onManualInput={(code) => {
                        console.log('手动输入条码:', code);
                        setShowQRScanner(false);
                      }}
                    />
                  </Suspense>
                )}

                {/* 数据导入组件 */}
                {showDataImport && (
                  <Suspense fallback={<LoadingSpinner />}>
                    <DataImport 
                      onImport={(data, mode) => {
                        console.log('导入数据:', data, mode);
                        setShowDataImport(false);
                      }}
                      onClose={() => setShowDataImport(false)}
                    />
                  </Suspense>
                )}
              </div>
            )
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
