import React, { useState } from 'react';
import { Trash2, Edit, Download, Upload, Check, X, FolderPlus } from 'lucide-react';
import './BatchOperations.css';

const BatchOperations = ({ 
  selectedItems, 
  onBatchDelete, 
  onBatchEdit, 
  onExport, 
  onImport,
  onMoveToCategory,
  categoryOptions = [],
  onClearSelection,
  onOpenBatchEdit
}) => {
  const [showConfirm, setShowConfirm] = useState(false);
  const [operation, setOperation] = useState(null);
  const [moveTarget, setMoveTarget] = useState('');

  const handleBatchDelete = () => {
    setOperation('delete');
    setShowConfirm(true);
  };

  const handleBatchEdit = () => {
    setOperation('edit');
    setShowConfirm(true);
  };

  const confirmOperation = () => {
    if (operation === 'delete') {
      onBatchDelete(selectedItems);
    } else if (operation === 'edit') {
      onBatchEdit(selectedItems);
    }
    setShowConfirm(false);
    setOperation(null);
  };

  const cancelOperation = () => {
    setShowConfirm(false);
    setOperation(null);
  };

  if (selectedItems.length === 0) {
    return null;
  }

  return (
    <>
      <div className="batch-operations">
        <div className="batch-info">
          <span className="selected-count">
            已选择 {selectedItems.length} 项
          </span>
          <button 
            className="clear-selection-btn"
            onClick={onClearSelection}
          >
            <X size={16} />
            清除选择
          </button>
        </div>

        <div className="batch-actions">
          <button 
            className="batch-btn batch-delete-btn"
            onClick={handleBatchDelete}
            title="批量删除"
          >
            <Trash2 size={16} />
            删除
          </button>

          <button 
            className="batch-btn batch-edit-btn"
            onClick={() => { onOpenBatchEdit && onOpenBatchEdit(); }}
            title="批量编辑"
          >
            <Edit size={16} />
            编辑
          </button>

          <button 
            className="batch-btn batch-export-btn"
            onClick={() => onExport(selectedItems)}
            title="导出选中项目"
          >
            <Download size={16} />
            导出
          </button>

          <button 
            className="batch-btn batch-import-btn"
            onClick={onImport}
            title="导入数据"
          >
            <Upload size={16} />
            导入
          </button>

          {/* 批量移动到分类 */}
          {categoryOptions.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <select value={moveTarget} onChange={(e)=>setMoveTarget(e.target.value)}>
                <option value="">移动到分类</option>
                {categoryOptions.map(c => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
              <button className="batch-btn" onClick={()=>{ if(moveTarget) onMoveToCategory(selectedItems, moveTarget); }} title="移动到分类">
                <FolderPlus size={16} />
                移动
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 确认对话框 */}
      {showConfirm && (
        <div className="batch-confirm-overlay">
          <div className="batch-confirm-modal">
            <div className="confirm-header">
              <h3>
                {operation === 'delete' ? '确认批量删除' : '确认批量编辑'}
              </h3>
            </div>
            
            <div className="confirm-content">
              <p>
                {operation === 'delete' 
                  ? `删除选中的 ${selectedItems.length} 个物品？`
                  : `编辑选中的 ${selectedItems.length} 个物品？`
                }
              </p>
              
              {operation === 'delete' && (
                <div className="delete-warning">
                  <p>⚠️ 此操作无法撤销</p>
                </div>
              )}
            </div>

            <div className="confirm-actions">
              <button 
                className="cancel-btn"
                onClick={cancelOperation}
              >
                取消
              </button>
              <button 
                className={`confirm-btn ${operation === 'delete' ? 'delete-confirm' : 'edit-confirm'}`}
                onClick={confirmOperation}
              >
                {operation === 'delete' ? '确认删除' : '确认编辑'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BatchOperations; 