import React, { useState, useEffect, useRef } from 'react';
import { Search, Trash2, Pill, Droplets, Utensils, Package2, Box, Filter, Edit } from 'lucide-react';
import { listUserCategories } from '../../services/categoryService';
import { useLeanCloudItems } from '../../hooks/useLeanCloudItems';
import { getExpiryStatus, getExpiryText } from '../../utils/itemUtils';
import toast from 'react-hot-toast';
import EmptyState from '../../components/EmptyState';
import BatchOperations from '../../components/BatchOperations';
import BatchEditModal from '../../components/BatchEditModal';
import ExportModal from '../../components/ExportModal';
import { useNavigate } from 'react-router-dom';
import dataExport from '../../utils/dataExport';

const Items = () => {
  const { items, deleteItem, updateItem } = useLeanCloudItems();
  const navigate = useNavigate();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [customCategories, setCustomCategories] = useState([]);
  const [selectedMedicineTags, setSelectedMedicineTags] = useState([]);
  const [selectedItemsIds, setSelectedItemsIds] = useState([]);
  const [searchHistory, setSearchHistory] = useState([]);
  const [showSearchHistory, setShowSearchHistory] = useState(false);
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false);
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  
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
    
    // 解析filter参数（来自统计页面跳转）
    const filterFromUrl = urlParams.get('filter');
    if (filterFromUrl) {
      switch (filterFromUrl) {
        case 'expired':
          setAdvancedFilters(prev => ({ ...prev, expiryStatus: 'expired' }));
          break;
        case 'expiring-soon':
          setAdvancedFilters(prev => ({ ...prev, expiryStatus: 'expiring-soon' }));
          break;
        case 'normal':
          setAdvancedFilters(prev => ({ ...prev, expiryStatus: 'normal' }));
          break;
        case 'all':
          // 显示所有物品，不设置筛选条件
          break;
        default:
          break;
      }
    }
    
    // 解析category参数
    const categoryFromUrl = urlParams.get('category');
    if (categoryFromUrl) {
      setCategoryFilter(decodeURIComponent(categoryFromUrl));
    }
    
    // 解析search参数
    const searchFromUrl = urlParams.get('search');
    if (searchFromUrl) {
      setSearchTerm(decodeURIComponent(searchFromUrl));
    }
    
    // 解析brand参数
    const brandFromUrl = urlParams.get('brand');
    if (brandFromUrl) {
      setAdvancedFilters(prev => ({ ...prev, brand: decodeURIComponent(brandFromUrl) }));
    }
    // 本地持久化恢复
    try {
      const saved = JSON.parse(localStorage.getItem('youqi-items-filters') || '{}');
      if (saved.searchTerm && !searchFromUrl) setSearchTerm(saved.searchTerm);
      if (saved.categoryFilter && !categoryFromUrl) setCategoryFilter(saved.categoryFilter);
      if (saved.advancedFilters) setAdvancedFilters(prev => ({ ...prev, ...saved.advancedFilters }));
    } catch(_) {}
  }, []);

  // 加载自定义分类
  useEffect(() => {
    (async () => {
      try {
        const list = await listUserCategories();
        setCustomCategories(list);
      } catch (_) {}
    })();
  }, []);

  // 同步筛选条件到URL
  useEffect(() => {
    const urlParams = new URLSearchParams();
    
    if (searchTerm) {
      urlParams.set('search', searchTerm);
    }
    if (categoryFilter) {
      urlParams.set('category', categoryFilter);
    }
    if (advancedFilters.expiryStatus) {
      urlParams.set('filter', advancedFilters.expiryStatus);
    }
    if (advancedFilters.brand) {
      urlParams.set('brand', advancedFilters.brand);
    }
    
    const newUrl = urlParams.toString() ? `?${urlParams.toString()}` : window.location.pathname;
    window.history.replaceState({}, '', newUrl);
    // 本地持久化
    try {
      localStorage.setItem('youqi-items-filters', JSON.stringify({ searchTerm, categoryFilter, advancedFilters }));
    } catch(_) {}
  }, [searchTerm, categoryFilter, advancedFilters.expiryStatus, advancedFilters.brand]);

  // 获取分类统计
  const getCategoryStats = () => {
    // 默认分类 + 自定义分类（去重）
    const base = ['药品', '护肤品', '食品', '日用品', '其他'];
    const extras = Array.from(new Set(customCategories.map(c => c.label)));
    const categories = Array.from(new Set([...base, ...extras]));
    const stats = categories.map(name => ({
      name,
      count: items.filter(item => item.category === name).length,
      icon: getCategoryIcon(name)
    }));
    // 数量降序，便于突出常用分类
    return stats.sort((a,b)=>b.count - a.count);
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

  // 分类筛选和药品标签筛选功能已集成到高级筛选中

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
    
    // 更新URL参数
    const urlParams = new URLSearchParams(window.location.search);
    if (term.trim()) {
      urlParams.set('search', term.trim());
    } else {
      urlParams.delete('search');
    }
    const newUrl = urlParams.toString() ? `?${urlParams.toString()}` : window.location.pathname;
    window.history.replaceState({}, '', newUrl);
  };

  const clearSearchHistory = () => {
    setSearchHistory([]);
  };

  // 生成搜索建议
  const generateSearchSuggestions = (input) => {
    if (!input.trim()) {
      setSearchSuggestions([]);
      return;
    }

    const suggestions = [];
    const inputLower = input.toLowerCase();

    // 从物品名称中生成建议
    items.forEach(item => {
      if (item.name.toLowerCase().includes(inputLower) && !suggestions.includes(item.name)) {
        suggestions.push(item.name);
      }
    });

    // 从品牌中生成建议
    items.forEach(item => {
      if (item.brand && item.brand.toLowerCase().includes(inputLower) && !suggestions.includes(item.brand)) {
        suggestions.push(item.brand);
      }
    });

    // 从分类中生成建议
    const categories = ['药品', '护肤品', '食品', '日用品', '其他'];
    categories.forEach(category => {
      if (category.toLowerCase().includes(inputLower) && !suggestions.includes(category)) {
        suggestions.push(category);
      }
    });

    // 从药品标签中生成建议
    items.forEach(item => {
      if (item.medicineTags) {
        item.medicineTags.forEach(tag => {
          if (tag.toLowerCase().includes(inputLower) && !suggestions.includes(tag)) {
            suggestions.push(tag);
          }
        });
      }
    });

    setSearchSuggestions(suggestions.slice(0, 8)); // 限制建议数量
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

  const selectedItems = items.filter(i => selectedItemsIds.includes(i.id));

  const toggleSelect = (id) => {
    setSelectedItemsIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const clearSelection = () => setSelectedItemsIds([]);
  const [showBatchEdit, setShowBatchEdit] = useState(false);
  const [showExport, setShowExport] = useState(false);

  const selectAllFiltered = () => setSelectedItemsIds(filteredItems.map(i => i.id));

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
              {/* 父子层级展开/收起可在后续加入树形UI */}
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
              onChange={(e) => {
                const value = e.target.value;
                setSearchTerm(value);
                generateSearchSuggestions(value);
                setShowSearchSuggestions(true);
                setShowSearchHistory(false);
              }}
              onFocus={() => {
                if (searchHistory.length > 0) {
                  setShowSearchHistory(true);
                }
                if (searchTerm) {
                  setShowSearchSuggestions(true);
                }
              }}
              onBlur={() => {
                // 延迟关闭，让用户有时间点击建议
                setTimeout(() => {
                  setShowSearchHistory(false);
                  setShowSearchSuggestions(false);
                }, 200);
              }}
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
          
          {/* 搜索历史和搜索建议 */}
          {(showSearchHistory && searchHistory.length > 0) || (showSearchSuggestions && searchSuggestions.length > 0) ? (
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
              maxHeight: '300px',
              overflowY: 'auto'
            }}>
              {/* 搜索历史 */}
              {showSearchHistory && searchHistory.length > 0 && (
                <>
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
                      key={`history-${index}`}
                      onClick={() => handleSearch(term)}
                      style={{
                        padding: '10px',
                        cursor: 'pointer',
                        borderBottom: '1px solid #f5f5f5',
                        fontSize: '14px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = '#f5f5f5'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
                    >
                      <Search size={14} style={{ color: '#999' }} />
                      {term}
                    </div>
                  ))}
                </>
              )}

              {/* 搜索建议 */}
              {showSearchSuggestions && searchSuggestions.length > 0 && (
                <>
                  {showSearchHistory && searchHistory.length > 0 && (
                    <div style={{ padding: '8px', borderBottom: '1px solid #eee' }}>
                      <span style={{ fontSize: '12px', color: '#666' }}>搜索建议</span>
                    </div>
                  )}
                  {searchSuggestions.map((suggestion, index) => (
                    <div
                      key={`suggestion-${index}`}
                      onClick={() => handleSearch(suggestion)}
                      style={{
                        padding: '10px',
                        cursor: 'pointer',
                        borderBottom: '1px solid #f5f5f5',
                        fontSize: '14px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = '#f5f5f5'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
                    >
                      <div style={{ width: '14px', height: '14px', borderRadius: '50%', background: '#8A9A5B', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'white' }}></div>
                      </div>
                      {suggestion}
                    </div>
                  ))}
                </>
              )}
            </div>
          ) : null}
          
        </div>

        {/* 快速筛选按钮组 */}
        <div style={{ marginTop: '20px', marginBottom: '15px' }}>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: '14px', color: '#666', marginRight: '10px' }}>快速筛选:</span>
            
            {/* 过期状态快速筛选 */}
            <button
              onClick={() => handleAdvancedFilterChange('expiryStatus', '')}
              style={{
                padding: '6px 12px',
                background: !advancedFilters.expiryStatus ? '#8A9A5B' : '#f0f0f0',
                color: !advancedFilters.expiryStatus ? 'white' : '#666',
                border: 'none',
                borderRadius: '16px',
                fontSize: '12px',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              全部
            </button>
            <button
              onClick={() => handleAdvancedFilterChange('expiryStatus', 'expired')}
              style={{
                padding: '6px 12px',
                background: advancedFilters.expiryStatus === 'expired' ? '#CB4154' : '#f0f0f0',
                color: advancedFilters.expiryStatus === 'expired' ? 'white' : '#666',
                border: 'none',
                borderRadius: '16px',
                fontSize: '12px',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              已过期
            </button>
            <button
              onClick={() => handleAdvancedFilterChange('expiryStatus', 'expiring-soon')}
              style={{
                padding: '6px 12px',
                background: advancedFilters.expiryStatus === 'expiring-soon' ? '#E89F65' : '#f0f0f0',
                color: advancedFilters.expiryStatus === 'expiring-soon' ? 'white' : '#666',
                border: 'none',
                borderRadius: '16px',
                fontSize: '12px',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              即将过期
            </button>
            <button
              onClick={() => handleAdvancedFilterChange('expiryStatus', 'normal')}
              style={{
                padding: '6px 12px',
                background: advancedFilters.expiryStatus === 'normal' ? '#8A9A5B' : '#f0f0f0',
                color: advancedFilters.expiryStatus === 'normal' ? 'white' : '#666',
                border: 'none',
                borderRadius: '16px',
                fontSize: '12px',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              正常
            </button>
            
            {/* 清除筛选按钮 */}
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                style={{
                  padding: '6px 12px',
                  background: '#f8f9fa',
                  color: '#666',
                  border: '1px solid #ddd',
                  borderRadius: '16px',
                  fontSize: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  marginLeft: 'auto'
                }}
              >
                清除筛选
              </button>
            )}
          </div>
        </div>

        {/* 高级筛选 */}
        <div style={{ marginTop: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <button
              onClick={() => setShowAdvancedFilter(!showAdvancedFilter)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                background: showAdvancedFilter ? '#8A9A5B' : '#f8f9fa',
                color: showAdvancedFilter ? 'white' : '#666',
                border: '1px solid #ddd',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                transition: 'all 0.2s ease'
              }}
            >
              <Filter size={16} />
              高级筛选
              {hasActiveFilters && <span style={{ background: showAdvancedFilter ? 'white' : '#8A9A5B', color: showAdvancedFilter ? '#8A9A5B' : 'white', borderRadius: '50%', width: '16px', height: '16px', fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>!</span>}
            </button>
            
            {/* 筛选结果统计 */}
            <div style={{ fontSize: '14px', color: '#666' }}>
              共找到 {filteredItems.length} 个物品
            </div>
          </div>

          {showAdvancedFilter && (
            <div style={{ 
              padding: '20px', 
              background: 'white', 
              borderRadius: '12px',
              border: '1px solid #e9ecef',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
              <h4 style={{ margin: '0 0 20px 0', color: '#333', fontSize: '16px', fontWeight: '600' }}>高级筛选条件</h4>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
                {/* 过期状态筛选 */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '14px', fontWeight: '500', color: '#333' }}>过期状态</label>
                  <select
                    value={advancedFilters.expiryStatus}
                    onChange={(e) => handleAdvancedFilterChange('expiryStatus', e.target.value)}
                    style={{
                      padding: '10px 12px',
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      fontSize: '14px',
                      background: 'white',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="">全部状态</option>
                    <option value="normal">正常</option>
                    <option value="expiring-soon">即将过期</option>
                    <option value="expired">已过期</option>
                  </select>
                </div>

                {/* 品牌筛选 */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '14px', fontWeight: '500', color: '#333' }}>品牌</label>
                  <input
                    type="text"
                    value={advancedFilters.brand}
                    onChange={(e) => handleAdvancedFilterChange('brand', e.target.value)}
                    placeholder="输入品牌名称"
                    style={{
                      padding: '10px 12px',
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      fontSize: '14px',
                      background: 'white'
                    }}
                  />
                </div>

                {/* 数量范围筛选 */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '14px', fontWeight: '500', color: '#333' }}>数量范围</label>
                  <select
                    value={advancedFilters.quantityRange}
                    onChange={(e) => handleAdvancedFilterChange('quantityRange', e.target.value)}
                    style={{
                      padding: '10px 12px',
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      fontSize: '14px',
                      background: 'white',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="">全部数量</option>
                    <option value="1-5">1-5个</option>
                    <option value="6-10">6-10个</option>
                    <option value="11-20">11-20个</option>
                    <option value="21-">21个以上</option>
                  </select>
                </div>

                {/* 过期日期范围 */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '14px', fontWeight: '500', color: '#333' }}>过期日期范围</label>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <input
                      type="date"
                      value={advancedFilters.dateRange.start}
                      onChange={(e) => handleDateRangeChange('start', e.target.value)}
                      placeholder="开始日期"
                      style={{
                        flex: 1,
                        padding: '10px 12px',
                        border: '1px solid #ddd',
                        borderRadius: '8px',
                        fontSize: '14px',
                        background: 'white'
                      }}
                    />
                    <span style={{ color: '#666', fontSize: '14px' }}>至</span>
                    <input
                      type="date"
                      value={advancedFilters.dateRange.end}
                      onChange={(e) => handleDateRangeChange('end', e.target.value)}
                      placeholder="结束日期"
                      style={{
                        flex: 1,
                        padding: '10px 12px',
                        border: '1px solid #ddd',
                        borderRadius: '8px',
                        fontSize: '14px',
                        background: 'white'
                      }}
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
            padding: '15px', 
            background: '#f8f9fa', 
            borderRadius: '8px',
            border: '1px solid #e9ecef'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Search size={16} style={{ color: '#8A9A5B' }} />
                <span style={{ fontSize: '14px', color: '#333', fontWeight: '500' }}>
                  找到 {filteredItems.length} 个物品
                </span>
                {items.length > 0 && (
                  <span style={{ fontSize: '12px', color: '#666' }}>
                    (共 {items.length} 个)
                  </span>
                )}
              </div>
              
              {/* 显示当前筛选条件 */}
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {searchTerm && (
                  <span style={{ 
                    padding: '4px 8px', 
                    background: '#8A9A5B', 
                    color: 'white', 
                    borderRadius: '12px', 
                    fontSize: '12px' 
                  }}>
                    搜索: {searchTerm}
                  </span>
                )}
                {categoryFilter && (
                  <span style={{ 
                    padding: '4px 8px', 
                    background: '#E89F65', 
                    color: 'white', 
                    borderRadius: '12px', 
                    fontSize: '12px' 
                  }}>
                    分类: {categoryFilter}
                  </span>
                )}
                {advancedFilters.expiryStatus && (
                  <span style={{ 
                    padding: '4px 8px', 
                    background: advancedFilters.expiryStatus === 'expired' ? '#CB4154' : 
                              advancedFilters.expiryStatus === 'expiring-soon' ? '#E89F65' : '#8A9A5B', 
                    color: 'white', 
                    borderRadius: '12px', 
                    fontSize: '12px' 
                  }}>
                    状态: {advancedFilters.expiryStatus === 'expired' ? '已过期' : 
                           advancedFilters.expiryStatus === 'expiring-soon' ? '即将过期' : '正常'}
                  </span>
                )}
                {advancedFilters.brand && (
                  <span style={{ 
                    padding: '4px 8px', 
                    background: '#4A4A4A', 
                    color: 'white', 
                    borderRadius: '12px', 
                    fontSize: '12px' 
                  }}>
                    品牌: {advancedFilters.brand}
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 批量操作栏（可选） */}
        {filteredItems.length > 0 && (
          <BatchOperations
            selectedItems={selectedItemsIds}
            onBatchDelete={async (ids)=>{
              if (!ids || ids.length===0) return;
              for (const id of ids) await deleteItem(id);
              clearSelection();
              toast.success('已删除选中物品');
            }}
            onBatchEdit={() => {}}
            onOpenBatchEdit={() => setShowBatchEdit(true)}
            onExport={()=> setShowExport(true)}
            onImport={() => { toast('请在数据管理入口导入'); }}
            onMoveToCategory={async (ids, target)=>{
              try {
                for (const id of ids) await updateItem(id, { category: target });
                toast.success('已移动到分类');
              } catch (e) { toast.error('移动失败'); }
            }}
            categoryOptions={[...new Set(['药品','护肤品','食品','日用品','其他', ...customCategories.map(c=>c.label)])].map(v=>({ value: v, label: v }))}
            onClearSelection={clearSelection}
          />
        )}
        <ExportModal
          open={showExport}
          onClose={()=>setShowExport(false)}
          onConfirm={(fmt)=>{
            const exportItems = items.filter(i => selectedItemsIds.includes(i.id));
            dataExport.exportData(exportItems, fmt);
            setShowExport(false);
          }}
        />

        {/* 批量编辑对话框 */}
        <BatchEditModal
          open={showBatchEdit}
          onClose={()=>setShowBatchEdit(false)}
          categories={[...new Set(['药品','护肤品','食品','日用品','其他', ...customCategories.map(c=>c.label)])].map(v=>({ value: v, label: v }))}
          onApply={async ({ category, brand, notesAppend })=>{
            try {
              for (const id of selectedItemsIds) {
                const patch = {};
                if (category) patch.category = category;
                if (brand) patch.brand = brand;
                if (notesAppend) patch.notes = ((items.find(i=>i.id===id)?.notes)||'') + (patch.notes? ' ' : '') + notesAppend;
                await updateItem(id, patch);
              }
              toast.success('批量编辑已应用');
              setShowBatchEdit(false);
            } catch (e) { toast.error('批量编辑失败'); }
          }}
        />

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
                    <input type="checkbox" checked={selectedItemsIds.includes(item.id)} onChange={()=>toggleSelect(item.id)} onClick={(e)=>e.stopPropagation()} />
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