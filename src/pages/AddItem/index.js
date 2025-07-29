import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, ArrowLeft } from 'lucide-react';
import { useFirebaseItems } from '../../hooks/useFirebaseItems';
import { CATEGORIES, MEDICINE_TAGS } from '../../utils/itemUtils';

const AddItem = () => {
  const navigate = useNavigate();
  const { addItem } = useFirebaseItems();
  
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    brand: '',
    quantity: 1,
    expiryDate: '',
    notes: ''
  });
  
  const [selectedMedicineTags, setSelectedMedicineTags] = useState([]);
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // 清除相关错误
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleCategoryChange = (e) => {
    const category = e.target.value;
    setFormData(prev => ({
      ...prev,
      category
    }));
    
    // 如果切换分类，清空药品标签
    if (category !== '药品') {
      setSelectedMedicineTags([]);
    }
  };

  const handleMedicineTagChange = (tag) => {
    setSelectedMedicineTags(prev => {
      if (prev.includes(tag)) {
        return prev.filter(t => t !== tag);
      } else {
        return [...prev, tag];
      }
    });
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = '物品名称不能为空';
    }
    
    if (!formData.category) {
      newErrors.category = '请选择分类';
    }
    
    if (!formData.expiryDate) {
      newErrors.expiryDate = '过期日期不能为空';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // 构建备注信息
    const tagsText = selectedMedicineTags.length > 0 ? `适用: ${selectedMedicineTags.join(', ')}` : '';
    const notes = [tagsText, formData.notes].filter(Boolean).join(' | ');

    const newItem = {
      ...formData,
      notes,
      medicineTags: selectedMedicineTags
    };

    addItem(newItem);
    navigate('/');
  };

  return (
    <div>
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
          <button 
            onClick={() => navigate('/')} 
            className="btn btn-secondary"
            style={{ marginRight: '15px' }}
          >
            <ArrowLeft size={16} />
          </button>
          <h2>添加新物品</h2>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">物品名称 *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="请输入物品名称"
              required
            />
            {errors.name && <div style={{ color: 'var(--brick-red)', fontSize: '14px', marginTop: '5px' }}>{errors.name}</div>}
          </div>

          <div className="form-group">
            <label htmlFor="category">分类 *</label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleCategoryChange}
              required
            >
              <option value="">请选择分类</option>
              {CATEGORIES.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
            {errors.category && <div style={{ color: 'var(--brick-red)', fontSize: '14px', marginTop: '5px' }}>{errors.category}</div>}
          </div>

          {formData.category === '药品' && (
            <div className="form-group">
              <label>适用症状/人群</label>
              <div className="tags-container">
                {MEDICINE_TAGS.map(tag => (
                  <label key={tag.value} className="tag-checkbox">
                    <input
                      type="checkbox"
                      value={tag.value}
                      checked={selectedMedicineTags.includes(tag.value)}
                      onChange={() => handleMedicineTagChange(tag.value)}
                    />
                    {tag.label}
                  </label>
                ))}
              </div>
              <div style={{ marginTop: '10px', padding: '10px', background: '#E8F5E8', borderRadius: '6px', fontSize: '14px', color: 'var(--sage-green)' }}>
                💡 <strong>提示：</strong>如果没有合适的选项，请在备注中填写其他症状或适用人群，例如"高血压"、"糖尿病"等，这些内容也可以在搜索中找到。
              </div>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="brand">品牌</label>
            <input
              type="text"
              id="brand"
              name="brand"
              value={formData.brand}
              onChange={handleInputChange}
              placeholder="请输入品牌名称"
            />
          </div>

          <div className="form-group">
            <label htmlFor="quantity">数量</label>
            <input
              type="number"
              id="quantity"
              name="quantity"
              value={formData.quantity}
              onChange={handleInputChange}
              min="1"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="expiryDate">过期日期 *</label>
            <input
              type="date"
              id="expiryDate"
              name="expiryDate"
              value={formData.expiryDate}
              onChange={handleInputChange}
              required
            />
            {errors.expiryDate && <div style={{ color: 'var(--brick-red)', fontSize: '14px', marginTop: '5px' }}>{errors.expiryDate}</div>}
          </div>

          <div className="form-group">
            <label htmlFor="notes">备注</label>
            <input
              type="text"
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              placeholder="其他备注信息"
            />
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
            <button type="submit" className="btn">
              <Save size={16} style={{ marginRight: '8px' }} />
              保存物品
            </button>
            <button 
              type="button" 
              className="btn btn-secondary"
              onClick={() => navigate('/')}
            >
              取消
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddItem; 