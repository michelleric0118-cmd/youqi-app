import React, { useState } from 'react';
import { Settings as SettingsIcon, Globe, Bell, Database } from 'lucide-react';
import i18n from '../utils/i18n';
import backupManager from '../utils/backup';
import notificationManager from '../utils/notifications';
import './Settings.css';

const Settings = ({ onClose, onOpenLanguageSettings, onOpenDataImport }) => {
  const [activeTab, setActiveTab] = useState('general');
  const [elderMode, setElderMode] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [autoBackup, setAutoBackup] = useState(true);

  const handleElderModeToggle = () => {
    const newMode = !elderMode;
    setElderMode(newMode);
    if (newMode) {
      document.body.style.fontSize = '18px';
    } else {
      document.body.style.fontSize = '';
    }
  };

  const handleNotificationToggle = async () => {
    const newState = !notificationsEnabled;
    setNotificationsEnabled(newState);
    
    if (newState) {
      await notificationManager.requestPermission();
    }
  };

  const handleBackupToggle = () => {
    const newState = !autoBackup;
    setAutoBackup(newState);
    backupManager.setAutoBackup(newState, 'daily');
  };

  const handleExportBackup = () => {
    backupManager.exportBackup({
      version: '1.0',
      timestamp: new Date().toISOString(),
      items: [],
      settings: {
        elderMode,
        notificationsEnabled,
        autoBackup
      }
    });
  };

  const tabs = [
    { id: 'general', name: '通用设置', icon: SettingsIcon },
    { id: 'language', name: '语言设置', icon: Globe },
    { id: 'notifications', name: '通知设置', icon: Bell },
    { id: 'backup', name: '备份设置', icon: Database }
  ];

  const renderGeneralSettings = () => (
    <div className="settings-section">
      <h3>通用设置</h3>
      
      <div className="setting-item">
        <div className="setting-info">
          <h4>老年模式</h4>
          <p>增大字体和按钮，提高可读性</p>
        </div>
        <label className="toggle-switch">
          <input
            type="checkbox"
            checked={elderMode}
            onChange={handleElderModeToggle}
          />
          <span className="toggle-slider"></span>
        </label>
      </div>

      <div className="setting-item">
        <div className="setting-info">
          <h4>自动备份</h4>
          <p>定期自动备份数据到本地</p>
        </div>
        <label className="toggle-switch">
          <input
            type="checkbox"
            checked={autoBackup}
            onChange={handleBackupToggle}
          />
          <span className="toggle-slider"></span>
        </label>
      </div>
    </div>
  );

  const renderLanguageSettings = () => (
    <div className="settings-section">
      <h3>语言设置</h3>
      
      <div className="setting-item">
        <div className="setting-info">
          <h4>当前语言</h4>
          <p>{i18n.getCurrentLocale() === 'zh-CN' ? '简体中文' : 'English'}</p>
        </div>
        <button 
          className="btn-secondary"
          onClick={onOpenLanguageSettings}
        >
          更改语言
        </button>
      </div>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="settings-section">
      <h3>通知设置</h3>
      
      <div className="setting-item">
        <div className="setting-info">
          <h4>启用通知</h4>
          <p>接收物品过期和库存提醒</p>
        </div>
        <label className="toggle-switch">
          <input
            type="checkbox"
            checked={notificationsEnabled}
            onChange={handleNotificationToggle}
          />
          <span className="toggle-slider"></span>
        </label>
      </div>

      <div className="notification-status">
        <p>通知权限状态: {notificationManager.hasPermission() ? '已授权' : '未授权'}</p>
        {!notificationManager.hasPermission() && (
          <button 
            className="btn-secondary"
            onClick={() => notificationManager.requestPermission()}
          >
            请求权限
          </button>
        )}
      </div>
    </div>
  );

  const renderBackupSettings = () => (
    <div className="settings-section">
      <h3>备份设置</h3>
      
      <div className="setting-item">
        <div className="setting-info">
          <h4>导出备份</h4>
          <p>将数据导出为文件保存</p>
        </div>
        <button 
          className="btn-secondary"
          onClick={handleExportBackup}
        >
          导出备份
        </button>
      </div>

      <div className="setting-item">
        <div className="setting-info">
          <h4>导入数据</h4>
          <p>从文件导入数据</p>
        </div>
        <button 
          className="btn-secondary"
          onClick={onOpenDataImport}
        >
          导入数据
        </button>
      </div>

      <div className="backup-info">
        <h4>备份信息</h4>
        <p>最后备份: {backupManager.getBackupInfo()?.lastBackup || '从未备份'}</p>
        <p>自动备份: {autoBackup ? '已启用' : '已禁用'}</p>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return renderGeneralSettings();
      case 'language':
        return renderLanguageSettings();
      case 'notifications':
        return renderNotificationSettings();
      case 'backup':
        return renderBackupSettings();
      default:
        return renderGeneralSettings();
    }
  };

  return (
    <div className="settings-overlay">
      <div className="settings-modal">
        <div className="settings-header">
          <div className="header-content">
            <SettingsIcon size={24} />
            <h3>设置</h3>
          </div>
          <button className="close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="settings-content">
          <div className="settings-tabs">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  className={`settings-tab ${activeTab === tab.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <Icon size={20} />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </div>

          <div className="settings-body">
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings; 