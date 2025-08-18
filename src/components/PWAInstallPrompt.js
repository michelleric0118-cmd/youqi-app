import React, { useState, useEffect } from 'react';
import { Download, X, Bell, Smartphone, Info, ArrowUp, Share2, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const PWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [platform, setPlatform] = useState('unknown');
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  useEffect(() => {
    // 检测平台
    const detectPlatform = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      if (/iphone|ipad|ipod/.test(userAgent)) {
        return 'ios';
      } else if (/android/.test(userAgent)) {
        return 'android';
      } else if (/windows/.test(userAgent)) {
        return 'windows';
      } else if (/macintosh|mac os x/.test(userAgent)) {
        return 'mac';
      } else if (/linux/.test(userAgent)) {
        return 'linux';
      }
      return 'unknown';
    };

    setPlatform(detectPlatform());

    // 检测是否已安装
    const checkInstallation = () => {
      if (window.matchMedia('(display-mode: standalone)').matches ||
          window.navigator.standalone === true) {
        setIsInstalled(true);
        return true;
      }
      return false;
    };

    // 监听beforeinstallprompt事件
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    // 监听appinstalled事件
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowPrompt(false);
      console.log('PWA安装成功！');
    };

    // 检查是否已安装
    if (!checkInstallation()) {
      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.addEventListener('appinstalled', handleAppInstalled);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('用户接受了安装提示');
      toast.success('PWA安装已启动，请按照提示完成安装');
    } else {
      console.log('用户拒绝了安装提示');
      toast('PWA安装已取消，您可以稍后在浏览器菜单中手动安装');
    }
    
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleShowIOSGuide = () => {
    setShowIOSGuide(true);
    toast('正在显示iOS安装详细步骤');
  };

  const handleCloseIOSGuide = () => {
    setShowIOSGuide(false);
    toast('已关闭iOS安装指南');
  };

  const handleClosePrompt = () => {
    setShowPrompt(false);
    toast('PWA安装提示已关闭');
  };

  // 如果已安装或没有安装提示，不显示
  if (isInstalled || !showPrompt) {
    return null;
  }

  // iOS设备显示特殊引导
  if (platform === 'ios') {
    return (
      <div className="pwa-install-prompt ios-prompt">
        <div className="prompt-content">
          <div className="prompt-header">
            <Smartphone className="prompt-icon" />
            <h3>安装"有期"到主屏幕</h3>
            <button className="close-button" onClick={handleClosePrompt}>
              <X size={20} />
            </button>
          </div>
          
          <div className="prompt-body">
            <p>享受更好的体验，包括离线访问和推送通知</p>
            
            <div className="ios-steps">
              <div className="step">
                <div className="step-number">1</div>
                <div className="step-content">
                  <p>点击底部分享按钮</p>
                  <Share2 className="step-icon" />
                </div>
              </div>
              
              <div className="step">
                <div className="step-number">2</div>
                <div className="step-content">
                  <p>选择"添加到主屏幕"</p>
                  <ArrowUp className="step-icon" />
                </div>
              </div>
              
              <div className="step">
                <div className="step-number">3</div>
                <div className="step-content">
                  <p>点击"添加"完成安装</p>
                  <CheckCircle className="step-icon" />
                </div>
              </div>
            </div>
            
            <button className="ios-guide-button" onClick={handleShowIOSGuide}>
              查看详细步骤
            </button>
          </div>
        </div>

        {/* iOS详细安装引导弹窗 */}
        {showIOSGuide && (
          <div className="ios-guide-modal">
            <div className="ios-guide-content">
              <div className="ios-guide-header">
                <h3>iOS安装详细步骤</h3>
                <button className="close-button" onClick={handleCloseIOSGuide}>
                  <X size={20} />
                </button>
              </div>
              
              <div className="ios-guide-body">
                <div className="guide-step">
                  <div className="step-image">📱</div>
                  <h4>第一步：打开分享菜单</h4>
                  <p>在Safari浏览器中，点击底部的分享按钮（方框加箭头的图标）</p>
                </div>
                
                <div className="guide-step">
                  <div className="step-image">➕</div>
                  <h4>第二步：选择"添加到主屏幕"</h4>
                  <p>在分享菜单中，向下滚动找到"添加到主屏幕"选项并点击</p>
                </div>
                
                <div className="guide-step">
                  <div className="step-image">✏️</div>
                  <h4>第三步：自定义名称（可选）</h4>
                  <p>您可以修改应用名称，然后点击"添加"按钮</p>
                </div>
                
                <div className="guide-step">
                  <div className="step-image">🎉</div>
                  <h4>完成安装</h4>
                  <p>现在您可以在主屏幕上找到"有期"应用了！</p>
                </div>
                
                <div className="guide-tips">
                  <h4>💡 小贴士</h4>
                  <ul>
                    <li>安装后，应用会像原生应用一样工作</li>
                    <li>支持离线访问和推送通知</li>
                    <li>可以添加到主屏幕文件夹中</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // 其他平台显示标准安装提示
  return (
    <div className="pwa-install-prompt">
      <div className="prompt-content">
        <div className="prompt-header">
          <Download className="prompt-icon" />
          <h3>安装"有期"应用</h3>
          <button className="close-button" onClick={handleClosePrompt}>
            <X size={20} />
          </button>
        </div>
        
        <div className="prompt-body">
          <p>享受更好的体验，包括离线访问和推送通知</p>
          
          <div className="prompt-features">
            <div className="feature">
              <Bell className="feature-icon" />
              <span>智能过期提醒</span>
            </div>
            <div className="feature">
              <Smartphone className="feature-icon" />
              <span>离线使用</span>
            </div>
            <div className="feature">
              <Info className="feature-icon" />
              <span>推送通知</span>
            </div>
          </div>
          
          <button className="install-button" onClick={handleInstall}>
            <Download className="button-icon" />
            立即安装
          </button>
        </div>
      </div>
    </div>
  );
};

export default PWAInstallPrompt; 