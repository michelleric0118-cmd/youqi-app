import i18n from './i18n';

// 错误类型枚举
export const ErrorTypes = {
  NETWORK: 'NETWORK',
  AUTH: 'AUTH',
  VALIDATION: 'VALIDATION',
  SERVER: 'SERVER',
  CLIENT: 'CLIENT',
  UNKNOWN: 'UNKNOWN'
};

// 错误消息配置
const errorMessages = {
  [ErrorTypes.NETWORK]: {
    title: i18n.t('networkErrorTitle'),
    message: i18n.t('networkErrorMessage'),
    action: i18n.t('retryAction')
  },
  [ErrorTypes.AUTH]: {
    title: i18n.t('authErrorTitle'),
    message: i18n.t('authErrorMessage'),
    action: i18n.t('loginAction')
  },
  [ErrorTypes.VALIDATION]: {
    title: i18n.t('validationErrorTitle'),
    message: i18n.t('validationErrorMessage'),
    action: i18n.t('checkAction')
  },
  [ErrorTypes.SERVER]: {
    title: i18n.t('serverErrorTitle'),
    message: i18n.t('serverErrorMessage'),
    action: i18n.t('contactSupportAction')
  },
  [ErrorTypes.CLIENT]: {
    title: i18n.t('clientErrorTitle'),
    message: i18n.t('clientErrorMessage'),
    action: i18n.t('refreshAction')
  },
  [ErrorTypes.UNKNOWN]: {
    title: i18n.t('unknownErrorTitle'),
    message: i18n.t('unknownErrorMessage'),
    action: i18n.t('tryAgainAction')
  }
};

// 错误处理类
class ErrorHandler {
  constructor() {
    this.listeners = [];
  }

  // 添加错误监听器
  addListener(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  // 处理错误
  handleError(error, type = ErrorTypes.UNKNOWN) {
    console.error('Error occurred:', error);

    // 获取错误信息
    const errorInfo = this.getErrorInfo(error, type);

    // 通知所有监听器
    this.notifyListeners(errorInfo);

    // 根据错误类型执行特定操作
    this.executeErrorAction(errorInfo);

    return errorInfo;
  }

  // 获取错误信息
  getErrorInfo(error, type) {
    const errorConfig = errorMessages[type] || errorMessages[ErrorTypes.UNKNOWN];
    
    return {
      type,
      title: errorConfig.title,
      message: error.message || errorConfig.message,
      action: errorConfig.action,
      timestamp: new Date().toISOString(),
      details: error.stack,
      originalError: error
    };
  }

  // 通知所有监听器
  notifyListeners(errorInfo) {
    this.listeners.forEach(listener => {
      try {
        listener(errorInfo);
      } catch (err) {
        console.error('Error in error listener:', err);
      }
    });
  }

  // 执行错误相关操作
  executeErrorAction(errorInfo) {
    switch (errorInfo.type) {
      case ErrorTypes.NETWORK:
        // 网络错误处理
        this.handleNetworkError(errorInfo);
        break;
      case ErrorTypes.AUTH:
        // 认证错误处理
        this.handleAuthError(errorInfo);
        break;
      case ErrorTypes.VALIDATION:
        // 验证错误处理
        this.handleValidationError(errorInfo);
        break;
      case ErrorTypes.SERVER:
        // 服务器错误处理
        this.handleServerError(errorInfo);
        break;
      case ErrorTypes.CLIENT:
        // 客户端错误处理
        this.handleClientError(errorInfo);
        break;
      default:
        // 未知错误处理
        this.handleUnknownError(errorInfo);
    }
  }

  // 处理网络错误
  handleNetworkError(errorInfo) {
    // 检查网络连接
    if (!navigator.onLine) {
      // 添加网络恢复监听器
      window.addEventListener('online', () => {
        // 网络恢复时重试失败的请求
        this.retryFailedRequests();
      });
    }
  }

  // 处理认证错误
  handleAuthError(errorInfo) {
    // 清除认证信息
    localStorage.removeItem('user-token');
    // 重定向到登录页
    window.location.href = '/login';
  }

  // 处理验证错误
  handleValidationError(errorInfo) {
    // 记录验证错误
    console.warn('Validation error:', errorInfo.message);
  }

  // 处理服务器错误
  handleServerError(errorInfo) {
    // 记录服务器错误
    console.error('Server error:', errorInfo);
  }

  // 处理客户端错误
  handleClientError(errorInfo) {
    // 记录客户端错误
    console.error('Client error:', errorInfo);
  }

  // 处理未知错误
  handleUnknownError(errorInfo) {
    // 记录未知错误
    console.error('Unknown error:', errorInfo);
  }

  // 重试失败的请求
  retryFailedRequests() {
    // 实现请求重试逻辑
  }
}

// 创建单例实例
const errorHandler = new ErrorHandler();

export default errorHandler;