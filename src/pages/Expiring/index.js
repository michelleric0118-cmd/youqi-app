import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle, XCircle, Trash2, Calendar, Download, CheckSquare, Square } from 'lucide-react';
import { useLeanCloudItems } from '../../hooks/useLeanCloudItems';
import { getExpiryStatus, getExpiryText } from '../../utils/itemUtils';
import toast from 'react-hot-toast';
import EmptyState from '../../components/EmptyState';

const Expiring = () => {
  const { getExpiringItems, deleteItem, updateItem } = useLeanCloudItems();
  const [filter, setFilter] = useState('all');
  const [showActions, setShowActions] = useState({});
  const [selectedItems, setSelectedItems] = useState([]);
  const [showBatchActions, setShowBatchActions] = useState(false);
  
  // 快捷编辑状态
  const [editingQuantity, setEditingQuantity] = useState(null);
  const [editingValue, setEditingValue] = useState('');

  const filterOptions = [
    { value: 'expired', label: '已过期', icon: XCircle },
    { value: 'expiring-soon', label: '7天内过期', icon: AlertTriangle },
    { value: 'expiring-month', label: '30天内过期', icon: Clock },
    { value: 'all', label: '全部', icon: Clock }
  ];

  // 从URL参数初始化筛选条件
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const filterFromUrl = urlParams.get('filter');
    if (filterFromUrl && ['expired', 'expiring-soon', 'expiring-month', 'all'].includes(filterFromUrl)) {
      setFilter(filterFromUrl);
    }
  }, []);

  const getFilterStats = () => {
    const all = getExpiringItems('all').length;
    const expired = getExpiringItems('expired').length;
    const expiringSoon = getExpiringItems('expiring-soon').length;
    const expiringMonth = getExpiringItems('expiring-month').length;

    return { all, expired, expiringSoon, expiringMonth };
  };

  // 根据筛选条件获取正确的物品列表
  const getFilteredItems = () => {
    if (filter === 'all') {
      // "全部"显示所有30天内过期的物品
      return getExpiringItems('all');
    } else {
      // 其他筛选条件只显示对应分类的物品
      return getExpiringItems(filter);
    }
  };

  const expiringItems = getFilteredItems();

  const stats = getFilterStats();

  const handleDelete = (id) => {
    // 找到要删除的物品，获取其名称
    const itemToDelete = sortedItems.find(item => item.id === id);
    const itemName = itemToDelete ? itemToDelete.name : '这个物品';
    
    if (window.confirm(`删除「${itemName}」？\n\n此操作无法撤销。`)) {
      deleteItem(id);
      // 从选中列表中移除
      setSelectedItems(prev => prev.filter(itemId => itemId !== id));
    }
  };

  const toggleActions = (id) => {
    setShowActions(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // 延期功能
  const handleDelay = (item, days = 30) => {
    const currentDate = new Date(item.expiryDate);
    const newDate = new Date(currentDate.getTime() + days * 24 * 60 * 60 * 1000);
    const newExpiryDate = newDate.toISOString().split('T')[0];
    
    updateItem(item.id, {
      ...item,
      expiryDate: newExpiryDate
    });
    
    // 关闭操作面板
    setShowActions(prev => ({
      ...prev,
      [item.id]: false
    }));
  };

  // 批量选择
  const toggleSelectItem = (id) => {
    setSelectedItems(prev => {
      if (prev.includes(id)) {
        return prev.filter(itemId => itemId !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  // 全选/取消全选
  const toggleSelectAll = () => {
    if (selectedItems.length === sortedItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(sortedItems.map(item => item.id));
    }
  };

  // 批量删除
  const handleBatchDelete = () => {
    if (selectedItems.length === 0) {
      toast.error('请先选择要删除的物品');
      return;
    }
    
    if (window.confirm(`删除选中的 ${selectedItems.length} 个物品？\n\n此操作无法撤销。`)) {
      selectedItems.forEach(id => {
        deleteItem(id);
      });
      setSelectedItems([]);
      setShowBatchActions(false);
    }
  };

  // 批量延期
  const handleBatchDelay = (days = 30) => {
    if (selectedItems.length === 0) {
      toast.error('请先选择要延期的物品');
      return;
    }
    
    selectedItems.forEach(id => {
      const item = sortedItems.find(item => item.id === id);
      if (item) {
        handleDelay(item, days);
      }
    });
    setSelectedItems([]);
    setShowBatchActions(false);
  };

  // 导出过期物品
  const exportExpiringItems = () => {
    const itemsToExport = sortedItems.map(item => ({
      名称: item.name,
      分类: item.category,
      品牌: item.brand || '',
      数量: item.quantity,
      过期日期: item.expiryDate,
      过期状态: getExpiryText(item.expiryDate).text,
      备注: item.notes || '',
      药品标签: item.medicineTags ? item.medicineTags.join(', ') : '',
    }));

    if (itemsToExport.length === 0) {
      toast.error('没有数据可以导出');
      return;
    }

    // 创建CSV内容
    const headers = Object.keys(itemsToExport[0]);
    const csvContent = [
      headers.join(','),
      ...itemsToExport.map(row => 
        headers.map(header => {
          const value = row[header] || '';
          return `"${value.toString().replace(/"/g, '""')}"`;
        }).join(',')
      )
    ].join('\n');

    // 创建下载链接
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `过期物品清单_${filter === 'all' ? '全部' : filter === 'expired' ? '已过期' : filter === 'expiring-soon' ? '即将过期' : '30天内过期'}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getExpiryPriority = (item) => {
    const status = getExpiryStatus(item.expiryDate);
    switch (status) {
      case 'expired': return 1;
      case 'expiring-soon': return 2;
      case 'expiring-week': return 3;
      default: return 4;
    }
  };

  // 按过期优先级排序
  const sortedItems = [...expiringItems].sort((a, b) => {
    return getExpiryPriority(a) - getExpiryPriority(b);
  });

  // 快捷编辑数量
  const handleQuickEditQuantity = (id, currentQuantity) => {
    setEditingQuantity(id);
    setEditingValue(currentQuantity.toString());
  };

  // 保存快捷编辑的数量
  const handleSaveQuickEdit = async () => {
    if (!editingQuantity || !editingValue.trim()) return;
    
    const newQuantity = parseInt(editingValue);
    if (isNaN(newQuantity) || newQuantity < 0) {
      toast.error('请输入有效的数量');
      return;
    }
    
    try {
      await updateItem(editingQuantity, { quantity: newQuantity });
      toast.success('数量更新成功！');
      setEditingQuantity(null);
      setEditingValue('');
    } catch (error) {
      console.error('更新数量失败:', error);
      toast.error('更新失败，请重试');
    }
  };

  // 取消快捷编辑
  const handleCancelQuickEdit = () => {
    setEditingQuantity(null);
    setEditingValue('');
  };

  // 处理快捷编辑的键盘事件
  const handleQuickEditKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSaveQuickEdit();
    } else if (e.key === 'Escape') {
      handleCancelQuickEdit();
    }
  };

  return (
    <div>
      <div className="card">
        <h2>过期管理</h2>
        
        {/* 分类统计卡片 */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', 
          gap: '15px', 
          marginBottom: '20px' 
        }}>
          {filterOptions.map(({ value, label, icon: Icon }) => {
            const count = value === 'all' ? stats.all : 
                         value === 'expired' ? stats.expired : 
                         value === 'expiring-soon' ? stats.expiringSoon : 
                         stats.expiringMonth;
            
            return (
              <button
                key={value}
                onClick={() => setFilter(value)}
                style={{
                  padding: '20px 15px',
                  background: filter === value ? '#8A9A5B' : 'white',
                  color: filter === value ? 'white' : '#333',
                  border: '1px solid #e9ecef',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.2s ease',
                  boxShadow: filter === value ? '0 4px 12px rgba(138, 154, 91, 0.3)' : '0 2px 8px rgba(0,0,0,0.1)'
                }}
              >
                <Icon size={24} style={{ color: filter === value ? 'white' : '#8A9A5B' }} />
                <div style={{ fontSize: '14px', fontWeight: '600' }}>{label}</div>
                <div style={{ fontSize: '18px', fontWeight: 'bold', color: filter === value ? 'white' : '#8A9A5B' }}>
                  {count}
                </div>
              </button>
            );
          })}
        </div>

        {/* 批量操作工具栏 */}
        {sortedItems.length > 0 && (
          <div style={{ 
            marginTop: '15px', 
            padding: '15px', 
            background: '#f8f9fa', 
            borderRadius: '8px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '10px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button
                onClick={toggleSelectAll}
                className="btn btn-secondary"
                style={{ padding: '6px 12px', fontSize: '12px' }}
              >
                {selectedItems.length === sortedItems.length ? <CheckSquare size={14} /> : <Square size={14} />}
                {selectedItems.length === sortedItems.length ? '取消全选' : '全选'}
              </button>
              {selectedItems.length > 0 && (
                <span style={{ fontSize: '14px', color: '#666' }}>
                  已选择 {selectedItems.length} 个物品
                </span>
              )}
            </div>
            
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button
                onClick={() => setShowBatchActions(!showBatchActions)}
                className="btn btn-secondary"
                style={{ padding: '6px 12px', fontSize: '12px' }}
              >
                批量操作
              </button>
              <button
                onClick={exportExpiringItems}
                className="btn btn-secondary"
                style={{ padding: '6px 12px', fontSize: '12px', background: '#28a745', color: 'white' }}
              >
                <Download size={14} style={{ marginRight: '4px' }} />
                导出
              </button>
            </div>
          </div>
        )}

        {/* 批量操作面板 */}
        {showBatchActions && selectedItems.length > 0 && (
          <div style={{ 
            marginTop: '10px', 
            padding: '15px', 
            background: '#fff3cd', 
            borderRadius: '8px',
            border: '1px solid #ffeaa7'
          }}>
            <h4 style={{ margin: '0 0 10px 0', color: '#856404' }}>批量操作</h4>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button
                onClick={handleBatchDelete}
                className="btn btn-danger"
                style={{ padding: '6px 12px', fontSize: '12px' }}
              >
                <Trash2 size={14} style={{ marginRight: '4px' }} />
                批量删除
              </button>
            </div>
          </div>
        )}

        {/* 物品列表 */}
        <div className="items-list">
          {sortedItems.length === 0 ? (
            <EmptyState
              type="expiring"
              onActionClick={() => window.location.href = '/items'}
              actionText="查看全部物品"
              showIconOnly={false}
            />
          ) : (
            sortedItems.map((item, index) => {
              const expiryStatus = getExpiryStatus(item.expiryDate);
              const expiryInfo = getExpiryText(item.expiryDate);
              const isSelected = selectedItems.includes(item.id);
              
              return (
                <div key={`${item.id}-${index}`} className={`item ${expiryStatus} ${isSelected ? 'selected' : ''}`}>
                  {/* 选择框 */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                    <button
                      onClick={() => toggleSelectItem(item.id)}
                      className="btn btn-secondary"
                      style={{ 
                        padding: '4px', 
                        fontSize: '12px',
                        background: isSelected ? 'var(--sage-green)' : 'transparent',
                        color: isSelected ? 'white' : '#666',
                        border: '1px solid #ddd'
                      }}
                    >
                      {isSelected ? <CheckSquare size={12} /> : <Square size={12} />}
                    </button>
                    
                    <div style={{ flex: 1 }}>
                      <div className="item-header">
                        <div className="item-name">{item.name}</div>
                        <div className="item-category">{item.category}</div>
                      </div>
                      <div className="item-details">
                        {item.brand && `品牌: ${item.brand} | `}
                        数量: 
                        {editingQuantity === item.id ? (
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', marginLeft: '4px' }}>
                            <input
                              type="number"
                              value={editingValue}
                              onChange={(e) => setEditingValue(e.target.value)}
                              onKeyDown={handleQuickEditKeyDown}
                              onBlur={handleSaveQuickEdit}
                              style={{
                                width: '60px',
                                padding: '2px 6px',
                                border: '1px solid #007bff',
                                borderRadius: '4px',
                                fontSize: '14px'
                              }}
                              autoFocus
                              min="0"
                              max="999"
                            />
                            <button
                              onClick={handleSaveQuickEdit}
                              style={{
                                padding: '2px 6px',
                                background: '#28a745',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '12px'
                              }}
                              title="保存"
                            >
                              ✓
                            </button>
                            <button
                              onClick={handleCancelQuickEdit}
                              style={{
                                padding: '2px 6px',
                                background: '#dc3545',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '12px'
                              }}
                              title="取消"
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <span 
                            className="quantity-editable"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleQuickEditQuantity(item.id, item.quantity);
                            }}
                            style={{ 
                              cursor: 'pointer', 
                              padding: '2px 6px', 
                              background: '#f0f0f0', 
                              borderRadius: '4px',
                              marginLeft: '4px',
                              userSelect: 'none'
                            }}
                            title="点击编辑数量"
                          >
                            {item.quantity}
                          </span>
                        )}
                        | 
                        <span className={expiryInfo.className}> {expiryInfo.text}</span>
                      </div>
                      {item.notes && (
                        <div className="item-details" style={{ marginTop: '5px' }}>
                          备注: {item.notes}
                        </div>
                      )}
                      {item.medicineTags && item.medicineTags.length > 0 && (
                        <div className="selected-tags">
                          {item.medicineTags.map(tag => (
                            <span key={tag} className="selected-tag">{tag}</span>
                          ))}
                        </div>
                      )}
                      
                      {/* 操作按钮 */}
                      <div style={{ marginTop: '10px', display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <button
                          className="btn btn-danger"
                          onClick={() => handleDelete(item.id)}
                          style={{ padding: '6px 12px', fontSize: '12px' }}
                        >
                          <Trash2 size={14} style={{ marginRight: '4px' }} />
                          删除
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {sortedItems.length > 0 && (
          <div style={{ marginTop: '20px', padding: '15px', background: '#f8f9fa', borderRadius: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <strong>共找到 {sortedItems.length} 个{filter === 'all' ? '' : filter === 'expired' ? '已过期' : filter === 'expiring-soon' ? '即将过期' : '30天内过期'}的物品</strong>
              </div>
              <div style={{ display: 'flex', gap: '15px', fontSize: '14px', color: '#666' }}>
                <span>已过期：{sortedItems.filter(item => getExpiryStatus(item.expiryDate) === 'expired').length}</span>
                <span>即将过期：{sortedItems.filter(item => getExpiryStatus(item.expiryDate) === 'expiring-soon').length}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Expiring; 