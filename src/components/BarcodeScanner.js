import React, { useState, useEffect } from 'react';
import { Camera, X, RotateCcw } from 'lucide-react';
import Quagga from 'quagga';

const BarcodeScanner = ({ onScan, onClose }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState('');

  // 启动扫码器
  const startScanner = async () => {
    try {
      setError('');
      setIsScanning(true);
      
      Quagga.init({
        inputStream: {
          name: "Live",
          type: "LiveStream",
          target: "#interactive",
          constraints: {
            facingMode: "environment",
            width: { min: 640 },
            height: { min: 480 }
          }
        },
        locator: {
          patchSize: "medium",
          halfSample: true
        },
        numOfWorkers: 2,
        frequency: 10,
        decoder: {
          readers: [
            "code_128_reader",
            "ean_reader",
            "ean_8_reader",
            "code_39_reader",
            "code_39_vin_reader",
            "codabar_reader",
            "upc_reader",
            "upc_e_reader"
          ]
        },
        locate: true
      }, (err) => {
        if (err) {
          console.error('扫码器初始化失败:', err);
          setError('扫码器初始化失败，请重试');
          setIsScanning(false);
          return;
        }
        
        Quagga.start();
      });
      
      // 监听扫码结果
      Quagga.onDetected((result) => {
        const barcode = result.codeResult.code;
        console.log('扫码成功:', barcode);
        handleScanResult(barcode);
      });
      
    } catch (err) {
      console.error('扫码器启动失败:', err);
      setError('无法启动扫码器，请检查权限设置');
      setIsScanning(false);
    }
  };

  // 停止扫码器
  const stopScanner = () => {
    if (isScanning) {
      Quagga.stop();
    }
    setIsScanning(false);
  };

  // 模拟扫码（用于测试）
  const simulateScan = () => {
    const mockBarcodes = [
      // 药品类
      '6901234567890', // 感冒灵颗粒
      '6901234567891', // 布洛芬缓释胶囊
      '6901234567892', // 维生素C片
      '6901234567893', // 板蓝根颗粒
      '6901234567894', // 阿司匹林肠溶片
      '6901234567895', // 钙片
      '6901234567896', // 藿香正气水
      '6901234567897', // 创可贴
      
      // 护肤品类
      '6909876543210', // 保湿面霜
      '6909876543211', // 防晒霜
      '6909876543212', // 洁面乳
      '6909876543213', // 精华液
      '6909876543214', // 眼霜
      '6909876543215', // 面膜
      '6909876543216', // 爽肤水
      '6909876543217', // 护手霜
      
      // 食品类
      '6905555555555', // 牛奶
      '6905555555556', // 面包
      '6905555555557', // 酸奶
      '6905555555558', // 鸡蛋
      '6905555555559', // 苹果
      '6905555555560', // 橙子
      '6905555555561', // 香蕉
      '6905555555562', // 西红柿
      
      // 日用品类
      '6907777777777', // 洗发水
      '6907777777778', // 牙膏
      '6907777777779', // 沐浴露
      '6907777777780', // 洗衣液
      '6907777777781', // 卫生纸
      '6907777777782', // 垃圾袋
      '6907777777783', // 洗洁精
      '6907777777784', // 消毒液
      
      // 饮料类
      '6908888888888', // 可乐
      '6908888888889', // 雪碧
      '6908888888890', // 矿泉水
      '6908888888891', // 绿茶
      
      // 零食类
      '6909999999999', // 薯片
      '6909999999998', // 巧克力
      '6909999999997', // 饼干
      '6909999999996', // 坚果
    ];
    const randomBarcode = mockBarcodes[Math.floor(Math.random() * mockBarcodes.length)];
    setResult(randomBarcode);
    onScan(randomBarcode);
  };

  // 处理扫码结果
  const handleScanResult = (barcode) => {
    setResult(barcode);
    onScan(barcode);
    stopScanner();
  };

  // 重新开始扫描
  const restartScan = () => {
    setResult('');
    setError('');
    if (isScanning) {
      stopScanner();
    }
    setTimeout(startScanner, 500);
  };

  useEffect(() => {
    startScanner();
    return () => {
      if (isScanning) {
        stopScanner();
      }
    };
  }, [isScanning]);

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
              <div id="interactive" className="viewport" />
              <div className="scan-overlay">
                <div className="scan-frame"></div>
                <p className="scan-tip">将条形码放入框内</p>
              </div>
            </div>
            
            <div className="scanner-controls">
              <button onClick={simulateScan} className="btn btn-secondary">
                <Camera size={16} style={{ marginRight: '8px' }} />
                模拟扫码（测试）
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