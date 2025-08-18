import React, { useState, useEffect } from 'react';
import { Bell, BellOff, Smartphone, CheckCircle, XCircle, Info } from 'lucide-react';
import { 
  checkNotificationPermission, 
  requestNotificationPermission, 
  subscribeToPush, 
  unsubscribeFromPush,
  getPushSubscriptionStatus 
} from '../utils/pushNotificationUtils';

const PushNotificationSettings = () => {
  const [permission, setPermission] = useState('default');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState(null);
  const [showInfo, setShowInfo] = useState(false);

  useEffect(() => {
    // 初始化状态
    updateStatus();
  }, []);

  const updateStatus = async () => {
    try {
      const currentPermission = await checkNotificationPermission();
      setPermission(currentPermission);
      
      const subscriptionStatus = getPushSubscriptionStatus();
      setIsSubscribed(!!subscriptionStatus.subscription);
      setStatus(subscriptionStatus);
    } catch (error) {
      console.error('获取推送状态失败:', error);
    }
  };

  const handleEnableNotifications = async () => {
    setIsLoading(true);
    try {
      const newPermission = await requestNotificationPermission();
      setPermission(newPermission);
      
      if (newPermission === 'granted') {
        // 权限获取成功，订阅推送
        await subscribeToPush();
        setIsSubscribed(true);
      }
      
      await updateStatus();
    } catch (error) {
      console.error('启用通知失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisableNotifications = async () => {
    setIsLoading(true);
    try {
      await unsubscribeFromPush();
      setIsSubscribed(false);
      await updateStatus();
    } catch (error) {
      console.error('禁用通知失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getPermissionStatusText = () => {
    switch (permission) {
      case 'granted':
        return '已允许';
      case 'denied':
        return '已拒绝';
      case 'default':
        return '未设置';
      default:
        return '不支持';
    }
  };

  const getPermissionStatusColor = () => {
    switch (permission) {
      case 'granted':
        return '#10b981';
      case 'denied':
        return '#ef4444';
      case 'default':
        return '#f59e0b';
      default:
        return '#6b7280';
    }
  };

  const getPermissionStatusIcon = () => {
    switch (permission) {
      case 'granted':
        return <CheckCircle size={20} color="#10b981" />;
      case 'denied':
        return <XCircle size={20} color="#ef4444" />;
      case 'default':
        return <Info size={20} color="#f59e0b" />;
      default:
        return <XCircle size={20} color="#6b7280" />;
    }
  };

  return (
    <div className="push-notification-settings">
      <style>
        {`
          .push-notification-settings {
            background: white;
            border-radius: 12px;
            padding: 24px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            margin-bottom: 24px;
          }
          
          .push-notification-header {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 20px;
          }
          
          .push-notification-title {
            font-size: 18px;
            font-weight: 600;
            color: #1f2937;
            margin: 0;
          }
          
          .push-notification-status {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 8px 12px;
            background: #f8fafc;
            border-radius: 8px;
            font-size: 14px;
            color: #64748b;
          }
          
          .push-notification-description {
            color: #6b7280;
            font-size: 14px;
            line-height: 1.6;
            margin-bottom: 20px;
          }
          
          .push-notification-actions {
            display: flex;
            gap: 12px;
            flex-wrap: wrap;
          }
          
          .push-notification-btn {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 10px 20px;
            border: none;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s ease;
          }
          
          .push-notification-btn.primary {
            background: var(--sage-green);
            color: white;
          }
          
          .push-notification-btn.primary:hover {
            background: #6b7a3a;
            transform: translateY(-1px);
          }
          
          .push-notification-btn.secondary {
            background: #f3f4f6;
            color: #374151;
            border: 1px solid #d1d5db;
          }
          
          .push-notification-btn.secondary:hover {
            background: #e5e7eb;
          }
          
          .push-notification-btn:disabled {
            opacity: 0.6;
            cursor: not-allowed;
            transform: none;
          }
          
          .push-notification-info {
            margin-top: 16px;
            padding: 12px;
            background: #eff6ff;
            border: 1px solid #bfdbfe;
            border-radius: 8px;
            font-size: 13px;
            color: #1e40af;
            line-height: 1.5;
          }
          
          .push-notification-info-header {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 8px;
            font-weight: 500;
          }
          
          .push-notification-features {
            margin-top: 16px;
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 16px;
          }
          
          .push-notification-feature {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 16px;
            background: #f9fafb;
            border-radius: 8px;
            border: 1px solid #e5e7eb;
          }
          
          .push-notification-feature-icon {
            width: 40px;
            height: 40px;
            background: var(--sage-green);
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
          }
          
          .push-notification-feature-text {
            flex: 1;
          }
          
          .push-notification-feature-title {
            font-size: 14px;
            font-weight: 500;
            color: #1f2937;
            margin: 0 0 4px 0;
          }
          
          .push-notification-feature-description {
            font-size: 12px;
            color: #6b7280;
            margin: 0;
            line-height: 1.4;
          }
          
          @media (max-width: 768px) {
            .push-notification-settings {
              padding: 16px;
            }
            
            .push-notification-actions {
              flex-direction: column;
            }
            
            .push-notification-btn {
              width: 100%;
              justify-content: center;
            }
            
            .push-notification-features {
              grid-template-columns: 1fr;
            }
          }
        `}
      </style>

      <div className="push-notification-header">
        <Bell size={24} color="var(--sage-green)" />
        <h3 className="push-notification-title">推送通知设置</h3>
        <div className="push-notification-status">
          {getPermissionStatusIcon()}
          <span>状态: {getPermissionStatusText()}</span>
        </div>
      </div>

      <p className="push-notification-description">
        启用推送通知后，即使您没有打开"有期"应用，也能及时收到物品过期提醒，确保不会错过任何重要信息。
      </p>

      <div className="push-notification-actions">
        {permission === 'default' && (
          <button
            className="push-notification-btn primary"
            onClick={handleEnableNotifications}
            disabled={isLoading}
          >
            <Bell size={16} />
            {isLoading ? '请求中...' : '启用推送通知'}
          </button>
        )}

        {permission === 'granted' && isSubscribed && (
          <button
            className="push-notification-btn secondary"
            onClick={handleDisableNotifications}
            disabled={isLoading}
          >
            <BellOff size={16} />
            {isLoading ? '处理中...' : '禁用推送通知'}
          </button>
        )}

        {permission === 'denied' && (
          <div className="push-notification-info">
            <div className="push-notification-info-header">
              <Info size={16} />
              通知权限已被拒绝
            </div>
            <p>
              您已在浏览器设置中拒绝了通知权限。如需重新启用，请在浏览器设置中手动开启"有期"的通知权限。
            </p>
          </div>
        )}
      </div>

      {permission === 'granted' && (
        <div className="push-notification-features">
          <div className="push-notification-feature">
            <div className="push-notification-feature-icon">
              <Bell size={20} />
            </div>
            <div className="push-notification-feature-text">
              <div className="push-notification-feature-title">过期提醒</div>
              <div className="push-notification-feature-description">
                物品即将过期时及时通知
              </div>
            </div>
          </div>

          <div className="push-notification-feature">
            <div className="push-notification-feature-icon">
              <Smartphone size={20} />
            </div>
            <div className="push-notification-feature-text">
              <div className="push-notification-feature-title">后台推送</div>
              <div className="push-notification-feature-description">
                无需打开应用即可接收通知
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="push-notification-info">
        <div className="push-notification-info-header">
          <Info size={16} />
          关于推送通知
        </div>
        <p>
          推送通知使用标准的Web Push技术，确保您的隐私安全。通知内容仅包含必要的提醒信息，
          不会收集或传输任何个人数据。您可以随时在设置中关闭推送通知。
        </p>
      </div>
    </div>
  );
};

export default PushNotificationSettings; 