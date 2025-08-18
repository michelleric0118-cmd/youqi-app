/**
 * 状态指示器移除工具
 * 用于隐藏页面右上角无用的状态指示器按钮
 */

class StatusIndicatorRemover {
  constructor() {
    this.isActive = false;
    this.observer = null;
    this.interval = null;
    this.hiddenElements = new Set();
  }

  /**
   * 启动状态指示器移除
   */
  start() {
    if (this.isActive) return;
    
    this.isActive = true;
    console.log('状态指示器移除工具已启动');
    
    // 立即执行一次
    this.hideStatusIndicators();
    
    // 设置定时器，持续监控
    this.interval = setInterval(() => {
      this.hideStatusIndicators();
    }, 1000);
    
    // 监听DOM变化
    this.observer = new MutationObserver(() => {
      this.hideStatusIndicators();
    });
    
    this.observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['style', 'class']
    });
  }

  /**
   * 停止状态指示器移除
   */
  stop() {
    if (!this.isActive) return;
    
    this.isActive = false;
    console.log('状态指示器移除工具已停止');
    
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
    
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
  }

  /**
   * 隐藏状态指示器
   */
  hideStatusIndicators() {
    // 隐藏包含特定文字的状态按钮
    this.hideTextBasedIndicators();
    
    // 隐藏可能的状态指示器类名
    this.hideClassBasedIndicators();
    
    // 隐藏固定在右上角的元素
    this.hideFixedTopRightElements();
  }

  /**
   * 隐藏基于文字的状态指示器
   */
  hideTextBasedIndicators() {
    const textSelectors = ['成功', '错误', '警告', '信息', '过期提醒'];
    
    textSelectors.forEach(text => {
      const elements = Array.from(document.querySelectorAll('*')).filter(el => 
        el.textContent && 
        el.textContent.includes(text) && 
        (el.tagName === 'BUTTON' || el.tagName === 'DIV') &&
        this.isFixedElement(el)
      );
      
      elements.forEach(el => {
        if (!this.hiddenElements.has(el)) {
          el.style.display = 'none';
          this.hiddenElements.add(el);
          console.log(`已隐藏文字状态指示器: ${text}`);
        }
      });
    });
  }

  /**
   * 隐藏基于类名的状态指示器
   */
  hideClassBasedIndicators() {
    const statusClasses = [
      'status-indicator', 'statusIndicator', 'status-indicators', 'statusIndicators',
      'status-btn', 'statusButton', 'status-buttons', 'statusButtons',
      'status-panel', 'statusPanel', 'status-bar', 'statusBar'
    ];
    
    statusClasses.forEach(className => {
      const elements = document.querySelectorAll(`.${className}`);
      elements.forEach(el => {
        if (!this.hiddenElements.has(el)) {
          el.style.display = 'none';
          this.hiddenElements.add(el);
          console.log(`已隐藏类名状态指示器: ${className}`);
        }
      });
    });
  }

  /**
   * 隐藏固定在右上角的元素
   */
  hideFixedTopRightElements() {
    const allElements = document.querySelectorAll('*');
    
    allElements.forEach(el => {
      if (this.hiddenElements.has(el)) return;
      
      const style = window.getComputedStyle(el);
      if (this.isFixedTopRight(style)) {
        el.style.display = 'none';
        this.hiddenElements.add(el);
        console.log('已隐藏固定在右上角的元素');
      }
    });
  }

  /**
   * 检查元素是否为固定定位
   */
  isFixedElement(element) {
    const style = window.getComputedStyle(element);
    return style.position === 'fixed';
  }

  /**
   * 检查样式是否为固定在右上角
   */
  isFixedTopRight(style) {
    if (style.position !== 'fixed') return false;
    
    const top = parseInt(style.top);
    const right = parseInt(style.right);
    
    // 检查是否在右上角区域
    return (top >= 0 && top <= 50) && (right >= 0 && right <= 50);
  }

  /**
   * 恢复所有隐藏的元素
   */
  restoreHiddenElements() {
    this.hiddenElements.forEach(el => {
      if (el && el.style) {
        el.style.display = '';
      }
    });
    
    this.hiddenElements.clear();
    console.log('已恢复所有隐藏的状态指示器');
  }

  /**
   * 获取隐藏的元素数量
   */
  getHiddenCount() {
    return this.hiddenElements.size;
  }

  /**
   * 获取隐藏的元素信息
   */
  getHiddenElementsInfo() {
    return Array.from(this.hiddenElements).map(el => ({
      tagName: el.tagName,
      className: el.className,
      textContent: el.textContent?.substring(0, 50),
      position: window.getComputedStyle(el).position
    }));
  }
}

// 创建单例实例
const statusIndicatorRemover = new StatusIndicatorRemover();

// 自动启动（仅在开发环境下）
if (process.env.NODE_ENV === 'development') {
  // 延迟启动，确保DOM已加载
  setTimeout(() => {
    statusIndicatorRemover.start();
  }, 1000);
}

export default statusIndicatorRemover; 