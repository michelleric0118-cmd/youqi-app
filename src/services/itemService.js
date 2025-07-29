// Firebase数据服务
import { 
  collection, 
  addDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  where, 
  orderBy,
  onSnapshot,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../firebase/config';

const COLLECTION_NAME = 'items';

// 添加物品
export const addItemToFirebase = async (itemData) => {
  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...itemData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return { id: docRef.id, ...itemData };
  } catch (error) {
    console.error('Error adding item:', error);
    throw error;
  }
};

// 获取所有物品
export const getItemsFromFirebase = async () => {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting items:', error);
    throw error;
  }
};

// 更新物品
export const updateItemInFirebase = async (id, updates) => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating item:', error);
    throw error;
  }
};

// 删除物品
export const deleteItemFromFirebase = async (id) => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error deleting item:', error);
    throw error;
  }
};

// 实时监听物品变化
export const subscribeToItems = (callback) => {
  const q = query(
    collection(db, COLLECTION_NAME),
    orderBy('createdAt', 'desc')
  );
  
  return onSnapshot(q, (querySnapshot) => {
    const items = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(items);
  });
};

// 根据过期状态查询物品
export const getExpiringItemsFromFirebase = async (filter = 'all') => {
  try {
    const now = new Date();
    let q = collection(db, COLLECTION_NAME);
    
    // 根据筛选条件构建查询
    switch (filter) {
      case 'expired':
        q = query(q, where('expiryDate', '<', now.toISOString().split('T')[0]));
        break;
      case 'expiring-soon':
        const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        q = query(
          q, 
          where('expiryDate', '>=', now.toISOString().split('T')[0]),
          where('expiryDate', '<=', weekFromNow.toISOString().split('T')[0])
        );
        break;
      case 'expiring-month':
        const monthFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
        q = query(
          q, 
          where('expiryDate', '>=', now.toISOString().split('T')[0]),
          where('expiryDate', '<=', monthFromNow.toISOString().split('T')[0])
        );
        break;
      default:
        // 所有即将过期的物品（30天内）
        const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
        q = query(
          q, 
          where('expiryDate', '<=', thirtyDaysFromNow.toISOString().split('T')[0])
        );
    }
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting expiring items:', error);
    throw error;
  }
}; 