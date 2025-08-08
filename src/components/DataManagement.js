import React, { useState, useEffect } from 'react';
import { 
  Download, 
  Upload, 
  RefreshCw, 
  Database, 
  Cloud, 
  HardDrive,
  AlertTriangle,
  CheckCircle,
  Clock,
  Trash2,
  FileText,
  Settings
} from 'lucide-react';
import backupManager from '../utils/backupManager';
import syncManager from '../utils/syncManager';
import dataExportManager from '../utils/dataExport';
import i18n from '../utils/i18n';
import ErrorMessage from './ErrorMessage';

const DataManagement = ({ items, onItemsUpdate }) => {
  const [activeTab, setActiveTab] = useState('backup');
  const [backups, setBackups] = useState([]);
  const [cloudBackups, setCloudBackups] = useState([]);
  const [syncStatus, setSyncStatus] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    loadBackups();
    loadSyncStatus();
  }, []);

  // 加载备份列表
  const loadBackups = async () => {
    try {
      const localBackups = await backupManager.getLocalBackups();
      const cloudBackups = await backupManager.getCloudBackups();
      setBackups(localBackups);
      setCloudBackups(cloudBackups);
    } catch (error) {
      setError('加载备份列表失败');
    }
  };

  // 加载同步状态
  const loadSyncStatus = () => {
    const status = syncManager.getSyncStatus();
    setSyncStatus(status);
  };

  // 创建备份
  const handleCreateBackup = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      await backupManager.createBackup(items, { type: 'manual' });
      await loadBackups();
      setSuccess('备份创建成功');
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      setError('创建备份失败');
    } finally {
      setIsLoading(false);
    }
  };

  // 恢复备份
  const handleRestoreBackup = async (backupId) => {
    if (!window.confirm('确定要恢复此备份吗？当前数据将被覆盖。')) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const restoredItems = await backupManager.restoreBackup(backupId);
      onItemsUpdate(restoredItems);
      setSuccess('备份恢复成功');
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      setError('恢复备份失败');
    } finally {
      setIsLoading(false);
    }
  };

  // 删除备份
  const handleDeleteBackup = async (backupId) => {
    if (!window.confirm('确定要删除此备份吗？')) {
      return;
    }

    try {
      await backupManager.deleteBackup(backupId);
      await loadBackups();
      setSuccess('备份删除成功');
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      setError('删除备份失败');
    }
  };

  // 强制同步
  const handleForceSync = async () => {
    setIsLoading(true);
    setError(null);

    try {
      await syncManager.forceSync();
      loadSyncStatus();
      setSuccess('同步完成');
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      setError('同步失败');
    } finally {
      setIsLoading(false);
    }
  };

  // 导出数据
  const handleExport = async (format) => {
    try {
      await dataExportManager.exportData(items, format);
      setSuccess(`${format.toUpperCase()}导出成功`);
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      setError('导出失败');
    }
  };

  // 导入数据
  const handleImport = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await dataExportManager.importData(file);
      onItemsUpdate(result.items);
      setSuccess(`成功导入 ${result.itemCount} 个物品`);
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      setError('导入失败');
    } finally {
      setIsLoading(false);
      event.target.value = ''; // 清空文件选择
    }
  };

  // 格式化时间
  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleString('zh-CN');
  };

  // 获取备份大小
  const getBackupSize = (backup) => {
    const size = JSON.stringify(backup).length;
    return size > 1024 ? `${(size / 1024).toFixed(1)} KB` : `${size} B`;
  };

  return (
    <div className="data-management">
      <div className="data-management-header">
        <h2>数据管理</h2>
        <p>管理您的数据备份、同步和导入导出</p>
      </div>

      {error && <ErrorMessage error={{ message: error }} />}
      {success && (
        <div className="success-message">
          <CheckCircle size={16} />
          <span>{success}</span>
        </div>
      )}

      <div className="data-management-tabs">
        <button
          className={`tab ${activeTab === 'backup' ? 'active' : ''}`}
          onClick={() => setActiveTab('backup')}
        >
          <Database size={16} />
          备份管理
        </button>
        <button
          className={`tab ${activeTab === 'sync' ? 'active' : ''}`}
          onClick={() => setActiveTab('sync')}
        >
          <Cloud size={16} />
          数据同步
        </button>
        <button
          className={`tab ${activeTab === 'import' ? 'active' : ''}`}
          onClick={() => setActiveTab('import')}
        >
          <Upload size={16} />
          导入导出
        </button>
      </div>

      <div className="data-management-content">
        {activeTab === 'backup' && (
          <div className="backup-section">
            <div className="backup-actions">
              <button
                className="btn btn-primary"
                onClick={handleCreateBackup}
                disabled={isLoading}
              >
                <Database size={16} />
                创建备份
              </button>
            </div>

            <div className="backup-list">
              <h3>本地备份</h3>
              {backups.length === 0 ? (
                <p className="empty-state">暂无备份</p>
              ) : (
                backups.map(backup => (
                  <div key={backup.id} className="backup-item">
                    <div className="backup-info">
                      <div className="backup-header">
                        <span className="backup-name">备份 {backup.id.slice(-8)}</span>
                        <span className="backup-time">{formatTime(backup.timestamp)}</span>
                      </div>
                      <div className="backup-details">
                        <span>{backup.itemCount} 个物品</span>
                        <span>{getBackupSize(backup)}</span>
                        <span>{backup.metadata?.type || '手动'}</span>
                      </div>
                    </div>
                    <div className="backup-actions">
                      <button
                        className="btn btn-small"
                        onClick={() => backupManager.exportBackup(backup)}
                      >
                        <Download size={14} />
                      </button>
                      <button
                        className="btn btn-small"
                        onClick={() => handleRestoreBackup(backup.id)}
                      >
                        <RefreshCw size={14} />
                      </button>
                      <button
                        className="btn btn-small btn-danger"
                        onClick={() => handleDeleteBackup(backup.id)}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'sync' && (
          <div className="sync-section">
            <div className="sync-status">
              <h3>同步状态</h3>
              <div className="status-grid">
                <div className="status-item">
                  <span className="status-label">同步状态:</span>
                  <span className={`status-value ${syncStatus.isSyncing ? 'syncing' : 'idle'}`}>
                    {syncStatus.isSyncing ? '同步中' : '空闲'}
                  </span>
                </div>
                <div className="status-item">
                  <span className="status-label">最后同步:</span>
                  <span className="status-value">
                    {syncStatus.lastSyncTime ? formatTime(syncStatus.lastSyncTime) : '从未'}
                  </span>
                </div>
                <div className="status-item">
                  <span className="status-label">队列长度:</span>
                  <span className="status-value">{syncStatus.queueLength || 0}</span>
                </div>
              </div>
            </div>

            <div className="sync-actions">
              <button
                className="btn btn-primary"
                onClick={handleForceSync}
                disabled={isLoading || syncStatus.isSyncing}
              >
                <RefreshCw size={16} />
                强制同步
              </button>
            </div>
          </div>
        )}

        {activeTab === 'import' && (
          <div className="import-export-section">
            <div className="export-section">
              <h3>导出数据</h3>
              <div className="export-options">
                <button
                  className="btn btn-outline"
                  onClick={() => handleExport('json')}
                >
                  <FileText size={16} />
                  导出 JSON
                </button>
                <button
                  className="btn btn-outline"
                  onClick={() => handleExport('csv')}
                >
                  <FileText size={16} />
                  导出 CSV
                </button>
                <button
                  className="btn btn-outline"
                  onClick={() => handleExport('xlsx')}
                >
                  <FileText size={16} />
                  导出 Excel
                </button>
              </div>
            </div>

            <div className="import-section">
              <h3>导入数据</h3>
              <div className="import-options">
                <label className="file-input">
                  <input
                    type="file"
                    accept=".json,.csv,.xlsx,.xls"
                    onChange={handleImport}
                    disabled={isLoading}
                  />
                  <span className="file-input-text">
                    <Upload size={16} />
                    选择文件 (JSON, CSV, Excel)
                  </span>
                </label>
              </div>
            </div>
          </div>
        )}
      </div>

      {isLoading && (
        <div className="loading-overlay">
          <div className="loading-spinner">
            <RefreshCw size={24} className="animate-spin" />
            <span>处理中...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataManagement; 