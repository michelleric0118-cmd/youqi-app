import React, { useState, useEffect } from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import themeManager from '../utils/themeManager';
import './ThemeToggle.css';

const ThemeToggle = ({ className = '' }) => {
  const [currentTheme, setCurrentTheme] = useState(themeManager.getCurrentTheme());
  const [isDark, setIsDark] = useState(themeManager.isDarkMode());

  useEffect(() => {
    // 监听主题变化
    const removeListener = themeManager.addThemeChangeListener((event) => {
      setCurrentTheme(event.detail.theme);
      setIsDark(event.detail.isDark);
    });

    // 初始化状态
    setCurrentTheme(themeManager.getCurrentTheme());
    setIsDark(themeManager.isDarkMode());

    return removeListener;
  }, []);

  const handleThemeChange = (themeName) => {
    themeManager.setTheme(themeName);
  };

  const getThemeIcon = (themeName) => {
    switch (themeName) {
      case 'light':
        return <Sun size={16} />;
      case 'dark':
        return <Moon size={16} />;
      case 'auto':
        return <Monitor size={16} />;
      default:
        return <Sun size={16} />;
    }
  };

  const getThemeLabel = (themeName) => {
    switch (themeName) {
      case 'light':
        return '浅色';
      case 'dark':
        return '深色';
      case 'auto':
        return '自动';
      default:
        return '浅色';
    }
  };

  return (
    <div className={`theme-toggle ${className}`}>
      <div className="theme-toggle-container">
        <button
          className={`theme-btn ${currentTheme === 'light' ? 'active' : ''}`}
          onClick={() => handleThemeChange('light')}
          title="浅色模式"
          aria-label="切换到浅色模式"
        >
          <Sun size={16} />
          <span>浅色</span>
        </button>
        
        <button
          className={`theme-btn ${currentTheme === 'dark' ? 'active' : ''}`}
          onClick={() => handleThemeChange('dark')}
          title="深色模式"
          aria-label="切换到深色模式"
        >
          <Moon size={16} />
          <span>深色</span>
        </button>
        
        <button
          className={`theme-btn ${currentTheme === 'auto' ? 'active' : ''}`}
          onClick={() => handleThemeChange('auto')}
          title="跟随系统"
          aria-label="跟随系统主题"
        >
          <Monitor size={16} />
          <span>自动</span>
        </button>
      </div>
      
      <div className="theme-indicator">
        <span className="theme-label">主题:</span>
        <span className="theme-value">
          {getThemeIcon(currentTheme)}
          {getThemeLabel(currentTheme)}
        </span>
      </div>
    </div>
  );
};

export default ThemeToggle; 