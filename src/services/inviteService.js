import { AV, initLeanCloud } from '../leancloud/config';

export const ensureInit = () => {
  try { initLeanCloud(); } catch (_) {}
};

export const generateCode = () => Math.random().toString(36).slice(2, 8).toUpperCase();

export const getUsersCount = async () => {
  ensureInit();
  const q = new AV.Query('_User');
  return await q.count();
};

export const listInvites = async () => {
  ensureInit();
  const Invite = AV.Object.extend('InviteCode');
  const q = new AV.Query(Invite);
  q.include('usedBy');
  q.descending('createdAt');
  q.limit(1000);
  const results = await q.find();
  return results.map(x => ({
    id: x.id,
    code: x.get('code'),
    used: !!x.get('used'),
    invalidated: !!x.get('invalidated'),
    usedBy: x.get('usedBy') ? x.get('usedBy').get('username') : '',
    createdAt: x.get('createdAt')?.toISOString() || '',
    usedAt: x.get('usedAt')?.toISOString?.() || '',
    usedIP: x.get('usedIP') || '',
    usedUA: x.get('usedUA') || ''
  }));
};

export const createInvite = async () => {
  // 通过后端接口创建并赋ACL，避免前端直写
  const sessionToken = localStorage.getItem('leancloud-session');
  const res = await fetch('/api/invite', {
    method: 'POST',
    headers: sessionToken ? { Authorization: `Bearer ${sessionToken}` } : {}
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'create invite failed');
  // 返回一个轻量对象以便读取 code
  return { get: (k) => (k === 'code' ? data.code : undefined) };
};

export const deleteInvite = async (id) => {
  const sessionToken = localStorage.getItem('leancloud-session');
  const res = await fetch(`/api/invite/${id}`, {
    method: 'DELETE',
    headers: sessionToken ? { Authorization: `Bearer ${sessionToken}` } : {}
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || 'delete invite failed');
  }
};

export const invalidateInvite = async (id) => {
  const sessionToken = localStorage.getItem('leancloud-session');
  const res = await fetch(`/api/invite/${id}/invalidate`, {
    method: 'PUT',
    headers: sessionToken ? { Authorization: `Bearer ${sessionToken}` } : {}
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || 'invalidate invite failed');
  }
};

export const createInvitesToFill = async (maxUsers = 20) => {
  const sessionToken = localStorage.getItem('leancloud-session');
  const res = await fetch('/api/invite/fill', {
    method: 'POST',
    headers: sessionToken ? { Authorization: `Bearer ${sessionToken}` } : {}
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'fill invites failed');
  return data;
};

export const exportInvitesCSV = (invites) => {
  const headers = ['code', 'used', 'usedBy', 'createdAt'];
  const rows = invites.map(i => [i.code, i.used ? 'YES' : 'NO', i.usedBy || '', i.createdAt || '']);
  const csv = [headers.join(','), ...rows.map(r => r.map(v => `"${String(v || '').replace(/"/g, '""')}"`).join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `invites-${new Date().toISOString().slice(0,10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};

export const exportInviteLogsCSV = (invites) => {
  const headers = ['code', 'usedBy', 'usedAt', 'usedIP', 'usedUA'];
  const logs = invites.filter(i => i.used);
  const rows = logs.map(i => [i.code, i.usedBy || '', i.usedAt || '', i.usedIP || '', i.usedUA || '']);
  const csv = [headers.join(','), ...rows.map(r => r.map(v => `"${String(v || '').replace(/"/g, '""')}"`).join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `invite-logs-${new Date().toISOString().slice(0,10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};

