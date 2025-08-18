import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit, 
  Trash2, 
  X,
  ChevronDown,
  ChevronRight,
  Bell
} from 'lucide-react';
import toast from 'react-hot-toast';
import { 
  listUserCategories, 
  createUserCategory, 
  deleteUserCategory,
  renameUserCategory,
  setCategoryOrder
} from '../services/categoryService';
import { getCurrentUser } from '../services/authService';
import { DEFAULT_CATEGORIES } from '../utils/itemUtils';

const CategoryManager = ({ onClose }) => {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  
  // 新增：父子分类相关状态
  const [newCategoryParent, setNewCategoryParent] = useState('');
  
  // 新增：过期提醒相关状态
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [reminderSettings, setReminderSettings] = useState({});
  
  // 拖拽传感器配置
  // const sensors = useSensors(
  //   useSensor(PointerSensor),
  //   useSensor(KeyboardSensor, {
  //     coordinateGetter: sortableKeyboardCoordinates,
  //   })
  // );

  // 拖拽开始事件
  // const handleDragStart = (event) => {
  //   setIsDragging(true);
  //   console.log('开始拖拽:', event.active.id);
    
  //   // 添加拖拽状态的CSS类
  //   const categoriesList = document.querySelector('.categories-list');
  //   if (categoriesList) {
  //     categoriesList.classList.add('dragging');
  //   }
  // };

  // 拖拽结束事件
  // const handleDragEnd = async (event) => {
  //   const { active, over } = event;
  //   setIsDragging(false);
    
  //   // 移除拖拽状态的CSS类
  //   const categoriesList = document.querySelector('.categories-list');
  //   if (categoriesList) {
  //     categoriesList.classList.remove('dragging');
  //   }

  //   if (active.id !== over.id) {
  //     console.log('拖拽完成:', { from: active.id, to: over.id });
      
  //     setCategories((items) => {
  //       const oldIndex = items.findIndex(item => item.id === active.id);
  //       const newIndex = items.findIndex(item => item.id === over.id);
        
  //       const newItems = arrayMove(items, oldIndex, newIndex);
        
  //       // 更新每个分类的orderIndex
  //       const updatedItems = newItems.map((item, index) => ({
  //         ...item,
  //         orderIndex: index
  //       }));
        
  //       // 异步保存新的排序到后端
  //       saveNewOrder(updatedItems);
        
  //       return updatedItems;
  //     });
  //   }
  // };

  // 保存新的排序
  // const saveNewOrder = async (updatedCategories) => {
  //   try {
  //     const currentUser = getCurrentUser();
  //     if (!currentUser) {
  //       // 测试模式：保存到localStorage
  //       const testCategories = updatedCategories.filter(cat => !cat.isDefault);
  //       localStorage.setItem('test_categories', JSON.stringify(testCategories));
        
  //       // 更新complete_categories
  //       const completeCategories = buildCompleteCategories(testCategories);
  //       localStorage.setItem('complete_categories', JSON.stringify(completeCategories));
        
  //       // 触发分类更新事件
  //       window.dispatchEvent(new CustomEvent('categoriesUpdated', {
  //         detail: {
  //           mode: 'test',
  //           completeCategories: completeCategories
  //         }
  //       }));
  //     } else {
  //       // 正常模式：保存到LeanCloud
  //       await setCategoryOrder(updatedCategories);
  //     }
  //   } catch (error) {
  //     console.error('保存分类排序失败:', error);
  //     toast.error('保存排序失败，请重试');
  //   }
  // };

  // 创建分类
  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) {
      toast.error('请输入分类名称');
      return;
    }

    setIsCreating(true);
    try {
      const currentUser = getCurrentUser();
      if (!currentUser) {
        // 测试模式：保存到localStorage
        const newCategory = {
          id: `test_${Date.now()}`,
          label: newCategoryName.trim(),
          value: newCategoryName.trim(),
          parent: newCategoryParent || null,
          orderIndex: categories.length
        };
        
        setCategories(prev => [...prev, newCategory]);
      } else {
        // 正常模式：保存到LeanCloud
        const newCategory = await createUserCategory({
          label: newCategoryName.trim(),
          value: newCategoryName.trim(),
          parent: newCategoryParent || null,
          orderIndex: categories.length
        });
        
        setCategories(prev => [...prev, newCategory]);
      }
      
      // 统一显示成功提示
      toast.success('✅ 分类创建成功');
      
      setShowCreateModal(false);
      setNewCategoryName('');
      setNewCategoryParent('');
    } catch (error) {
      console.error('创建分类失败:', error);
      toast.error('创建分类失败，请重试');
    } finally {
      setIsCreating(false);
    }
  };

  // 编辑分类
  const handleEdit = (category) => {
    setEditingCategory(category);
    setNewCategoryName(category.label);
    setNewCategoryParent(category.parent?.id || '');
    setShowEditModal(true);
  };

  // 更新分类
  const handleUpdateCategory = async () => {
    if (!newCategoryName.trim()) {
      toast.error('请输入分类名称');
      return;
    }

    setIsUpdating(true);
    try {
      // 检查是否在测试模式
      const currentUser = getCurrentUser();
      if (!currentUser) {
        // 测试模式：更新localStorage
        const updatedCategories = categories.map(cat => 
          cat.id === editingCategory.id 
            ? { ...cat, label: newCategoryName.trim(), parent: newCategoryParent || null }
            : cat
        );
        setCategories(updatedCategories);
        
        // 保存到localStorage
        const testData = localStorage.getItem('test_categories') || '[]';
        const parsedData = JSON.parse(testData);
        const updatedTestData = parsedData.map(cat => 
          cat.id === editingCategory.id 
            ? { ...cat, label: newCategoryName.trim(), parent: newCategoryParent || null }
            : cat
        );
        localStorage.setItem('test_categories', JSON.stringify(updatedTestData));
        
        // 更新complete_categories
        const completeCategories = buildCompleteCategories(updatedTestData);
        localStorage.setItem('complete_categories', JSON.stringify(completeCategories));
        
        // 触发分类更新事件
        window.dispatchEvent(new CustomEvent('categoriesUpdated', {
          detail: {
            mode: 'test',
            completeCategories: completeCategories
          }
        }));
      } else {
        // 正常模式：更新LeanCloud
        await renameUserCategory(editingCategory.id, newCategoryName.trim());
        
        setCategories(prev => prev.map(cat => 
          cat.id === editingCategory.id 
            ? { ...cat, label: newCategoryName.trim(), parent: newCategoryParent || null }
            : cat
        ));
      }
      
      // 统一显示成功提示
      toast.success('✅ 分类更新成功');
      
      setShowEditModal(false);
      setEditingCategory(null);
      setNewCategoryName('');
      setNewCategoryParent('');
    } catch (error) {
      console.error('更新分类失败:', error);
      toast.error('更新分类失败，请重试');
    } finally {
      setIsUpdating(false);
    }
  };

  // 删除分类
  const handleDelete = async (categoryId) => {
    // 找到要删除的分类，获取其名称
    const categoryToDelete = categories.find(cat => cat.id === categoryId);
    const categoryName = categoryToDelete ? categoryToDelete.label : '这个分类';
    
    if (!window.confirm(`删除「${categoryName}」？\n\n此操作无法撤销。`)) {
      return;
    }

    try {
      const currentUser = getCurrentUser();
      if (!currentUser) {
        // 测试模式：从localStorage删除
        const updatedCategories = categories.filter(cat => cat.id !== categoryId);
        setCategories(updatedCategories);
        
        // 保存到localStorage
        const testData = localStorage.getItem('test_categories') || '[]';
        const parsedData = JSON.parse(testData);
        const updatedTestData = parsedData.filter(cat => cat.id !== categoryId);
        localStorage.setItem('test_categories', JSON.stringify(updatedTestData));
        
        // 更新complete_categories
        const completeCategories = buildCompleteCategories(updatedTestData);
        localStorage.setItem('complete_categories', JSON.stringify(completeCategories));
        
        // 触发分类更新事件
        window.dispatchEvent(new CustomEvent('categoriesUpdated', {
          detail: {
            mode: 'test',
            completeCategories: completeCategories
          }
        }));
      } else {
        // 正常模式：从LeanCloud删除
        await deleteUserCategory(categoryId);
        
        setCategories(prev => prev.filter(cat => cat.id !== categoryId));
      }
      
      // 统一显示成功提示
      toast.success('✅ 分类删除成功');
    } catch (error) {
      console.error('删除分类失败:', error);
      toast.error('删除分类失败，请重试');
    }
  };

  // 选择分类查看过期提醒设置
  const handleSelectCategory = (category) => {
    setSelectedCategory(category);
    
    // 加载该分类的过期提醒设置
    loadCategoryReminderSettings(category);
  };

  // 加载分类的过期提醒设置
  const loadCategoryReminderSettings = (category) => {
    try {
      const currentUser = getCurrentUser();
      if (!currentUser) {
        // 测试模式：从localStorage加载
        const categorySettings = localStorage.getItem(`category_reminder_${category.label}`);
        if (categorySettings) {
          setReminderSettings(JSON.parse(categorySettings));
        } else {
          // 如果没有设置，使用默认值
          setReminderSettings({
            firstReminderDays: [7],
            secondReminderDays: [1]
          });
        }
      } else {
        // 正常模式：从LeanCloud加载
        // 这里需要实现从LeanCloud加载过期提醒设置的逻辑
        setReminderSettings({
          firstReminderDays: [7],
          secondReminderDays: [1]
        });
      }
    } catch (error) {
      console.error('加载过期提醒设置失败:', error);
      setReminderSettings({
        firstReminderDays: [7],
        secondReminderDays: [1]
      });
    }
  };

  // 保存过期提醒设置
  const handleSaveReminderSettings = async () => {
    try {
      const currentUser = getCurrentUser();
      if (!currentUser) {
        // 测试模式：保存到localStorage
        localStorage.setItem(`category_reminder_${selectedCategory.label}`, JSON.stringify(reminderSettings));
      } else {
        // 正常模式：保存到LeanCloud
        // 这里需要实现保存到LeanCloud的逻辑
      }
      // 统一显示成功提示
      toast.success('✅ 过期提醒设置已保存');
    } catch (error) {
      console.error('保存过期提醒设置失败:', error);
      toast.error('保存失败，请重试');
    }
  };

  // 构建分类树形结构
  const buildCategoryTree = (categories) => {
    const categoryMap = new Map();
    const rootCategories = [];

    // 创建分类映射
    categories.forEach(category => {
      categoryMap.set(category.id, { ...category, children: [] });
    });

    // 构建树形结构
    categories.forEach(category => {
      if (category.parent) {
        const parent = categoryMap.get(category.parent);
        if (parent) {
          parent.children.push(categoryMap.get(category.id));
        }
      } else {
        rootCategories.push(categoryMap.get(category.id));
      }
    });

    return rootCategories;
  };

  // 渲染分类树
  const renderCategoryTree = (categories, level = 0) => {
    return categories.map(category => (
      <div key={category.id} className="category-tree-item" style={{ marginLeft: `${level * 20}px` }}>
        <div className="category-tree-header">
          {category.children && category.children.length > 0 && (
            <button
              className="expand-btn"
              onClick={() => toggleCategoryExpansion(category.id)}
            >
              {category.expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>
          )}
          <div 
            className={`category-tree-content ${selectedCategory?.id === category.id ? 'selected' : ''}`}
            onClick={() => handleSelectCategory(category)}
          >
            <span className="category-name">{category.label}</span>
            {category.isDefault && <span className="default-badge">系统</span>}
          </div>
          <div className="category-tree-actions">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleEdit(category);
              }}
              className="action-btn edit-btn"
              title="编辑分类"
            >
              <Edit size={14} />
            </button>
            {!category.isDefault && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(category.id);
                }}
                className="action-btn delete-btn"
                title="删除分类"
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>
        </div>
        {category.children && category.children.length > 0 && category.expanded && (
          <div className="category-children">
            {renderCategoryTree(category.children, level + 1)}
          </div>
        )}
      </div>
    ));
  };

  // 切换分类展开状态
  const toggleCategoryExpansion = (categoryId) => {
    setCategories(prev => prev.map(cat => 
      cat.id === categoryId 
        ? { ...cat, expanded: !cat.expanded }
        : cat
    ));
  };

  // 检查是否在测试模式（没有登录用户）
  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      console.log('检测到未登录状态，启用测试模式');
    }
  }, []);

  const refresh = async () => {
    try {
      // 检查是否在测试模式
      const currentUser = getCurrentUser();
      if (!currentUser) {
        // 测试模式：从localStorage获取测试数据
        const testData = localStorage.getItem('test_categories');
        if (testData) {
          const parsedData = JSON.parse(testData);
          // 合并系统默认分类和用户自定义分类
          const allCategories = [
            ...DEFAULT_CATEGORIES.map(cat => ({
              id: `default_${cat.value}`,
              label: cat.label,
              value: cat.value,
              parent: null,
              orderIndex: cat.value === '其他' ? 999 : DEFAULT_CATEGORIES.indexOf(cat),
              isDefault: true,
              expanded: true
            })),
            ...parsedData.map(cat => ({
              ...cat,
              orderIndex: cat.orderIndex + DEFAULT_CATEGORIES.length,
              expanded: false
            }))
          ];
          setCategories(allCategories);
        } else {
          // 初始化测试数据：只显示系统默认分类
          const initialData = DEFAULT_CATEGORIES.map(cat => ({
            id: `default_${cat.value}`,
            label: cat.label,
            value: cat.value,
            parent: null,
            orderIndex: DEFAULT_CATEGORIES.indexOf(cat),
            isDefault: true,
            expanded: true
          }));
          localStorage.setItem('test_categories', JSON.stringify([]));
          setCategories(initialData);
        }
      } else {
        const data = await listUserCategories();
        // 合并系统默认分类和用户自定义分类
        const allCategories = [
          ...DEFAULT_CATEGORIES.map(cat => ({
            id: `default_${cat.value}`,
            label: cat.label,
            value: cat.value,
            parent: null,
            orderIndex: cat.value === '其他' ? DEFAULT_CATEGORIES.indexOf(cat) : 999,
            isDefault: true,
            expanded: true
          })),
          ...data.map(cat => ({
            ...cat,
            orderIndex: cat.orderIndex + DEFAULT_CATEGORIES.length,
            expanded: false
          }))
        ];
        setCategories(allCategories);
      }
    } catch (error) {
      console.error('获取分类列表失败:', error);
      // 如果出错，显示系统默认分类
      const fallbackData = DEFAULT_CATEGORIES.map(cat => ({
        id: `default_${cat.value}`,
        label: cat.label,
        value: cat.value,
        parent: null,
        orderIndex: DEFAULT_CATEGORIES.indexOf(cat),
        isDefault: true,
        expanded: true
      }));
      setCategories(fallbackData);
    } finally {
      // 无论成功还是失败，都要设置加载完成
      setIsLoading(false);
    }
  };

  useEffect(() => { refresh(); }, []);

  // 构建完整的分类列表（包含系统分类、用户分类和自定义选项）
  const buildCompleteCategories = (testCategories) => {
    const categories = [
      ...DEFAULT_CATEGORIES,
      ...testCategories.map(cat => ({ value: cat.label, label: cat.label })),
      { value: 'custom', label: '自定义' }
    ];
    return categories;
  };

  return (
    <div className="category-manager">
      {/* 样式 */}
      <style>
        {`
          .category-manager {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
          }
          
          .category-manager .modal-container {
            background: white;
            border-radius: 16px;
            width: 95%;
            max-width: 1000px;
            max-height: 90vh;
            overflow: hidden;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
            display: flex;
            flex-direction: column;
          }
          
          .category-manager .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 20px 24px;
            border-bottom: 1px solid #e5e7eb;
            background: #f9fafb;
          }
          
          .category-manager .header h2 {
            margin: 0;
            font-size: 1.5rem;
            color: #1f2937;
            font-weight: 600;
          }
          
          .category-manager .close-btn {
            background: none;
            border: none;
            font-size: 24px;
            cursor: pointer;
            color: #6b7280;
            padding: 8px;
            border-radius: 8px;
            transition: all 0.2s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            width: 40px;
            height: 40px;
          }
          
          .category-manager .close-btn:hover {
            background: #e5e7eb;
            color: #374151;
          }
          
          .category-manager .content {
            display: flex;
            flex: 1;
            overflow: hidden;
          }
          
          .category-manager .left-panel {
            flex: 1;
            border-right: 1px solid #e5e7eb;
            display: flex;
            flex-direction: column;
          }
          
          .category-manager .right-panel {
            flex: 1;
            display: flex;
            flex-direction: column;
            background: #f9fafb;
          }
          
          .category-manager .panel-header {
            padding: 16px 20px;
            border-bottom: 1px solid #e5e7eb;
            background: white;
          }
          
          .category-manager .panel-header h3 {
            margin: 0;
            font-size: 1.1rem;
            color: #1f2937;
            font-weight: 600;
          }
          
          .category-manager .actions {
            padding: 16px 20px;
            border-bottom: 1px solid #e5e7eb;
            background: white;
          }
          
          .category-manager .add-btn {
            background: var(--sage-green);
            color: white;
            border: none;
            padding: 10px 16px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 500;
            display: flex;
            align-items: center;
            gap: 8px;
            transition: all 0.2s ease;
          }
          
          .category-manager .add-btn:hover {
            background: #7a8a4a;
            transform: translateY(-1px);
          }
          
          .category-manager .categories-tree {
            flex: 1;
            overflow-y: auto;
            padding: 16px 20px;
            background: white;
          }
          
          .category-manager .category-tree-item {
            margin-bottom: 8px;
          }
          
          .category-manager .category-tree-header {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 8px 12px;
            border-radius: 8px;
            transition: all 0.2s ease;
            cursor: pointer;
          }
          
          .category-manager .category-tree-header:hover {
            background: #f3f4f6;
          }
          
          .category-manager .expand-btn {
            background: none;
            border: none;
            cursor: pointer;
            color: #6b7280;
            padding: 4px;
            border-radius: 4px;
            transition: all 0.2s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            width: 24px;
            height: 24px;
          }
          
          .category-manager .expand-btn:hover {
            background: #e5e7eb;
            color: #374151;
          }
          
          .category-manager .category-tree-content {
            flex: 1;
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 4px 0;
          }
          
          .category-manager .category-tree-content.selected {
            background: #dbeafe;
            border-radius: 6px;
            padding: 4px 8px;
            margin: -4px -8px;
          }
          
          .category-manager .category-name {
            font-size: 14px;
            font-weight: 500;
            color: #1f2937;
          }
          
          .category-manager .default-badge {
            background: #10b981;
            color: white;
            font-size: 10px;
            padding: 2px 6px;
            border-radius: 10px;
            font-weight: 500;
          }
          
          .category-manager .category-tree-actions {
            display: flex;
            gap: 4px;
            opacity: 0;
            transition: opacity 0.2s ease;
          }
          
          .category-manager .category-tree-header:hover .category-tree-actions {
            opacity: 1;
          }
          
          .category-manager .action-btn {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 28px;
            height: 28px;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            transition: all 0.2s ease;
            color: white;
            font-size: 12px;
          }
          
          .category-manager .edit-btn {
            background: #3b82f6;
          }
          
          .category-manager .edit-btn:hover {
            background: #2563eb;
            transform: scale(1.05);
          }
          
          .category-manager .delete-btn {
            background: #ef4444;
          }
          
          .category-manager .delete-btn:hover {
            background: #dc2626;
            transform: scale(1.05);
          }
          
          .category-manager .category-children {
            margin-left: 20px;
            border-left: 2px solid #e5e7eb;
            padding-left: 16px;
          }
          
          .category-manager .reminder-settings {
            flex: 1;
            overflow-y: auto;
            padding: 20px;
          }
          
          .category-manager .reminder-header {
            margin-bottom: 24px;
            padding-bottom: 16px;
            border-bottom: 1px solid #e5e7eb;
          }
          
          .category-manager .reminder-header h4 {
            margin: 0 0 8px 0;
            font-size: 1.2rem;
            color: #1f2937;
            font-weight: 600;
          }
          
          .category-manager .reminder-header p {
            margin: 0;
            color: #6b7280;
            font-size: 14px;
          }
          
          .category-manager .reminder-options {
            margin-bottom: 24px;
          }
          
          .category-manager .reminder-options h5 {
            margin: 0 0 16px 0;
            font-size: 1rem;
            color: #374151;
            font-weight: 500;
          }
          
          .category-manager .reminder-option {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 12px;
            cursor: pointer;
            padding: 8px 0;
          }
          
          .category-manager .reminder-option input[type="checkbox"] {
            width: 18px;
            height: 18px;
            cursor: pointer;
          }
          
          .category-manager .reminder-option span {
            font-size: 14px;
            color: #374151;
          }
          
          .category-manager .reminder-actions {
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            display: flex;
            gap: 12px;
            justify-content: flex-end;
          }
          
          .category-manager .btn {
            padding: 10px 20px;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 500;
            transition: all 0.2s ease;
          }
          
          .category-manager .btn-primary {
            background: var(--sage-green);
            color: white;
          }
          
          .category-manager .btn-primary:hover {
            background: #7a8a4a;
          }
          
          .category-manager .btn-secondary {
            background: #f3f4f6;
            color: #374151;
          }
          
          .category-manager .btn-secondary:hover {
            background: #e5e7eb;
          }
          
          .category-manager .loading {
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 50px 20px;
            color: #6b7280;
            font-size: 14px;
            background: #f9fafb;
            margin: 20px;
            border-radius: 10px;
          }
          
          .category-manager .no-category-selected {
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 50px 20px;
            color: #6b7280;
            font-size: 14px;
            background: #f9fafb;
            margin: 20px;
            border-radius: 10px;
            text-align: center;
          }
          
          .category-manager .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1100;
          }
          
          .category-manager .modal-content {
            background: white;
            border-radius: 12px;
            width: 90%;
            max-width: 500px;
            max-height: 80vh;
            overflow: hidden;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
          }
          
          .category-manager .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 20px;
            border-bottom: 1px solid #e5e7eb;
            background: #f9fafb;
          }
          
          .category-manager .modal-header h3 {
            margin: 0;
            font-size: 1.2rem;
            color: #1f2937;
            font-weight: 600;
          }
          
          .category-manager .modal-body {
            padding: 20px;
          }
          
          .category-manager .modal-body input,
          .category-manager .modal-body select {
            width: 100%;
            padding: 10px 12px;
            border: 1px solid #d1d5db;
            border-radius: 8px;
            font-size: 14px;
            margin-bottom: 16px;
            box-sizing: border-box;
          }
          
          .category-manager .modal-body select {
            margin-bottom: 20px;
          }
          
          .category-manager .modal-actions {
            display: flex;
            gap: 12px;
            justify-content: flex-end;
          }
          
          .category-manager .btn-secondary {
            background: #f3f4f6;
            color: #374151;
          }
          
          .category-manager .btn-primary {
            background: var(--sage-green);
            color: white;
          }
        `}
      </style>

      <div className="modal-container">
        <div className="header">
          <h2>分类管理与过期提醒</h2>
          <button onClick={onClose} className="close-btn">
            <X size={20} />
          </button>
        </div>

        <div className="content">
          {/* 左侧：分类树形结构 */}
          <div className="left-panel">
            <div className="panel-header">
              <h3>分类结构</h3>
            </div>
            
            <div className="actions">
              <button onClick={() => setShowCreateModal(true)} className="add-btn">
                <Plus size={16} />
                添加新分类
              </button>
            </div>

            {isLoading ? (
              <div className="loading">加载中...</div>
            ) : (
              <div className="categories-tree">
                {renderCategoryTree(buildCategoryTree(categories))}
              </div>
            )}
          </div>

          {/* 右侧：过期提醒设置 */}
          <div className="right-panel">
            <div className="panel-header">
              <h3>过期提醒设置</h3>
            </div>
            
            {selectedCategory ? (
              <div className="reminder-settings">
                <div className="reminder-header">
                  <h4>{selectedCategory.label}</h4>
                  <p>设置该分类的过期提醒规则</p>
                </div>
                
                <div className="reminder-options">
                  <h5>提醒时间选择</h5>
                  <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '16px' }}>
                    温馨提示：可选择多个提醒时间。
                  </p>
                  
                  {[0, 1, 2, 7, 15, 30, 90].map(days => (
                    <label key={days} className="reminder-option">
                      <input
                        type="checkbox"
                        checked={reminderSettings.firstReminderDays?.includes(days) || reminderSettings.secondReminderDays?.includes(days)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setReminderSettings(prev => ({
                              ...prev,
                              firstReminderDays: [...(prev.firstReminderDays || []), days]
                            }));
                          } else {
                            setReminderSettings(prev => ({
                              ...prev,
                              firstReminderDays: (prev.firstReminderDays || []).filter(d => d !== days),
                              secondReminderDays: (prev.secondReminderDays || []).filter(d => d !== days)
                            }));
                          }
                        }}
                      />
                      <span>{days === 0 ? '过期当天' : days === 1 ? '过期前1天' : `过期前${days}天`}</span>
                    </label>
                  ))}
                </div>
                
                <div className="reminder-actions">
                  <button className="btn btn-secondary" onClick={() => setSelectedCategory(null)}>
                    关闭
                  </button>
                  <button className="btn btn-primary" onClick={handleSaveReminderSettings}>
                    保存设置
                  </button>
                </div>
              </div>
            ) : (
              <div className="no-category-selected">
                <div>
                  <Bell size={48} style={{ color: '#9ca3af', marginBottom: '16px' }} />
                  <p>请从左侧选择一个分类来设置过期提醒</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 创建分类模态框 */}
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>创建新分类</h3>
              <button onClick={() => setShowCreateModal(false)} className="close-btn">
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <input
                type="text"
                placeholder="请输入分类名称"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleCreateCategory()}
                autoFocus
                ref={(input) => {
                  if (input) {
                    input.focus();
                    input.select();
                  }
                }}
              />
              
              <select
                value={newCategoryParent}
                onChange={(e) => setNewCategoryParent(e.target.value)}
              >
                <option value="">无父级分类</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.label}</option>
                ))}
              </select>
              
              <div className="modal-actions">
                <button onClick={() => setShowCreateModal(false)} className="btn btn-secondary">
                  取消
                </button>
                <button 
                  onClick={handleCreateCategory} 
                  disabled={!newCategoryName.trim() || isCreating}
                  className="btn btn-primary"
                >
                  {isCreating ? '创建中...' : '创建'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 编辑分类模态框 */}
      {showEditModal && editingCategory && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>编辑分类</h3>
              <button onClick={() => setShowEditModal(false)} className="close-btn">
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <input
                type="text"
                placeholder="请输入分类名称"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleUpdateCategory()}
                autoFocus
                ref={(input) => {
                  if (input) {
                    input.focus();
                    input.select();
                  }
                }}
              />
              
              <select
                value={newCategoryParent}
                onChange={(e) => setNewCategoryParent(e.target.value)}
              >
                <option value="">无父级分类</option>
                {categories.filter(cat => cat.id !== editingCategory.id).map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.label}</option>
                ))}
              </select>
              
              <div className="modal-actions">
                <button onClick={() => setShowEditModal(false)} className="btn btn-secondary">
                  取消
                </button>
                <button 
                  onClick={handleUpdateCategory} 
                  disabled={!newCategoryName.trim() || isUpdating}
                  className="btn btn-primary"
                >
                  {isUpdating ? '更新中...' : '更新'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryManager;
