import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Settings as SettingsIcon, 
  User, 
  Bell, 
  FolderOpen, 
  Database, 
  Download, 
  Upload, 
  Trash2, 
  Globe, 
  Palette, 
  Shield, 
  HelpCircle, 
  Info, 
  ChevronRight 
} from 'lucide-react';
import i18n from '../utils/i18n';
import backupManager from '../utils/backup';
import notificationManager from '../utils/notifications';
import UserManagement from './UserManagement';
import CategoryManager from './CategoryManager';
import ReminderSettings from './ReminderSettings';
import PushNotificationSettings from './PushNotificationSettings';
import toast from 'react-hot-toast';
import { AV } from '../leancloud/config';
import './Settings.css';

const Settings = ({ onClose, onOpenLanguageSettings, onOpenDataImport }) => {
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('general');
  const [elderMode, setElderMode] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [autoBackup, setAutoBackup] = useState(true);
  const [showUserManagement, setShowUserManagement] = useState(false);
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [currentTab, setCurrentTab] = useState('general');
  const [isLoading, setIsLoading] = useState(false);
  const [reminderSettings, setReminderSettings] = useState(null);
  const [isTestMode, setIsTestMode] = useState(false);
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [showRulesModal, setShowRulesModal] = useState(false);
  const [reminderActiveTab, setReminderActiveTab] = useState('notifications');

  // 处理URL参数中的tab参数
  useEffect(() => {
    const tabFromUrl = searchParams.get('tab');
    if (tabFromUrl && ['general', 'category', 'data', 'appearance', 'users'].includes(tabFromUrl)) {
      setActiveTab(tabFromUrl);
      // 如果是从URL跳转过来的分类管理，直接显示分类管理
      if (tabFromUrl === 'category') {
        setShowCategoryManager(true);
      }
    }
  }, [searchParams]);

  // 读取URL参数中的tab参数
  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    const tabParam = params.get('tab');
    if (tabParam && tabs.find(tab => tab.id === tabParam)) {
      setCurrentTab(tabParam);
    }
  }, [searchParams]);

  // 加载提醒设置
  useEffect(() => {
    loadReminderSettings();
  }, []);

  // 加载提醒设置
  const loadReminderSettings = () => {
    try {
      // 检查是否为测试模式
      const testMode = !AV.User.current();
      setIsTestMode(testMode);
      
      if (testMode) {
        // 测试模式：从localStorage加载
        const saved = localStorage.getItem('reminder_settings');
        if (saved) {
          setReminderSettings(JSON.parse(saved));
        }
      } else {
        // 正常模式：从用户设置加载
        const currentUser = AV.User.current();
        if (currentUser) {
          const settings = currentUser.get('reminderSettings');
          if (settings) {
            setReminderSettings(settings);
          }
        }
      }
    } catch (error) {
      console.error('加载提醒设置失败:', error);
    }
  };

  // 保存提醒设置
  const handleSaveReminderSettings = async (newSettings) => {
    try {
      if (isTestMode) {
        // 测试模式：保存到localStorage
        localStorage.setItem('reminder_settings', JSON.stringify(newSettings));
        setReminderSettings(newSettings);
        toast.success('提醒设置已保存');
      } else {
        // 正常模式：保存到用户设置
        const currentUser = AV.User.current();
        if (currentUser) {
          currentUser.set('reminderSettings', newSettings);
          await currentUser.save();
          setReminderSettings(newSettings);
          toast.success('提醒设置已保存');
        }
      }
    } catch (error) {
      console.error('保存提醒设置失败:', error);
      toast.error('保存失败，请重试');
    }
  };

  const handleElderModeToggle = () => {
    const newMode = !elderMode;
    setElderMode(newMode);
    if (newMode) {
      document.body.style.fontSize = '18px';
    } else {
      document.body.style.fontSize = '';
    }
  };

  // 处理提醒设置变化
  const handleReminderChange = (days, checked) => {
    if (!reminderSettings) {
      setReminderSettings({
        globalFirstReminderDays: 7,
        globalSecondReminderDays: 1
      });
    }

    const newSettings = { ...reminderSettings };
    
    if (checked) {
      // 如果选中，添加到第一个提醒时间
      if (newSettings.globalFirstReminderDays === undefined) {
        newSettings.globalFirstReminderDays = days;
      } else if (newSettings.globalSecondReminderDays === undefined) {
        newSettings.globalSecondReminderDays = days;
      } else {
        // 如果两个都已设置，替换第一个
        newSettings.globalFirstReminderDays = days;
      }
    } else {
      // 如果取消选中，从相应位置移除
      if (newSettings.globalFirstReminderDays === days) {
        newSettings.globalFirstReminderDays = undefined;
      } else if (newSettings.globalSecondReminderDays === days) {
        newSettings.globalSecondReminderDays = undefined;
      }
    }
    
    setReminderSettings(newSettings);
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
    { id: 'category', name: '分类与提醒', icon: Bell },
    { id: 'data', name: '数据管理', icon: Database },
    { id: 'appearance', name: '外观与辅助', icon: Globe },
    { id: 'users', name: '用户管理', icon: User }
  ];

  const renderGeneralSettings = () => (
    <div className="settings-section">
      <h3>通用设置</h3>
      
      <div className="setting-item">
        <div className="setting-info">
          <h4>应用信息</h4>
          <p>有期 - 家庭物品管理系统</p>
        </div>
        <span className="setting-value">v1.0.0</span>
      </div>

      <div className="setting-item">
        <div className="setting-info">
          <h4>数据统计</h4>
        </div>
        <button 
          className="btn btn-secondary"
          onClick={() => window.location.href = '/statistics'}
        >
          查看统计
        </button>
      </div>

      <div className="setting-item">
        <div className="setting-info">
          <h4>帮助与支持</h4>
        </div>
        <button 
          className="btn btn-secondary"
          onClick={() => window.open('https://github.com/your-repo', '_blank')}
        >
          查看帮助
        </button>
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
      <h3>通知与提醒</h3>
      
      {/* 提醒设置组件 */}
      <ReminderSettings
        settings={reminderSettings}
        onSave={handleSaveReminderSettings}
        isTestMode={isTestMode}
      />
      
      {/* 推送通知设置组件 */}
      <PushNotificationSettings />
      
      <div className="setting-item">
        <div className="setting-info">
          <label>本地通知</label>
          <span>接收重要事件的通知</span>
        </div>
        <div className="setting-control">
          <input
            type="checkbox"
            checked={notificationManager.isEnabled()}
            onChange={() => notificationManager.toggle()}
          />
        </div>
      </div>
      
      <div className="setting-item">
        <div className="setting-info">
          <label>声音提醒</label>
          <span>通知时播放提示音</span>
        </div>
        <div className="setting-control">
          <input
            type="checkbox"
            checked={notificationManager.isSoundEnabled()}
            onChange={() => notificationManager.toggleSound()}
          />
        </div>
      </div>
    </div>
  );

  const renderReminderSettings = () => (
    <div className="settings-section">
      <h3>过期提醒设置</h3>
      
      {/* 导航式过期提醒设置 */}
      <div className="reminder-navigation">
        {/* 提醒通知 */}
        <div className="reminder-nav-item">
          <div className="reminder-nav-header" onClick={() => setShowReminderModal(true)}>
            <div className="reminder-nav-info">
              <h4>提醒通知</h4>
              <p>设置过期提醒时间</p>
            </div>
            <div className="reminder-nav-arrow">›</div>
          </div>
        </div>
        
        {/* 设置须知 */}
        <div className="reminder-nav-item">
          <div className="reminder-nav-header" onClick={() => setShowRulesModal(true)}>
            <div className="reminder-nav-info">
              <h4>设置须知</h4>
              <p>了解提醒规则和优先级</p>
            </div>
            <div className="reminder-nav-arrow">›</div>
          </div>
        </div>
      </div>

      {/* 过期提醒设置Modal */}
      {showReminderModal && (
        <div className="modal-overlay" onClick={() => setShowReminderModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>过期提醒设置</h3>
              <button className="modal-close" onClick={() => setShowReminderModal(false)}>✕</button>
            </div>
            
            <div className="modal-tab-content">
              <div className="reminder-options">
                <h4>过期提醒</h4>
                <p className="reminder-tip">温馨提示：可选择多个提醒时间。</p>
                {[0, 1, 2, 7, 15, 30, 90].map(days => (
                  <label key={days} className="reminder-option">
                    <input
                      type="checkbox"
                      checked={reminderSettings?.globalFirstReminderDays === days || reminderSettings?.globalSecondReminderDays === days}
                      onChange={(e) => handleReminderChange(days, e.target.checked)}
                    />
                    <span>{days === 0 ? '过期当天' : days === 1 ? '过期前1天' : `过期前${days}天`}</span>
                  </label>
                ))}
              </div>
            </div>
            
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setShowReminderModal(false)}>取消</button>
              <button className="btn btn-primary" onClick={handleSaveReminderSettings}>保存</button>
            </div>
          </div>
        </div>
      )}

      {/* 设置须知Modal */}
      {showRulesModal && (
        <div className="modal-overlay" onClick={() => setShowRulesModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>设置须知</h3>
              <button className="modal-close" onClick={() => setShowRulesModal(false)}>✕</button>
            </div>
            
            <div className="rules-content">
              <div className="rule-item">
                <h4>提醒优先级</h4>
                <p>单个物品设置 > 分类设置 > 全局设置</p>
              </div>
              <div className="rule-item">
                <h4>提醒时间</h4>
                <p>可设置多个提醒时间，系统会在相应时间发送通知</p>
              </div>
              <div className="rule-item">
                <h4>通知方式</h4>
                <p>支持应用内通知、推送通知和本地通知</p>
              </div>
              <div className="rule-item">
                <h4>使用建议</h4>
                <p>建议设置2-3个提醒时间，避免错过重要提醒</p>
              </div>
            </div>
            
            <div className="modal-actions">
              <button className="btn btn-primary" onClick={() => setShowRulesModal(false)}>知道了</button>
            </div>
          </div>
        </div>
      )}
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

  const renderCategoryAndReminderSettings = () => (
    <div className="settings-section">
      <h3>分类与过期提醒管理</h3>
      
      {/* 分类管理 */}
      <div className="setting-item">
        <div className="setting-info">
          <h4>分类管理</h4>
          <p>管理物品分类，创建自定义分类，设置过期提醒规则</p>
        </div>
        <button 
          className="btn btn-secondary"
          onClick={() => setShowCategoryManager(true)}
        >
          管理分类与提醒
        </button>
      </div>

      {/* 过期提醒说明 */}
      <div className="setting-item">
        <div className="setting-info">
          <h4>过期提醒说明</h4>
          <p>• 每个分类可以设置独立的过期提醒规则</p>
          <p>• 子分类默认继承父分类的提醒设置</p>
          <p>• 支持多个提醒时间：过期当天、过期前1天、7天、15天等</p>
          <p>• 提醒优先级：单个物品设置 > 分类设置 > 全局设置</p>
        </div>
      </div>

      {/* 全局提醒设置 */}
      <div className="setting-item">
        <div className="setting-info">
          <h4>全局提醒设置</h4>
          <p>设置默认的过期提醒规则，新分类将继承此设置</p>
        </div>
        <button 
          className="btn btn-secondary"
          onClick={() => setShowReminderModal(true)}
        >
          设置全局提醒
        </button>
      </div>
    </div>
  );

  const renderDataManagementSettings = () => (
    <div className="settings-section">
      <h3>数据管理</h3>
      
      {/* 数据备份 */}
      <div className="setting-item">
        <div className="setting-info">
          <h4>数据备份</h4>
          <p>自动备份数据，防止数据丢失</p>
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

      {/* 手动备份 */}
      <div className="setting-item">
        <div className="setting-info">
          <h4>手动备份</h4>
          <p>立即创建数据备份</p>
        </div>
        <button 
          className="btn btn-secondary"
          onClick={handleExportBackup}
        >
          导出备份
        </button>
      </div>

      {/* 数据导入导出 */}
      <div className="setting-item">
        <div className="setting-info">
          <h4>数据导入导出</h4>
          <p>导入导出物品数据，支持多种格式</p>
        </div>
        <button 
          className="btn btn-secondary"
          onClick={onOpenDataImport}
        >
          导入导出
        </button>
      </div>
    </div>
  );

  const renderAppearanceSettings = () => (
    <div className="settings-section">
      <h3>外观与辅助功能</h3>
      
      {/* 语言设置 */}
      <div className="setting-item">
        <div className="setting-info">
          <h4>语言设置</h4>
          <p>选择您偏好的语言</p>
        </div>
        <button 
          className="btn btn-secondary"
          onClick={onOpenLanguageSettings}
        >
          选择语言
        </button>
      </div>

      {/* 老年人模式 */}
      <div className="setting-item">
        <div className="setting-info">
          <h4>老年人模式</h4>
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

      {/* 通知设置 */}
      <div className="setting-item">
        <div className="setting-info">
          <h4>通知设置</h4>
          <p>管理应用通知和提醒</p>
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
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return renderGeneralSettings();
      case 'category':
        return renderCategoryAndReminderSettings();
      case 'data':
        return renderDataManagementSettings();
      case 'appearance':
        return renderAppearanceSettings();
      case 'users':
        return renderUserSettings();
      default:
        return renderGeneralSettings();
    }
  };

  const renderUserSettings = () => (
    <div className="settings-section">
      <h3>用户管理</h3>
      
      <div className="setting-item">
        <div className="setting-info">
          <h4>内测用户管理</h4>
        </div>
        <button 
          className="btn-secondary"
          onClick={() => setShowUserManagement(true)}
        >
          管理用户
        </button>
      </div>

      <div className="beta-info">
        <h4>内测说明</h4>
        <p>当前为内测阶段，限制20个用户名额。新用户需要邀请码才能注册。</p>
      </div>
    </div>
  );

  const renderCategorySettings = () => (
    <div className="settings-section">
      <h3>分类管理</h3>
      <button 
        className="btn-secondary"
        onClick={() => setShowCategoryManager(true)}
      >
        管理分类
      </button>
    </div>
  );

  // 样式
  const styles = `
    .reminder-navigation {
      margin-top: 20px;
    }
    
    .reminder-nav-item {
      margin-bottom: 12px;
    }
    
    .reminder-nav-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px;
      background: #f9fafb;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    
    .reminder-nav-header:hover {
      background: #f3f4f6;
      border-color: #d1d5db;
    }
    
    .reminder-nav-info h4 {
      margin: 0 0 4px 0;
      font-size: 16px;
      font-weight: 600;
      color: #374151;
    }
    
    .reminder-nav-info p {
      margin: 0;
      font-size: 14px;
      color: #6b7280;
    }
    
    .reminder-nav-arrow {
      font-size: 20px;
      color: #9ca3af;
      font-weight: 300;
    }
    
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }
    
    .modal-content {
      background: white;
      border-radius: 12px;
      width: 90%;
      max-width: 500px;
      max-height: 80vh;
      overflow: hidden;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
    }
    
    .modal-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 20px 24px;
      border-bottom: 1px solid #e5e7eb;
    }
    
    .modal-header h3 {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
      color: #374151;
    }
    
    .modal-close {
      background: none;
      border: none;
      font-size: 20px;
      color: #9ca3af;
      cursor: pointer;
      padding: 4px;
      border-radius: 4px;
    }
    
    .modal-close:hover {
      background: #f3f4f6;
      color: #6b7280;
    }
    
    .modal-tabs {
      display: flex;
      border-bottom: 1px solid #e5e7eb;
    }
    
    .tab-button {
      flex: 1;
      padding: 16px;
      background: none;
      border: none;
      font-size: 14px;
      font-weight: 500;
      color: #6b7280;
      cursor: pointer;
      border-bottom: 2px solid transparent;
      transition: all 0.2s ease;
    }
    
    .tab-button.active {
      color: #059669;
      border-bottom-color: #059669;
    }
    
    .tab-button:hover:not(.active) {
      background: #f9fafb;
      color: #374151;
    }
    
    .modal-tab-content {
      padding: 24px;
      max-height: 400px;
      overflow-y: auto;
    }
    
    .reminder-options h4 {
      margin: 0 0 16px 0;
      font-size: 16px;
      font-weight: 600;
      color: #374151;
    }
    
    .reminder-tip {
      margin: 0 0 16px 0;
      font-size: 14px;
      color: #6b7280;
      font-style: italic;
      padding: 8px 12px;
      background: #f9fafb;
      border-radius: 6px;
      border-left: 3px solid #059669;
    }
    
    .reminder-option {
      display: flex;
      align-items: center;
      padding: 12px 0;
      border-bottom: 1px solid #f3f4f6;
      cursor: pointer;
    }
    
    .reminder-option:last-child {
      border-bottom: none;
    }
    
    .reminder-option input[type="checkbox"] {
      margin-right: 12px;
      width: 18px;
      height: 18px;
    }
    
    .reminder-option span {
      font-size: 14px;
      color: #374151;
    }
    
    .rules-content {
      padding: 0 24px;
    }
    
    .rules-content h4 {
      margin: 0 0 20px 0;
      font-size: 16px;
      font-weight: 600;
      color: #374151;
    }
    
    .rule-item {
      margin-bottom: 32px;
      padding: 0;
    }
    
    .rule-item h5 {
      margin: 0 0 16px 0;
      font-size: 15px;
      font-weight: 600;
      color: #374151;
    }
    
    .rule-item p {
      margin: 0;
      font-size: 14px;
      color: #6b7280;
      line-height: 1.5;
      padding: 6px 0;
    }
    
    .modal-actions {
      display: flex;
      gap: 12px;
      padding: 20px 24px;
      border-top: 1px solid #e5e7eb;
      justify-content: flex-end;
    }
    
    .btn {
      padding: 10px 20px;
      border: none;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    
    .btn-primary {
      background: #059669;
      color: white;
    }
    
    .btn-primary:hover {
      background: #047857;
    }
    
    .btn-secondary {
      background: #f3f4f6;
      color: #374151;
    }
    
    .btn-secondary:hover {
      background: #e5e7eb;
    }
  `;

  return (
    <div className="settings-overlay">
      <style>{styles}</style>
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

      {/* 用户管理组件 */}
      {showUserManagement && (
        <UserManagement onClose={() => setShowUserManagement(false)} />
      )}
      {showCategoryManager && (
        <CategoryManager onClose={() => setShowCategoryManager(false)} />
      )}
    </div>
  );
};

export default Settings; 