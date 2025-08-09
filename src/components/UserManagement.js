import React, { useState, useEffect } from 'react';
import { Users, UserPlus, UserX } from 'lucide-react';
import { AV, initLeanCloud } from '../leancloud/config';
import { listInvites, createInvite, createInvitesToFill, exportInvitesCSV, exportInviteLogsCSV, invalidateInvite, deleteInvite } from '../services/inviteService';
import './UserManagement.css';

const UserManagement = ({ onClose }) => {
  const [users, setUsers] = useState([]);
  const [inviteCode, setInviteCode] = useState('');
  const [maxUsers] = useState(20); // 内测名额限制
  const [isInviteMode, setIsInviteMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [invites, setInvites] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const isAdmin = (currentUser?.get && currentUser.get('role')) === 'admin';

  const refreshInvites = async () => {
    try {
      const data = await listInvites();
      setInvites(data);
    } catch (e) {
      console.error('加载邀请码失败', e);
    }
  };

  // 读取真实用户列表
  useEffect(() => {
    initLeanCloud();
    const fetchUsers = async () => {
      try {
        const me = AV.User.current();
        if (me) setCurrentUser(me);
        const q = new AV.Query('_User');
        q.ascending('createdAt');
        q.limit(1000);
        const list = await q.find();
        setUsers(list.map(u => ({
          id: u.id,
          username: u.get('username'),
          email: u.get('email') || '',
          role: u.get('role') || 'user',
          status: 'active',
          joinDate: u.get('createdAt')?.toISOString().slice(0,10)
        })));
      } catch (e) {
        console.error('加载用户失败', e);
      }
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    refreshInvites();
  }, []);

  const currentUserCount = users.length;
  const remainingSlots = maxUsers - currentUserCount;

  // 生成邀请码
  const generateInviteCode = () => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    return code;
  };

  // 邀请新用户（创建邀请码）
  const inviteUser = async () => {
    if (!isAdmin) { alert('仅管理员可生成邀请码'); return; }
    if (currentUserCount >= maxUsers) {
      alert('内测名额已满，无法邀请新用户');
      return;
    }

    setLoading(true);
    try {
      const obj = await createInvite();
      setInviteCode(obj.get('code'));
      setIsInviteMode(true);
      await refreshInvites();
    } catch (error) {
      console.error('邀请失败:', error);
      alert('邀请失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  // 删除用户
  const deleteUser = async (userId) => {
    if (!isAdmin) { alert('仅管理员可删除用户'); return; }
    if (!window.confirm('确定要删除此用户吗？此操作不可撤销。')) return;
    try {
      const user = AV.Object.createWithoutData('_User', userId);
      await user.destroy();
      setUsers(prev => prev.filter(user => user.id !== userId));
    } catch (e) {
      alert('删除失败：需要管理员权限');
    }
  };

  // 复制邀请码
  const copyInviteCode = () => {
    navigator.clipboard.writeText(inviteCode).then(() => {
      alert('邀请码已复制到剪贴板');
    });
  };

  const fillInvites = async () => {
    if (!isAdmin) { alert('仅管理员可操作'); return; }
    setLoading(true);
    try {
      await createInvitesToFill(maxUsers);
      await refreshInvites();
      alert('已补齐可用邀请码');
    } finally {
      setLoading(false);
    }
  };

  const onExport = async () => {
    if (!isAdmin) { alert('仅管理员可操作'); return; }
    const data = await listInvites();
    exportInvitesCSV(data);
  };

  return (
    <div className="user-management-overlay">
      <div className="user-management-modal">
        <div className="user-management-header">
          <h3>用户管理</h3>
          <button onClick={onClose} className="close-btn">
            ×
          </button>
        </div>

        <div className="user-management-content">
          {/* 统计信息 */}
          <div className="stats-section">
            <div className="stat-card">
              <div className="stat-number">{currentUserCount}</div>
              <div className="stat-label">当前用户</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{remainingSlots}</div>
              <div className="stat-label">剩余名额</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{maxUsers}</div>
              <div className="stat-label">总名额</div>
            </div>
          </div>

          {/* 邀请新用户 */}
          <div className="invite-section">
            <h4>邀请新用户</h4>
            <button 
              onClick={inviteUser}
              disabled={currentUserCount >= maxUsers || loading}
              className="invite-btn"
            >
              <UserPlus size={20} />
              {loading ? '生成中...' : '生成邀请码'}
            </button>
            <div style={{ marginTop: 10, display: 'flex', gap: 10 }}>
              <button className="btn-secondary" onClick={fillInvites}>一键补齐至剩余名额</button>
              <button className="btn-secondary" onClick={onExport}>导出全部邀请码</button>
            </div>
            
            {isInviteMode && inviteCode && (
              <div className="invite-code-section">
                <p>邀请码已生成，请分享给新用户：</p>
                <div className="invite-code-display">
                  <span className="invite-code">{inviteCode}</span>
                  <button onClick={copyInviteCode} className="copy-btn">
                    复制
                  </button>
                </div>
                <p className="invite-tip">
                  新用户注册时输入此邀请码即可加入内测
                </p>
              </div>
            )}

            {/* 邀请码列表 */}
            {invites.length > 0 && (
              <div style={{ marginTop: 16 }}>
                <h4>邀请码列表</h4>
                <div style={{ maxHeight: 200, overflow: 'auto', border: '1px solid #eee', borderRadius: 6 }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr>
                        <th style={{ textAlign: 'left', padding: 8 }}>Code</th>
                        <th style={{ textAlign: 'left', padding: 8 }}>状态</th>
                        <th style={{ textAlign: 'left', padding: 8 }}>使用者</th>
                        <th style={{ textAlign: 'left', padding: 8 }}>创建时间</th>
                        <th style={{ textAlign: 'left', padding: 8 }}>操作</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invites.map(i => (
                        <tr key={i.id}>
                          <td style={{ padding: 8, fontFamily: 'monospace' }}>{i.code}</td>
                          <td style={{ padding: 8 }}>{i.used ? `已使用（${i.usedAt?.slice(0,10) || ''}）` : '未使用'}</td>
                          <td style={{ padding: 8 }}>{i.usedBy || '-'}</td>
                          <td style={{ padding: 8 }}>{i.createdAt?.slice(0,10)}</td>
                          <td style={{ padding: 8 }}>
                            {!i.used && (
                              <>
                                <button className="btn-secondary" onClick={async ()=>{ await invalidateInvite(i.id); await refreshInvites(); }}>作废</button>
                                <button className="btn-secondary" style={{ marginLeft: 8 }} onClick={async ()=>{ await deleteInvite(i.id); await refreshInvites(); }}>删除</button>
                              </>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            {invites.length > 0 && (
              <div style={{ marginTop: 10, textAlign: 'right' }}>
                <button className="btn-secondary" onClick={() => exportInviteLogsCSV(invites)}>导出使用日志</button>
              </div>
            )}
          </div>

          {/* 用户列表 */}
          <div className="users-section">
            <h4>用户列表</h4>
            <div className="users-list">
              {users.map(user => (
                <div key={user.id} className="user-item">
                  <div className="user-info">
                    <div className="user-avatar">
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                    <div className="user-details">
                      <div className="user-name">
                        {user.username}
                        {user.role === 'admin' && (
                          <span className="admin-badge">管理员</span>
                        )}
                      </div>
                      <div className="user-email">{user.email}</div>
                      <div className="user-join-date">加入时间: {user.joinDate}</div>
                    </div>
                  </div>
                  <div className="user-actions">
                    <span className={`status-badge ${user.status}`}>
                      {user.status === 'active' ? '活跃' : '禁用'}
                    </span>
                    {user.role !== 'admin' && (
                      <button 
                        onClick={() => deleteUser(user.id)}
                        className="delete-user-btn"
                        title="删除用户"
                      >
                        <UserX size={16} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 内测说明 */}
          <div className="beta-info">
            <h4>内测说明</h4>
            <ul>
              <li>当前为内测阶段，限制20个用户名额</li>
              <li>新用户需要邀请码才能注册</li>
              <li>管理员可以生成邀请码和管理用户</li>
              <li>内测期间所有功能免费使用</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserManagement; 