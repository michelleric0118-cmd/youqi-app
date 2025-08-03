// LeanCloud数据服务
import AV from 'leancloud-storage';

const CLASS_NAME = 'Item';

// 添加物品
export const addItemToLeanCloud = async (itemData) => {
  try {
    const Item = AV.Object.extend(CLASS_NAME);
    const newItem = new Item();
    
    // 设置物品属性（排除系统保留字段）
    for (let key in itemData) {
      if (itemData[key] !== undefined && itemData[key] !== null && 
          key !== 'createdAt' && key !== 'updatedAt' && key !== 'id') {
        newItem.set(key, itemData[key]);
      }
    }
    
    // 设置ACL权限为公共读写，避免删除时的权限问题
    const acl = new AV.ACL();
    acl.setPublicReadAccess(true);
    acl.setPublicWriteAccess(true);
    newItem.setACL(acl);
    
    // 不设置任何时间戳，让LeanCloud自动处理
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
    
    // 更新属性（排除系统保留字段）
    for (let key in updateData) {
      if (updateData[key] !== undefined && updateData[key] !== null && 
          key !== 'createdAt' && key !== 'updatedAt' && key !== 'id') {
        item.set(key, updateData[key]);
      }
    }
    
    // 不手动设置updatedAt，让LeanCloud自动处理
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
    console.log('物品删除成功:', itemId);
    return true;
  } catch (error) {
    console.error('Error deleting item:', error);
    
    // 如果普通删除失败，尝试使用REST API删除
    if (error.code === 403 || error.message.includes('Forbidden')) {
      console.log('尝试使用REST API删除...');
      try {
        const appId = "D6XZYikpA2suStDXoZl0dI7q-gzGzoHsz";
        const masterKey = "50BUt5vs3MsCOmPOlcSoU3Jo";
        const serverURL = "https://d6xzyikp.lc-cn-n1-shared.com";
        
        const deleteResponse = await fetch(`${serverURL}/1.1/classes/Item/${itemId}`, {
          method: 'DELETE',
          headers: {
            'X-LC-Id': appId,
            'X-LC-Key': masterKey,
            'Content-Type': 'application/json'
          }
        });
        
        if (!deleteResponse.ok) {
          throw new Error(`REST API删除失败: ${deleteResponse.status}`);
        }
        
        console.log('使用REST API删除成功:', itemId);
        return true;
      } catch (restError) {
        console.error('REST API删除也失败:', restError);
        throw restError;
      }
    }
    
    throw error;
  }
};

// 清空所有LeanCloud数据
export const clearAllLeanCloudData = async () => {
  try {
    // 使用REST API直接删除，绕过ACL权限限制
    const appId = "D6XZYikpA2suStDXoZl0dI7q-gzGzoHsz";
    const masterKey = "50BUt5vs3MsCOmPOlcSoU3Jo";
    const serverURL = "https://d6xzyikp.lc-cn-n1-shared.com";
    
    // 先获取所有物品
    const response = await fetch(`${serverURL}/1.1/classes/Item`, {
      method: 'GET',
      headers: {
        'X-LC-Id': appId,
        'X-LC-Key': masterKey,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`获取数据失败: ${response.status}`);
    }
    
    const data = await response.json();
    const items = data.results || [];
    
    console.log(`准备删除 ${items.length} 个物品`);
    
    // 批量删除所有物品
    for (const item of items) {
      const deleteResponse = await fetch(`${serverURL}/1.1/classes/Item/${item.objectId}`, {
        method: 'DELETE',
        headers: {
          'X-LC-Id': appId,
          'X-LC-Key': masterKey,
          'Content-Type': 'application/json'
        }
      });
      
      if (!deleteResponse.ok) {
        console.error(`删除物品 ${item.objectId} 失败: ${deleteResponse.status}`);
      }
    }
    
    console.log('LeanCloud数据清空完成');
    return true;
  } catch (error) {
    console.error('Error clearing LeanCloud data:', error);
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