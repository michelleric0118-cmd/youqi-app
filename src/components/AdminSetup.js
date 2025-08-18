import React, { useState } from 'react';
import { setupAdmin, isAdmin, getAllUsers, setUserRole } from '../utils/adminSetup';
import { getCurrentUser } from '../services/authService';
import './AdminSetup.css';

const AdminSetup = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [showUsers, setShowUsers] = useState(false);

  // 检查当前用户状态
  React.useEffect(() => {
    const user = getCurrentUser();
    setCurrentUser(user);
  }, []);

  // 设置管理员
  const handleSetupAdmin = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      setMessage('请输入用户名和密码');
      return;
    }

    setLoading(true);
    setMessage('正在设置管理员权限...');

    try {
      await setupAdmin(username, password);
      setMessage('✅ 管理员权限设置成功！请刷新页面查看效果。');
      setUsername('');
      setPassword('');
      
      // 重新检查当前用户状态
      const user = getCurrentUser();
      setCurrentUser(user);
    } catch (error) {
      setMessage(`❌ 设置失败: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // 获取用户列表
  const handleGetUsers = async () => {
    try {
      const userList = await getAllUsers();
      setUsers(userList);
      setShowUsers(true);
      setMessage(`✅ 获取到 ${userList.length} 个用户`);
    } catch (error) {
      setMessage(`❌ 获取用户列表失败: ${error.message}`);
    }
  };

  // 设置用户角色
  const handleSetUserRole = async (userId, role) => {
    try {
      await setUserRole(userId, role);
      setMessage(`✅ 用户角色设置成功: ${userId} -> ${role}`);
      // 刷新用户列表
      handleGetUsers();
    } catch (error) {
      setMessage(`❌ 设置用户角色失败: ${error.message}`);
    }
  };

  // 检查是否为管理员
  const isCurrentUserAdmin = currentUser ? isAdmin(currentUser) : false;

  return (
    <div className="admin-setup">
      <div className="admin-setup-header">
        <h2>🔧 管理员设置工具</h2>
        <p className="warning">
          ⚠️ 此工具仅用于开发测试，生产环境请通过LeanCloud控制台设置
        </p>
      </div>

      {/* 当前用户状态 */}
      <div className="current-user-status">
        <h3>当前用户状态</h3>
        {currentUser ? (
          <div className="user-info">
            <p><strong>用户名:</strong> {currentUser.get('username')}</p>
            <p><strong>邮箱:</strong> {currentUser.get('email') || '未设置'}</p>
            <p><strong>角色:</strong> 
              <span className={`role-badge ${isCurrentUserAdmin ? 'admin' : 'user'}`}>
                {isCurrentUserAdmin ? '管理员' : '普通用户'}
              </span>
            </p>
            <p><strong>用户ID:</strong> {currentUser.id}</p>
          </div>
        ) : (
          <p className="not-logged-in">未登录</p>
        )}
      </div>

      {/* 设置管理员表单 */}
      <div className="setup-form">
        <h3>设置管理员权限</h3>
        <form onSubmit={handleSetupAdmin}>
          <div className="form-group">
            <label htmlFor="username">用户名:</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="输入用户名"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">密码:</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="输入密码"
              required
            />
          </div>
          
          <button 
            type="submit" 
            className="setup-btn"
            disabled={loading}
          >
            {loading ? '设置中...' : '设置管理员权限'}
          </button>
        </form>
      </div>

      {/* 管理员功能 */}
      {isCurrentUserAdmin && (
        <div className="admin-functions">
          <h3>管理员功能</h3>
          
          <div className="function-buttons">
            <button 
              onClick={handleGetUsers}
              className="function-btn"
            >
              👥 获取用户列表
            </button>
            
            <button 
              onClick={() => setShowUsers(!showUsers)}
              className="function-btn"
            >
              {showUsers ? '隐藏用户列表' : '显示用户列表'}
            </button>
          </div>

          {/* 用户列表 */}
          {showUsers && users.length > 0 && (
            <div className="users-list">
              <h4>用户列表 ({users.length})</h4>
              <div className="users-table">
                <table>
                  <thead>
                    <tr>
                      <th>用户名</th>
                      <th>邮箱</th>
                      <th>角色</th>
                      <th>创建时间</th>
                      <th>操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(user => (
                      <tr key={user.id}>
                        <td>{user.username}</td>
                        <td>{user.email || '-'}</td>
                        <td>
                          <span className={`role-badge ${user.role === 'admin' ? 'admin' : 'user'}`}>
                            {user.role === 'admin' ? '管理员' : '普通用户'}
                          </span>
                        </td>
                        <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                        <td>
                          {user.role !== 'admin' ? (
                            <button
                              onClick={() => handleSetUserRole(user.id, 'admin')}
                              className="role-btn promote"
                              title="提升为管理员"
                            >
                              设为管理员
                            </button>
                          ) : (
                            <button
                              onClick={() => handleSetUserRole(user.id, 'user')}
                              className="role-btn demote"
                              title="降级为普通用户"
                            >
                              取消管理员
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 消息提示 */}
      {message && (
        <div className={`message ${message.includes('✅') ? 'success' : 'error'}`}>
          {message}
        </div>
      )}

      {/* 使用说明 */}
      <div className="instructions">
        <h3>使用说明</h3>
        <ol>
          <li>首先使用你的用户名和密码登录应用</li>
          <li>在此页面输入相同的用户名和密码</li>
          <li>点击"设置管理员权限"按钮</li>
          <li>设置成功后，刷新页面即可看到管理员功能</li>
          <li>现在你可以访问"设置 > 用户管理"功能了</li>
        </ol>
        
        <div className="note">
          <strong>注意:</strong> 此工具仅用于开发测试。在生产环境中，请通过LeanCloud控制台手动设置用户角色。
        </div>
      </div>
    </div>
  );
};

export default AdminSetup; 