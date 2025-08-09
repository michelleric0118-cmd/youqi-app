// Cloudflare Pages Function: /api/order/place
// Creates a lightweight order placeholder for manual activation in beta
// Env: LEANCLOUD_APP_ID, LEANCLOUD_MASTER_KEY, LEANCLOUD_SERVER

function lcHeaders(env) {
  return {
    'X-LC-Id': env.LEANCLOUD_APP_ID,
    'X-LC-Key': `${env.LEANCLOUD_MASTER_KEY},master`,
    'Content-Type': 'application/json'
  };
}

async function getMe(env, sessionToken) {
  if (!sessionToken) return null;
  const res = await fetch(`${env.LEANCLOUD_SERVER}/1.1/users/me`, {
    headers: {
      'X-LC-Id': env.LEANCLOUD_APP_ID,
      'X-LC-Key': `${env.LEANCLOUD_MASTER_KEY},master`,
      'X-LC-Session': sessionToken
    }
  });
  if (!res.ok) return null;
  return await res.json();
}

export const onRequestPost = async ({ request, env }) => {
  try {
    const { plan, note, contact } = await request.json();
    if (!plan) return new Response(JSON.stringify({ error: 'plan required' }), { status: 400 });
    const auth = request.headers.get('Authorization') || '';
    const tokenMatch = auth.match(/^Bearer\s+(.+)$/i);
    const sessionToken = tokenMatch ? tokenMatch[1] : request.headers.get('X-Session-Token');
    const me = await getMe(env, sessionToken);
    const order = {
      plan,
      note: note || '',
      contact: contact || {},
      status: 'pending',
      user: me?.objectId ? { __type: 'Pointer', className: '_User', objectId: me.objectId } : undefined,
      createdAt: { __type: 'Date', iso: new Date().toISOString() },
      ACL: {
        '*': { read: false },
        'role:admin': { read: true, write: true },
        ...(me?.objectId ? { [me.objectId]: { read: true } } : {})
      }
    };
    const res = await fetch(`${env.LEANCLOUD_SERVER}/1.1/classes/Orders`, {
      method: 'POST',
      headers: lcHeaders(env),
      body: JSON.stringify(order)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'create order failed');
    return new Response(JSON.stringify({ id: data.objectId }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message || 'Internal Error' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
};

