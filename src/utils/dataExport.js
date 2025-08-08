import Papa from 'papaparse';
import * as XLSX from 'xlsx';

class DataExportManager {
  constructor() {
    this.supportedFormats = ['json', 'csv', 'xlsx'];
  }

  // 导出数据
  async exportData(items, format = 'json', options = {}) {
    try {
      switch (format.toLowerCase()) {
        case 'json':
          return this.exportToJSON(items, options);
        case 'csv':
          return this.exportToCSV(items, options);
        case 'xlsx':
          return this.exportToXLSX(items, options);
        default:
          throw new Error(`不支持的导出格式: ${format}`);
      }
    } catch (error) {
      console.error('导出数据失败:', error);
      throw error;
    }
  }

  // 导出为JSON格式
  exportToJSON(items, options = {}) {
    const exportData = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      itemCount: items.length,
      items: items,
      metadata: {
        appVersion: process.env.REACT_APP_VERSION || '1.0.0',
        ...options.metadata
      }
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const filename = options.filename || `youqi-export-${Date.now()}.json`;
    this.downloadFile(dataBlob, filename);
    
    return { success: true, filename, itemCount: items.length };
  }

  // 导出为CSV格式
  exportToCSV(items, options = {}) {
    const csvData = items.map(item => ({
      '名称': item.name || '',
      '分类': item.category || '',
      '过期日期': item.expiryDate || '',
      '数量': item.quantity || '',
      '品牌': item.brand || '',
      '位置': item.location || '',
      '备注': item.notes || '',
      '创建时间': item.createdAt || '',
      '更新时间': item.updatedAt || ''
    }));

    const csv = Papa.unparse(csvData, {
      header: true,
      delimiter: options.delimiter || ',',
      ...options.csvOptions
    });

    const dataBlob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const filename = options.filename || `youqi-export-${Date.now()}.csv`;
    this.downloadFile(dataBlob, filename);
    
    return { success: true, filename, itemCount: items.length };
  }

  // 导出为XLSX格式
  exportToXLSX(items, options = {}) {
    // 这里需要安装xlsx库
    // import * as XLSX from 'xlsx';
    
    const worksheet = items.map(item => ({
      '名称': item.name || '',
      '分类': item.category || '',
      '过期日期': item.expiryDate || '',
      '数量': item.quantity || '',
      '品牌': item.brand || '',
      '位置': item.location || '',
      '备注': item.notes || '',
      '创建时间': item.createdAt || '',
      '更新时间': item.updatedAt || ''
    }));

    // 创建工作簿
    const workbook = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(worksheet);
    
    // 设置列宽
    const colWidths = [
      { wch: 20 }, // 名称
      { wch: 15 }, // 分类
      { wch: 15 }, // 过期日期
      { wch: 10 }, // 数量
      { wch: 15 }, // 品牌
      { wch: 15 }, // 位置
      { wch: 30 }, // 备注
      { wch: 20 }, // 创建时间
      { wch: 20 }  // 更新时间
    ];
    ws['!cols'] = colWidths;

    XLSX.utils.book_append_sheet(workbook, ws, '物品列表');
    
    const filename = options.filename || `youqi-export-${Date.now()}.xlsx`;
    XLSX.writeFile(workbook, filename);
    
    return { success: true, filename, itemCount: items.length };
  }

  // 导入数据
  async importData(file, format = 'auto') {
    try {
      const detectedFormat = format === 'auto' ? this.detectFormat(file) : format;
      
      switch (detectedFormat) {
        case 'json':
          return await this.importFromJSON(file);
        case 'csv':
          return await this.importFromCSV(file);
        case 'xlsx':
          return await this.importFromXLSX(file);
        default:
          throw new Error(`不支持的导入格式: ${detectedFormat}`);
      }
    } catch (error) {
      console.error('导入数据失败:', error);
      throw error;
    }
  }

