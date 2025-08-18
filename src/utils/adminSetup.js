// 管理员设置工具
// 注意：此文件仅用于开发测试，生产环境请通过LeanCloud控制台设置

import { AV, initLeanCloud } from '../leancloud/config';

/**
 * 设置当前用户为管理员
 * @param {string} username 用户名
 * @param {string} password 密码
 */
export const setupAdmin = async (username, password) => {
  try {
    // 初始化LeanCloud
    initLeanCloud();
    
    // 登录用户
    const user = await AV.User.logIn(username, password);
    console.log('✅ 用户登录成功:', user.get('username'));
    
    // 设置管理员权限
    user.set('role', 'admin');
    await user.save();
    
    console.log('✅ 管理员权限设置成功！');
    console.log('用户信息:', {
      id: user.id,
      username: user.get('username'),
      role: user.get('role'),
      email: user.get('email')
    });
    
    return user;
  } catch (error) {
    console.error('❌ 设置管理员失败:', error);
    throw error;
  }
};

/**
 * 检查用户是否为管理员
 * @param {AV.User} user 用户对象
 * @returns {boolean}
 */
export const isAdmin = (user) => {
  if (!user) return false;
  const role = user.get('role');
  return role === 'admin';
};

/**
 * 获取所有用户列表（仅管理员可用）
 */
export const getAllUsers = async () => {
  try {
    const currentUser = AV.User.current();
    if (!isAdmin(currentUser)) {
      throw new Error('权限不足：需要管理员权限');
    }
    
    const query = new AV.Query('_User');
    query.ascending('createdAt');
    const users = await query.find();
    
    return users.map(user => ({
      id: user.id,
      username: user.get('username'),
      email: user.get('email') || '',
      role: user.get('role') || 'user',
      createdAt: user.get('createdAt')
    }));
  } catch (error) {
    console.error('获取用户列表失败:', error);
    throw error;
  }
};

/**
 * 批量设置用户角色
 * @param {string} userId 用户ID
 * @param {string} role 角色 ('admin' | 'user')
 */
export const setUserRole = async (userId, role) => {
  try {
    const currentUser = AV.User.current();
    if (!isAdmin(currentUser)) {
      throw new Error('权限不足：需要管理员权限');
    }
    
    if (!['admin', 'user'].includes(role)) {
      throw new Error('无效的角色值，只能是 admin 或 user');
    }
    
    const user = AV.Object.createWithoutData('_User', userId);
    user.set('role', role);
    await user.save();
    
    console.log(`✅ 用户角色设置成功: ${userId} -> ${role}`);
    return true;
  } catch (error) {
    console.error('设置用户角色失败:', error);
    throw error;
  }
};

// 使用示例：
// 1. 在浏览器控制台中运行：
// import('./src/utils/adminSetup.js').then(module => {
//   const { setupAdmin } = module;
//   setupAdmin('你的用户名', '你的密码');
// });

