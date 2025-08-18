import React, { useState, Suspense, lazy, useEffect } from 'react';
import { initLeanCloud, AV } from './leancloud/config';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Home, Package, Plus, Clock, BarChart3, Loader2, Settings as SettingsIcon } from 'lucide-react';
import { Toaster } from 'react-hot-toast';
import i18n from './utils/i18n';
import './App.css';
import './utils/debugHelper'; // 导入调试工具

// PWA组件
import PWAInstallPrompt from './components/PWAInstallPrompt';
import LocalNotificationManager from './components/LocalNotificationManager';

// 推送通知工具
import { initializePushNotifications } from './utils/pushNotificationUtils';

// 状态指示器移除工具
import statusIndicatorRemover from './utils/statusIndicatorRemover';

// 错误边界组件
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('页面渲染错误:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '20px',
          textAlign: 'center',
          color: '#dc2626',
          background: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: '8px',
          margin: '20px'
        }}>
          <h3>页面加载失败</h3>
          <p>抱歉，页面遇到了问题。请尝试刷新页面或返回首页。</p>
          <button 
            onClick={() => window.location.href = '/'}
            style={{
              padding: '8px 16px',
              background: '#dc2626',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            返回首页
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// 懒加载页面组件
const HomePage = lazy(() => import('./pages/Home'));
const ItemsPage = lazy(() => import('./pages/Items'));
const AddItemPage = lazy(() => import('./pages/AddItem'));
const EditItemPage = lazy(() => import('./pages/EditItem'));
const ExpiringPage = lazy(() => import('./pages/Expiring'));
const StatisticsPage = lazy(() => import('./pages/Statistics'));
const LoginPage = lazy(() => import('./pages/Login'));
const LeanCloudTest = lazy(() => import('./components/LeanCloudTest'));
const OCRTest = lazy(() => import('./components/OCRTest'));
const UpgradePage = lazy(() => import('./pages/Upgrade'));

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
const Navbar = ({ onOpenSettings, showSettings }) => {
  const location = useLocation();
  
  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  // 检查是否处于老年人模式
  const isElderMode = document.body.style.fontSize === '18px';
  
  // 检查是否为移动端
  const isMobile = window.innerWidth <= 768;

  return (
    <>
      {/* 桌面端顶部导航栏 */}
      {!isMobile && (
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
                <span>{i18n.t('add')}</span>
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
              onClick={onOpenSettings}
              className="navbar-tab"
              style={{ 
                fontSize: isElderMode ? '18px' : '',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '0',
                margin: '0',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <SettingsIcon size={20} />
              <span>{i18n.t('settings')}</span>
            </button>
          </div>
        </nav>
      )}
      
      {/* 移动端底部标签栏 */}
      {isMobile && (
        <nav className="mobile-bottom-nav">
          <Link to="/" className={`mobile-nav-tab ${isActive('/') ? 'active' : ''}`}>
            <Home size={20} />
            <span>{i18n.t('home')}</span>
          </Link>
          
          <Link to="/items" className={`mobile-nav-tab ${isActive('/items') ? 'active' : ''}`}>
            <Package size={20} />
            <span>{i18n.t('items')}</span>
          </Link>
          
          <Link to="/add" className={`mobile-nav-tab ${isActive('/add') ? 'active' : ''}`}>
            <Plus size={20} />
            <span>{i18n.t('add')}</span>
          </Link>
          
          <Link to="/expiring" className={`mobile-nav-tab ${isActive('/expiring') ? 'active' : ''}`}>
            <Clock size={20} />
            <span>{i18n.t('expiring')}</span>
          </Link>
          
          <Link to="/statistics" className={`mobile-nav-tab ${isActive('/statistics') ? 'active' : ''}`}>
            <BarChart3 size={20} />
            <span>{i18n.t('statistics')}</span>
          </Link>
          
          <button 
            onClick={onOpenSettings}
            className={`mobile-nav-tab ${showSettings ? 'active' : ''}`}
          >
            <SettingsIcon size={20} />
            <span>{i18n.t('settings')}</span>
          </button>
        </nav>
      )}
    </>
  );
};

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [showDataImport, setShowDataImport] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState('zh-CN');
  
  // PWA相关状态
  const [showPWAInstall, setShowPWAInstall] = useState(false);
  const [pushNotificationStatus, setPushNotificationStatus] = useState(null);

  // 监听URL变化，自动显示Settings组件
  useEffect(() => {
    const handleUrlChange = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const tab = urlParams.get('tab');
      if (window.location.pathname === '/settings' || tab === 'category') {
        setShowSettings(true);
      }
    };

    // 监听URL变化
    window.addEventListener('popstate', handleUrlChange);
    
    // 检查初始URL
    handleUrlChange();

    // 移除管理员测试按钮，让界面更专业
    // 如需设置管理员权限，请通过LeanCloud控制台操作

    return () => {
      window.removeEventListener('popstate', handleUrlChange);
    };
  }, []);

  // 检查是否已登录（LeanCloud session）
  const checkLoginStatus = () => {
    const token = localStorage.getItem('leancloud-session');
    if (token) return true;
    try {
      const current = AV.User && AV.User.current && AV.User.current();
      return !!current;
    } catch (_) {
      return false;
    }
  };

  // 初始化 LeanCloud & 监听语言变化
  useEffect(() => {
    try { initLeanCloud(); } catch (_) {}
    setIsLoggedIn(checkLoginStatus());
    const handleLanguageChange = () => {
      // 强制重新渲染以应用新语言
      window.location.reload();
    };

    window.addEventListener('languageChanged', handleLanguageChange);
    return () => {
      window.removeEventListener('languageChanged', handleLanguageChange);
    };
  }, []);

  // 初始化PWA推送通知系统
  useEffect(() => {
    const initPushNotifications = async () => {
      try {
        const status = await initializePushNotifications();
        setPushNotificationStatus(status);
        
        if (status.supported && status.permission === 'granted') {
          console.log('推送通知系统初始化成功');
        } else if (status.supported && status.permission === 'default') {
          // 延迟显示PWA安装提示
          setTimeout(() => {
            setShowPWAInstall(true);
          }, 3000);
        }
      } catch (error) {
        console.error('推送通知系统初始化失败:', error);
      }
    };

    initPushNotifications();
  }, []);

  // 隐藏右上角状态指示器
  useEffect(() => {
    // 启动状态指示器移除工具
    statusIndicatorRemover.start();
    
    return () => {
      // 清理时停止工具
      statusIndicatorRemover.stop();
    };
  }, []);

  return (
    <Router>
      <div className="App">
        {/* 隐藏右上角状态指示器 */}
        <style>
          {`
            /* 隐藏右上角的状态指示器按钮 */
            [class*="status-indicator"],
            [class*="statusIndicator"],
            [id*="status-indicator"],
            [id*="statusIndicator"],
            .status-indicator,
            .statusIndicator,
            .status-indicators,
            .statusIndicators {
              display: none !important;
            }
            
            /* 隐藏包含"成功"、"错误"、"警告"、"信息"、"过期提醒"文字的按钮 */
            button:contains("成功"),
            button:contains("错误"),
            button:contains("警告"),
            button:contains("信息"),
            button:contains("过期提醒"),
            div:contains("成功"),
            div:contains("错误"),
            div:contains("警告"),
            div:contains("信息"),
            div:contains("过期提醒") {
              display: none !important;
            }
            
            /* 隐藏固定在右上角的元素 */
            [style*="position: fixed"][style*="top"][style*="right"],
            [style*="position:fixed"][style*="top"][style*="right"] {
              display: none !important;
            }
          `}
        </style>
        
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
              <ErrorBoundary>
                <div className="App">
                  {/* 导航栏 */}
                  <Navbar onOpenSettings={() => setShowSettings(true)} showSettings={showSettings} />

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
                        <Route path="/ocr-test" element={<OCRTest />} />
                         <Route path="/upgrade" element={<UpgradePage />} />
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

                  {/* PWA安装提示 */}
                  {showPWAInstall && (
                    <PWAInstallPrompt />
                  )}

                  {/* 本地通知管理器（开发模式显示） */}
                  {process.env.NODE_ENV === 'development' && (
                    <LocalNotificationManager />
                  )}
                </div>
              </ErrorBoundary>
            )
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
