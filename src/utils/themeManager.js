class ThemeManager {
  constructor() {
    this.themeKey = 'youqi-theme';
    this.themes = {
      light: {
        name: 'light',
        label: '浅色模式',
        colors: {
          primary: '#2563eb',
          secondary: '#64748b',
          background: '#ffffff',
          surface: '#f8fafc',
          text: '#1f2937',
          textSecondary: '#6b7280',
          border: '#e5e7eb',
          success: '#10b981',
          warning: '#f59e0b',
          error: '#ef4444',
          info: '#3b82f6'
        }
      },
      dark: {
        name: 'dark',
        label: '深色模式',
        colors: {
          primary: '#3b82f6',
          secondary: '#94a3b8',
          background: '#0f172a',
          surface: '#1e293b',
          text: '#f1f5f9',
          textSecondary: '#cbd5e1',
          border: '#334155',
          success: '#22c55e',
          warning: '#fbbf24',
          error: '#f87171',
          info: '#60a5fa'
        }
      },
      auto: {
        name: 'auto',
        label: '跟随系统',
        colors: null // 动态获取
      }
    };
    
    this.currentTheme = this.getStoredTheme();
    this.init();
  }

  // 初始化主题
  init() {
    this.applyTheme(this.currentTheme);
    this.setupSystemThemeListener();
  }

  // 获取存储的主题
  getStoredTheme() {
    try {
      const stored = localStorage.getItem(this.themeKey);
      return stored && this.themes[stored] ? stored : 'auto';
    } catch (error) {
      return 'auto';
    }
  }

  // 保存主题设置
  saveTheme(themeName) {
    try {
      localStorage.setItem(this.themeKey, themeName);
    } catch (error) {
      console.error('保存主题设置失败:', error);
    }
  }

  // 获取当前主题
  getCurrentTheme() {
    return this.currentTheme;
  }

  // 获取主题配置
  getThemeConfig(themeName = this.currentTheme) {
    const theme = this.themes[themeName];
    if (!theme) return this.themes.light;

    if (themeName === 'auto') {
      return this.getSystemTheme();
    }

    return theme;
  }

  // 获取系统主题
  getSystemTheme() {
    if (typeof window === 'undefined') return this.themes.light;
    
    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    return isDark ? this.themes.dark : this.themes.light;
  }

  // 应用主题
  applyTheme(themeName) {
    this.currentTheme = themeName;
    this.saveTheme(themeName);
    
    const themeConfig = this.getThemeConfig(themeName);
    this.applyCSSVariables(themeConfig.colors);
    this.updateMetaThemeColor(themeConfig.colors);
    
    // 触发主题变化事件
    this.dispatchThemeChangeEvent(themeName, themeConfig);
  }

  // 应用CSS变量
  applyCSSVariables(colors) {
    if (!colors) return;
    
    const root = document.documentElement;
    Object.entries(colors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value);
    });
  }

  // 更新meta主题色
  updateMetaThemeColor(colors) {
    if (!colors) return;
    
    let metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (!metaThemeColor) {
      metaThemeColor = document.createElement('meta');
      metaThemeColor.name = 'theme-color';
      document.head.appendChild(metaThemeColor);
    }
    
    metaThemeColor.content = colors.background;
  }

  // 设置系统主题监听器
  setupSystemThemeListener() {
    if (typeof window === 'undefined') return;
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', (e) => {
      if (this.currentTheme === 'auto') {
        this.applyTheme('auto');
      }
    });
  }

  // 切换主题
  toggleTheme() {
    const themeNames = Object.keys(this.themes);
    const currentIndex = themeNames.indexOf(this.currentTheme);
    const nextIndex = (currentIndex + 1) % themeNames.length;
    const nextTheme = themeNames[nextIndex];
    
    this.applyTheme(nextTheme);
    return nextTheme;
  }

  // 设置特定主题
  setTheme(themeName) {
    if (this.themes[themeName]) {
      this.applyTheme(themeName);
      return true;
    }
    return false;
  }

  // 获取所有可用主题
  getAvailableThemes() {
    return Object.values(this.themes).map(theme => ({
      name: theme.name,
      label: theme.label
    }));
  }

  // 获取主题颜色
  getThemeColor(colorName) {
    const themeConfig = this.getThemeConfig();
    return themeConfig.colors?.[colorName] || '#000000';
  }

  // 检查是否为深色模式
  isDarkMode() {
    const themeConfig = this.getThemeConfig();
    return themeConfig.name === 'dark';
  }

  // 检查是否为浅色模式
  isLightMode() {
    const themeConfig = this.getThemeConfig();
    return themeConfig.name === 'light';
  }

  // 检查是否为自动模式
  isAutoMode() {
    return this.currentTheme === 'auto';
  }

  // 获取当前实际主题（自动模式下返回系统主题）
  getActualTheme() {
    if (this.currentTheme === 'auto') {
      return this.getSystemTheme().name;
    }
    return this.currentTheme;
  }

  // 触发主题变化事件
  dispatchThemeChangeEvent(themeName, themeConfig) {
    if (typeof window === 'undefined') return;
    
    const event = new CustomEvent('themechange', {
      detail: {
        theme: themeName,
        config: themeConfig,
        isDark: this.isDarkMode()
      }
    });
    
    window.dispatchEvent(event);
  }

  // 添加主题变化监听器
  addThemeChangeListener(callback) {
    if (typeof window === 'undefined') return;
    
    window.addEventListener('themechange', callback);
    
    // 返回移除监听器的函数
    return () => {
      window.removeEventListener('themechange', callback);
    };
  }

  // 获取主题CSS类名
  getThemeClassName() {
    const actualTheme = this.getActualTheme();
    return `theme-${actualTheme}`;
  }

  // 应用主题类名到body
  applyThemeClass() {
    if (typeof document === 'undefined') return;
    
    const body = document.body;
    const themeClass = this.getThemeClassName();
    
    // 移除所有主题类
    body.classList.remove('theme-light', 'theme-dark');
    
    // 添加当前主题类
    body.classList.add(themeClass);
  }
}

// 创建单例实例
const themeManager = new ThemeManager();

export default themeManager; 