import React, { useState, useEffect } from 'react';
import { getItemsFromFirebase } from '../services/itemService';

const FirebaseDataViewer = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  const loadItems = async () => {
    try {
      setLoading(true);
      const firebaseItems = await getItemsFromFirebase();
      setItems(firebaseItems);
    } catch (error) {
      console.error('加载Firebase数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
    
    // 设置定时刷新，每30秒自动刷新一次
    const interval = setInterval(loadItems, 30000);
    return () => clearInterval(interval);
  }, []);

  // 使用useMemo优化性能
  const filteredAndSortedItems = React.useMemo(() => {
    const filtered = items.filter(item => {
      const matchesSearch = !searchTerm || 
        item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.notes?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = !categoryFilter || item.category === categoryFilter;
      
      return matchesSearch && matchesCategory;
    });

    return filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      
      // 处理日期字段
      if (sortBy === 'createdAt' || sortBy === 'expiryDate') {
        aValue = aValue ? new Date(aValue) : new Date(0);
        bValue = bValue ? new Date(bValue) : new Date(0);
      }
      
      // 处理字符串字段
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue ? bValue.toLowerCase() : '';
      }
      
      // 处理数字字段
      if (typeof aValue === 'number') {
        aValue = aValue || 0;
        bValue = bValue || 0;
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
      } else {
        return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
      }
    });
  }, [items, searchTerm, categoryFilter, sortBy, sortOrder]);

  const categories = [...new Set(items.map(item => item.category))];
  const totalItems = items.length;
  const filteredItems = filteredAndSortedItems.length;

  const formatDate = (dateString) => {
    if (!dateString) return '未设置';
    return new Date(dateString).toLocaleDateString('zh-CN');
  };

  const getExpiryStatus = (expiryDate) => {
    if (!expiryDate) return { status: 'unknown', text: '未设置' };
    
    const now = new Date();
    const expiry = new Date(expiryDate);
    const diffDays = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return { status: 'expired', text: '已过期' };
    } else if (diffDays <= 7) {
      return { status: 'expiring-soon', text: '即将过期' };
    } else {
      return { status: 'ok', text: '正常' };
    }
  };

  return (
    <div className="card">
      <h3>Firebase数据查看器</h3>
      
      {/* 统计信息 */}
      <div style={{ marginBottom: '20px', padding: '15px', background: '#f5f5f5', borderRadius: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
          <span><strong>总物品数：</strong>{totalItems}</span>
          <span><strong>筛选结果：</strong>{filteredItems}</span>
        </div>
        <button className="btn" onClick={loadItems} disabled={loading}>
          {loading ? '加载中...' : '刷新数据'}
        </button>
      </div>

      {/* 筛选和搜索 */}
      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="搜索物品名称、品牌、分类..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ flex: 1, minWidth: '200px' }}
        />
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          style={{ minWidth: '120px' }}
        >
          <option value="">所有分类</option>
          {categories.map(category => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          style={{ minWidth: '120px' }}
        >
          <option value="createdAt">创建时间</option>
          <option value="name">名称</option>
          <option value="expiryDate">过期时间</option>
          <option value="category">分类</option>
        </select>
        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
          style={{ minWidth: '80px' }}
        >
          <option value="desc">降序</option>
          <option value="asc">升序</option>
        </select>
      </div>

      {/* 数据表格 */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '20px' }}>加载中...</div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f5f5f5' }}>
                <th style={{ padding: '10px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>名称</th>
                <th style={{ padding: '10px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>分类</th>
                <th style={{ padding: '10px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>品牌</th>
                <th style={{ padding: '10px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>数量</th>
                <th style={{ padding: '10px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>过期时间</th>
                <th style={{ padding: '10px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>状态</th>
                <th style={{ padding: '10px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>备注</th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedItems.map((item, index) => {
                const expiryStatus = getExpiryStatus(item.expiryDate);
                // 使用更唯一的key
                const uniqueKey = item.id || `item-${index}-${Date.now()}`;
                return (
                  <tr key={uniqueKey} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '10px' }}>{item.name}</td>
                    <td style={{ padding: '10px' }}>{item.category}</td>
                    <td style={{ padding: '10px' }}>{item.brand || '-'}</td>
                    <td style={{ padding: '10px' }}>{item.quantity}</td>
                    <td style={{ padding: '10px' }}>{formatDate(item.expiryDate)}</td>
                    <td style={{ padding: '10px' }}>
                      <span style={{
                        color: expiryStatus.status === 'expired' ? 'red' :
                               expiryStatus.status === 'expiring-soon' ? 'orange' : 'green',
                        fontWeight: 'bold'
                      }}>
                        {expiryStatus.text}
                      </span>
                    </td>
                    <td style={{ padding: '10px', maxWidth: '200px', wordBreak: 'break-word' }}>
                      {item.notes || '-'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {!loading && filteredAndSortedItems.length === 0 && (
        <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
          没有找到匹配的物品
        </div>
      )}
    </div>
  );
};

export default FirebaseDataViewer; 