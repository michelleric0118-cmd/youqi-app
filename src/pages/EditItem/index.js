import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, ArrowLeft, Camera } from 'lucide-react';
import { useLeanCloudItems } from '../../hooks/useLeanCloudItems';
import { DEFAULT_CATEGORIES, buildCategories, MEDICINE_TAGS } from '../../utils/itemUtils';
import { listUserCategories, createUserCategory } from '../../services/categoryService';
import BarcodeScanner from '../../components/BarcodeScanner';
import CustomDatePicker from '../../components/CustomDatePicker';
import toast from 'react-hot-toast';

const EditItem = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { items, updateItem } = useLeanCloudItems();
  
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    brand: '',
    quantity: 1,
    productionDate: '', // 添加生产日期字段
    expiryDate: '',
    notes: '',
    location: '',
    reminderDays: [], // 分类默认提醒天数数组
    customReminderDays: [] // 自定义提醒天数数组
  });
  
  const [selectedMedicineTags, setSelectedMedicineTags] = useState([]);
  const [errors, setErrors] = useState({});

  const [loading, setLoading] = useState(true);
  const [customCategories, setCustomCategories] = useState([]);
  const [newCategory, setNewCategory] = useState('');
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  
  // 过期提醒相关状态
  const [categoryReminderSettings, setCategoryReminderSettings] = useState(null);

  const [showReminderSettings, setShowReminderSettings] = useState(false);
  
  // 自定义日期选择器状态
  const [showProductionDatePicker, setShowProductionDatePicker] = useState(false);
  const [showExpiryDatePicker, setShowExpiryDatePicker] = useState(false);

  // 获取分类提醒设置
  useEffect(() => {
    if (formData.category && formData.category !== 'custom') {
      // 从localStorage获取分类的提醒设置
      const categorySettings = localStorage.getItem(`category_reminder_${formData.category}`);
      if (categorySettings) {
        setCategoryReminderSettings(JSON.parse(categorySettings));
      } else {
        // 如果没有分类特定设置，使用全局默认设置
        const globalSettings = localStorage.getItem('reminder_settings');
        if (globalSettings) {
          setCategoryReminderSettings(JSON.parse(globalSettings));
        } else {
          // 如果都没有，设置默认值
          setCategoryReminderSettings({
            firstReminderDays: 7,
            secondReminderDays: 1
          });
        }
      }
    }
  }, [formData.category]);

  // 加载物品数据
  useEffect(() => {
    const item = items.find(item => item.id === id);
    if (item) {
      setFormData({
        name: item.name || '',
        category: item.category || '',
        brand: item.brand || '',
        quantity: item.quantity || 1,
        productionDate: item.productionDate || '',
        expiryDate: item.expiryDate || '',
        notes: item.notes || '',
        location: item.location || '',
        reminderDays: item.reminderDays || [],
        customReminderDays: item.customReminderDays || []
      });
      setSelectedMedicineTags(item.medicineTags || []);
      setLoading(false);
    } else if (items.length > 0) {
      // 只有在items数组已经加载完成且不为空的情况下才显示错误
      toast.error('物品不存在');
      navigate('/items');
    }
    // 如果items数组为空或还在加载中，不显示错误
  }, [id, items, navigate]);

  // 加载自定义分类
  useEffect(() => {
    (async () => {
      try {
        // 检查是否在测试模式
        const currentUser = require('../services/authService').getCurrentUser();
        if (!currentUser) {
          // 测试模式：从localStorage获取完整分类数据
          const completeCategoriesData = localStorage.getItem('complete_categories');
          if (completeCategoriesData) {
            const parsedData = JSON.parse(completeCategoriesData);
            setCustomCategories(parsedData);
          } else {
            // 如果没有完整分类数据，尝试获取测试分类数据
            const testData = localStorage.getItem('test_categories');
            if (testData) {
              const parsedData = JSON.parse(testData);
              // 构建完整分类列表
              const completeCategories = [
                { value: '药品', label: '药品' },
                { value: '护肤品', label: '护肤品' },
                { value: '食品', label: '食品' },
                { value: '日用品', label: '日用品' },
                { value: '其他', label: '其他' },
                ...parsedData.map(cat => ({ value: cat.label, label: cat.label })),
                { value: 'custom', label: '自定义' }
              ];
              setCustomCategories(completeCategories);
            } else {
              // 初始化测试数据
              const initialData = [
                { id: 'test1', label: '测试分类1', parent: null, order: 1 },
                { id: 'test2', label: '测试分类2', parent: null, order: 2 }
              ];
              localStorage.setItem('test_categories', JSON.stringify(initialData));
              
              // 构建完整分类列表
              const completeCategories = [
                { value: '药品', label: '药品' },
                { value: '护肤品', label: '护肤品' },
                { value: '食品', label: '食品' },
                { value: '日用品', label: '日用品' },
                { value: '其他', label: '其他' },
                ...initialData.map(cat => ({ value: cat.label, label: cat.label })),
                { value: 'custom', label: '自定义' }
              ];
              setCustomCategories(completeCategories);
            }
          }
        } else {
          // 正常模式：从服务器获取分类数据
          const list = await listUserCategories();
          setCustomCategories(list);
        }
      } catch (error) {
        console.error('加载分类失败:', error);
        // 如果服务器获取失败，尝试从localStorage获取测试数据
        const testData = localStorage.getItem('test_categories');
        if (testData) {
          const parsedData = JSON.parse(testData);
          const completeCategories = [
            { value: '药品', label: '药品' },
            { value: '护肤品', label: '护肤品' },
            { value: '食品', label: '食品' },
            { value: '日用品', label: '日用品' },
            { value: '其他', label: '其他' },
            ...parsedData.map(cat => ({ value: cat.label, label: cat.label })),
            { value: 'custom', label: '自定义' }
          ];
          setCustomCategories(completeCategories);
        }
      }
    })();

    // 监听分类数据变化事件
    const handleCategoriesUpdated = (event) => {
      if (event.detail.mode === 'test') {
        if (event.detail.completeCategories) {
          setCustomCategories(event.detail.completeCategories);
        } else {
          // 兼容旧版本的事件数据
          const testData = localStorage.getItem('test_categories');
          if (testData) {
            const parsedData = JSON.parse(testData);
            const completeCategories = [
              { value: '药品', label: '药品' },
              { value: '护肤品', label: '护肤品' },
              { value: '食品', label: '食品' },
              { value: '日用品', label: '日用品' },
              { value: '其他', label: '其他' },
              ...parsedData.map(cat => ({ value: cat.label, label: cat.label })),
              { value: 'custom', label: '自定义' }
            ];
            setCustomCategories(completeCategories);
          }
        }
      }
    };

    window.addEventListener('categoriesUpdated', handleCategoriesUpdated);

    return () => {
      window.removeEventListener('categoriesUpdated', handleCategoriesUpdated);
    };
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // 特殊处理数量输入
    if (name === 'quantity') {
      const numValue = parseInt(value);
      if (isNaN(numValue) || numValue < 1) {
        // 如果输入无效或小于1，设置为1
        setFormData(prev => ({ ...prev, [name]: 1 }));
        return;
      }
      // 限制最大数量为999
      if (numValue > 999) {
        setFormData(prev => ({ ...prev, [name]: 999 }));
        return;
      }
    }
    
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // 清除对应字段的错误
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    
    // 实时日期校验
    if (name === 'productionDate' || name === 'expiryDate') {
      const productionDate = name === 'productionDate' ? value : formData.productionDate;
      const expiryDate = name === 'expiryDate' ? value : formData.expiryDate;
      
      if (productionDate && expiryDate) {
        const prodDate = new Date(productionDate);
        const expDate = new Date(expiryDate);
        
        if (expDate <= prodDate) {
          setErrors(prev => ({
            ...prev,
            expiryDate: '过期日期必须晚于生产日期'
          }));
        } else {
          // 清除过期日期错误
          setErrors(prev => ({
            ...prev,
            expiryDate: ''
          }));
        }
      }
    }
  };

  const handleCategoryChange = (e) => {
    const category = e.target.value;
    setFormData(prev => ({
      ...prev,
      category
    }));
    
    // 如果选择"自定义"，显示创建分类模态框
    if (category === 'custom') {
      setShowCategoryModal(true);
    }
    
    // 如果切换分类，清空药品标签
    if (category !== '药品') {
      setSelectedMedicineTags([]);
    }
    
    // 应用分类的默认过期提醒设置
    if (category && category !== 'custom') {
      const categorySettings = localStorage.getItem(`category_reminder_${category}`);
      if (categorySettings) {
        const settings = JSON.parse(categorySettings);
        // 将分类的提醒设置应用到formData
        setFormData(prev => ({
          ...prev,
          reminderDays: [
            ...(settings.firstReminderDays || []),
            ...(settings.secondReminderDays || [])
          ].filter((value, index, self) => self.indexOf(value) === index) // 去重
        }));
      } else {
        // 如果没有分类特定设置，使用全局默认设置
        const globalSettings = localStorage.getItem('reminder_settings');
        if (globalSettings) {
          const settings = JSON.parse(globalSettings);
          setFormData(prev => ({
            ...prev,
            reminderDays: [
              ...(settings.globalFirstReminderDays ? [settings.globalFirstReminderDays] : []),
              ...(settings.globalSecondReminderDays ? [settings.globalSecondReminderDays] : [])
            ].filter((value, index, self) => index === self.indexOf(value)) // 去重
          }));
        } else {
          // 如果都没有，设置默认值
          setFormData(prev => ({
            ...prev,
            reminderDays: [7, 1]
          }));
        }
      }
    }
  };

  // 创建新分类
  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) {
      toast.error('请输入分类名称');
      return;
    }

    setIsCreatingCategory(true);
    try {
      // 检查是否在测试模式
      const currentUser = require('../services/authService').getCurrentUser();
      if (!currentUser) {
        // 测试模式：模拟创建分类
        const newCategory = {
          id: `test_${Date.now()}`,
          label: newCategoryName.trim(),
          parent: null,
          order: customCategories.length + 1
        };
        const updatedList = [...customCategories, newCategory];
        setCustomCategories(updatedList);
        // 保存到localStorage
        localStorage.setItem('test_categories', JSON.stringify(updatedList));
        // 触发全局事件，通知其他组件更新分类数据
        window.dispatchEvent(new CustomEvent('categoriesUpdated', { 
          detail: { categories: updatedList, mode: 'test' } 
        }));
        // 设置新创建的分类为当前选择
        setFormData(prev => ({
          ...prev,
          category: newCategoryName.trim()
        }));
        setNewCategoryName('');
        setShowCategoryModal(false);
        toast.success('✅ 分类已创建');
      } else {
        // 正常模式：从服务器创建分类
        await createUserCategory(newCategoryName.trim());
        const list = await listUserCategories();
        setCustomCategories(list);
        // 设置新创建的分类为当前选择
        setFormData(prev => ({
          ...prev,
          category: newCategoryName.trim()
        }));
        setNewCategoryName('');
        setShowCategoryModal(false);
        toast.success('✅ 分类已创建');
      }
    } catch (error) {
      console.error('创建分类失败：' + (error.message || '未知错误'));
      toast.error('创建分类失败，请重试');
    } finally {
      setIsCreatingCategory(false);
    }
  };

  // 取消创建分类
  const handleCancelCreateCategory = () => {
    setNewCategoryName('');
    setShowCategoryModal(false);
    // 重置分类选择
    setFormData(prev => ({
      ...prev,
      category: ''
    }));
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
    
    // 添加日期校验逻辑
    if (formData.productionDate && formData.expiryDate) {
      const productionDate = new Date(formData.productionDate);
      const expiryDate = new Date(formData.expiryDate);
      
      if (expiryDate <= productionDate) {
        newErrors.expiryDate = '过期日期必须晚于生产日期';
      }
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

      const updateData = {
        ...formData,
        notes,
        medicineTags: selectedMedicineTags
      };

      await updateItem(id, updateData);
      navigate('/items');
    } catch (error) {
      console.error('更新物品失败:', error);
      toast.error('更新失败，请重试');
    }
  };

  if (loading) {
    return (
      <div className="card">
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <p>正在加载物品信息...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <style>
        {`
          .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            z-index: 999;
          }
        `}
      </style>
      

      
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
          <button onClick={() => navigate('/items')} className="btn btn-secondary" style={{ marginRight: '10px' }}>
            <ArrowLeft size={16} />
          </button>
          <h2>编辑物品</h2>
        </div>

        <form onSubmit={handleSubmit}>


          {/* 物品名称 */}
          <div className="form-group">
            <label htmlFor="name">物品名称 *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="例如：神仙水 或 布洛芬缓释胶囊"
              className={errors.name ? 'error' : ''}
            />
            {errors.name && <span className="error-message">{errors.name}</span>}
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
              placeholder="例如：SK-II"
            />
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
              {buildCategories(customCategories).map(category => (
                <option key={category.value} value={category.value}>{category.label}</option>
              ))}
              <option value="custom">自定义</option>
            </select>
            {errors.category && <span className="error-message">{errors.category}</span>}
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
              placeholder="1-999"
              title="请输入1-999之间的数量"
            />

          </div>

          {/* 保质期 */}
          <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <label htmlFor="shelfLife" style={{ minWidth: '80px', margin: 0 }}>
              保质期
              <span style={{ fontSize: '12px', color: '#9ca3af', marginLeft: '4px' }}>（可选填）</span>
            </label>
            <input
              type="text"
              id="shelfLife"
              name="shelfLife"
              value={formData.shelfLife || ''}
              onChange={handleInputChange}
              placeholder="输入保质期天数"
              style={{ 
                flex: 1,
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px'
              }}
            />
          </div>

          {/* 生产日期 */}
          <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <label htmlFor="productionDate" style={{ minWidth: '80px', margin: 0 }}>
              生产日期
              <span style={{ fontSize: '12px', color: '#9ca3af', marginLeft: '4px' }}>（可选填）</span>
            </label>
            <input
              type="text"
              id="productionDate"
              name="productionDate"
              value={formData.productionDate}
              onChange={handleInputChange}
              placeholder="选择生产日期"
              readOnly
              onClick={() => setShowProductionDatePicker(true)}
              style={{ 
                cursor: 'pointer',
                flex: 1,
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px'
              }}
            />
          </div>

          {/* 过期日期 */}
          <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <label htmlFor="expiryDate" style={{ minWidth: '80px', margin: 0 }}>过期日期 *</label>
            <input
              type="text"
              id="expiryDate"
              name="expiryDate"
              value={formData.expiryDate}
              onChange={handleInputChange}
              placeholder="选择过期日期"
              readOnly
              onClick={() => setShowExpiryDatePicker(true)}
              className={errors.expiryDate ? 'error' : ''}
              style={{ 
                cursor: 'pointer',
                flex: 1,
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px'
              }}
            />
            {errors.expiryDate && <span className="error-message" style={{ marginLeft: '92px' }}>{errors.expiryDate}</span>}
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

          {/* 过期提醒设置 */}
              <div className="form-group">
                <label htmlFor="reminderSettings">过期提醒</label>
                <div className="reminder-settings" style={{
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '12px 16px',
                  background: '#f9fafb'
                }}>
                  <div className="reminder-header" style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer'
                  }}
                  onClick={() => setShowReminderSettings(!showReminderSettings)}
                  >
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <span style={{
                        fontSize: '14px',
                        color: '#374151'
                      }}>
                        {formData.category ? (
                          formData.reminderDays && formData.reminderDays.length > 0 ? (
                            formData.reminderDays.length === 1 ? 
                              (formData.reminderDays[0] === 0 ? '过期当天' : `过期前${formData.reminderDays[0]}天`) :
                              `过期前${formData.reminderDays[0]}天等${formData.reminderDays.length}项`
                          ) : '未设置'
                        ) : '请先选择分类'
                      }
                    </span>
                    {formData.customReminderDays && formData.customReminderDays.length > 0 && (
                      <span style={{
                        fontSize: '12px',
                        color: '#6b7280',
                        marginLeft: '8px'
                      }}>
                        + 自定义{formData.customReminderDays.length}项
                      </span>
                    )}
                    </div>
                    <button
                      type="button"
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#6b7280',
                        fontSize: '16px',
                        cursor: 'pointer',
                        padding: '4px',
                        borderRadius: '4px',
                        transition: 'all 0.2s',
                        transform: showReminderSettings ? 'rotate(90deg)' : 'rotate(0deg)'
                      }}
                      onMouseEnter={(e) => e.target.style.background = '#f3f4f6'}
                      onMouseLeave={(e) => e.target.style.background = 'none'}
                    >
                      ›
                    </button>
                  </div>
                  
                  {showReminderSettings && (
                    <div className="reminder-details" style={{
                      marginTop: '12px',
                      paddingTop: '12px',
                      borderTop: '1px solid #e5e7eb'
                    }}>
                      {/* 分类默认设置 */}
                      <div className="reminder-section" style={{
                        marginBottom: '16px'
                      }}>
                        <div className="reminder-section-header" style={{
                          marginBottom: '12px'
                        }}>
                          <span style={{
                            fontSize: '13px',
                            fontWeight: '500',
                            color: '#374151'
                          }}>分类默认设置</span>
                        </div>
                        
                        {formData.category ? (
                          <div className="reminder-options" style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '8px',
                            width: '100%'
                          }}>
                            {[0, 1, 2, 7, 15, 30, 90].map(days => (
                              <label key={days} style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                cursor: 'pointer',
                                fontSize: '13px',
                                color: '#374151',
                                width: '100%',
                                padding: '4px 0'
                              }}>
                                <input
                                  type="checkbox"
                                  checked={formData.reminderDays && formData.reminderDays.includes(days)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setFormData(prev => ({
                                        ...prev,
                                        reminderDays: [...(prev.reminderDays || []), days]
                                      }));
                                    } else {
                                      setFormData(prev => ({
                                        ...prev,
                                        reminderDays: (prev.reminderDays || []).filter(d => d !== days)
                                      }));
                                    }
                                  }}
                                  style={{ 
                                    margin: 0,
                                    width: '16px',
                                    height: '16px',
                                    cursor: 'pointer'
                                  }}
                                />
                                <span style={{
                                  marginLeft: '4px',
                                  lineHeight: '1.4'
                                }}>
                                  {days === 0 ? '过期当天' : 
                                   days === 1 ? '过期前1天' : 
                                   `过期前${days}天`}
                                </span>
                              </label>
                            ))}
                          </div>
                        ) : (
                          <div style={{
                            fontSize: '12px',
                            color: '#9ca3af',
                            fontStyle: 'italic'
                          }}>
                            请先选择分类
                          </div>
                        )}
                      </div>
                      
                      {/* 自定义设置 */}
                      <div className="reminder-section">
                        <div className="reminder-section-header" style={{
                          marginBottom: '12px'
                        }}>
                          <span style={{
                            fontSize: '13px',
                            fontWeight: '500',
                            color: '#374151'
                          }}>自定义设置</span>
                        </div>
                        
                        <div style={{
                          fontSize: '12px',
                          color: '#6b7280'
                        }}>
                          {formData.customReminderDays && formData.customReminderDays.length > 0 ? (
                            formData.customReminderDays.map(days => 
                              `过期前${days}天`
                            ).join('、')
                          ) : '未设置自定义提醒时间'}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

          {/* 存放位置 */}
          <div className="form-group">
            <label htmlFor="location">存放位置</label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location || ''}
              onChange={handleInputChange}
              placeholder="请输入存放位置"
              inputMode="text"
            />
          </div>

          {/* 备注 */}
          <div className="form-group">
            <label htmlFor="notes">备注</label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              placeholder="例如：请在有效期内使用，避免阳光直射"
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
              保存修改
            </button>
          </div>
        </form>
      </div>



      

      {/* 创建分类模态框 */}
      {showCategoryModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{
            background: 'white',
            borderRadius: '12px',
            width: '90%',
            maxWidth: '500px',
            maxHeight: '90vh',
            overflow: 'hidden',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 1000
          }}>
            <div className="modal-header" style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '20px',
              borderBottom: '1px solid #eee',
              background: 'var(--sage-green)',
              color: 'white'
            }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem' }}>创建新分类</h3>
              <button 
                onClick={handleCancelCreateCategory}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '24px',
                  padding: '0',
                  width: '30px',
                  height: '30px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '50%',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.2)'}
                onMouseLeave={(e) => e.target.style.background = 'none'}
              >
                ×
              </button>
            </div>
            
            <div className="modal-body" style={{ padding: '20px' }}>
              <div className="form-group">
                <label htmlFor="newCategoryName" style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: '500',
                  color: '#333'
                }}>
                  分类名称
                </label>
                <input
                  type="text"
                  id="newCategoryName"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="请输入分类名称"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid var(--sage-green)',
                    borderRadius: '8px',
                    fontSize: '16px',
                    outline: 'none',
                    transition: 'border-color 0.2s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#7a8a4a'}
                  onBlur={(e) => e.target.style.borderColor = 'var(--sage-green)'}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleCreateCategory();
                    }
                  }}
                />
              </div>
              
              <div style={{ 
                display: 'flex', 
                gap: '12px', 
                justifyContent: 'flex-end',
                marginTop: '24px'
              }}>
                <button 
                  onClick={handleCancelCreateCategory}
                  style={{
                    padding: '10px 20px',
                    background: '#f3f4f6',
                    color: '#374151',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.target.style.background = '#e5e7eb'}
                  onMouseLeave={(e) => e.target.style.background = '#f3f4f6'}
                >
                  取消
                </button>
                <button 
                  className="btn"
                  onClick={handleCreateCategory}
                  disabled={!newCategoryName.trim() || isCreatingCategory}
                  style={{
                    padding: '10px 20px',
                    background: newCategoryName.trim() && !isCreatingCategory ? 'var(--sage-green)' : '#9ca3af',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: newCategoryName.trim() && !isCreatingCategory ? 'pointer' : 'not-allowed',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (newCategoryName.trim() && !isCreatingCategory) {
                      e.target.style.background = '#7a8a4a';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (newCategoryName.trim() && !isCreatingCategory) {
                      e.target.style.background = 'var(--sage-green)';
                    }
                  }}
                >
                  {isCreatingCategory ? '创建中...' : '创建分类'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 生产日期选择器 */}
      {showProductionDatePicker && (
        <CustomDatePicker
          isOpen={showProductionDatePicker}
          value={formData.productionDate}
          onChange={(date) => {
            setFormData(prev => ({ ...prev, productionDate: date }));
            setShowProductionDatePicker(false);
          }}
          onClose={() => setShowProductionDatePicker(false)}
          placeholder="选择生产日期"
        />
      )}

      {/* 过期日期选择器 */}
      {showExpiryDatePicker && (
        <CustomDatePicker
          isOpen={showExpiryDatePicker}
          value={formData.expiryDate}
          onChange={(date) => {
            setFormData(prev => ({ ...prev, expiryDate: date }));
            setShowExpiryDatePicker(false);
          }}
          onClose={() => setShowExpiryDatePicker(false)}
          placeholder="选择过期日期"
        />
      )}
    </div>
  );
};

export default EditItem;