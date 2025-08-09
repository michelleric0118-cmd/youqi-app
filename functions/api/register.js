// Cloudflare Pages Function: /api/register
// Create user with invite atomically-ish on server side using LeanCloud REST
// Env required:
// - LEANCLOUD_APP_ID
// - LEANCLOUD_APP_KEY
// - LEANCLOUD_MASTER_KEY
// - LEANCLOUD_SERVER
// - MAX_USERS (optional, default 20)

function lcHeaders(env, useMaster = false) {
  return {
    'X-LC-Id': env.LEANCLOUD_APP_ID,
    'X-LC-Key': useMaster ? `${env.LEANCLOUD_MASTER_KEY},master` : env.LEANCLOUD_APP_KEY,
    'Content-Type': 'application/json'
  };
}

async function getUsersCount(env) {
  const url = `${env.LEANCLOUD_SERVER}/1.1/classes/_User?count=1&limit=0`;
  const res = await fetch(url, { headers: lcHeaders(env, true) });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'count users failed');
  return data.count || 0;
}

async function findInvite(env, code) {
  const where = encodeURIComponent(JSON.stringify({ code, used: false, invalidated: { $ne: true } }));
  const url = `${env.LEANCLOUD_SERVER}/1.1/classes/InviteCode?where=${where}&limit=1`;
  const res = await fetch(url, { headers: lcHeaders(env, true) });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'find invite failed');
  return (data.results && data.results[0]) || null;
}

async function createUser(env, { username, email, password }) {
  const url = `${env.LEANCLOUD_SERVER}/1.1/users`;
  const res = await fetch(url, {
    method: 'POST',
    headers: lcHeaders(env, false), // app key to get sessionToken
    body: JSON.stringify({ username, password, email, role: 'user' })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'create user failed');
  return data; // contains objectId, sessionToken
}

async function markInviteUsed(env, inviteId, userId) {
  const url = `${env.LEANCLOUD_SERVER}/1.1/classes/InviteCode/${inviteId}`;
  const body = {
    used: true,
    usedBy: { __type: 'Pointer', className: '_User', objectId: userId }
  };
  const res = await fetch(url, { method: 'PUT', headers: lcHeaders(env, true), body: JSON.stringify(body) });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'consume invite failed');
}

export const onRequestPost = async ({ request, env }) => {
  try {
    const { username, email, password, inviteCode } = await request.json();
    if (!username || !password || !inviteCode) {
      return new Response(JSON.stringify({ error: 'missing fields' }), { status: 400 });
    }
    const maxUsers = Number(env.MAX_USERS || 20);

    // 1) 总人数上限
    const count = await getUsersCount(env);
    if (count >= maxUsers) {
      return new Response(JSON.stringify({ error: '内测名额已满', code: 'CAP_REACHED' }), { status: 409 });
    }

    // 2) 校验邀请码
    const invite = await findInvite(env, inviteCode);
    if (!invite) {
      return new Response(JSON.stringify({ error: '邀请码无效或已被使用', code: 'INVITE_INVALID' }), { status: 400 });
    }

    // 3) 创建用户（使用 appKey 以获取 sessionToken）
    const user = await createUser(env, { username, email, password });

    // 4) 标记邀请码为已使用（masterKey）并记录使用信息
    try {
      const ua = request.headers.get('User-Agent') || '';
      const ip = request.headers.get('CF-Connecting-IP') || request.headers.get('x-forwarded-for') || '';
      const url = `${env.LEANCLOUD_SERVER}/1.1/classes/InviteCode/${invite.objectId}`;
      const body = {
        used: true,
        usedBy: { __type: 'Pointer', className: '_User', objectId: user.objectId },
        usedAt: { __type: 'Date', iso: new Date().toISOString() },
        usedUA: ua,
        usedIP: ip
      };
      const res = await fetch(url, { method: 'PUT', headers: lcHeaders(env, true), body: JSON.stringify(body) });
      if (!res.ok) {
        // 降级：至少标记为已用
        await markInviteUsed(env, invite.objectId, user.objectId);
      }
    } catch (_) {
      await markInviteUsed(env, invite.objectId, user.objectId);
    }

    return new Response(JSON.stringify({ objectId: user.objectId, sessionToken: user.sessionToken }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message || 'Internal Error' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
};

