import React, { useState } from 'react';
import { checkOCRConfig, recognizeText, parseProductInfo } from '../services/baiduOCRService';
import { performNetworkCheck, generateNetworkRecommendations, checkLocalEnvironment } from '../utils/networkCheck';
import './OCRTest.css';

const OCRTest = () => {
  const [testResult, setTestResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [configStatus, setConfigStatus] = useState(null);
  const [networkStatus, setNetworkStatus] = useState(null);
  const [environmentInfo, setEnvironmentInfo] = useState(null);

  // 检查OCR配置
  const checkConfig = () => {
    const status = checkOCRConfig();
    setConfigStatus(status);
    setTestResult(`配置检查结果：
- 配置完成: ${status.isConfigured ? '✅ 是' : '❌ 否'}
- 令牌有效: ${status.hasToken ? '✅ 是' : '❌ 否'}
    `);
  };

  // 检查网络连接
  const checkNetwork = async () => {
    setLoading(true);
    setTestResult('正在检查网络连接...');
    
    try {
      const networkResults = await performNetworkCheck();
      setNetworkStatus(networkResults);
      
      const recommendations = generateNetworkRecommendations(networkResults);
      const envInfo = checkLocalEnvironment();
      setEnvironmentInfo(envInfo);
      
      let resultText = `网络检查结果：
- 域名解析: ${networkResults.domainResolution?.success ? '✅ 正常' : '❌ 失败'}
- HTTPS连接: ${networkResults.httpsConnection?.success ? '✅ 正常' : '❌ 失败'}
- 端口连通: ${networkResults.portConnectivity?.success ? '✅ 正常' : '❌ 失败'}
- 整体状态: ${networkResults.overallStatus === 'success' ? '✅ 正常' : '❌ 异常'}

环境信息：
- 本地环境: ${envInfo.isLocalhost ? '✅ 是' : '❌ 否'}
- HTTPS协议: ${envInfo.isHTTPS ? '✅ 是' : '❌ 否'}
- 浏览器: ${envInfo.userAgent.includes('Chrome') ? 'Chrome' : envInfo.userAgent.includes('Safari') ? 'Safari' : '其他'}

配置建议：`;

      recommendations.forEach(rec => {
        resultText += `\n\n${rec.type === 'success' ? '✅' : rec.type === 'error' ? '❌' : '⚠️'} ${rec.title}
${rec.description}
解决方案：
${rec.solutions.map(s => `- ${s}`).join('\n')}`;
      });
      
      setTestResult(resultText);
    } catch (error) {
      setTestResult(`网络检查失败: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // 测试OCR识别
  const testOCR = async () => {
    setLoading(true);
    setTestResult('正在测试OCR识别...');
    
    try {
      // 使用一个简单的测试图片（base64格式）
      const testImage = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=';
      
      const imageData = testImage.split(',')[1];
      const ocrResults = await recognizeText(imageData);
      
      if (ocrResults && ocrResults.length > 0) {
        const productInfo = parseProductInfo(ocrResults);
        setTestResult(`OCR识别成功！🎉

识别结果：
${ocrResults.map(item => `- ${item.words}`).join('\n')}

解析的商品信息：
- 名称: ${productInfo.name || '未识别'}
- 品牌: ${productInfo.brand || '未识别'}
- 生产日期: ${productInfo.productionDate || '未识别'}
- 过期日期: ${productInfo.expiryDate || '未识别'}
- 备注: ${productInfo.notes || '无'}

配置信息：
- App ID: 7008056
- API Key: eIKgfcznPiVt64bIlQfmroDQ
- 服务状态: 正常`);
      } else {
        setTestResult('OCR识别成功，但未识别到文字内容。');
      }
    } catch (error) {
      console.error('OCR测试失败:', error);
      setTestResult(`OCR测试失败 ❌

错误信息: ${error.message}

可能的原因：
1. 网络连接问题
2. API密钥配置错误
3. 安全域名未配置
4. 免费额度已用完

请检查：
- 网络连接是否正常
- 百度AI控制台中的安全域名设置
- API密钥是否正确配置`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ocr-test-container">
      <div className="ocr-test-header">
        <h2>百度OCR功能测试</h2>
        <p>测试OCR识别功能是否正常工作</p>
      </div>

      <div className="ocr-test-content">
        <div className="test-buttons">
          <button onClick={checkConfig} className="test-btn config-btn">
            检查配置
          </button>
          <button onClick={checkNetwork} className="test-btn network-btn">
            检查网络
          </button>
          <button 
            onClick={testOCR} 
            disabled={loading}
            className="test-btn ocr-btn"
          >
            {loading ? '测试中...' : '测试OCR识别'}
          </button>
        </div>

        <div className="test-result">
          <h3>测试结果</h3>
          <div className="result-content">
            {testResult ? (
              <pre>{testResult}</pre>
            ) : (
              <p>点击上方按钮开始测试</p>
            )}
          </div>
        </div>

        <div className="config-info">
          <h3>配置信息</h3>
          <div className="info-grid">
            <div className="info-item">
              <label>应用名称:</label>
              <span>有期-OCR识别</span>
            </div>
            <div className="info-item">
              <label>App ID:</label>
              <span>7008056</span>
            </div>
            <div className="info-item">
              <label>API Key:</label>
              <span>eIKgfcznPiVt64bIlQfmroDQ</span>
            </div>
            <div className="info-item">
              <label>免费额度:</label>
              <span>1,000次/月</span>
            </div>
          </div>
        </div>

        <div className="usage-tips">
          <h3>使用提示</h3>
          <ul>
            <li>确保在百度AI控制台中添加了安全域名：localhost, 127.0.0.1</li>
            <li>OCR识别需要网络连接</li>
            <li>图片质量会影响识别准确率</li>
            <li>建议在光线充足的环境下拍照</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default OCRTest; 