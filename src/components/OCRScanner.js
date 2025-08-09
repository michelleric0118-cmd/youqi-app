import React, { useState, useRef } from 'react';
import { Camera, X, RotateCcw, Check } from 'lucide-react';
import { recognizeText as recognizeTextViaProxy, parseProductInfo } from '../services/baiduOCRService';
import PaywallModal from './PaywallModal';
import './OCRScanner.css';

const OCRScanner = ({ onScan, onClose, onManualInput }) => {
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [recognizedText, setRecognizedText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [showPaywall, setShowPaywall] = useState(false);
  const [quotaInfo, setQuotaInfo] = useState({ used: 40, limit: 40 });
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  // 启动摄像头
  const startCamera = async () => {
    try {
      setError('');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error('摄像头启动失败:', err);
      setError('无法访问摄像头，请检查权限设置');
    }
  };

  // 停止摄像头
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  // 拍照
  const captureImage = () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    setIsCapturing(true);
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    
    // 设置canvas尺寸
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // 绘制视频帧到canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // 获取图片数据
    const imageData = canvas.toDataURL('image/jpeg', 0.8);
    setCapturedImage(imageData);
    
    // 停止摄像头
    stopCamera();
  };

  // 重新拍照
  const retakePhoto = () => {
    setCapturedImage(null);
    setRecognizedText('');
    setError('');
    startCamera();
  };

  // 调用后端代理进行OCR识别
  const handleRecognize = async () => {
    if (!capturedImage) return;
    
    setIsProcessing(true);
    setError('');
    
    try {
      // 从base64图片数据中提取图片数据部分
      const imageData = capturedImage.split(',')[1];
      
      // 使用后端代理；若存在 LeanCloud sessionToken，携带用于配额统计
      const sessionToken = localStorage.getItem('leancloud-session') || undefined;
      const ocrResults = await recognizeTextViaProxy(imageData, { sessionToken });
      
      // 解析OCR结果，提取商品信息
      const productInfo = parseProductInfo(ocrResults);
      
      // 将识别结果转换为文本
      const recognizedText = ocrResults.map(item => item.words).join('\n');
      setRecognizedText(recognizedText);
      
      // 如果解析出商品信息，可以自动填充表单
      if (productInfo.name || productInfo.brand) {
        console.log('解析的商品信息:', productInfo);
      }
      
    } catch (err) {
      console.error('OCR识别失败:', err);
      if (err.code === 'QUOTA_EXCEEDED' || err.status === 402) {
        // 超出配额，展示付费引导
        setQuotaInfo({ used: err.used || 40, limit: err.limit || 40 });
        setShowPaywall(true);
      } else {
        setError('文字识别失败，请重试');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  // 确认识别结果
  const confirmResult = () => {
    if (recognizedText) {
      onScan(recognizedText);
    }
  };

  // 手动输入
  const handleManualInput = () => {
    const text = prompt('请输入识别到的文字信息：');
    if (text) {
      onManualInput(text);
    }
  };

  // 组件挂载时启动摄像头
  React.useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <div className="ocr-scanner-overlay">
      <div className="ocr-scanner-modal">
        <div className="ocr-scanner-header">
          <h3>OCR文字识别</h3>
          <button onClick={onClose} className="close-btn">
            <X size={24} />
          </button>
        </div>

        <div className="ocr-scanner-content">
          {!capturedImage ? (
            // 拍照界面
            <div className="camera-container">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="camera-video"
              />
              <canvas ref={canvasRef} style={{ display: 'none' }} />
              
              <div className="camera-overlay">
                <div className="scan-area">
                  <div className="scan-corner top-left"></div>
                  <div className="scan-corner top-right"></div>
                  <div className="scan-corner bottom-left"></div>
                  <div className="scan-corner bottom-right"></div>
                </div>
                <p className="scan-tip">将商品包装上的文字信息放入框内</p>
              </div>

              <div className="camera-controls">
                <button onClick={captureImage} className="capture-btn">
                  <Camera size={32} />
                </button>
              </div>
            </div>
          ) : (
            // 识别结果界面
            <div className="result-container">
              <div className="image-preview">
                <img src={capturedImage} alt="拍摄的图片" />
                <button onClick={retakePhoto} className="retake-btn">
                  <RotateCcw size={20} />
                  重新拍照
                </button>
              </div>

              <div className="recognition-section">
                <button 
                  onClick={handleRecognize} 
                  disabled={isProcessing}
                  className="recognize-btn"
                >
                  {isProcessing ? '识别中...' : '开始识别'}
                </button>

                {recognizedText && (
                  <div className="recognized-text">
                    <h4>识别结果：</h4>
                    <textarea
                      value={recognizedText}
                      onChange={(e) => setRecognizedText(e.target.value)}
                      placeholder="识别到的文字将显示在这里..."
                      rows="6"
                    />
                  </div>
                )}

                {recognizedText && (
                  <div className="action-buttons">
                    <button onClick={confirmResult} className="confirm-btn">
                      <Check size={20} />
                      确认使用
                    </button>
                    <button onClick={handleManualInput} className="manual-btn">
                      手动输入
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
    {showPaywall && (
      <PaywallModal
        used={quotaInfo.used}
        limit={quotaInfo.limit}
        onClose={() => setShowPaywall(false)}
        onUpgrade={() => {
          setShowPaywall(false);
          window.location.href = '/upgrade';
        }}
      />
    )}
  );
};

export default OCRScanner; 