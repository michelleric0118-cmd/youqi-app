// Cloudflare Pages Functions: /api/invite[/*]
// Admin-only write operations guarded by role on user (role==='admin')
// Env: LEANCLOUD_APP_ID, LEANCLOUD_MASTER_KEY, LEANCLOUD_APP_KEY (optional), LEANCLOUD_SERVER, MAX_USERS(optional)

function lcHeaders(env, master = false) {
  return {
    'X-LC-Id': env.LEANCLOUD_APP_ID,
    'X-LC-Key': master ? `${env.LEANCLOUD_MASTER_KEY},master` : env.LEANCLOUD_APP_KEY,
    'Content-Type': 'application/json'
  };
}

async function getMe(env, sessionToken) {
  if (!sessionToken) return null;
  const res = await fetch(`${env.LEANCLOUD_SERVER}/1.1/users/me`, {
    headers: { ...lcHeaders(env, true), 'X-LC-Session': sessionToken }
  });
  if (!res.ok) return null;
  return await res.json();
}

async function isAdmin(env, sessionToken) {
  const me = await getMe(env, sessionToken);
  return !!(me && me.role === 'admin');
}

function parsePath(pathname) {
  const parts = pathname.split('/').filter(Boolean); // [api, invite, ...]
  const idx = parts.indexOf('invite');
  const rest = parts.slice(idx + 1);
  return rest; // e.g., [], ['fill'], [':id','invalidate']
}

async function createInvite(env) {
  const code = Math.random().toString(36).slice(2, 8).toUpperCase();
  const body = {
    code,
    used: false,
    ACL: {
      '*': { read: true },
      'role:admin': { read: true, write: true }
    }
  };
  const res = await fetch(`${env.LEANCLOUD_SERVER}/1.1/classes/InviteCode`, {
    method: 'POST',
    headers: lcHeaders(env, true),
    body: JSON.stringify(body)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'create invite failed');
  return { id: data.objectId, code };
}

async function getUsersCount(env) {
  const res = await fetch(`${env.LEANCLOUD_SERVER}/1.1/classes/_User?count=1&limit=0`, {
    headers: lcHeaders(env, true)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'count users failed');
  return data.count || 0;
}

async function listInvites(env) {
  const res = await fetch(`${env.LEANCLOUD_SERVER}/1.1/classes/InviteCode?limit=1000&order=-createdAt`, {
    headers: lcHeaders(env, true)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'list invites failed');
  return data.results || [];
}

export const onRequest = async ({ request, env }) => {
  try {
    const url = new URL(request.url);
    const rest = parsePath(url.pathname);
    const authHeader = request.headers.get('Authorization') || '';
    const tokenMatch = authHeader.match(/^Bearer\s+(.+)$/i);
    const sessionToken = tokenMatch ? tokenMatch[1] : request.headers.get('X-Session-Token');
    const admin = await isAdmin(env, sessionToken);
    if (!admin) {
      return new Response(JSON.stringify({ error: 'forbidden' }), { status: 403 });
    }

    // POST /api/invite -> create one
    if (request.method === 'POST' && rest.length === 0) {
      const invite = await createInvite(env);
      return new Response(JSON.stringify(invite), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }

    // POST /api/invite/fill -> create invites to cover remaining slots
    if (request.method === 'POST' && rest[0] === 'fill') {
      const maxUsers = Number(env.MAX_USERS || 20);
      const count = await getUsersCount(env);
      const remaining = Math.max(maxUsers - count, 0);
      const invites = await listInvites(env);
      const unused = invites.filter(i => !i.used && !i.invalidated).length;
      const toCreate = Math.max(remaining - unused, 0);
      const created = [];
      for (let i = 0; i < toCreate; i += 1) {
        created.push(await createInvite(env));
      }
      return new Response(JSON.stringify({ toCreate, created }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }

    // PUT /api/invite/:id/invalidate
    if (request.method === 'PUT' && rest.length === 2 && rest[1] === 'invalidate') {
      const id = rest[0];
      const res = await fetch(`${env.LEANCLOUD_SERVER}/1.1/classes/InviteCode/${id}`, {
        method: 'PUT',
        headers: lcHeaders(env, true),
        body: JSON.stringify({ invalidated: true })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'invalidate failed');
      return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }

    // DELETE /api/invite/:id
    if (request.method === 'DELETE' && rest.length === 1) {
      const id = rest[0];
      const res = await fetch(`${env.LEANCLOUD_SERVER}/1.1/classes/InviteCode/${id}`, {
        method: 'DELETE',
        headers: lcHeaders(env, true)
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'delete failed');
      }
      return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }

    return new Response(JSON.stringify({ error: 'not found' }), { status: 404 });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message || 'Internal Error' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
};

