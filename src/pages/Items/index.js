import React, { useState } from 'react';
import { Search, Trash2 } from 'lucide-react';
import { useFirebaseItems } from '../../hooks/useFirebaseItems';
import { getExpiryStatus, getExpiryText, CATEGORIES, MEDICINE_TAGS } from '../../utils/itemUtils';

const Items = () => {
  const { items, deleteItem } = useFirebaseItems();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [selectedMedicineTags, setSelectedMedicineTags] = useState([]);

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

  const handleDelete = (id) => {
    if (window.confirm('确定要删除这个物品吗？')) {
      deleteItem(id);
    }
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
    
    return matchesSearch && matchesCategory && matchesMedicineTags;
  });

  return (
    <div>
      <div className="card">
        <h2>物品管理</h2>
        
        {/* 搜索和筛选 */}
        <div className="form-group">
          <label htmlFor="searchInput">搜索物品</label>
          <div style={{ position: 'relative' }}>
            <Search size={20} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#666' }} />
            <input
              type="text"
              id="searchInput"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="搜索物品名称、品牌、分类、症状、备注..."
              style={{ paddingLeft: '40px' }}
            />
          </div>
          <div style={{ marginTop: '5px', fontSize: '12px', color: '#666' }}>
            💡 可以搜索：物品名称、品牌、分类、症状（如感冒、高血压）、适用人群（如成人、儿童）、备注中的任何内容
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="categoryFilter">分类筛选</label>
          <select
            id="categoryFilter"
            value={categoryFilter}
            onChange={handleCategoryFilterChange}
          >
            <option value="">所有分类</option>
            {CATEGORIES.map(cat => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>
        </div>

        {categoryFilter === '药品' && (
          <div className="form-group">
            <label>药品筛选</label>
            <div className="tags-container">
              {MEDICINE_TAGS.map(tag => (
                <label key={tag.value} className="tag-checkbox">
                  <input
                    type="checkbox"
                    value={tag.value}
                    checked={selectedMedicineTags.includes(tag.value)}
                    onChange={() => handleMedicineTagFilterChange(tag.value)}
                  />
                  {tag.label}
                </label>
              ))}
            </div>
          </div>
        )}

        {/* 物品列表 */}
        <div className="items-list">
          {filteredItems.length === 0 ? (
            <p>暂无物品</p>
          ) : (
            filteredItems.map(item => {
              const expiryStatus = getExpiryStatus(item.expiryDate);
              const expiryInfo = getExpiryText(item.expiryDate);
              
              return (
                <div key={item.id} className={`item ${expiryStatus}`}>
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
                  <button 
                    className="btn btn-danger" 
                    onClick={() => handleDelete(item.id)}
                    style={{ marginTop: '10px' }}
                  >
                    <Trash2 size={16} style={{ marginRight: '8px' }} />
                    删除
                  </button>
                </div>
              );
            })
          )}
        </div>

        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <p>共找到 {filteredItems.length} 个物品</p>
        </div>
      </div>
    </div>
  );
};

export default Items; 