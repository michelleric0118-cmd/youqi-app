import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle, XCircle, Trash2, Calendar, Download, CheckSquare, Square } from 'lucide-react';
import { useLeanCloudItems } from '../../hooks/useLeanCloudItems';
import { getExpiryStatus, getExpiryText } from '../../utils/itemUtils';

const Expiring = () => {
  const { getExpiringItems, deleteItem, updateItem } = useLeanCloudItems();
  const [filter, setFilter] = useState('all');
  const [showActions, setShowActions] = useState({});
  const [selectedItems, setSelectedItems] = useState([]);
  const [showBatchActions, setShowBatchActions] = useState(false);

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
    if (window.confirm('确定要删除这个物品吗？')) {
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
      alert('请先选择要删除的物品');
      return;
    }
    
    if (window.confirm(`确定要删除选中的 ${selectedItems.length} 个物品吗？`)) {
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
      alert('请先选择要延期的物品');
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
      alert('没有数据可以导出');
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

  return (
    <div>
      <div className="card">
        <h2>过期管理</h2>
        
        {/* 筛选选项 */}
        <div className="tabs">
          {filterOptions.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              className={`tab ${filter === value ? 'active' : ''}`}
              onClick={() => setFilter(value)}
            >
              <Icon size={16} style={{ marginRight: '8px' }} />
              {label}
              {value === 'all' && ` (${stats.all})`}
              {value === 'expired' && ` (${stats.expired})`}
              {value === 'expiring-soon' && ` (${stats.expiringSoon})`}
              {value === 'expiring-month' && ` (${stats.expiringMonth})`}
            </button>
          ))}
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
                onClick={() => handleBatchDelay(7)}
                className="btn btn-secondary"
                style={{ padding: '6px 12px', fontSize: '12px' }}
              >
                延期7天
              </button>
              <button
                onClick={() => handleBatchDelay(30)}
                className="btn btn-secondary"
                style={{ padding: '6px 12px', fontSize: '12px' }}
              >
                延期30天
              </button>
              <button
                onClick={() => handleBatchDelay(90)}
                className="btn btn-secondary"
                style={{ padding: '6px 12px', fontSize: '12px' }}
              >
                延期90天
              </button>
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
            <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
              <Clock size={48} style={{ marginBottom: '20px', opacity: 0.5 }} />
              <p>暂无{filter === 'all' ? '' : filter === 'expired' ? '已过期' : filter === 'expiring-soon' ? '即将过期' : '30天内过期'}的物品</p>
            </div>
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
                        数量: {item.quantity} | 
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
                          className="btn btn-secondary"
                          onClick={() => toggleActions(item.id)}
                          style={{ padding: '6px 12px', fontSize: '12px' }}
                        >
                          {showActions[item.id] ? '隐藏' : '操作'}
                        </button>
                      </div>
                      
                      {/* 展开的操作选项 */}
                      {showActions[item.id] && (
                        <div style={{ 
                          marginTop: '10px', 
                          padding: '10px', 
                          background: '#f8f9fa', 
                          borderRadius: '6px',
                          display: 'flex',
                          gap: '8px',
                          flexWrap: 'wrap'
                        }}>
                          <button
                            className="btn btn-secondary"
                            onClick={() => handleDelay(item, 7)}
                            style={{ padding: '6px 12px', fontSize: '12px' }}
                          >
                            <Calendar size={14} style={{ marginRight: '4px' }} />
                            延期7天
                          </button>
                          <button
                            className="btn btn-secondary"
                            onClick={() => handleDelay(item, 30)}
                            style={{ padding: '6px 12px', fontSize: '12px' }}
                          >
                            <Calendar size={14} style={{ marginRight: '4px' }} />
                            延期30天
                          </button>
                          <button
                            className="btn btn-secondary"
                            onClick={() => handleDelay(item, 90)}
                            style={{ padding: '6px 12px', fontSize: '12px' }}
                          >
                            <Calendar size={14} style={{ marginRight: '4px' }} />
                            延期90天
                          </button>
                          <button
                            className="btn btn-danger"
                            onClick={() => handleDelete(item.id)}
                            style={{ padding: '6px 12px', fontSize: '12px' }}
                          >
                            <Trash2 size={14} style={{ marginRight: '4px' }} />
                            删除
                          </button>
                        </div>
                      )}
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