  // 检测文件格式
  detectFormat(file) {
    const extension = file.name.split('.').pop().toLowerCase();
    
    switch (extension) {
      case 'json':
        return 'json';
      case 'csv':
        return 'csv';
      case 'xlsx':
      case 'xls':
        return 'xlsx';
      default:
        throw new Error(`无法识别的文件格式: ${extension}`);
    }
  }

  // 从JSON导入
  async importFromJSON(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);
          
          // 验证数据格式
          if (!this.validateImportData(data)) {
            reject(new Error('无效的导入数据格式'));
            return;
          }
          
          // 提取物品数据
          const items = data.items || data;
          const processedItems = this.processImportedItems(items);
          
          resolve({
            success: true,
            items: processedItems,
            metadata: data.metadata || {},
            itemCount: processedItems.length
          });
        } catch (error) {
          reject(new Error('解析JSON文件失败'));
        }
      };
      reader.onerror = () => reject(new Error('读取文件失败'));
      reader.readAsText(file);
    });
  }

  // 从CSV导入
  async importFromCSV(file) {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          try {
            if (results.errors.length > 0) {
              reject(new Error(`CSV解析错误: ${results.errors[0].message}`));
              return;
            }
            
            const processedItems = this.processImportedItems(results.data);
            
            resolve({
              success: true,
              items: processedItems,
              itemCount: processedItems.length,
              errors: results.errors
            });
          } catch (error) {
            reject(error);
          }
        },
        error: (error) => {
          reject(new Error(`CSV解析失败: ${error.message}`));
        }
      });
    });
  }

  // 从XLSX导入
  async importFromXLSX(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          
          // 获取第一个工作表
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          
          // 转换为JSON
          const jsonData = XLSX.utils.sheet_to_json(worksheet);
          const processedItems = this.processImportedItems(jsonData);
          
          resolve({
            success: true,
            items: processedItems,
            itemCount: processedItems.length
          });
        } catch (error) {
          reject(new Error('解析XLSX文件失败'));
        }
      };
      reader.onerror = () => reject(new Error('读取文件失败'));
      reader.readAsArrayBuffer(file);
    });
  }

  // 验证导入数据
  validateImportData(data) {
    if (!data) return false;
    
    // 检查是否有items数组
    if (data.items && Array.isArray(data.items)) {
      return data.items.length > 0;
    }
    
    // 检查data本身是否是数组
    if (Array.isArray(data)) {
      return data.length > 0;
    }
    
    return false;
  }

  // 处理导入的物品数据
  processImportedItems(items) {
    return items.map((item, index) => ({
      id: item.id || `imported_${Date.now()}_${index}`,
      name: item.name || item['名称'] || '',
      category: item.category || item['分类'] || '',
      expiryDate: item.expiryDate || item['过期日期'] || '',
      quantity: parseInt(item.quantity || item['数量']) || 1,
      brand: item.brand || item['品牌'] || '',
      location: item.location || item['位置'] || '',
      notes: item.notes || item['备注'] || '',
      createdAt: item.createdAt || item['创建时间'] || new Date().toISOString(),
      updatedAt: item.updatedAt || item['更新时间'] || new Date().toISOString()
    })).filter(item => item.name.trim() !== ''); // 过滤空名称的物品
  }

  // 下载文件
  downloadFile(blob, filename) {
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    URL.revokeObjectURL(link.href);
  }

  // 批量导出
  async batchExport(items, formats = ['json'], options = {}) {
    const results = [];
    
    for (const format of formats) {
      try {
        const result = await this.exportData(items, format, {
          ...options,
          filename: `${options.filename || 'youqi-export'}-${Date.now()}.${format}`
        });
        results.push(result);
      } catch (error) {
        results.push({ success: false, format, error: error.message });
      }
    }
    
    return results;
  }

  // 获取支持的格式
  getSupportedFormats() {
    return this.supportedFormats;
  }

  // 验证文件格式
  validateFileFormat(file, allowedFormats = this.supportedFormats) {
    const format = this.detectFormat(file);
    return allowedFormats.includes(format);
  }
}

export default new DataExportManager(); 