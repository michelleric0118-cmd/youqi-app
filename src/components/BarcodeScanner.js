import React, { useState, useEffect, useRef } from 'react';
import { Camera, X, RotateCcw } from 'lucide-react';

const BarcodeScanner = ({ onScan, onClose }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState('');
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // 启动摄像头
  const startCamera = async () => {
    try {
      setError('');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment', // 优先使用后置摄像头
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsScanning(true);
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
    setIsScanning(false);
  };

  // 模拟扫码（用于开发环境）
  const simulateScan = () => {
    const mockBarcodes = [
      '6901234567890', // 药品条码
      '6909876543210', // 护肤品条码
      '6905555555555', // 食品条码
    ];
    const randomBarcode = mockBarcodes[Math.floor(Math.random() * mockBarcodes.length)];
    setResult(randomBarcode);
    onScan(randomBarcode);
  };

  // 处理扫码结果
  const handleScanResult = (barcode) => {
    setResult(barcode);
    onScan(barcode);
    stopCamera();
  };

  // 重新开始扫描
  const restartScan = () => {
    setResult('');
    setError('');
    if (isScanning) {
      stopCamera();
    }
    setTimeout(startCamera, 500);
  };

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <div className="barcode-scanner">
      <div className="scanner-header">
        <h3>扫描条形码</h3>
        <button onClick={onClose} className="close-btn">
          <X size={20} />
        </button>
      </div>

      <div className="scanner-content">
        {error ? (
          <div className="scanner-error">
            <p>{error}</p>
            <button onClick={restartScan} className="btn btn-secondary">
              <RotateCcw size={16} style={{ marginRight: '8px' }} />
              重试
            </button>
          </div>
        ) : (
          <>
            <div className="video-container">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <div className="scan-overlay">
                <div className="scan-frame"></div>
                <p className="scan-tip">将条形码放入框内</p>
              </div>
            </div>
            
            <div className="scanner-controls">
              <button onClick={simulateScan} className="btn btn-secondary">
                <Camera size={16} style={{ marginRight: '8px' }} />
                模拟扫码（开发环境）
              </button>
              <button onClick={restartScan} className="btn btn-secondary">
                <RotateCcw size={16} style={{ marginRight: '8px' }} />
                重新扫描
              </button>
            </div>
          </>
        )}
      </div>

      {result && (
        <div className="scan-result">
          <h4>扫描结果</h4>
          <p className="barcode-result">{result}</p>
          <button onClick={() => setResult('')} className="btn btn-secondary">
            继续扫描
          </button>
        </div>
      )}
    </div>
  );
};

export default BarcodeScanner; 