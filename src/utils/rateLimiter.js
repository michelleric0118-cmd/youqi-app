class RateLimiter {
  constructor(maxRequests = 100, timeWindow = 60000) {
    this.maxRequests = maxRequests;      // 最大请求数
    this.timeWindow = timeWindow;        // 时间窗口（毫秒）
    this.requests = new Map();           // 请求记录
    this.blacklist = new Set();          // IP黑名单
    this.blacklistTimeout = 3600000;     // 黑名单超时时间（1小时）
  }

  // 检查请求是否允许
  isAllowed(clientId) {
    // 如果在黑名单中，直接拒绝
    if (this.blacklist.has(clientId)) {
      return false;
    }

    const now = Date.now();
    const clientRequests = this.requests.get(clientId) || [];

    // 清理过期的请求记录
    const validRequests = clientRequests.filter(
      timestamp => now - timestamp < this.timeWindow
    );

    // 如果请求次数超过限制，加入黑名单
    if (validRequests.length >= this.maxRequests) {
      this.addToBlacklist(clientId);
      return false;
    }

    // 记录新的请求
    validRequests.push(now);
    this.requests.set(clientId, validRequests);

    return true;
  }

  // 将客户端加入黑名单
  addToBlacklist(clientId) {
    this.blacklist.add(clientId);
    
    // 设置自动从黑名单移除的定时器
    setTimeout(() => {
      this.blacklist.delete(clientId);
    }, this.blacklistTimeout);
  }

  // 清理过期的请求记录
  cleanup() {
    const now = Date.now();
    
    for (const [clientId, requests] of this.requests.entries()) {
      const validRequests = requests.filter(
        timestamp => now - timestamp < this.timeWindow
      );

      if (validRequests.length === 0) {
        this.requests.delete(clientId);
      } else {
        this.requests.set(clientId, validRequests);
      }
    }
  }

  // 重置客户端的请求记录
  reset(clientId) {
    this.requests.delete(clientId);
    this.blacklist.delete(clientId);
  }

  // 获取客户端的剩余请求配额
  getRemainingQuota(clientId) {
    const clientRequests = this.requests.get(clientId) || [];
    const now = Date.now();
    
    const validRequests = clientRequests.filter(
      timestamp => now - timestamp < this.timeWindow
    );

    return Math.max(0, this.maxRequests - validRequests.length);
  }
}

// 创建默认实例
const defaultLimiter = new RateLimiter();

// 创建API请求限制器（更严格的限制）
const apiLimiter = new RateLimiter(50, 60000);

// 创建登录请求限制器（防止暴力破解）
const loginLimiter = new RateLimiter(5, 300000);

export {
  defaultLimiter,
  apiLimiter,
  loginLimiter,
  RateLimiter
};