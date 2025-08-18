/**
 * 调试助手模块
 * 提供开发环境下的调试工具和功能
 */

// 环境检测
const isDevelopment = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';

// 调试配置
const DEBUG_CONFIG = {
  enabled: isDevelopment,
  logLevel: isDevelopment ? 'debug' : 'error',
  showTimestamps: isDevelopment,
  enablePerformanceMonitoring: isDevelopment,
  enableErrorTracking: true,
  maxLogEntries: 100
};

// 日志存储
let logEntries = [];
let performanceMarks = new Map();

/**
 * 调试日志类
 */
class DebugLogger {
  constructor() {
    this.logs = [];
    this.maxLogs = DEBUG_CONFIG.maxLogEntries;
  }

  /**
   * 添加日志条目
   */
  addLog(level, message, data = null, timestamp = Date.now()) {
    const logEntry = {
      level,
      message,
      data,
      timestamp,
      formattedTime: new Date(timestamp).toLocaleTimeString()
    };

    this.logs.push(logEntry);

    // 限制日志数量
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    // 在开发环境下输出到控制台
    if (DEBUG_CONFIG.enabled) {
      this.outputToConsole(logEntry);
    }
  }

  /**
   * 输出到控制台
   */
  outputToConsole(logEntry) {
    const { level, message, data, formattedTime } = logEntry;
    const prefix = DEBUG_CONFIG.showTimestamps ? `[${formattedTime}]` : '';
    
    switch (level) {
      case 'debug':
        console.log(`${prefix} 🔍 ${message}`, data || '');
        break;
      case 'info':
        console.info(`${prefix} ℹ️ ${message}`, data || '');
        break;
      case 'warn':
        console.warn(`${prefix} ⚠️ ${message}`, data || '');
        break;
      case 'error':
        console.error(`${prefix} ❌ ${message}`, data || '');
        break;
      default:
        console.log(`${prefix} ${message}`, data || '');
    }
  }

  /**
   * 获取所有日志
   */
  getLogs() {
    return [...this.logs];
  }

  /**
   * 清空日志
   */
  clearLogs() {
    this.logs = [];
  }

  /**
   * 导出日志
   */
  exportLogs() {
    return JSON.stringify(this.logs, null, 2);
  }
}

/**
 * 性能监控类
 */
class PerformanceMonitor {
  constructor() {
    this.marks = new Map();
    this.measures = new Map();
  }

  /**
   * 标记开始时间
   */
  mark(name) {
    if (!DEBUG_CONFIG.enablePerformanceMonitoring) return;
    
    this.marks.set(name, performance.now());
    if (window.performance && window.performance.mark) {
      window.performance.mark(name);
    }
  }

  /**
   * 标记结束时间并计算耗时
   */
  measure(name, startMark, endMark) {
    if (!DEBUG_CONFIG.enablePerformanceMonitoring) return;
    
    const start = this.marks.get(startMark);
    const end = this.marks.get(endMark);
    
    if (start && end) {
      const duration = end - start;
      this.measures.set(name, duration);
      
      if (window.performance && window.performance.measure) {
        window.performance.measure(name, startMark, endMark);
      }
      
      // 输出性能信息
      if (DEBUG_CONFIG.enabled) {
        console.log(`⚡ 性能监控: ${name} 耗时 ${duration.toFixed(2)}ms`);
      }
      
      return duration;
    }
    
    return null;
  }

  /**
   * 获取性能指标
   */
  getMeasures() {
    return Object.fromEntries(this.measures);
  }

  /**
   * 清空性能指标
   */
  clearMeasures() {
    this.marks.clear();
    this.measures.clear();
  }
}

/**
 * 错误追踪类
 */
class ErrorTracker {
  constructor() {
    this.errors = [];
    this.maxErrors = 50;
    this.setupGlobalErrorHandling();
  }

