import React, { useState, useRef, useEffect } from 'react';
import { Camera, X, Type } from 'lucide-react';
import './QRScanner.css';

const QRScanner = ({ onScan, onClose, onManualInput }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [error, setError] = useState('');
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // 启动摄像头
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsScanning(true);
        setError('');
      }
    } catch (err) {
      setError('无法访问摄像头，请检查权限设置');
      console.error('摄像头访问失败:', err);
    }
  };

  // 停止摄像头
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsScanning(false);
  };

  // 手动输入条码
  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (manualCode.trim()) {
      onManualInput(manualCode.trim());
      setManualCode('');
    }
  };

  // 处理扫码结果 - 目前通过onScan prop处理

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <div className="qr-scanner-overlay">
      <div className="qr-scanner-modal">
        <div className="qr-scanner-header">
          <h3>扫码添加物品</h3>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="qr-scanner-content">
          {/* 扫码区域 */}
          <div className="scanner-section">
            <div className="scanner-video-container">
              {!isScanning ? (
                <div className="scanner-placeholder">
                  <Camera size={48} />
                  <p>点击开始扫码</p>
                  <button 
                    className="start-scan-btn"
                    onClick={startCamera}
                  >
                    开始扫码
                  </button>
                </div>
              ) : (
                <div className="scanner-active">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="scanner-video"
                  />
                  <div className="scanner-overlay">
                    <div className="scanner-frame"></div>
                  </div>
                  <button 
                    className="stop-scan-btn"
                    onClick={stopCamera}
                  >
                    停止扫码
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* 手动输入区域 */}
          <div className="manual-input-section">
            <div className="section-header">
              <Type size={20} />
              <span>手动输入条码</span>
            </div>
            <form onSubmit={handleManualSubmit} className="manual-input-form">
              <input
                type="text"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                placeholder="请输入商品条码"
                className="manual-input"
              />
              <button 
                type="submit" 
                className="manual-submit-btn"
                disabled={!manualCode.trim()}
              >
                确认
              </button>
            </form>
          </div>

          {/* 错误提示 */}
          {error && (
            <div className="scanner-error">
              <p>{error}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QRScanner; 