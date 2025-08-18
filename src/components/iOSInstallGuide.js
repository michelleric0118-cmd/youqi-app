import React, { useState, useEffect } from 'react';
import { X, Smartphone, Share2, Plus, ArrowUp } from 'lucide-react';
import './iOSInstallGuide.css';

const iOSInstallGuide = ({ onClose }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // 检测是否为iOS设备
    const detectIOS = () => {
      const userAgent = navigator.userAgent || navigator.vendor || window.opera;
      return /iPad|iPhone|iPod/.test(userAgent);
    };

    // 检测是否已经安装为PWA
    const detectStandalone = () => {
      return window.matchMedia('(display-mode: standalone)').matches ||
             window.navigator.standalone === true;
    };

    const ios = detectIOS();
    const standalone = detectStandalone();

    setIsIOS(ios);
    setIsStandalone(standalone);

    // 如果是iOS设备且未安装为PWA，显示引导
    if (ios && !standalone) {
      // 延迟显示，避免干扰用户体验
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, []);

  // 处理分享
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: '有期 - 家庭物品管理',
          text: '管理您的家庭物品，设置过期提醒，让生活更有条理！',
          url: window.location.href
        });
      } catch (error) {
        console.log('Share cancelled or failed:', error);
      }
    } else {
      // 回退到复制链接
      navigator.clipboard.writeText(window.location.href)
        .then(() => {
          alert('链接已复制到剪贴板！');
        })
        .catch(() => {
          // 如果clipboard API不可用，使用传统方法
          const textArea = document.createElement('textarea');
          textArea.value = window.location.href;
          document.body.appendChild(textArea);
          textArea.select();
          document.execCommand('copy');
          document.body.removeChild(textArea);
          alert('链接已复制到剪贴板！');
        });
    }
  };

  // 关闭引导
  const handleClose = () => {
    setIsVisible(false);
    if (onClose) {
      onClose();
    }
    
    // 记住用户已关闭引导
    localStorage.setItem('ios_install_guide_dismissed', 'true');
  };

  // 检查用户是否已关闭过引导
  useEffect(() => {
    const dismissed = localStorage.getItem('ios_install_guide_dismissed');
    if (dismissed === 'true') {
      setIsVisible(false);
    }
  }, []);

  if (!isVisible || !isIOS || isStandalone) {
    return null;
  }

  return (
    <div className="ios-install-guide-overlay">
      <div className="ios-install-guide">
        <div className="ios-install-guide-header">
          <h3>📱 添加到主屏幕</h3>
          <button 
            className="ios-install-guide-close"
            onClick={handleClose}
            aria-label="关闭"
          >
            <X size={20} />
          </button>
        </div>

        <div className="ios-install-guide-content">
          <div className="ios-install-guide-icon">
            <Smartphone size={48} />
          </div>

          <p className="ios-install-guide-description">
            将"有期"添加到主屏幕，享受原生应用般的体验！
          </p>

          <div className="ios-install-guide-steps">
            <div className="ios-install-guide-step">
              <div className="ios-install-guide-step-number">1</div>
              <div className="ios-install-guide-step-content">
                <p>点击底部分享按钮</p>
                <div className="ios-install-guide-step-icon">
                  <Share2 size={24} />
                </div>
              </div>
            </div>

            <div className="ios-install-guide-step">
              <div className="ios-install-guide-step-number">2</div>
              <div className="ios-install-guide-step-content">
                <p>选择"添加到主屏幕"</p>
                <div className="ios-install-guide-step-icon">
                  <Plus size={24} />
                </div>
              </div>
            </div>

            <div className="ios-install-guide-step">
              <div className="ios-install-guide-step-number">3</div>
              <div className="ios-install-guide-step-content">
                <p>点击"添加"完成安装</p>
                <div className="ios-install-guide-step-icon">
                  <ArrowUp size={24} />
                </div>
              </div>
            </div>
          </div>

          <div className="ios-install-guide-benefits">
            <h4>安装后的优势：</h4>
            <ul>
              <li>✅ 离线访问已缓存的数据</li>
              <li>✅ 推送通知提醒</li>
              <li>✅ 原生应用般的体验</li>
              <li>✅ 快速启动和访问</li>
            </ul>
          </div>
        </div>

        <div className="ios-install-guide-actions">
          <button 
            className="ios-install-guide-share-btn"
            onClick={handleShare}
          >
            <Share2 size={16} />
            分享应用
          </button>
          
          <button 
            className="ios-install-guide-dismiss-btn"
            onClick={handleClose}
          >
            稍后再说
          </button>
        </div>

        <div className="ios-install-guide-footer">
          <p>💡 提示：安装后可以从主屏幕直接启动应用</p>
        </div>
      </div>
    </div>
  );
};

export default iOSInstallGuide; 