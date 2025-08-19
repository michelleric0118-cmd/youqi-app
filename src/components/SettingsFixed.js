import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Settings as SettingsIcon, 
  User, 
  Bell, 
  Globe, 
  Info 
} from 'lucide-react';
import i18n from '../utils/i18n';
import './Settings.css';

// 修复版本的Settings组件 - 确保所有用户都能访问
const SettingsFixed = ({ onClose, onOpenLanguageSettings, onOpenDataImport }) => {
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('general');
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // 检查用户权限
  useEffect(() => {
    try {
      // 导入AV对象
      const { AV } = require('../leancloud/config');
      const user = AV.User.current();
      if (user) {
        setCurrentUser(user);
        const role = user.get('role');
        setIsAdmin(role === 'admin');
        console.log('用户权限检查:', { username: user.get('username'), role, isAdmin: role === 'admin' });
      }
    } catch (error) {
      console.log('权限检查失败，使用普通用户模式:', error);
      setIsAdmin(false);
    }
  }, []);

  const tabs = [
    { id: 'general', label: '通用设置', icon: User },
    { id: 'notifications', label: '通知设置', icon: Bell },
    { id: 'language', label: '语言设置', icon: Globe },
    { id: 'about', label: '关于', icon: Info }
  ];

  // 只有管理员才显示用户管理标签
  if (isAdmin) {
    tabs.push({ id: 'admin', label: '内测管理', icon: User });
  }

  const renderGeneralSettings = () => (
    <div className="settings-section">
      <h3>通用设置</h3>
      <div className="setting-item">
        <div className="setting-info">
          <h4>用户信息</h4>
          <p>当前用户: {currentUser ? currentUser.get('username') : '未登录'}</p>
          <p>用户角色: {currentUser ? (currentUser.get('role') || 'user') : '未知'}</p>
        </div>
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

  const renderAdminSettings = () => (
    <div className="settings-section">
      <h3>内测管理</h3>
      <div className="setting-item">
        <div className="setting-info">
          <h4>用户管理</h4>
          <p>管理内测用户和邀请码</p>
        </div>
        <button className="btn-secondary">管理用户</button>
      </div>
      <div className="setting-item">
        <div className="setting-info">
          <h4>内测统计</h4>
          <p>查看内测用户统计信息</p>
        </div>
        <button className="btn-secondary">查看统计</button>
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
      case 'admin':
        return isAdmin ? renderAdminSettings() : <div>权限不足</div>;
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

export default SettingsFixed; 