import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, ArrowLeft, Camera, FileText } from 'lucide-react';
import { useLeanCloudItems } from '../../hooks/useLeanCloudItems';
import { DEFAULT_CATEGORIES, buildCategories, MEDICINE_TAGS } from '../../utils/itemUtils';
import { listUserCategories, createUserCategory } from '../../services/categoryService';
import BarcodeScanner from '../../components/BarcodeScanner';
import OCRScanner from '../../components/OCRScanner';
import CustomDatePicker from '../../components/CustomDatePicker';
import { generateProductInfo } from '../../services/productDatabase';
import toast from 'react-hot-toast';

const AddItem = () => {
  const navigate = useNavigate();
  const { addItem } = useLeanCloudItems();
  
  // 表单数据状态
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    brand: '',
    quantity: 1,
    productionDate: '',
    expiryDate: '',
    notes: '',
    location: '',
    reminderDays: [], // 分类默认提醒天数数组
    customReminderDays: [] // 自定义提醒天数数组
  });
  
  // 新增：录入模式状态
  const [inputMode, setInputMode] = useState('manual'); // 'manual' | 'scan'
  
  // 新增：智能日期模式状态
  const [dateMode, setDateMode] = useState('expiryOnly'); // 'expiryOnly' | 'advanced'
  const [shelfLife, setShelfLife] = useState('');
  const [shelfLifeUnit, setShelfLifeUnit] = useState('年');
  
  // 新增：记忆功能状态
  const [lastUsedCategory, setLastUsedCategory] = useState('');
  const [lastUsedLocation, setLastUsedLocation] = useState('');
  const [showLocationInput, setShowLocationInput] = useState(false);
  const [selectedMedicineTags, setSelectedMedicineTags] = useState([]);
  const [errors, setErrors] = useState({});
  const [customCategories, setCustomCategories] = useState([]);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [showOCRScanner, setShowOCRScanner] = useState(false);
  
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

    // 新增：加载记忆功能数据
    const loadMemoryData = () => {
      try {
        const memoryData = localStorage.getItem('addItem_memory');
        if (memoryData) {
          const { category, location } = JSON.parse(memoryData);
          if (category) {
            setLastUsedCategory(category);
            setFormData(prev => ({ ...prev, category }));
          }
          if (location) {
            setLastUsedLocation(location);
          }
        }
      } catch (error) {
        console.error('加载记忆数据失败:', error);
      }
    };

    loadMemoryData();

    return () => {
      window.removeEventListener('categoriesUpdated', handleCategoriesUpdated);
    };
  }, []);

  // 验证日期逻辑
  const validateDates = () => {
    const { productionDate, expiryDate } = formData;
    
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
  };

  const handleQuantityChange = (change) => {
    const currentQuantity = formData.quantity || 1;
    const newQuantity = Math.max(1, Math.min(999, currentQuantity + change));
    setFormData(prev => ({ ...prev, quantity: newQuantity }));
  };

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
    
    // 验证日期逻辑
    if (name === 'productionDate' || name === 'expiryDate') {
      validateDates();
    }
  };

  const handleCategoryChange = (e) => {
    const category = e.target.value;
    
    if (category === 'custom') {
      // 显示分类创建模态框，而不是跳转页面
      setShowCategoryModal(true);
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      category
    }));
    
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
            ].filter((value, index, self) => self.indexOf(value) === index) // 去重
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
      
      toast.success('✅ 扫码成功，已自动填充');
    } catch (error) {
      console.error('处理扫码结果失败:', error);
      toast.error('扫码处理失败，请手动输入商品信息');
    }
    
    setShowOCRScanner(false);
  };

  // 创建新分类
  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) {
      toast.error('请输入分类名称');
      return;
    }
    
    setIsCreatingCategory(true);
    try {
      // 这里应该调用实际的分类创建API
      // 暂时模拟创建成功
      const newCategory = {
        id: Date.now().toString(),
        label: newCategoryName.trim(),
        value: newCategoryName.trim().toLowerCase()
      };
      
      // 添加到自定义分类列表
      setCustomCategories(prev => [...prev, newCategory]);
      
      // 自动选择新创建的分类
      setFormData(prev => ({
        ...prev,
        category: newCategory.value
      }));
      
      // 关闭模态框并重置状态
      setShowCategoryModal(false);
      setNewCategoryName('');
      
      toast.success('✅ 分类已创建');
    } catch (error) {
      console.error('创建分类失败:', error);
      toast.error('创建分类失败，请重试');
    } finally {
      setIsCreatingCategory(false);
    }
  };

  // 取消创建分类
  const handleCancelCreateCategory = () => {
    setShowCategoryModal(false);
    setNewCategoryName('');
    // 重置分类选择
    setFormData(prev => ({
      ...prev,
      category: ''
    }));
  };

  // 处理OCR扫描结果
  const handleOCRResult = (result) => {
    console.log('OCR扫描结果:', result);
    
    // 根据扫描结果自动填充表单
    if (result.text) {
      // 尝试识别物品名称（通常是第一行或最长的文本）
      const lines = result.text.split('\n').filter(line => line.trim());
      if (lines.length > 0) {
        setFormData(prev => ({
          ...prev,
          name: lines[0].trim()
        }));
      }
      
      // 尝试识别日期（查找日期格式的文本）
      const datePattern = /(\d{4})[-\/](\d{1,2})[-\/](\d{1,2})/;
      const dateMatch = result.text.match(datePattern);
      if (dateMatch) {
        const dateStr = `${dateMatch[1]}-${dateMatch[2].padStart(2, '0')}-${dateMatch[3].padStart(2, '0')}`;
        setFormData(prev => ({
          ...prev,
          expiryDate: dateStr
        }));
      }
      
      // 尝试识别品牌（查找常见的品牌关键词）
      const brandKeywords = ['品牌', 'Brand', 'BRAND', '品牌名'];
      for (const keyword of brandKeywords) {
        const brandIndex = result.text.indexOf(keyword);
        if (brandIndex !== -1) {
          const afterBrand = result.text.substring(brandIndex + keyword.length);
          const brandMatch = afterBrand.match(/[^\s\n]+/);
          if (brandMatch) {
            setFormData(prev => ({
              ...prev,
              brand: brandMatch[0].trim()
            }));
            break;
          }
        }
      }
      
      toast.success('✅ 扫描结果已填充，请核对并补充');
    }
    
    setShowOCRScanner(false);
  };

  // 智能日期计算函数
  const calculateExpiryDate = () => {
    if (!formData.productionDate || !shelfLife) return;
    
    const productionDate = new Date(formData.productionDate);
    const shelfLifeValue = parseInt(shelfLife);
    
    if (isNaN(shelfLifeValue) || shelfLifeValue <= 0) return;
    
    let expiryDate = new Date(productionDate);
    
    switch (shelfLifeUnit) {
      case '年':
        expiryDate.setFullYear(expiryDate.getFullYear() + shelfLifeValue);
        break;
      case '月':
        expiryDate.setMonth(expiryDate.getMonth() + shelfLifeValue);
        break;
      case '天':
        expiryDate.setDate(expiryDate.getDate() + shelfLifeValue);
        break;
      default:
        return;
    }
    
    setFormData(prev => ({
      ...prev,
      expiryDate: expiryDate.toISOString().split('T')[0]
    }));
    
    toast.success(`已根据生产日期和保质期自动计算过期日期：${expiryDate.toISOString().split('T')[0]}`);
  };

  const calculateShelfLife = () => {
    if (!formData.productionDate || !formData.expiryDate) return;
    
    const productionDate = new Date(formData.productionDate);
    const expiryDate = new Date(formData.expiryDate);
    
    if (expiryDate <= productionDate) {
      toast.error('过期日期必须晚于生产日期');
      return;
    }
    
    const diffTime = expiryDate.getTime() - productionDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays >= 365) {
      const years = Math.floor(diffDays / 365);
      setShelfLife(years.toString());
      setShelfLifeUnit('年');
      toast.success(`已自动计算保质期：${years}年`);
    } else if (diffDays >= 30) {
      const months = Math.floor(diffDays / 30);
      setShelfLife(months.toString());
      setShelfLifeUnit('月');
      toast.success(`已自动计算保质期：${months}月`);
    } else {
      setShelfLife(diffDays.toString());
      setShelfLifeUnit('天');
      toast.success(`已自动计算保质期：${diffDays}天`);
    }
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

      const newItem = {
        ...formData,
        notes,
        medicineTags: selectedMedicineTags
      };

      await addItem(newItem);
      
      // 新增：保存记忆功能数据
      try {
        const memoryData = {
          category: formData.category,
          location: formData.location || lastUsedLocation
        };
        localStorage.setItem('addItem_memory', JSON.stringify(memoryData));
      } catch (error) {
        console.error('保存记忆数据失败:', error);
      }
      
      navigate('/');
    } catch (error) {
      console.error('添加物品失败:', error);
      toast.error('添加失败，请重试');
    }
  };

  return (
    <div className="add-item-page">
      {/* 标签页样式 */}
      <style>
        {`
          .input-mode-tabs {
            display: flex;
            background: white;
            border-radius: 12px;
            padding: 8px;
            margin: 20px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            gap: 8px;
          }
          
          .tab-button {
            flex: 1;
            padding: 12px 20px;
            border: none;
            border-radius: 8px;
            background: #f3f4f6;
            color: #6b7280;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s ease;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          
          .tab-button:hover {
            background: #e5e7eb;
            color: #374151;
          }
          
          .tab-button.active {
            background: var(--sage-green);
            color: white;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          }
          
          .scan-description {
            text-align: center;
            color: #6b7280;
            margin-bottom: 24px;
            font-size: 14px;
            line-height: 1.5;
          }
          
          .scan-interface {
            text-align: center;
          }
          
          .scan-result-preview {
            background: #f9fafb;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 20px;
            margin-top: 20px;
            text-align: left;
          }
          
          .scan-result-preview h4 {
            margin: 0 0 16px 0;
            color: #374151;
            font-size: 16px;
          }
          
          .preview-item {
            margin-bottom: 8px;
            color: #6b7280;
          }
          
          .preview-note {
            margin-top: 16px;
            padding: 12px;
            background: #dbeafe;
            border: 1px solid #93c5fd;
            border-radius: 6px;
            color: #1e40af;
            font-size: 13px;
            line-height: 1.4;
          }
          
          .date-mode-toggle {
            display: flex;
            gap: 20px;
            margin-bottom: 16px;
          }
          
          .date-mode-label {
            display: flex;
            align-items: center;
            gap: 8px;
            cursor: pointer;
            font-size: 14px;
            color: #374151;
          }
          
          .date-mode-label input[type="radio"] {
            margin: 0;
            cursor: pointer;
          }
          
          .shelf-life-input {
            display: flex;
            align-items: center;
            gap: 8px;
          }
          
          .expiry-date-input {
            display: flex;
            align-items: center;
            gap: 8px;
          }
          
          .calculate-btn {
            white-space: nowrap;
            transition: all 0.2s ease;
          }
          
          .calculate-btn:hover:not(:disabled) {
            background: #7a8a4a !important;
          }
          
          .quantity-stepper {
            display: flex;
            align-items: center;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          }
          
          .stepper-btn {
            border: none;
            outline: none;
            transition: all 0.2s ease;
          }
          
          .stepper-btn:active {
            transform: scale(0.95);
          }
          
          .quantity-stepper input[type="number"] {
            border: none;
            outline: none;
            -moz-appearance: textfield;
          }
          
          .quantity-stepper input[type="number"]::-webkit-outer-spin-button,
          .quantity-stepper input[type="number"]::-webkit-inner-spin-button {
            -webkit-appearance: none;
            margin: 0;
          }
          
          .memory-hint {
            margin-top: 4px;
          }
          
          .location-input {
            display: flex;
            align-items: center;
            gap: 8px;
          }
          
          .memory-btn {
            transition: all 0.2s ease;
          }
          
          .memory-btn:hover {
            background: #e5e7eb !important;
            color: #374151 !important;
          }
        `}
      </style>

      {/* 顶部标签页 */}
      <div className="input-mode-tabs">
        <button
          className={`tab-button ${inputMode === 'manual' ? 'active' : ''}`}
          onClick={() => setInputMode('manual')}
        >
          <FileText size={20} style={{ marginRight: '8px' }} />
          手动录入
        </button>
        <button
          className={`tab-button ${inputMode === 'scan' ? 'active' : ''}`}
          onClick={() => setInputMode('scan')}
        >
          <Camera size={20} style={{ marginRight: '8px' }} />
          扫描录入
        </button>
      </div>

      {/* 手动录入模式 */}
      {inputMode === 'manual' && (
        <div className="manual-input-mode">
          <div className="card">
            <h2>添加物品</h2>
            
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
                  inputMode="text"
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
                  inputMode="text"
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
                  {customCategories.map(category => (
                    <option key={category.value} value={category.value}>{category.label}</option>
                  ))}
                </select>
                 
                {/* 记忆功能提示 */}
                {formData.category && (
                  <div className="memory-hint">
                    <span>💡 已记住您的选择，下次会优先显示</span>
                  </div>
                )}
                
                {/* 创建新分类 */}
                {formData.category === 'custom' && (
                  <div className="new-category-input">
                    <input
                      type="text"
                      placeholder="输入新分类名称"
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      style={{
                        marginTop: '8px',
                        padding: '8px 12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '14px',
                        width: '100%',
                        boxSizing: 'border-box'
                      }}
                    />
                    <div style={{ 
                      display: 'flex', 
                      gap: '8px', 
                      marginTop: '8px'
                    }}>
                      <button
                        type="button"
                        onClick={handleCreateCategory}
                        disabled={!newCategoryName.trim() || isCreatingCategory}
                        style={{
                          padding: '6px 12px',
                          background: newCategoryName.trim() && !isCreatingCategory ? 'var(--sage-green)' : '#9ca3af',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          fontSize: '12px',
                          cursor: newCategoryName.trim() && !isCreatingCategory ? 'pointer' : 'not-allowed'
                        }}
                      >
                        {isCreatingCategory ? '创建中...' : '创建分类'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setFormData(prev => ({ ...prev, category: '' }));
                          setNewCategoryName('');
                        }}
                        style={{
                          padding: '6px 12px',
                          background: '#f3f4f6',
                          color: '#374151',
                          border: 'none',
                          borderRadius: '4px',
                          fontSize: '12px',
                          cursor: 'pointer'
                        }}
                      >
                        取消
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* 数量 */}
              <div className="form-group">
                <label htmlFor="quantity">数量</label>
                <div className="quantity-stepper">
                  <button
                    type="button"
                    onClick={() => handleQuantityChange(-1)}
                    className="quantity-btn"
                    style={{
                      width: '40px',
                      height: '40px',
                      border: '1px solid #d1d5db',
                      background: 'white',
                      borderRadius: '6px 0 0 6px',
                      cursor: 'pointer',
                      fontSize: '18px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    -
                  </button>
                  <input
                    type="number"
                    id="quantity"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleInputChange}
                    min="1"
                    max="999"
                    inputMode="numeric"
                    placeholder="1-999"
                    style={{
                      width: '80px',
                      height: '40px',
                      border: '1px solid #d1d5db',
                      borderLeft: 'none',
                      borderRight: 'none',
                      textAlign: 'center',
                      fontSize: '16px',
                      outline: 'none'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => handleQuantityChange(1)}
                    className="quantity-btn"
                    style={{
                      width: '40px',
                      height: '40px',
                      border: '1px solid #d1d5db',
                      background: 'white',
                      borderRadius: '0 6px 6px 0',
                      cursor: 'pointer',
                      fontSize: '18px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    +
                  </button>
                </div>
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
                <div className="location-input-container">
                  <input
                    type="text"
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder={lastUsedLocation ? `上次使用: ${lastUsedLocation}` : "请输入存放位置"}
                    inputMode="text"
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px',
                      boxSizing: 'border-box'
                    }}
                  />
                  {lastUsedLocation && (
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, location: lastUsedLocation }))}
                      style={{
                        marginTop: '8px',
                        padding: '6px 12px',
                        background: 'var(--sage-green)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        fontSize: '12px',
                        cursor: 'pointer'
                      }}
                      title={`使用上次的存放位置: ${lastUsedLocation}`}
                    >
                      使用上次
                    </button>
                  )}
                </div>
              </div>

              {/* 备注 */}
              <div className="form-group">
                <label htmlFor="notes">备注</label>
                <textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="例如：朋友送的，要先用完"
                  rows="3"
                  inputMode="text"
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
      )}

      {/* 扫描录入模式 */}
      {inputMode === 'scan' && (
        <div className="scan-input-mode">
          <div className="card">
            <h2>扫描录入</h2>
            <p className="scan-description">
              请将商品条形码或包装上的日期文字对准扫描框，系统将自动识别并填充信息
            </p>
            
            {/* 扫描界面 */}
            <div className="scan-interface">
              <button
                className="btn scan-button"
                onClick={() => setShowOCRScanner(true)}
                style={{
                  background: 'var(--sage-green)',
                  color: 'white',
                  padding: '20px',
                  fontSize: '1.2rem',
                  width: '100%',
                  marginBottom: '20px'
                }}
              >
                <Camera size={24} style={{ marginRight: '12px' }} />
                开始扫描
              </button>
              
              {/* 扫描结果预览 */}
              {formData.name && (
                <div className="scan-result-preview">
                  <h4>扫描结果预览</h4>
                  <div className="preview-item">
                    <strong>物品名称:</strong> {formData.name}
                  </div>
                  {formData.brand && (
                    <div className="preview-item">
                      <strong>品牌:</strong> {formData.brand}
                    </div>
                  )}
                  {formData.expiryDate && (
                    <div className="preview-item">
                      <strong>过期日期:</strong> {formData.expiryDate}
                    </div>
                  )}
                  <p className="preview-note">
                    请核对扫描结果，如有需要可以切换到"手动录入"模式进行修改
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 分类创建模态框 */}
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





      {/* OCR扫描器 */}
      {showOCRScanner && (
        <div className="modal-overlay">
          <div className="modal-content" style={{
            background: 'white',
            borderRadius: '12px',
            width: '95%',
            maxWidth: '600px',
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
              <h3 style={{ margin: 0, fontSize: '1.2rem' }}>OCR扫描</h3>
              <button 
                onClick={() => setShowOCRScanner(false)}
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
                onMouseEnter={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)'}
                onMouseLeave={(e) => e.target.style.borderColor = 'none'}
              >
                ×
              </button>
            </div>
            
            <div className="modal-body" style={{ padding: '20px' }}>
              <OCRScanner 
                onClose={() => setShowOCRScanner(false)}
                onScanResult={handleOCRResult}
              />
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

export default AddItem; 