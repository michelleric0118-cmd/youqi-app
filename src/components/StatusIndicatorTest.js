import React, { useState, useEffect } from 'react';
import statusIndicatorRemover from '../utils/statusIndicatorRemover';
import './StatusIndicatorTest.css';

const StatusIndicatorTest = () => {
  const [isActive, setIsActive] = useState(false);
  const [hiddenCount, setHiddenCount] = useState(0);
  const [hiddenElements, setHiddenElements] = useState([]);

  useEffect(() => {
    // 获取当前状态
    setIsActive(statusIndicatorRemover.isActive);
    setHiddenCount(statusIndicatorRemover.getHiddenCount());
    setHiddenElements(statusIndicatorRemover.getHiddenElementsInfo());
  }, []);

  const handleStart = () => {
    statusIndicatorRemover.start();
    setIsActive(true);
  };

  const handleStop = () => {
    statusIndicatorRemover.stop();
    setIsActive(false);
  };

  const handleRestore = () => {
    statusIndicatorRemover.restoreHiddenElements();
    setHiddenCount(0);
    setHiddenElements([]);
  };

  const handleRefresh = () => {
    setHiddenCount(statusIndicatorRemover.getHiddenCount());
    setHiddenElements(statusIndicatorRemover.getHiddenElementsInfo());
  };

  // 创建测试状态指示器
  const createTestIndicators = () => {
    // 创建成功按钮
    const successBtn = document.createElement('button');
    successBtn.textContent = '成功';
    successBtn.style.cssText = 'position: fixed; top: 10px; right: 10px; z-index: 9999; background: #10b981; color: white; border: none; padding: 8px 16px; border-radius: 4px;';
    document.body.appendChild(successBtn);

    // 创建错误按钮
    const errorBtn = document.createElement('button');
    errorBtn.textContent = '错误';
    errorBtn.style.cssText = 'position: fixed; top: 50px; right: 10px; z-index: 9999; background: #ef4444; color: white; border: none; padding: 8px 16px; border-radius: 4px;';
    document.body.appendChild(errorBtn);

    // 创建警告按钮
    const warningBtn = document.createElement('button');
    warningBtn.textContent = '警告';
    warningBtn.style.cssText = 'position: fixed; top: 90px; right: 10px; z-index: 9999; background: #f59e0b; color: white; border: none; padding: 8px 16px; border-radius: 4px;';
    document.body.appendChild(warningBtn);

    // 创建信息按钮
    const infoBtn = document.createElement('button');
    infoBtn.textContent = '信息';
    infoBtn.style.cssText = 'position: fixed; top: 130px; right: 10px; z-index: 9999; background: #3b82f6; color: white; border: none; padding: 8px 16px; border-radius: 4px;';
    document.body.appendChild(infoBtn);

    // 创建过期提醒按钮
    const expiryBtn = document.createElement('button');
    expiryBtn.textContent = '过期提醒';
    expiryBtn.style.cssText = 'position: fixed; top: 170px; right: 10px; z-index: 9999; background: #dc2626; color: white; border: none; padding: 8px 16px; border-radius: 4px;';
    document.body.appendChild(expiryBtn);

    console.log('已创建测试状态指示器');
  };

  const removeTestIndicators = () => {
    const testButtons = document.querySelectorAll('button[style*="position: fixed"][style*="right: 10px"]');
    testButtons.forEach(btn => {
      if (['成功', '错误', '警告', '信息', '过期提醒'].includes(btn.textContent)) {
        btn.remove();
      }
    });
    console.log('已移除测试状态指示器');
  };

  return (
    <div className="status-indicator-test">
      <h2>🧪 状态指示器移除工具测试</h2>
      
      <div className="test-controls">
        <div className="control-group">
          <h3>工具控制</h3>
          <div className="button-group">
            <button 
              className={`control-btn ${isActive ? 'active' : ''}`}
              onClick={handleStart}
              disabled={isActive}
            >
              🚀 启动工具
            </button>
            
            <button 
              className="control-btn"
              onClick={handleStop}
              disabled={!isActive}
            >
              ⏹️ 停止工具
            </button>
            
            <button 
              className="control-btn"
              onClick={handleRestore}
            >
              🔄 恢复元素
            </button>
            
            <button 
              className="control-btn"
              onClick={handleRefresh}
            >
              📊 刷新状态
            </button>
          </div>
        </div>

        <div className="control-group">
          <h3>测试数据</h3>
          <div className="button-group">
            <button 
              className="control-btn"
              onClick={createTestIndicators}
            >
              ➕ 创建测试指示器
            </button>
            
            <button 
              className="control-btn"
              onClick={removeTestIndicators}
            >
              🗑️ 移除测试指示器
            </button>
          </div>
        </div>
      </div>

      <div className="status-info">
        <div className="status-item">
          <span className="status-label">工具状态:</span>
          <span className={`status-value ${isActive ? 'active' : 'inactive'}`}>
            {isActive ? '🟢 运行中' : '🔴 已停止'}
          </span>
        </div>
        
        <div className="status-item">
          <span className="status-label">已隐藏元素:</span>
          <span className="status-value">{hiddenCount} 个</span>
        </div>
      </div>

      {hiddenElements.length > 0 && (
        <div className="hidden-elements">
          <h3>📋 隐藏的元素详情</h3>
          <div className="elements-list">
            {hiddenElements.map((el, index) => (
              <div key={index} className="element-item">
                <div className="element-tag">{el.tagName}</div>
                <div className="element-class">{el.className || '无类名'}</div>
                <div className="element-text">{el.textContent || '无文本'}</div>
                <div className="element-position">{el.position}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="usage-guide">
        <h3>📖 使用说明</h3>
        <div className="guide-steps">
          <div className="guide-step">
            <div className="step-number">1</div>
            <div className="step-content">
              <h4>启动工具</h4>
              <p>点击"启动工具"按钮，工具会自动检测并隐藏页面右上角的状态指示器</p>
            </div>
          </div>
          
          <div className="guide-step">
            <div className="step-number">2</div>
            <div className="step-content">
              <h4>测试功能</h4>
              <p>点击"创建测试指示器"按钮，在页面右上角创建测试状态按钮</p>
            </div>
          </div>
          
          <div className="guide-step">
            <div className="step-number">3</div>
            <div className="step-content">
              <h4>验证效果</h4>
              <p>工具会自动隐藏这些测试按钮，您可以在"已隐藏元素"中查看详情</p>
            </div>
          </div>
          
          <div className="guide-step">
            <div className="step-number">4</div>
            <div className="step-content">
              <h4>恢复元素</h4>
              <p>如果需要，可以点击"恢复元素"按钮来显示所有被隐藏的元素</p>
            </div>
          </div>
        </div>
      </div>

      <div className="technical-info">
        <h3>🔧 技术信息</h3>
        <div className="info-grid">
          <div className="info-item">
            <span className="info-label">检测方式:</span>
            <span className="info-value">文字内容 + 类名 + 位置</span>
          </div>
          
          <div className="info-item">
            <span className="info-label">监控频率:</span>
            <span className="info-value">每秒1次</span>
          </div>
          
          <div className="info-item">
            <span className="info-label">DOM监听:</span>
            <span className="info-value">实时监控变化</span>
          </div>
          
          <div className="info-item">
            <span className="info-label">自动启动:</span>
            <span className="info-value">开发环境自动启动</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatusIndicatorTest; 