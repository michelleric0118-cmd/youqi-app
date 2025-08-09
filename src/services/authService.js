import { AV, initLeanCloud } from '../leancloud/config';

// 初始化（确保在应用启动时被调用一次）
export const ensureLeanCloudInited = () => {
  try {
    if (!AV.applicationId) {
      initLeanCloud();
    }
  } catch (_) {
    // ignore
  }
};

export const login = async ({ username, password }) => {
  ensureLeanCloudInited();
  const user = await AV.User.logIn(username, password);
  // 保存 sessionToken 供 OCR 代理做配额统计
  try {
    const token = user.getSessionToken && user.getSessionToken();
    if (token) localStorage.setItem('leancloud-session', token);
  } catch (_) {}
  return user; // AV.User 实例
};

// 检查全局用户数是否达到上限（默认20）
const checkUserCap = async (maxUsers = 20) => {
  const query = new AV.Query('_User');
  const count = await query.count();
  return count < maxUsers;
};

// 查询邀请码
const findInvite = async (inviteCode) => {
  const Invite = AV.Object.extend('InviteCode');
  const query = new AV.Query(Invite);
  query.equalTo('code', inviteCode);
  query.equalTo('used', false);
  return await query.first();
};

// 标记邀请码已使用
const consumeInvite = async (inviteObject, user) => {
  inviteObject.set('used', true);
  inviteObject.set('usedBy', user);
  await inviteObject.save();
};

export const registerWithInvite = async ({ username, email, password, inviteCode }) => {
  // 改为调用服务端云函数（/api/register）以获得强一致
  const res = await fetch('/api/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, email, password, inviteCode })
  });
  const data = await res.json();
  if (!res.ok) {
    const err = new Error(data.error || '注册失败');
    err.code = data.code;
    throw err;
  }
  if (data.sessionToken) localStorage.setItem('leancloud-session', data.sessionToken);
  return { id: data.objectId };
};

// 获取当前登录用户
export const getCurrentUser = () => AV.User.current();

export const logout = async () => {
  ensureLeanCloudInited();
  await AV.User.logOut();
  localStorage.removeItem('leancloud-session');
};