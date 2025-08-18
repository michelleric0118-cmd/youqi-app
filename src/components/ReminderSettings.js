import React, { useState, useEffect } from 'react';
import { Bell, Info } from 'lucide-react';
import { REMINDER_OPTIONS, DEFAULT_REMINDER_SETTINGS, validateReminderSettings } from '../utils/reminderUtils';

const ReminderSettings = ({ 
  settings, 
  onSave, 
  isTestMode = false 
}) => {
  const [firstReminderDays, setFirstReminderDays] = useState(DEFAULT_REMINDER_SETTINGS.globalFirstReminderDays);
  const [secondReminderDays, setSecondReminderDays] = useState(DEFAULT_REMINDER_SETTINGS.globalSecondReminderDays);
  const [isLoading, setIsLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState([]);

  // 初始化设置
  useEffect(() => {
    if (settings) {
      setFirstReminderDays(settings.globalFirstReminderDays ?? DEFAULT_REMINDER_SETTINGS.globalFirstReminderDays);
      setSecondReminderDays(settings.globalSecondReminderDays ?? DEFAULT_REMINDER_SETTINGS.globalSecondReminderDays);
    }
  }, [settings]);

  // 验证设置
  const validateSettings = () => {
    const validation = validateReminderSettings(firstReminderDays, secondReminderDays);
    setValidationErrors(validation.errors);
    return validation.isValid;
  };

  // 保存设置
  const handleSave = async () => {
    if (!validateSettings()) {
      return;
    }

    setIsLoading(true);
    try {
      const newSettings = {
        ...settings,
        globalFirstReminderDays: firstReminderDays,
        globalSecondReminderDays: secondReminderDays
      };

      if (isTestMode) {
        // 测试模式：保存到localStorage
        localStorage.setItem('reminder_settings', JSON.stringify(newSettings));
        onSave && onSave(newSettings);
      } else {
        // 正常模式：调用保存函数
        onSave && onSave(newSettings);
      }
    } catch (error) {
      console.error('保存提醒设置失败:', error);
      setValidationErrors(['保存失败，请重试']);
    } finally {
      setIsLoading(false);
    }
  };

  // 重置为默认值
  const handleReset = () => {
    setFirstReminderDays(DEFAULT_REMINDER_SETTINGS.globalFirstReminderDays);
    setSecondReminderDays(DEFAULT_REMINDER_SETTINGS.globalSecondReminderDays);
    setValidationErrors([]);
  };

  return (
    <div className="reminder-settings">
      {/* 样式 */}
      <style>
        {`
          .reminder-settings {
            background: white;
            border-radius: 12px;
            padding: 24px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            margin-bottom: 20px;
          }
          
          .reminder-header {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 24px;
            padding-bottom: 16px;
            border-bottom: 1px solid #f3f4f6;
          }
          
          .reminder-header h3 {
            margin: 0;
            color: #374151;
            font-size: 18px;
            font-weight: 600;
          }
          
          .reminder-header .icon {
            color: var(--sage-green);
          }
          
          .reminder-description {
            color: #6b7280;
            font-size: 14px;
            line-height: 1.5;
            margin-bottom: 24px;
            padding: 16px;
            background: #f9fafb;
            border-radius: 8px;
            border-left: 4px solid var(--sage-green);
          }
          
          .reminder-section {
            margin-bottom: 24px;
          }
          
          .reminder-section h4 {
            margin: 0 0 16px 0;
            color: #374151;
            font-size: 16px;
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 8px;
          }
          
          .reminder-options {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 12px;
          }
          
          .reminder-option {
            position: relative;
            cursor: pointer;
          }
          
          .reminder-option input[type="radio"] {
            position: absolute;
            opacity: 0;
            cursor: pointer;
          }
          
          .reminder-option label {
            display: block;
            padding: 16px;
            border: 2px solid #e5e7eb;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.2s ease;
            text-align: center;
            font-weight: 500;
            color: #374151;
          }
          
          .reminder-option input[type="radio"]:checked + label {
            border-color: var(--sage-green);
            background: #f0fdf4;
            color: var(--sage-green);
          }
          
          .reminder-option:hover label {
            border-color: #d1d5db;
            background: #f9fafb;
          }
          
          .reminder-option.recommended label::after {
            content: '推荐';
            position: absolute;
            top: -8px;
            right: 8px;
            background: var(--sage-green);
            color: white;
            font-size: 10px;
            padding: 2px 6px;
            border-radius: 10px;
            font-weight: 600;
          }
          
          .reminder-actions {
            display: flex;
            gap: 12px;
            justify-content: flex-end;
            padding-top: 20px;
            border-top: 1px solid #f3f4f6;
          }
          
          .btn {
            padding: 12px 24px;
            border: none;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s ease;
          }
          
          .btn-secondary {
            background: #f3f4f6;
            color: #374151;
          }
          
          .btn-secondary:hover {
            background: #e5e7eb;
          }
          
          .btn-primary {
            background: var(--sage-green);
            color: white;
          }
          
          .btn-primary:hover:not(:disabled) {
            background: #7a8a4a;
          }
          
          .btn-primary:disabled {
            background: #9ca3af;
            cursor: not-allowed;
          }
          
          .validation-errors {
            margin-top: 16px;
            padding: 12px;
            background: #fef2f2;
            border: 1px solid #fecaca;
            border-radius: 8px;
            color: #dc2626;
            font-size: 14px;
          }
          
          .validation-errors ul {
            margin: 0;
            padding-left: 20px;
          }
          
          .reminder-info {
            display: flex;
            align-items: center;
            gap: 8px;
            color: #6b7280;
            font-size: 12px;
            margin-top: 8px;
          }
          
          @media (max-width: 768px) {
            .reminder-options {
              grid-template-columns: 1fr;
            }
            
            .reminder-actions {
              flex-direction: column;
            }
            
            .btn {
              width: 100%;
            }
          }
        `}
      </style>

      <div className="reminder-header">
        <Bell className="icon" size={24} />
        <h3>默认过期提醒</h3>
      </div>

      <div className="reminder-description">
        <strong>双重守护提醒系统</strong><br />
        设置全局默认的提醒规则，所有新物品将自动继承这些设置。
        您也可以在分类或单个物品级别进行个性化调整。
        <div className="reminder-source-info" style={{ 
          marginTop: '12px', 
          padding: '8px 12px', 
          background: '#f3f4f6', 
          borderRadius: '6px', 
          fontSize: '13px',
          color: '#6b7280'
        }}>
          <Info size={14} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
          <strong>规则继承说明：</strong> 单个物品设置 > 分类设置 > 全局设置
        </div>
      </div>

      {/* 第一次提醒设置 */}
      <div className="reminder-section">
        <h4>
          <Bell size={16} />
          第一次提醒
        </h4>
        <div className="reminder-options">
          {REMINDER_OPTIONS.firstReminder.map((option) => (
            <div 
              key={option.value} 
              className={`reminder-option ${option.value === 15 ? 'recommended' : ''}`}
            >
              <input
                type="radio"
                id={`first-${option.value}`}
                name="firstReminder"
                value={option.value}
                checked={firstReminderDays === option.value}
                onChange={(e) => setFirstReminderDays(parseInt(e.target.value))}
              />
              <label htmlFor={`first-${option.value}`}>
                {option.label}
              </label>
            </div>
          ))}
        </div>
        <div className="reminder-info">
          <Info size={12} />
          第一次提醒帮助您提前规划物品使用，避免过期
          {firstReminderDays === 0 && (
            <div style={{ 
              marginTop: '4px', 
              color: '#dc2626', 
              fontSize: '11px',
              fontStyle: 'italic'
            }}>
              注意：设置为"不提醒"时，单个物品仍可覆盖此设置
            </div>
          )}
        </div>
      </div>

      {/* 第二次提醒设置 */}
      <div className="reminder-section">
        <h4>
          <Bell size={16} />
          第二次提醒
        </h4>
        <div className="reminder-options">
          {REMINDER_OPTIONS.secondReminder.map((option) => (
            <div 
              key={option.value} 
              className={`reminder-option ${option.value === 0 ? 'recommended' : ''}`}
            >
              <input
                type="radio"
                id={`second-${option.value}`}
                name="secondReminder"
                value={option.value}
                checked={secondReminderDays === option.value}
                onChange={(e) => setSecondReminderDays(parseInt(e.target.value))}
              />
              <label htmlFor={`second-${option.value}`}>
                {option.label}
              </label>
            </div>
          ))}
        </div>
        <div className="reminder-info">
          <Info size={12} />
          第二次提醒确保您不会错过物品过期时间
          {secondReminderDays === 0 && (
            <div style={{ 
              marginTop: '4px', 
              color: '#dc2626', 
              fontSize: '11px',
              fontStyle: 'italic'
            }}>
              注意：设置为"不提醒"时，单个物品仍可覆盖此设置
            </div>
          )}
        </div>
      </div>

      {/* 验证错误 */}
      {validationErrors.length > 0 && (
        <div className="validation-errors">
          <strong>设置验证失败：</strong>
          <ul>
            {validationErrors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* 操作按钮 */}
      <div className="reminder-actions">
        <button 
          className="btn btn-secondary" 
          onClick={handleReset}
          disabled={isLoading}
        >
          重置为默认
        </button>
        <button 
          className="btn btn-primary" 
          onClick={handleSave}
          disabled={isLoading}
        >
          {isLoading ? '保存中...' : '保存设置'}
        </button>
      </div>

      {/* 高级设置说明 */}
      <div className="advanced-settings" style={{ 
        marginTop: '24px', 
        padding: '16px', 
        background: '#f8fafc', 
        border: '1px solid #e2e8f0', 
        borderRadius: '8px' 
      }}>
        <h4 style={{ margin: '0 0 12px 0', color: '#374151', fontSize: '14px' }}>
          <Info size={16} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
          高级设置说明
        </h4>
        <div style={{ fontSize: '13px', color: '#6b7280', lineHeight: '1.5' }}>
          <p><strong>提醒规则优先级：</strong></p>
          <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
            <li><strong>单个物品设置</strong> - 最高优先级，可以覆盖任何上层设置</li>
            <li><strong>分类设置</strong> - 中等优先级，覆盖全局设置</li>
            <li><strong>全局设置</strong> - 基础优先级，作为默认值</li>
          </ul>
          <p><strong>重要说明：</strong></p>
          <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
            <li>即使全局设置为"不提醒"，单个物品仍可设置具体的提醒时间</li>
            <li>分类级别的"不提醒"设置同样可以被单个物品覆盖</li>
            <li>建议根据物品的重要程度设置不同的提醒策略</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ReminderSettings; 