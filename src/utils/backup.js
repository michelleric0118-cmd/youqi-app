// 数据备份和恢复管理
class BackupManager {
  constructor() {
    this.backupKey = 'youqi_backup_data';
    this.settingsKey = 'youqi_backup_settings';
  }

  // 创建完整备份
  async createBackup(items, settings = {}) {
    try {
      const backup = {
        version: '1.0',
        timestamp: new Date().toISOString(),
        items: items,
        settings: settings,
        metadata: {
          totalItems: items.length,
          categories: [...new Set(items.map(item => item.category))],
          brands: [...new Set(items.map(item => item.brand).filter(Boolean))]
        }
      };

      localStorage.setItem(this.backupKey, JSON.stringify(backup));
      
      const backupSettings = {
        lastBackup: new Date().toISOString(),
        autoBackup: settings.autoBackup || false,
        backupInterval: settings.backupInterval || 'daily'
      };
      localStorage.setItem(this.settingsKey, JSON.stringify(backupSettings));

      return backup;
    } catch (error) {
      console.error('创建备份失败:', error);
      throw error;
    }
  }

  // 从本地存储恢复数据
  async restoreFromLocal() {
    try {
      const backupData = localStorage.getItem(this.backupKey);
      if (!backupData) {
        throw new Error('没有找到备份数据');
      }

      const backup = JSON.parse(backupData);
      
      if (!this.validateBackup(backup)) {
        throw new Error('备份数据格式无效');
      }

      return backup;
    } catch (error) {
      console.error('从本地恢复失败:', error);
      throw error;
    }
  }

  // 验证备份数据
  validateBackup(backup) {
    if (!backup || typeof backup !== 'object') {
      return false;
    }

    if (!backup.version || !backup.timestamp || !backup.items) {
      return false;
    }

    if (!Array.isArray(backup.items)) {
      return false;
    }

    for (const item of backup.items) {
      if (!item.id || !item.name) {
        return false;
      }
    }

    return true;
  }

  // 导出备份文件
  exportBackup(backup, format = 'json') {
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    
    const blob = new Blob([JSON.stringify(backup, null, 2)], {
      type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `有期备份_${timestamp}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  // 获取备份信息
  getBackupInfo() {
    try {
      const backupData = localStorage.getItem(this.backupKey);
      const settingsData = localStorage.getItem(this.settingsKey);
      
      if (!backupData) {
        return null;
      }

      const backup = JSON.parse(backupData);
      const settings = settingsData ? JSON.parse(settingsData) : {};

      return {
        timestamp: backup.timestamp,
        version: backup.version,
        totalItems: backup.metadata?.totalItems || 0,
        categories: backup.metadata?.categories || [],
        brands: backup.metadata?.brands || [],
        lastBackup: settings.lastBackup,
        autoBackup: settings.autoBackup || false,
        backupInterval: settings.backupInterval || 'daily'
      };
    } catch (error) {
      console.error('获取备份信息失败:', error);
      return null;
    }
  }

  // 删除备份
  deleteBackup() {
    try {
      localStorage.removeItem(this.backupKey);
      localStorage.removeItem(this.settingsKey);
      console.log('备份已删除');
    } catch (error) {
      console.error('删除备份失败:', error);
    }
  }
}

// 创建单例实例
const backupManager = new BackupManager();

export default backupManager; 