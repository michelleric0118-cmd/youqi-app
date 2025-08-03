import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, ArrowLeft, Camera } from 'lucide-react';
import { useLeanCloudItems } from '../../hooks/useLeanCloudItems';
import { CATEGORIES, MEDICINE_TAGS } from '../../utils/itemUtils';
import BarcodeScanner from '../../components/BarcodeScanner';

const AddItem = () => {
  const navigate = useNavigate();
  const { addItem } = useLeanCloudItems();
  
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
  const [showScanner, setShowScanner] = useState(false);

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

  // 处理扫码结果
  const handleScanResult = (barcode) => {
    console.log('扫码结果:', barcode);
    
    // 根据条码前缀判断商品类型并自动填充
    if (barcode.startsWith('690')) {
      // 中国商品条码，根据条码规则判断商品类型
      const categoryMap = {
        '690123': '药品',
        '690987': '护肤品',
        '690555': '食品'
      };
      
      const prefix = barcode.substring(0, 6);
      const category = categoryMap[prefix] || '其他';
      
      setFormData(prev => ({
        ...prev,
        name: `商品${barcode.substring(8)}`,
        category,
        brand: `品牌${barcode.substring(6, 8)}`
      }));
    }
    
    setShowScanner(false);
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
      {showScanner && (
        <BarcodeScanner
          onScan={handleScanResult}
          onClose={() => setShowScanner(false)}
        />
      )}
      
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
          <button onClick={() => navigate('/')} className="btn btn-secondary" style={{ marginRight: '10px' }}>
            <ArrowLeft size={16} />
          </button>
          <h2>添加物品</h2>
        </div>

        <form onSubmit={handleSubmit}>
          {/* 扫码按钮 */}
          <div style={{ marginBottom: '20px', textAlign: 'center' }}>
            <button
              type="button"
              onClick={() => setShowScanner(true)}
              className="btn"
              style={{ 
                background: 'var(--sage-green)', 
                color: 'white',
                padding: '12px 24px',
                fontSize: '1rem'
              }}
            >
              <Camera size={20} style={{ marginRight: '8px' }} />
              扫描条形码
            </button>
            <p style={{ marginTop: '8px', fontSize: '0.9rem', color: '#666' }}>
              💡 点击扫描条形码，自动填充商品信息
            </p>
          </div>

          {/* 物品名称 */}
          <div className="form-group">
            <label htmlFor="name">物品名称 *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="请输入物品名称"
              className={errors.name ? 'error' : ''}
            />
            {errors.name && <span className="error-message">{errors.name}</span>}
          </div>

          {/* 分类 */}
          <div className="form-group">
            <label htmlFor="category">分类 *</label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleCategoryChange}
              className={errors.category ? 'error' : ''}
            >
              <option value="">请选择分类</option>
              {CATEGORIES.map(category => (
                <option key={category.value} value={category.value}>{category.label}</option>
              ))}
            </select>
            {errors.category && <span className="error-message">{errors.category}</span>}
          </div>

          {/* 品牌 */}
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

          {/* 数量 */}
          <div className="form-group">
            <label htmlFor="quantity">数量</label>
            <input
              type="number"
              id="quantity"
              name="quantity"
              value={formData.quantity}
              onChange={handleInputChange}
              min="1"
              max="999"
            />
          </div>

          {/* 过期日期 */}
          <div className="form-group">
            <label htmlFor="expiryDate">过期日期 *</label>
            <input
              type="date"
              id="expiryDate"
              name="expiryDate"
              value={formData.expiryDate}
              onChange={handleInputChange}
              className={errors.expiryDate ? 'error' : ''}
            />
            {errors.expiryDate && <span className="error-message">{errors.expiryDate}</span>}
          </div>

          {/* 药品标签（仅当分类为药品时显示） */}
          {formData.category === '药品' && (
            <div className="form-group">
              <label>适用症状/人群</label>
              <div className="tags-container">
                {MEDICINE_TAGS.map(tag => (
                  <label key={tag.value} className="tag-checkbox">
                    <input
                      type="checkbox"
                      checked={selectedMedicineTags.includes(tag.value)}
                      onChange={() => handleMedicineTagChange(tag.value)}
                    />
                    {tag.label}
                  </label>
                ))}
              </div>
              {selectedMedicineTags.length > 0 && (
                <div className="selected-tags">
                  {selectedMedicineTags.map(tag => (
                    <span key={tag} className="selected-tag">{tag}</span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 备注 */}
          <div className="form-group">
            <label htmlFor="notes">备注</label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              placeholder="请输入备注信息"
              rows="3"
            />
            {formData.category === '药品' && (
              <div style={{ marginTop: '5px', fontSize: '12px', color: '#666' }}>
                💡 如果没有合适的症状选项，请在备注中填写
              </div>
            )}
          </div>

          {/* 提交按钮 */}
          <div style={{ textAlign: 'center', marginTop: '30px' }}>
            <button type="submit" className="btn" style={{ 
              background: 'var(--sage-green)', 
              color: 'white',
              padding: '12px 40px',
              fontSize: '1.1rem'
            }}>
              <Save size={20} style={{ marginRight: '8px' }} />
              保存物品
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddItem; 