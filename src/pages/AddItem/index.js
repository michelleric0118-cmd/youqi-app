import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, ArrowLeft, Camera } from 'lucide-react';
import { useLeanCloudItems } from '../../hooks/useLeanCloudItems';
import { CATEGORIES, MEDICINE_TAGS } from '../../utils/itemUtils';
import BarcodeScanner from '../../components/BarcodeScanner';
import { generateProductInfo } from '../../services/productDatabase';
import toast from 'react-hot-toast';

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
    
    try {
      // 使用商品数据库服务生成商品信息
      const productInfo = generateProductInfo(barcode);
      
      // 自动填充表单
      setFormData(prev => ({
        ...prev,
        name: productInfo.name,
        brand: productInfo.brand,
        category: productInfo.category,
        notes: productInfo.notes
      }));
      
      // 如果是药品，设置药品标签
      if (productInfo.category === '药品' && productInfo.medicineTags.length > 0) {
        setSelectedMedicineTags(productInfo.medicineTags);
      }
      
      // 设置默认过期日期
      const defaultExpiryDate = new Date();
      defaultExpiryDate.setDate(defaultExpiryDate.getDate() + productInfo.defaultExpiryDays);
      
      setFormData(prev => ({
        ...prev,
        expiryDate: defaultExpiryDate.toISOString().split('T')[0]
      }));
      
      toast.success('扫码成功，已自动填充商品信息');
    } catch (error) {
      console.error('处理扫码结果失败:', error);
      toast.error('扫码处理失败，请重试');
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

  const showValidationErrors = (errors) => {
    const errorMessages = Object.values(errors).filter(Boolean);
    if (errorMessages.length > 0) {
      toast.error(errorMessages[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      showValidationErrors(errors);
      return;
    }

    try {
      // 构建备注信息
      const tagsText = selectedMedicineTags.length > 0 ? `适用: ${selectedMedicineTags.join(', ')}` : '';
      const notes = [tagsText, formData.notes].filter(Boolean).join(' | ');

      const newItem = {
        ...formData,
        notes,
        medicineTags: selectedMedicineTags
      };

      await addItem(newItem);
      navigate('/');
    } catch (error) {
      console.error('添加物品失败:', error);
      toast.error('添加失败，请重试');
    }
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