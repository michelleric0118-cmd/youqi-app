import React, { useState } from 'react';
import { QrCode, Download, Upload, Globe, Trash2, Edit } from 'lucide-react';
import { demoItems } from '../utils/demoData';
import dataExportManager from '../utils/dataExport';
import './FeatureTest.css';

const FeatureTest = ({ onOpenQRScanner, onOpenDataImport, onOpenLanguageSettings }) => {
  const [selectedItems, setSelectedItems] = useState([]);
  const [items] = useState(demoItems);

  const handleItemSelect = (itemId) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleSelectAll = () => {
    setSelectedItems(items.map(item => item.id));
  };

  const handleClearSelection = () => {
    setSelectedItems([]);
  };

  const handleBatchDelete = () => {
    console.log('批量删除:', selectedItems);
    setSelectedItems([]);
  };

  const handleBatchEdit = () => {
    console.log('批量编辑:', selectedItems);
  };

  const handleExport = () => {
    const selectedItemsData = items.filter(item => selectedItems.includes(item.id));
    if (selectedItemsData.length > 0) {
      dataExportManager.exportData(selectedItemsData, 'json');
    }
  };

  return (
    <div className="feature-test">
      <div className="test-header">
        <h2>新功能测试</h2>
        <p>测试扫码、批量操作、数据导入导出、多语言等功能</p>
      </div>

      <div className="test-section">
        <h3>功能按钮测试</h3>
        <div className="test-buttons">
          <button 
            className="test-btn"
            onClick={onOpenQRScanner}
          >
            <QrCode size={20} />
            测试扫码功能
          </button>

          <button 
            className="test-btn"
            onClick={onOpenDataImport}
          >
            <Upload size={20} />
            测试数据导入
          </button>

          <button 
            className="test-btn"
            onClick={onOpenLanguageSettings}
          >
            <Globe size={20} />
            测试语言设置
          </button>
        </div>
      </div>

      <div className="test-section">
        <h3>批量操作测试</h3>
        <div className="batch-controls">
          <button 
            className="test-btn secondary"
            onClick={handleSelectAll}
          >
            全选
          </button>
          <button 
            className="test-btn secondary"
            onClick={handleClearSelection}
          >
            清除选择
          </button>
          <span className="selection-info">
            已选择 {selectedItems.length} 项
          </span>
        </div>

        <div className="items-list">
          {items.map(item => (
            <div 
              key={item.id}
              className={`test-item ${selectedItems.includes(item.id) ? 'selected' : ''}`}
              onClick={() => handleItemSelect(item.id)}
            >
              <div className="item-info">
                <div className="item-name">{item.name}</div>
                <div className="item-details">
                  {item.category} | {item.brand} | {item.quantity} {item.unit}
                </div>
                <div className="item-expiry">
                  过期日期: {item.expiryDate}
                </div>
              </div>
              <div className="item-actions">
                <button className="action-btn">
                  <Edit size={16} />
                </button>
                <button className="action-btn danger">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {selectedItems.length > 0 && (
          <div className="batch-actions">
            <button 
              className="test-btn danger"
              onClick={handleBatchDelete}
            >
              <Trash2 size={16} />
              批量删除 ({selectedItems.length})
            </button>
            <button 
              className="test-btn"
              onClick={handleBatchEdit}
            >
              <Edit size={16} />
              批量编辑 ({selectedItems.length})
            </button>
            <button 
              className="test-btn"
              onClick={handleExport}
            >
              <Download size={16} />
              导出选中 ({selectedItems.length})
            </button>
          </div>
        )}
      </div>

      <div className="test-section">
        <h3>功能说明</h3>
        <div className="feature-description">
          <div className="feature-item">
            <h4>扫码功能</h4>
            <p>支持摄像头扫码和手动输入条码，用于快速添加物品</p>
          </div>
          <div className="feature-item">
            <h4>批量操作</h4>
            <p>支持批量选择、删除、编辑、导出物品</p>
          </div>
          <div className="feature-item">
            <h4>数据导入导出</h4>
            <p>支持JSON、CSV格式的数据备份和恢复</p>
          </div>
          <div className="feature-item">
            <h4>多语言支持</h4>
            <p>支持中英文切换，界面文本实时翻译</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeatureTest; 