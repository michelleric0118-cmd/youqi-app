// 网络配置检查工具
// 用于检测百度OCR服务的网络连接状态

// 检查域名解析
export const checkDomainResolution = async (domain = 'aip.baidubce.com') => {
  try {
    // 使用fetch检查域名是否可访问
    const response = await fetch(`https://${domain}`, {
      method: 'HEAD',
      mode: 'no-cors', // 避免CORS问题
      cache: 'no-cache'
    });
    return {
      success: true,
      message: `域名 ${domain} 解析正常`
    };
  } catch (error) {
    return {
      success: false,
      message: `域名 ${domain} 解析失败: ${error.message}`
    };
  }
};

// 检查HTTPS连接
export const checkHTTPSConnection = async (domain = 'aip.baidubce.com') => {
  try {
    const startTime = Date.now();
    const response = await fetch(`https://${domain}`, {
      method: 'HEAD',
      mode: 'no-cors',
      cache: 'no-cache'
    });
    const endTime = Date.now();
    const latency = endTime - startTime;
    
    return {
      success: true,
      message: `HTTPS连接正常，延迟: ${latency}ms`,
      latency
    };
  } catch (error) {
    return {
      success: false,
      message: `HTTPS连接失败: ${error.message}`
    };
  }
};

// 检查端口连通性（通过代理检测）
export const checkPortConnectivity = async (domain = 'aip.baidubce.com', port = 443) => {
  try {
    // 使用Image对象检测端口连通性
    return new Promise((resolve) => {
      const img = new Image();
      const startTime = Date.now();
      
      img.onload = () => {
        const endTime = Date.now();
        const latency = endTime - startTime;
        resolve({
          success: true,
          message: `端口 ${port} 连通正常，延迟: ${latency}ms`,
          latency
        });
      };
      
      img.onerror = () => {
        resolve({
          success: false,
          message: `端口 ${port} 连通失败`
        });
      };
      
      // 设置超时
      setTimeout(() => {
        resolve({
          success: false,
          message: `端口 ${port} 连接超时`
        });
      }, 5000);
      
      img.src = `https://${domain}:${port}/favicon.ico?t=${Date.now()}`;
    });
  } catch (error) {
    return {
      success: false,
      message: `端口检测失败: ${error.message}`
    };
  }
};

// 综合网络检查
export const performNetworkCheck = async () => {
  const results = {
    domainResolution: null,
    httpsConnection: null,
    portConnectivity: null,
    overallStatus: 'checking'
  };

  try {
    // 检查域名解析
    results.domainResolution = await checkDomainResolution();
    
    // 检查HTTPS连接
    results.httpsConnection = await checkHTTPSConnection();
    
    // 检查端口连通性
    results.portConnectivity = await checkPortConnectivity();
    
    // 判断整体状态
    const allChecksPassed = results.domainResolution.success && 
                           results.httpsConnection.success && 
                           results.portConnectivity.success;
    
    results.overallStatus = allChecksPassed ? 'success' : 'failed';
    
    return results;
  } catch (error) {
    results.overallStatus = 'error';
    results.error = error.message;
    return results;
  }
};

// 生成网络配置建议
export const generateNetworkRecommendations = (checkResults) => {
  const recommendations = [];
  
  if (!checkResults.domainResolution?.success) {
    recommendations.push({
      type: 'error',
      title: '域名解析失败',
      description: '无法解析 aip.baidubce.com 域名',
      solutions: [
        '检查DNS设置是否正确',
        '确认网络连接正常',
        '尝试使用其他DNS服务器（如8.8.8.8）'
      ]
    });
  }
  
  if (!checkResults.httpsConnection?.success) {
    recommendations.push({
      type: 'error',
      title: 'HTTPS连接失败',
      description: '无法建立到百度AI服务的HTTPS连接',
      solutions: [
        '检查防火墙设置，确保443端口已开放',
        '确认网络代理配置正确',
        '检查企业网络白名单设置'
      ]
    });
  }
  
  if (!checkResults.portConnectivity?.success) {
    recommendations.push({
      type: 'warning',
      title: '端口连通性异常',
      description: '443端口连接可能存在问题',
      solutions: [
        '联系网络管理员检查防火墙规则',
        '确认企业网络允许访问外部HTTPS服务',
        '检查是否有网络代理或VPN影响'
      ]
    });
  }
  
  if (checkResults.overallStatus === 'success') {
    recommendations.push({
      type: 'success',
      title: '网络配置正常',
      description: '所有网络检查都通过，OCR服务应该可以正常使用',
      solutions: [
        '可以正常使用OCR功能',
        '如果仍有问题，请检查API密钥配置'
      ]
    });
  }
  
  return recommendations;
};

// 检查本地开发环境
export const checkLocalEnvironment = () => {
  const checks = {
    isLocalhost: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1',
    isHTTPS: window.location.protocol === 'https:',
    userAgent: navigator.userAgent,
    platform: navigator.platform
  };
  
  return {
    ...checks,
    recommendations: [
      checks.isLocalhost ? '本地开发环境，需要在百度AI控制台添加localhost域名' : '生产环境，需要添加实际域名',
      checks.isHTTPS ? 'HTTPS环境，摄像头权限正常' : 'HTTP环境，摄像头权限可能受限',
      '建议在Chrome或Safari浏览器中测试OCR功能'
    ]
  };
}; 