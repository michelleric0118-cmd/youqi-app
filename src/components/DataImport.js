import React, { useState, useRef } from 'react';
import { Upload, FileText, AlertCircle, CheckCircle, X } from 'lucide-react';
import dataExportManager from '../utils/dataExport';
import './DataImport.css';

const DataImport = ({ onImport, onClose }) => {
  const [file, setFile] = useState(null);
  const [previewData, setPreviewData] = useState(null);
  const [errors, setErrors] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [importMode, setImportMode] = useState('append'); // append, replace
  const fileInputRef = useRef(null);

  const handleFileSelect = async (event) => {
    const selectedFile = event.target.files[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setErrors([]);
    setPreviewData(null);
    setIsLoading(true);

    try {
      const result = await dataExportManager.importData(selectedFile);
      if (result.success) {
        setPreviewData(result.items);
      } else {
        setErrors([result.error || '导入失败']);
      }
    } catch (error) {
      setErrors([error.message]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImport = () => {
    if (previewData && previewData.length > 0) {
      onImport(previewData, importMode);
      onClose();
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const droppedFile = event.dataTransfer.files[0];
    if (droppedFile) {
      fileInputRef.current.files = event.dataTransfer.files;
      handleFileSelect({ target: { files: [droppedFile] } });
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const resetForm = () => {
    setFile(null);
    setPreviewData(null);
    setErrors([]);
    setIsLoading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="data-import-overlay">
      <div className="data-import-modal">
        <div className="import-header">
          <h3>导入数据</h3>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="import-content">
          {/* 文件上传区域 */}
          <div className="upload-section">
            <div 
              className="upload-area"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".json,.csv"
                onChange={handleFileSelect}
                className="file-input"
              />
              
              {!file ? (
                <div className="upload-placeholder">
                  <Upload size={48} />
                  <p>拖拽文件到此处或点击选择文件</p>
                  <p className="upload-hint">支持 JSON 和 CSV 格式</p>
                </div>
              ) : (
                <div className="file-info">
                  <FileText size={24} />
                  <div className="file-details">
                    <p className="file-name">{file.name}</p>
                    <p className="file-size">
                      {(file.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 错误提示 */}
          {errors.length > 0 && (
            <div className="import-errors">
              <div className="error-header">
                <AlertCircle size={20} />
                <span>发现 {errors.length} 个错误</span>
              </div>
              <ul className="error-list">
                {errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}

          {/* 数据预览 */}
          {previewData && previewData.length > 0 && (
            <div className="preview-section">
              <div className="preview-header">
                <CheckCircle size={20} />
                <span>数据预览 ({previewData.length} 项)</span>
              </div>
              
              <div className="preview-table">
                <table>
                  <thead>
                    <tr>
                      <th>物品名称</th>
                      <th>分类</th>
                      <th>品牌</th>
                      <th>数量</th>
                      <th>过期日期</th>
                    </tr>
                  </thead>
                  <tbody>
                    {previewData.slice(0, 5).map((item, index) => (
                      <tr key={index}>
                        <td>{item.name}</td>
                        <td>{item.category}</td>
                        <td>{item.brand}</td>
                        <td>{item.quantity} {item.unit}</td>
                        <td>{item.expiryDate}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {previewData.length > 5 && (
                  <p className="preview-more">
                    还有 {previewData.length - 5} 项数据...
                  </p>
                )}
              </div>

              {/* 导入模式选择 */}
              <div className="import-mode">
                <label>导入模式：</label>
                <div className="mode-options">
                  <label className="mode-option">
                    <input
                      type="radio"
                      name="importMode"
                      value="append"
                      checked={importMode === 'append'}
                      onChange={(e) => setImportMode(e.target.value)}
                    />
                    <span>追加到现有数据</span>
                  </label>
                  <label className="mode-option">
                    <input
                      type="radio"
                      name="importMode"
                      value="replace"
                      checked={importMode === 'replace'}
                      onChange={(e) => setImportMode(e.target.value)}
                    />
                    <span>替换现有数据</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* 加载状态 */}
          {isLoading && (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>正在解析文件...</p>
            </div>
          )}
        </div>

        <div className="import-actions">
          <button 
            className="reset-btn"
            onClick={resetForm}
            disabled={!file}
          >
            重新选择
          </button>
          <button 
            className="import-btn"
            onClick={handleImport}
            disabled={!previewData || previewData.length === 0 || errors.length > 0}
          >
            确认导入
          </button>
        </div>
      </div>
    </div>
  );
};

export default DataImport; 