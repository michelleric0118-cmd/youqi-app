import React, { useState, useEffect } from 'react';
import { Globe, Check } from 'lucide-react';
import i18n from '../utils/i18n';
import './LanguageSettings.css';

const LanguageSettings = ({ onClose }) => {
  const [currentLocale, setCurrentLocale] = useState(i18n.getCurrentLocale());
  const [isChanging, setIsChanging] = useState(false);

  const supportedLocales = i18n.getSupportedLocales();

  const handleLanguageChange = async (locale) => {
    setIsChanging(true);
    
    try {
      const success = i18n.setLocale(locale);
      if (success) {
        setCurrentLocale(locale);
        // 重新加载页面以应用语言变化
        setTimeout(() => {
          window.location.reload();
        }, 500);
      }
    } catch (error) {
      console.error('语言切换失败:', error);
    } finally {
      setIsChanging(false);
    }
  };

  return (
    <div className="language-settings-overlay">
      <div className="language-settings-modal">
        <div className="language-settings-header">
          <div className="header-content">
            <Globe size={24} />
            <h3>语言设置</h3>
          </div>
          <button className="close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="language-settings-content">
          <p className="language-description">
            选择您偏好的语言，更改将立即生效
          </p>

          <div className="language-options">
            {supportedLocales.map((locale) => (
              <div
                key={locale.code}
                className={`language-option ${currentLocale === locale.code ? 'selected' : ''}`}
                onClick={() => handleLanguageChange(locale.code)}
              >
                <div className="language-info">
                  <div className="language-name">{locale.nativeName}</div>
                  <div className="language-subtitle">{locale.name}</div>
                </div>
                
                {currentLocale === locale.code && (
                  <div className="selected-indicator">
                    <Check size={20} />
                  </div>
                )}
                
                {isChanging && currentLocale === locale.code && (
                  <div className="changing-indicator">
                    <div className="loading-spinner"></div>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="language-note">
            <p>
              💡 提示：语言设置会保存到本地，下次访问时会自动应用
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LanguageSettings; 