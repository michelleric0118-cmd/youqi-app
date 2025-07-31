// LeanCloud数据服务
import AV from 'leancloud-storage';

const CLASS_NAME = 'Item';

// 添加物品
export const addItemToLeanCloud = async (itemData) => {
  try {
    const Item = AV.Object.extend(CLASS_NAME);
    const newItem = new Item();
    
    // 设置物品属性
    for (let key in itemData) {
      if (itemData[key] !== undefined && itemData[key] !== null) {
        newItem.set(key, itemData[key]);
      }
    }
    
    // 设置时间戳
    newItem.set('createdAt', new Date());
    newItem.set('updatedAt', new Date());
    
    const savedItem = await newItem.save();
    return { id: savedItem.id, ...itemData };
  } catch (error) {
    console.error('Error adding item:', error);
    throw error;
  }
};

// 获取所有物品
export const getItemsFromLeanCloud = async () => {
  try {
    const Item = AV.Object.extend(CLASS_NAME);
    const query = new AV.Query(Item);
    query.descending('createdAt');
    
    const results = await query.find();
    return results.map(item => ({
      id: item.id,
      name: item.get('name'),
      category: item.get('category'),
      brand: item.get('brand'),
      quantity: item.get('quantity'),
      expiryDate: item.get('expiryDate'),
      notes: item.get('notes'),
      medicineTags: item.get('medicineTags'),
      createdAt: item.get('createdAt')?.toISOString(),
      updatedAt: item.get('updatedAt')?.toISOString()
    }));
  } catch (error) {
    console.error('Error getting items:', error);
    throw error;
  }
};

// 更新物品
export const updateItemInLeanCloud = async (itemId, updateData) => {
  try {
    const Item = AV.Object.extend(CLASS_NAME);
    const query = new AV.Query(Item);
    const item = await query.get(itemId);
    
    // 更新属性
    for (let key in updateData) {
      if (updateData[key] !== undefined && updateData[key] !== null) {
        item.set(key, updateData[key]);
      }
    }
    
    item.set('updatedAt', new Date());
    await item.save();
    
    return { id: item.id, ...updateData };
  } catch (error) {
    console.error('Error updating item:', error);
    throw error;
  }
};

// 删除物品
export const deleteItemFromLeanCloud = async (itemId) => {
  try {
    const Item = AV.Object.extend(CLASS_NAME);
    const query = new AV.Query(Item);
    const item = await query.get(itemId);
    await item.destroy();
    return true;
  } catch (error) {
    console.error('Error deleting item:', error);
    throw error;
  }
};

// 获取即将过期的物品
export const getExpiringItemsFromLeanCloud = async (filterType = 'all') => {
  try {
    const Item = AV.Object.extend(CLASS_NAME);
    const query = new AV.Query(Item);
    
    const now = new Date();
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    
    switch (filterType) {
      case 'expired':
        query.lessThan('expiryDate', now.toISOString().split('T')[0]);
        break;
      case 'expiring-soon':
        query.greaterThanOrEqualTo('expiryDate', now.toISOString().split('T')[0]);
        query.lessThan('expiryDate', sevenDaysFromNow.toISOString().split('T')[0]);
        break;
      case 'expiring-month':
        query.greaterThanOrEqualTo('expiryDate', now.toISOString().split('T')[0]);
        query.lessThan('expiryDate', thirtyDaysFromNow.toISOString().split('T')[0]);
        break;
      case 'all':
        query.greaterThanOrEqualTo('expiryDate', now.toISOString().split('T')[0]);
        query.lessThan('expiryDate', thirtyDaysFromNow.toISOString().split('T')[0]);
        break;
      default:
        break;
    }
    
    query.descending('createdAt');
    const results = await query.find();
    
    return results.map(item => ({
      id: item.id,
      name: item.get('name'),
      category: item.get('category'),
      brand: item.get('brand'),
      quantity: item.get('quantity'),
      expiryDate: item.get('expiryDate'),
      notes: item.get('notes'),
      medicineTags: item.get('medicineTags'),
      createdAt: item.get('createdAt')?.toISOString(),
      updatedAt: item.get('updatedAt')?.toISOString()
    }));
  } catch (error) {
    console.error('Error getting expiring items:', error);
    throw error;
  }
}; 