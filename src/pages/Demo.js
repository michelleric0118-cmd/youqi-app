import React from 'react';
import { QrCode, Download, Globe, Settings, Package } from 'lucide-react';
import './Demo.css';

const Demo = () => {
  const features = [
    {
      id: 'scan',
      name: '扫码功能',
      icon: QrCode,
      description: '摄像头扫码和手动输入条码'
    },
    {
      id: 'batch',
      name: '批量操作',
      icon: Package,
      description: '批量选择、删除、编辑、导出'
    },
    {
      id: 'import',
      name: '数据导入导出',
      icon: Download,
      description: 'JSON、CSV格式数据备份'
    },
    {
      id: 'language',
      name: '多语言支持',
      icon: Globe,
      description: '中英文切换'
    },
    {
      id: 'settings',
      name: '设置管理',
      icon: Settings,
      description: '统一设置界面'
    }
  ];

  return (
    <div className="demo-page">
      <div className="demo-header">
        <h1>有期 - 新功能演示</h1>
        <p>体验最新的功能完善和用户体验优化</p>
      </div>

      <div className="features-grid">
        {features.map(feature => {
          const Icon = feature.icon;
          return (
            <div key={feature.id} className="feature-card">
              <div className="feature-icon">
                <Icon size={32} />
              </div>
              <h3>{feature.name}</h3>
              <p>{feature.description}</p>
            </div>
          );
        })}
      </div>

      <div className="demo-stats">
        <div className="stat-item">
          <h3>5</h3>
          <p>核心功能</p>
        </div>
        <div className="stat-item">
          <h3>100%</h3>
          <p>响应式设计</p>
        </div>
        <div className="stat-item">
          <h3>2</h3>
          <p>语言支持</p>
        </div>
        <div className="stat-item">
          <h3>24/7</h3>
          <p>离线可用</p>
        </div>
      </div>
    </div>
  );
};

export default Demo; 