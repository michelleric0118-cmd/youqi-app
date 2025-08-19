import React, { useState } from 'react';
import { User, Bell, Globe, Info } from 'lucide-react';
import './Settings.css';

// 简化的Settings组件，用于测试基本功能
const SettingsSimple = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState('general');

  const tabs = [
    { id: 'general', label: '通用设置', icon: User },
    { id: 'notifications', label: '通知设置', icon: Bell },
    { id: 'language', label: '语言设置', icon: Globe },
    { id: 'about', label: '关于', icon: Info }
  ];

  const renderGeneralSettings = () => (
    <div className="settings-section">
      <h3>通用设置</h3>
      <div className="setting-item">
        <div className="setting-info">
          <h4>测试设置</h4>
          <p>这是一个测试设置项</p>
        </div>
        <button className="btn-secondary">测试按钮</button>
      </div>
    </div>
  );

  const renderNotificationsSettings = () => (
    <div className="settings-section">
      <h3>通知设置</h3>
      <div className="setting-item">
        <div className="setting-info">
          <h4>推送通知</h4>
          <p>管理应用推送通知</p>
        </div>
        <button className="btn-secondary">开启通知</button>
      </div>
    </div>
  );

  const renderLanguageSettings = () => (
    <div className="settings-section">
      <h3>语言设置</h3>
      <div className="setting-item">
        <div className="setting-info">
          <h4>应用语言</h4>
          <p>选择应用显示语言</p>
        </div>
        <select className="form-select">
          <option value="zh">中文</option>
          <option value="en">English</option>
        </select>
      </div>
    </div>
  );

  const renderAbout = () => (
    <div className="settings-section">
      <h3>关于应用</h3>
      <div className="setting-item">
        <div className="setting-info">
          <h4>版本信息</h4>
          <p>有期 v0.2.0-beta</p>
        </div>
      </div>
      <div className="setting-item">
        <div className="setting-info">
          <h4>内测说明</h4>
          <p>当前为内测阶段，限制20个用户名额</p>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'general':
        return renderGeneralSettings();
      case 'notifications':
        return renderNotificationsSettings();
      case 'language':
        return renderLanguageSettings();
      case 'about':
        return renderAbout();
      default:
        return renderGeneralSettings();
    }
  };

  return (
    <div className="settings-overlay">
      <div className="settings-modal">
        <div className="settings-header">
          <h2>设置</h2>
          <button onClick={onClose} className="close-btn">×</button>
        </div>
        
        <div className="settings-tabs">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>
        
        <div className="settings-content">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default SettingsSimple; 