// 2. 或者创建一个测试按钮（仅开发环境使用）
export const createAdminTestButton = () => {
  if (process.env.NODE_ENV === 'development') {
    const button = document.createElement('button');
    button.textContent = '🔧 设置管理员（开发测试）';
    button.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 9999;
      padding: 10px 15px;
      background: #ff6b6b;
      color: white;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      font-size: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    `;
    
    button.onclick = () => {
      showAdminSetupModal();
    };
    
    document.body.appendChild(button);
  }
};

/**
 * 显示管理员设置模态框
 */
function showAdminSetupModal() {
  // 创建模态框
  const modal = document.createElement('div');
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 10000;
    display: flex;
    align-items: center;
    justify-content: center;
  `;
  
  // 创建模态框内容
  const modalContent = document.createElement('div');
  modalContent.style.cssText = `
    background: white;
    border-radius: 12px;
    padding: 24px;
    width: 90%;
    max-width: 400px;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  `;
  
  // 标题
  const title = document.createElement('h3');
  title.textContent = '🔧 设置管理员权限';
  title.style.cssText = `
    margin: 0 0 20px 0;
    color: #333;
    font-size: 18px;
    text-align: center;
  `;
  
  // 用户名输入框
  const usernameLabel = document.createElement('label');
  usernameLabel.textContent = '用户名:';
  usernameLabel.style.cssText = `
    display: block;
    margin-bottom: 8px;
    font-weight: 500;
    color: #555;
  `;
  
  const usernameInput = document.createElement('input');
  usernameInput.type = 'text';
  usernameInput.placeholder = '请输入用户名';
  usernameInput.style.cssText = `
    width: 100%;
    padding: 12px;
    border: 2px solid #e1e5e9;
    border-radius: 8px;
    font-size: 14px;
    margin-bottom: 16px;
    box-sizing: border-box;
    outline: none;
    transition: border-color 0.2s;
  `;
  
  // 密码输入框
  const passwordLabel = document.createElement('label');
  passwordLabel.textContent = '密码:';
  passwordLabel.style.cssText = `
    display: block;
    margin-bottom: 8px;
    font-weight: 500;
    color: #555;
  `;
  
  const passwordInput = document.createElement('input');
  passwordInput.type = 'password';
  passwordInput.placeholder = '请输入密码';
  passwordInput.style.cssText = `
    width: 100%;
    padding: 12px;
    border: 2px solid #e1e5e9;
    border-radius: 8px;
    font-size: 14px;
    margin-bottom: 24px;
    box-sizing: border-box;
    outline: none;
    transition: border-color 0.2s;
  `;
  
  // 按钮容器
  const buttonContainer = document.createElement('div');
  buttonContainer.style.cssText = `
    display: flex;
    gap: 12px;
    justify-content: flex-end;
  `;
  
  // 取消按钮
  const cancelButton = document.createElement('button');
  cancelButton.textContent = '取消';
  cancelButton.style.cssText = `
    padding: 10px 20px;
    background: #f3f4f6;
    color: #374151;
    border: none;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
  `;
  
  // 确认按钮
  const confirmButton = document.createElement('button');
  confirmButton.textContent = '设置管理员';
  confirmButton.style.cssText = `
    padding: 10px 20px;
    background: #ff6b6b;
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
  `;
  
  // 状态提示
  const statusDiv = document.createElement('div');
  statusDiv.style.cssText = `
    margin-top: 16px;
    padding: 12px;
    border-radius: 8px;
    font-size: 14px;
    text-align: center;
    display: none;
  `;
  
  // 输入框焦点效果
  [usernameInput, passwordInput].forEach(input => {
    input.addEventListener('focus', () => {
      input.style.borderColor = '#ff6b6b';
    });
    input.addEventListener('blur', () => {
      input.style.borderColor = '#e1e5e9';
    });
  });
  
  // 按钮悬停效果
  [cancelButton, confirmButton].forEach(btn => {
    btn.addEventListener('mouseenter', () => {
      if (btn === cancelButton) {
        btn.style.background = '#e5e7eb';
      } else {
        btn.style.background = '#ff5252';
      }
    });
    btn.addEventListener('mouseleave', () => {
      if (btn === cancelButton) {
        btn.style.background = '#f3f4f6';
      } else {
        btn.style.background = '#ff6b6b';
      }
    });
  });
  
  // 取消按钮事件
  cancelButton.onclick = () => {
    document.body.removeChild(modal);
  };
  
  // 确认按钮事件
  confirmButton.onclick = async () => {
    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();
    
    if (!username || !password) {
      showStatus('请输入用户名和密码', 'error');
      return;
    }
    
    // 禁用按钮和输入框
    confirmButton.disabled = true;
    confirmButton.textContent = '设置中...';
    usernameInput.disabled = true;
    passwordInput.disabled = true;
    
    try {
      await setupAdmin(username, password);
      showStatus('✅ 管理员权限设置成功！', 'success');
      
      // 延迟关闭模态框
      setTimeout(() => {
        document.body.removeChild(modal);
      }, 2000);
    } catch (error) {
      showStatus(`❌ 设置失败: ${error.message}`, 'error');
      
      // 重新启用按钮和输入框
      confirmButton.disabled = false;
      confirmButton.textContent = '设置管理员';
      usernameInput.disabled = false;
      passwordInput.disabled = false;
    }
  };
  
  // 显示状态信息
  function showStatus(message, type) {
    statusDiv.textContent = message;
    statusDiv.style.display = 'block';
    
    if (type === 'success') {
      statusDiv.style.background = '#d1fae5';
      statusDiv.style.color = '#065f46';
      statusDiv.style.border = '1px solid #a7f3d0';
    } else {
      statusDiv.style.background = '#fee2e2';
      statusDiv.style.color = '#991b1b';
      statusDiv.style.border = '1px solid #fca5a5';
    }
  }
  
  // 回车键提交
  [usernameInput, passwordInput].forEach(input => {
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        confirmButton.click();
      }
    });
  });
  
  // 组装模态框
  buttonContainer.appendChild(cancelButton);
  buttonContainer.appendChild(confirmButton);
  
  modalContent.appendChild(title);
  modalContent.appendChild(usernameLabel);
  modalContent.appendChild(usernameInput);
  modalContent.appendChild(passwordLabel);
  modalContent.appendChild(passwordInput);
  modalContent.appendChild(buttonContainer);
  modalContent.appendChild(statusDiv);
  
  modal.appendChild(modalContent);
  document.body.appendChild(modal);
  
  // 自动聚焦用户名输入框
  usernameInput.focus();
} 