// 权限检查辅助工具
import { AV } from '../leancloud/config';

/**
 * 检查当前用户是否为管理员
 */
export const checkIsAdmin = () => {
  try {
    const currentUser = AV.User.current();
    if (!currentUser) {
      console.log('❌ 用户未登录');
      return false;
    }
    
    const role = currentUser.get('role');
    console.log('🔍 当前用户角色:', role);
    
    if (role === 'admin') {
      console.log('✅ 用户是管理员');
      return true;
    } else {
      console.log('❌ 用户不是管理员，角色:', role);
      return false;
    }
  } catch (error) {
    console.error('❌ 权限检查失败:', error);
    return false;
  }
};

/**
 * 获取当前用户信息
 */
export const getCurrentUserInfo = () => {
  try {
    const currentUser = AV.User.current();
    if (!currentUser) {
      return null;
    }
    
    return {
      id: currentUser.id,
      username: currentUser.get('username'),
      email: currentUser.get('email'),
      role: currentUser.get('role') || 'user',
      createdAt: currentUser.get('createdAt')
    };
  } catch (error) {
    console.error('获取用户信息失败:', error);
    return null;
  }
};

/**
 * 临时设置管理员权限（仅用于测试）
 */
export const setTempAdminRole = () => {
  try {
    const currentUser = AV.User.current();
    if (!currentUser) {
      console.log('❌ 用户未登录');
      return false;
    }
    
    console.log('🔄 正在设置临时管理员权限...');
    currentUser.set('role', 'admin');
    
    // 保存到本地存储作为临时方案
    localStorage.setItem('temp-admin-role', 'admin');
    localStorage.setItem('temp-admin-user', currentUser.id);
    
    console.log('✅ 临时管理员权限已设置');
    return true;
  } catch (error) {
    console.error('❌ 设置临时管理员权限失败:', error);
    return false;
  }
};

/**
 * 检查临时管理员权限
 */
export const checkTempAdminRole = () => {
  const tempRole = localStorage.getItem('temp-admin-role');
  const tempUser = localStorage.getItem('temp-admin-user');
  const currentUser = AV.User.current();
  
  if (tempRole === 'admin' && tempUser === currentUser?.id) {
    console.log('✅ 使用临时管理员权限');
    return true;
  }
  
  return false;
}; 