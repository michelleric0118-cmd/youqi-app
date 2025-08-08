import { AV } from 'leancloud-storage';

class BackupManager {
  constructor() {
    this.backupKey = 'youqi-backups';
    this.maxBackups = 10; // 最大备份数量
    this.autoBackupInterval = 24 * 60 * 60 * 1000; // 24小时自动备份
  }

  // 创建备份
  async createBackup(items, metadata = {}) {
    try {
      const backup = {
        id: this.generateBackupId(),
        timestamp: new Date().toISOString(),
        version: '1.0',
        itemCount: items.length,
        data: items,
        metadata: {
          ...metadata,
          createdAt: new Date().toISOString(),
          appVersion: process.env.REACT_APP_VERSION || '1.0.0'
        }
      };

      // 保存到本地存储
      await this.saveBackupToLocal(backup);
      
      // 保存到云端
      await this.saveBackupToCloud(backup);

      // 清理旧备份
      await this.cleanupOldBackups();

      return backup;
    } catch (error) {
      console.error('创建备份失败:', error);
      throw error;
    }
  }

  // 生成备份ID
  generateBackupId() {
    return `backup_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // 保存备份到本地
  async saveBackupToLocal(backup) {
    try {
      const backups = await this.getLocalBackups();
      backups.unshift(backup);
      
      // 限制本地备份数量
      if (backups.length > this.maxBackups) {
        backups.splice(this.maxBackups);
      }

      localStorage.setItem(this.backupKey, JSON.stringify(backups));
      return true;
    } catch (error) {
      console.error('保存本地备份失败:', error);
      throw error;
    }
  }

  // 保存备份到云端
  async saveBackupToCloud(backup) {
    try {
      const Backup = AV.Object.extend('Backup');
      const backupObj = new Backup();
      
      backupObj.set('backupId', backup.id);
      backupObj.set('timestamp', backup.timestamp);
      backupObj.set('version', backup.version);
      backupObj.set('itemCount', backup.itemCount);
      backupObj.set('data', backup.data);
      backupObj.set('metadata', backup.metadata);
      backupObj.set('userId', AV.User.current()?.id || 'anonymous');

      await backupObj.save();
      return true;
    } catch (error) {
      console.error('保存云端备份失败:', error);
      // 云端备份失败不影响本地备份
      return false;
    }
  }

  // 获取本地备份列表
  async getLocalBackups() {
    try {
      const backups = localStorage.getItem(this.backupKey);
      return backups ? JSON.parse(backups) : [];
    } catch (error) {
      console.error('获取本地备份失败:', error);
      return [];
    }
  }

  // 获取云端备份列表
  async getCloudBackups() {
    try {
      const Backup = AV.Object.extend('Backup');
      const query = new AV.Query(Backup);
      query.descending('timestamp');
      query.limit(50);
      
      const results = await query.find();
      return results.map(obj => ({
        id: obj.get('backupId'),
        timestamp: obj.get('timestamp'),
        version: obj.get('version'),
        itemCount: obj.get('itemCount'),
        metadata: obj.get('metadata'),
        isCloud: true
      }));
    } catch (error) {
      console.error('获取云端备份失败:', error);
      return [];
    }
  }

  // 恢复备份
  async restoreBackup(backupId) {
    try {
      // 先尝试从本地恢复
      let backup = await this.getBackupFromLocal(backupId);
      
      if (!backup) {
        // 本地没有，从云端获取
        backup = await this.getBackupFromCloud(backupId);
      }

      if (!backup) {
        throw new Error('备份不存在');
      }

      // 验证备份数据
      if (!this.validateBackup(backup)) {
        throw new Error('备份数据无效');
      }

      return backup.data;
    } catch (error) {
      console.error('恢复备份失败:', error);
      throw error;
    }
  }

  // 从本地获取备份
  async getBackupFromLocal(backupId) {
    const backups = await this.getLocalBackups();
    return backups.find(backup => backup.id === backupId);
  }

  // 从云端获取备份
  async getBackupFromCloud(backupId) {
    try {
      const Backup = AV.Object.extend('Backup');
      const query = new AV.Query(Backup);
      query.equalTo('backupId', backupId);
      
      const result = await query.first();
      if (result) {
        return {
          id: result.get('backupId'),
          timestamp: result.get('timestamp'),
          version: result.get('version'),
          itemCount: result.get('itemCount'),
          data: result.get('data'),
          metadata: result.get('metadata')
        };
      }
      return null;
    } catch (error) {
      console.error('从云端获取备份失败:', error);
      return null;
    }
  }

  // 验证备份数据
  validateBackup(backup) {
    return backup && 
           backup.id && 
           backup.timestamp && 
           backup.data && 
           Array.isArray(backup.data);
  }

  // 删除备份
  async deleteBackup(backupId) {
    try {
      // 删除本地备份
      const backups = await this.getLocalBackups();
      const filteredBackups = backups.filter(backup => backup.id !== backupId);
      localStorage.setItem(this.backupKey, JSON.stringify(filteredBackups));

      // 删除云端备份
      await this.deleteCloudBackup(backupId);

      return true;
    } catch (error) {
      console.error('删除备份失败:', error);
      throw error;
    }
  }

  // 删除云端备份
  async deleteCloudBackup(backupId) {
    try {
      const Backup = AV.Object.extend('Backup');
      const query = new AV.Query(Backup);
      query.equalTo('backupId', backupId);
      
      const result = await query.first();
      if (result) {
        await result.destroy();
      }
      return true;
    } catch (error) {
      console.error('删除云端备份失败:', error);
      return false;
    }
  }

  // 清理旧备份
  async cleanupOldBackups() {
    try {
      const backups = await this.getLocalBackups();
      if (backups.length > this.maxBackups) {
        const newBackups = backups.slice(0, this.maxBackups);
        localStorage.setItem(this.backupKey, JSON.stringify(newBackups));
      }
    } catch (error) {
      console.error('清理旧备份失败:', error);
    }
  }

  // 自动备份
  async autoBackup(items) {
    try {
      const lastBackup = await this.getLastBackupTime();
      const now = Date.now();
      
      if (!lastBackup || (now - lastBackup) > this.autoBackupInterval) {
        await this.createBackup(items, { type: 'auto' });
        return true;
      }
      return false;
    } catch (error) {
      console.error('自动备份失败:', error);
      return false;
    }
  }

  // 获取最后备份时间
  async getLastBackupTime() {
    try {
      const backups = await this.getLocalBackups();
      if (backups.length > 0) {
        return new Date(backups[0].timestamp).getTime();
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  // 导出备份
  exportBackup(backup) {
    const dataStr = JSON.stringify(backup, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `youqi-backup-${backup.id}.json`;
    link.click();
  }

  // 导入备份
  async importBackup(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const backup = JSON.parse(e.target.result);
          if (this.validateBackup(backup)) {
            resolve(backup);
          } else {
            reject(new Error('无效的备份文件'));
          }
        } catch (error) {
          reject(new Error('解析备份文件失败'));
        }
      };
      reader.onerror = () => reject(new Error('读取文件失败'));
      reader.readAsText(file);
    });
  }
}

export default new BackupManager(); 