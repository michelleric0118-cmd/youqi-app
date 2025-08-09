// Cloudflare Pages Functions: /api/ocr
// Env required:
// - BAIDU_OCR_API_KEY
// - BAIDU_OCR_SECRET_KEY
// - LEANCLOUD_APP_ID
// - LEANCLOUD_MASTER_KEY
// - LEANCLOUD_SERVER (e.g. https://d6xzyikp.lc-cn-n1-shared.com)
// - OCR_MONTHLY_LIMIT (optional, default 40)

let cachedToken = null;
let tokenExpireAt = 0;

async function fetchAccessToken(env) {
  const now = Date.now();
  if (cachedToken && now < tokenExpireAt - 60_000) return cachedToken;

  const apiKey = env.BAIDU_OCR_API_KEY;
  const secretKey = env.BAIDU_OCR_SECRET_KEY;
  if (!apiKey || !secretKey) throw new Error('OCR API key/secret not configured');

  const url = `https://aip.baidubce.com/oauth/2.0/token?grant_type=client_credentials&client_id=${apiKey}&client_secret=${secretKey}`;
  const res = await fetch(url, { method: 'POST' });
  const data = await res.json();
  if (!res.ok || !data.access_token) throw new Error(data.error_msg || 'Failed to obtain access token');
  cachedToken = data.access_token;
  tokenExpireAt = Date.now() + (data.expires_in || 2592000) * 1000;
  return cachedToken;
}

function getMonthKey(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  return `${y}${m}`;
}

async function getCurrentUserId(env, sessionToken) {
  if (!sessionToken) return null;
  const res = await fetch(`${env.LEANCLOUD_SERVER}/1.1/users/me`, {
    headers: {
      'X-LC-Id': env.LEANCLOUD_APP_ID,
      'X-LC-Key': `${env.LEANCLOUD_MASTER_KEY},master`,
      'X-LC-Session': sessionToken
    }
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data.objectId || null;
}

async function getOrCreateQuota(env, userId, monthKey, defaultLimit) {
  // Query
  const where = encodeURIComponent(JSON.stringify({
    user: { __type: 'Pointer', className: '_User', objectId: userId },
    monthKey
  }));
  let res = await fetch(`${env.LEANCLOUD_SERVER}/1.1/classes/OcrQuota?where=${where}&limit=1`, {
    headers: {
      'X-LC-Id': env.LEANCLOUD_APP_ID,
      'X-LC-Key': `${env.LEANCLOUD_MASTER_KEY},master`,
      'Content-Type': 'application/json'
    }
  });
  const list = await res.json();
  if (list.results && list.results.length > 0) return list.results[0];

  // Create
  res = await fetch(`${env.LEANCLOUD_SERVER}/1.1/classes/OcrQuota`, {
    method: 'POST',
    headers: {
      'X-LC-Id': env.LEANCLOUD_APP_ID,
      'X-LC-Key': `${env.LEANCLOUD_MASTER_KEY},master`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      user: { __type: 'Pointer', className: '_User', objectId: userId },
      monthKey,
      used: 0,
      limit: defaultLimit
    })
  });
  const created = await res.json();
  if (!res.ok) throw new Error(created.error || 'Create quota failed');
  return { objectId: created.objectId, used: 0, limit: defaultLimit };
}

async function incrementQuota(env, quotaId) {
  const res = await fetch(`${env.LEANCLOUD_SERVER}/1.1/classes/OcrQuota/${quotaId}`, {
    method: 'PUT',
    headers: {
      'X-LC-Id': env.LEANCLOUD_APP_ID,
      'X-LC-Key': `${env.LEANCLOUD_MASTER_KEY},master`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ used: { __op: 'Increment', amount: 1 } })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Update quota failed');
}

async function callBaiduOCR(env, imageBase64, mode) {
  const token = await fetchAccessToken(env);
  const endpoint = mode === 'accurate' ? 'accurate_basic' : 'general_basic';
  const url = `https://aip.baidubce.com/rest/2.0/ocr/v1/${endpoint}?access_token=${token}`;
  const body = new URLSearchParams({ image: imageBase64 });
  const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body });
  const data = await res.json();
  if (data.error_code) throw new Error(`${data.error_code}: ${data.error_msg}`);
  return data.words_result || [];
}

export const onRequestPost = async ({ request, env }) => {
  try {
    const { imageBase64, mode = 'standard' } = await request.json();
    if (!imageBase64) return new Response(JSON.stringify({ error: 'imageBase64 is required' }), { status: 400 });

    // Identify user by session token (optional but required for quota)
    const authHeader = request.headers.get('Authorization') || '';
    const tokenMatch = authHeader.match(/^Bearer\s+(.+)$/i);
    const sessionToken = tokenMatch ? tokenMatch[1] : request.headers.get('X-Session-Token');
    const userId = await getCurrentUserId(env, sessionToken);

    // Enforce quota when user is known
    if (userId) {
      const monthKey = getMonthKey();
      const defaultLimit = Number(env.OCR_MONTHLY_LIMIT || 40);
      const quota = await getOrCreateQuota(env, userId, monthKey, defaultLimit);
      const used = quota.used || 0;
      const limit = quota.limit || defaultLimit;
      if (used >= limit) {
        return new Response(JSON.stringify({ error: 'OCR quota exceeded', code: 'QUOTA_EXCEEDED', used, limit }), { status: 402 });
      }
      await incrementQuota(env, quota.objectId);
    }

    // OCR
    const words = await callBaiduOCR(env, imageBase64, mode);
    return new Response(JSON.stringify({ words_result: words }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message || 'Internal Error' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
};