  /**
   * 设置全局错误处理
   */
  setupGlobalErrorHandling() {
    if (!DEBUG_CONFIG.enableErrorTracking) return;

    // 捕获未处理的Promise错误
    window.addEventListener('unhandledrejection', (event) => {
      this.trackError('Unhandled Promise Rejection', event.reason);
    });

    // 捕获全局错误
    window.addEventListener('error', (event) => {
      this.trackError('Global Error', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error
      });
    });
  }

  /**
   * 追踪错误
   */
  trackError(type, error) {
    const errorEntry = {
      type,
      error: error instanceof Error ? {
        name: error.name,
        message: error.message,
        stack: error.stack
      } : error,
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent
    };

    this.errors.push(errorEntry);

    // 限制错误数量
    if (this.errors.length > this.maxErrors) {
      this.errors.shift();
    }

    // 在开发环境下输出到控制台
    if (DEBUG_CONFIG.enabled) {
      console.error(`🚨 错误追踪: ${type}`, errorEntry);
    }
  }

  /**
   * 获取所有错误
   */
  getErrors() {
    return [...this.errors];
  }

  /**
   * 清空错误记录
   */
  clearErrors() {
    this.errors = [];
  }
}

/**
 * 调试工具类
 */
class DebugTools {
  constructor() {
    this.logger = new DebugLogger();
    this.performanceMonitor = new PerformanceMonitor();
    this.errorTracker = new ErrorTracker();
    
    // 在开发环境下暴露到全局
    if (DEBUG_CONFIG.enabled) {
      this.exposeToGlobal();
    }
  }

  /**
   * 暴露到全局对象
   */
  exposeToGlobal() {
    if (typeof window !== 'undefined') {
      window.__DEBUG__ = {
        logger: this.logger,
        performance: this.performanceMonitor,
        errors: this.errorTracker,
        config: DEBUG_CONFIG,
        utils: {
          isDevelopment,
          isProduction,
          getLogs: () => this.logger.getLogs(),
          getPerformance: () => this.performanceMonitor.getMeasures(),
          getErrors: () => this.errorTracker.getErrors(),
          clearAll: () => {
            this.logger.clearLogs();
            this.performanceMonitor.clearMeasures();
            this.errorTracker.clearErrors();
          }
        }
      };
    }
  }

  /**
   * 调试日志方法
   */
  log(message, data) {
    this.logger.addLog('debug', message, data);
  }

  info(message, data) {
    this.logger.addLog('info', message, data);
  }

  warn(message, data) {
    this.logger.addLog('warn', message, data);
  }

  error(message, data) {
    this.logger.addLog('error', message, data);
  }

  /**
   * 性能监控方法
   */
  mark(name) {
    this.performanceMonitor.mark(name);
  }

  measure(name, startMark, endMark) {
    return this.performanceMonitor.measure(name, startMark, endMark);
  }

  /**
   * 错误追踪方法
   */
  trackError(type, error) {
    this.errorTracker.trackError(type, error);
  }

  /**
   * 获取调试信息
   */
  getDebugInfo() {
    return {
      environment: {
        isDevelopment,
        isProduction,
        nodeEnv: process.env.NODE_ENV
      },
      config: DEBUG_CONFIG,
      logs: this.logger.getLogs(),
      performance: this.performanceMonitor.getMeasures(),
      errors: this.errorTracker.getErrors()
    };
  }

  /**
   * 导出调试数据
   */
  exportDebugData() {
    return {
      timestamp: new Date().toISOString(),
      ...this.getDebugInfo()
    };
  }
}

// 创建调试工具实例
const debugTools = new DebugTools();

// 导出调试工具
export default debugTools;

// 导出便捷方法
export const {
  log,
  info,
  warn,
  error,
  mark,
  measure,
  trackError,
  getDebugInfo,
  exportDebugData
} = debugTools;

// 在开发环境下输出初始化信息
if (DEBUG_CONFIG.enabled) {
  console.log('🔧 调试助手已初始化', {
    environment: process.env.NODE_ENV,
    config: DEBUG_CONFIG
  });
  
  // 输出使用说明
  console.log('💡 调试工具使用说明:', {
    'window.__DEBUG__.log()': '查看所有日志',
    'window.__DEBUG__.performance': '查看性能指标',
    'window.__DEBUG__.errors': '查看错误记录',
    'window.__DEBUG__.utils.clearAll()': '清空所有调试数据'
  });
} 