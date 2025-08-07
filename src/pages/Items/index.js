import React, { useState, useEffect, useRef } from 'react';
import { Search, Trash2, Clock, AlertTriangle, Pill, Droplets, Utensils, Package2, Box, Filter, Edit } from 'lucide-react';
import { useLeanCloudItems } from '../../hooks/useLeanCloudItems';
import { getExpiryStatus, getExpiryText, CATEGORIES, MEDICINE_TAGS } from '../../utils/itemUtils';
import toast from 'react-hot-toast';
import EmptyState from '../../components/EmptyState';
import { useNavigate } from 'react-router-dom';

const Items = () => {
  const { items, deleteItem, updateItem } = useLeanCloudItems();
  const navigate = useNavigate();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [selectedMedicineTags, setSelectedMedicineTags] = useState([]);
  const [searchHistory, setSearchHistory] = useState([]);
  const [showSearchHistory, setShowSearchHistory] = useState(false);
  
  // 高级筛选状态
  const [showAdvancedFilter, setShowAdvancedFilter] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState({
    expiryStatus: '',
    brand: '',
    quantityRange: '',
    dateRange: {
      start: '',
      end: ''
    }
  });

  
  const searchRef = useRef(null);

  // 从URL参数初始化筛选条件
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const categoryFromUrl = urlParams.get('category');
    if (categoryFromUrl) {
      setCategoryFilter(decodeURIComponent(categoryFromUrl));
    }
  }, []);

  // 获取分类统计
  const getCategoryStats = () => {
    const categories = ['药品', '护肤品', '食品', '日用品', '其他'];
    return categories.map(category => ({
      name: category,
      count: items.filter(item => item.category === category).length,
      icon: getCategoryIcon(category)
    }));
  };

  // 获取分类图标
  const getCategoryIcon = (category) => {
    switch (category) {
      case '药品': return <Pill size={20} />;
      case '护肤品': return <Droplets size={20} />;
      case '食品': return <Utensils size={20} />;
      case '日用品': return <Package2 size={20} />;
      case '其他': return <Box size={20} />;
      default: return <Box size={20} />;
    }
  };

  // 清除所有筛选条件
  const clearAllFilters = () => {
    setSearchTerm('');
    setCategoryFilter('');
    setSelectedMedicineTags([]);
    setAdvancedFilters({
      expiryStatus: '',
      brand: '',
      quantityRange: '',
      dateRange: {
        start: '',
        end: ''
      }
    });
  };

  // 检查是否有筛选条件
  const hasActiveFilters = searchTerm || categoryFilter || selectedMedicineTags.length > 0 || 
    advancedFilters.expiryStatus || advancedFilters.brand || advancedFilters.quantityRange ||
    advancedFilters.dateRange.start || advancedFilters.dateRange.end;

  const handleCategoryFilterChange = (e) => {
    const category = e.target.value;
    setCategoryFilter(category);
    
    // 如果切换分类，清空药品标签筛选
    if (category !== '药品') {
      setSelectedMedicineTags([]);
    }
  };

  const handleMedicineTagFilterChange = (tag) => {
    setSelectedMedicineTags(prev => {
      if (prev.includes(tag)) {
        return prev.filter(t => t !== tag);
      } else {
        return [...prev, tag];
      }
    });
  };

  // 高级筛选处理
  const handleAdvancedFilterChange = (field, value) => {
    setAdvancedFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleDateRangeChange = (field, value) => {
    setAdvancedFilters(prev => ({
      ...prev,
      dateRange: {
        ...prev.dateRange,
        [field]: value
      }
    }));
  };



  const handleDelete = (id) => {
    if (window.confirm('确定要删除这个物品吗？')) {
      try {
        deleteItem(id);
      } catch (error) {
        toast.error('删除失败，请重试');
      }
    }
  };

  const handleUseOne = async (id, currentQuantity) => {
    if (currentQuantity <= 0) {
      toast.error('数量不足');
      return;
    }
    
    try {
      const newQuantity = currentQuantity - 1;
      await updateItem(id, { quantity: newQuantity });
      
      if (newQuantity === 0) {
        toast.success('物品已用完');
      } else {
        toast.success('已使用一个');
      }
    } catch (error) {
      console.error('使用物品失败:', error);
      toast.error('操作失败，请重试');
    }
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
    setShowSearchHistory(false);
    
    // 添加到搜索历史
    if (term.trim() && !searchHistory.includes(term.trim())) {
      setSearchHistory(prev => [term.trim(), ...prev.slice(0, 4)]);
    }
  };

  const clearSearchHistory = () => {
    setSearchHistory([]);
  };

  // 点击外部关闭搜索历史
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchHistory(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // 高级筛选逻辑
  const matchesAdvancedFilters = (item) => {
    // 过期状态筛选
    if (advancedFilters.expiryStatus) {
      const itemStatus = getExpiryStatus(item.expiryDate);
      if (itemStatus !== advancedFilters.expiryStatus) {
        return false;
      }
    }

    // 品牌筛选
    if (advancedFilters.brand && item.brand) {
      if (!item.brand.toLowerCase().includes(advancedFilters.brand.toLowerCase())) {
        return false;
      }
    }

    // 数量范围筛选
    if (advancedFilters.quantityRange) {
      const [min, max] = advancedFilters.quantityRange.split('-').map(Number);
      if (min && item.quantity < min) return false;
      if (max && item.quantity > max) return false;
    }

    // 日期范围筛选
    if (advancedFilters.dateRange.start || advancedFilters.dateRange.end) {
      const itemDate = new Date(item.expiryDate);
      if (advancedFilters.dateRange.start) {
        const startDate = new Date(advancedFilters.dateRange.start);
        if (itemDate < startDate) return false;
      }
      if (advancedFilters.dateRange.end) {
        const endDate = new Date(advancedFilters.dateRange.end);
        if (itemDate > endDate) return false;
      }
    }

    return true;
  };

  // 筛选物品
  const filteredItems = items.filter(item => {
    // 文本搜索
    const searchFields = [
      item.name,
      item.brand,
      item.category,
      item.notes,
      ...(item.medicineTags || [])
    ].filter(Boolean).join(' ').toLowerCase();
    
    const matchesSearch = !searchTerm || searchFields.includes(searchTerm.toLowerCase());
    
    // 分类筛选
    const matchesCategory = !categoryFilter || item.category === categoryFilter;
    
    // 药品标签筛选
    let matchesMedicineTags = true;
    if (categoryFilter === '药品' && selectedMedicineTags.length > 0) {
      matchesMedicineTags = item.medicineTags && 
        selectedMedicineTags.some(tag => item.medicineTags.includes(tag));
    }
    
    // 高级筛选
    const matchesAdvanced = matchesAdvancedFilters(item);
    
    return matchesSearch && matchesCategory && matchesMedicineTags && matchesAdvanced;
  });

  return (
    <div>
      <div className="card">
        <h2>物品管理</h2>
        
        {/* 分类统计卡片 */}
        <div className="category-stats">
          <div className="category-scroll">
            {getCategoryStats().map((category, index) => (
              <button 
                key={category.name} 
                onClick={() => setCategoryFilter(categoryFilter === category.name ? '' : category.name)}
                className={`category-card ${categoryFilter === category.name ? 'active' : ''}`}
              >
                <div className="category-icon">{category.icon}</div>
                <div className="category-name">{category.name}</div>
                <div className="category-count">{category.count}</div>
              </button>
            ))}
          </div>
        </div>
        
        {/* 搜索和筛选 */}
        <div className="form-group" ref={searchRef}>
          <label htmlFor="searchInput">搜索物品</label>
          <div style={{ position: 'relative' }}>
            <Search size={20} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#666' }} />
            <input
              type="text"
              id="searchInput"
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              onFocus={() => setShowSearchHistory(true)}
              placeholder="搜索物品名称、品牌、分类、症状、备注..."
              style={{ paddingLeft: '40px' }}
            />
            {searchTerm && (
              <button
                onClick={() => handleSearch('')}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#666',
                  fontSize: '18px'
                }}
              >
                ×
              </button>
            )}
          </div>
          
          {/* 搜索历史 */}
          {showSearchHistory && searchHistory.length > 0 && (
            <div style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              background: 'white',
              border: '1px solid #ddd',
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              zIndex: 1000,
              maxHeight: '200px',
              overflowY: 'auto'
            }}>
              <div style={{ padding: '10px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', color: '#666' }}>搜索历史</span>
                <button
                  onClick={clearSearchHistory}
                  style={{ background: 'none', border: 'none', color: '#999', cursor: 'pointer', fontSize: '12px' }}
                >
                  清空
                </button>
              </div>
              {searchHistory.map((term, index) => (
                <div
                  key={index}
                  onClick={() => handleSearch(term)}
                  style={{
                    padding: '10px',
                    cursor: 'pointer',
                    borderBottom: '1px solid #f5f5f5',
                    fontSize: '14px'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#f5f5f5'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
                >
                  {term}
                </div>
              ))}
            </div>
          )}
          
        </div>

        {/* 高级筛选 */}
        <div style={{ marginTop: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <button
              onClick={() => setShowAdvancedFilter(!showAdvancedFilter)}
              className="btn btn-secondary"
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <Filter size={16} />
              高级筛选
              {hasActiveFilters && <span style={{ background: 'var(--sage-green)', color: 'white', borderRadius: '50%', width: '16px', height: '16px', fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>!</span>}
            </button>
            

          </div>

          {showAdvancedFilter && (
            <div style={{ 
              padding: '15px', 
              background: '#f8f9fa', 
              borderRadius: '8px',
              border: '1px solid #e9ecef'
            }}>
              <h4 style={{ margin: '0 0 15px 0', color: '#333' }}>高级筛选条件</h4>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
                {/* 过期状态筛选 */}
                <div className="form-group">
                  <label>过期状态</label>
                  <select
                    value={advancedFilters.expiryStatus}
                    onChange={(e) => handleAdvancedFilterChange('expiryStatus', e.target.value)}
                  >
                    <option value="">全部状态</option>
                    <option value="normal">正常</option>
                    <option value="expiring-soon">即将过期</option>
                    <option value="expired">已过期</option>
                  </select>
                </div>

                {/* 品牌筛选 */}
                <div className="form-group">
                  <label>品牌</label>
                  <input
                    type="text"
                    value={advancedFilters.brand}
                    onChange={(e) => handleAdvancedFilterChange('brand', e.target.value)}
                    placeholder="输入品牌名称"
                  />
                </div>

                {/* 数量范围筛选 */}
                <div className="form-group">
                  <label>数量范围</label>
                  <select
                    value={advancedFilters.quantityRange}
                    onChange={(e) => handleAdvancedFilterChange('quantityRange', e.target.value)}
                  >
                    <option value="">全部数量</option>
                    <option value="1-5">1-5个</option>
                    <option value="6-10">6-10个</option>
                    <option value="11-20">11-20个</option>
                    <option value="21-">21个以上</option>
                  </select>
                </div>

                {/* 过期日期范围 */}
                <div className="form-group">
                  <label>过期日期范围</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="date"
                      value={advancedFilters.dateRange.start}
                      onChange={(e) => handleDateRangeChange('start', e.target.value)}
                      placeholder="开始日期"
                      style={{ flex: 1 }}
                    />
                    <span style={{ alignSelf: 'center', color: '#666' }}>至</span>
                    <input
                      type="date"
                      value={advancedFilters.dateRange.end}
                      onChange={(e) => handleDateRangeChange('end', e.target.value)}
                      placeholder="结束日期"
                      style={{ flex: 1 }}
                    />
                  </div>
                </div>
              </div>


            </div>
          )}
        </div>

        {/* 筛选结果统计 */}
        {hasActiveFilters && (
          <div style={{ 
            marginTop: '15px', 
            padding: '10px 15px', 
            background: 'var(--sage-green-light)', 
            borderRadius: '6px',
            border: '1px solid var(--sage-green)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <span style={{ fontSize: '14px', color: 'var(--sage-green)' }}>
                找到 {filteredItems.length} 个物品
              </span>
            </div>
          </div>
        )}

        {/* 物品列表 */}
        <div className="items-list">
          {filteredItems.length === 0 ? (
            hasActiveFilters ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                <Search size={48} style={{ marginBottom: '20px', opacity: 0.5 }} />
                <p>没有找到符合条件的物品</p>
                <button
                  onClick={clearAllFilters}
                  className="btn btn-secondary"
                  style={{ marginTop: '10px' }}
                >
                  清除所有筛选条件
                </button>
              </div>
            ) : (
              <EmptyState
                message="这里还没有物品哦，开始记录你的第一个物品吧！"
                onActionClick={() => window.location.href = '/add'}
                actionText="添加第一个物品"
              />
            )
          ) : (
            filteredItems.map((item, index) => {
              const expiryStatus = getExpiryStatus(item.expiryDate);
              const expiryInfo = getExpiryText(item.expiryDate);
              
              return (
                <div 
                  key={`${item.id}-${index}`} 
                  className={`item ${expiryStatus}`}
                  style={{ cursor: 'pointer' }}
                  onClick={() => navigate(`/edit/${item.id}`)}
                >
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
                  <div 
                    style={{ marginTop: '10px', display: 'flex', gap: '8px', justifyContent: 'flex-end' }}
                    onClick={(e) => e.stopPropagation()} // 防止触发卡片的点击事件
                  >
                    {item.quantity > 0 && (
                      <button
                        className="btn btn-secondary"
                        onClick={() => handleUseOne(item.id, item.quantity)}
                        style={{ padding: '6px 12px', fontSize: '12px' }}
                      >
                        -1
                      </button>
                    )}
                    <button
                      className="btn"
                      onClick={() => navigate(`/edit/${item.id}`)}
                      style={{ 
                        padding: '6px 12px', 
                        fontSize: '12px',
                        background: 'var(--sage-green)',
                        color: 'white'
                      }}
                    >
                      <Edit size={14} style={{ marginRight: '4px' }} />
                      编辑
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
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default Items; 