// Serverless function: Baidu OCR proxy (for Vercel / similar platforms)
// Environment variables required:
// - BAIDU_OCR_API_KEY
// - BAIDU_OCR_SECRET_KEY

let cachedToken = null;
let tokenExpireAt = 0;

async function fetchAccessToken() {
  const now = Date.now();
  if (cachedToken && now < tokenExpireAt - 60_000) {
    return cachedToken;
  }

  const apiKey = process.env.BAIDU_OCR_API_KEY;
  const secretKey = process.env.BAIDU_OCR_SECRET_KEY;
  if (!apiKey || !secretKey) {
    throw new Error('Missing BAIDU_OCR_API_KEY or BAIDU_OCR_SECRET_KEY');
  }

  const url = `https://aip.baidubce.com/oauth/2.0/token?grant_type=client_credentials&client_id=${apiKey}&client_secret=${secretKey}`;
  const res = await fetch(url, { method: 'POST' });
  const data = await res.json();
  if (!res.ok || !data.access_token) {
    throw new Error(`Failed to get access token: ${data.error_msg || res.status}`);
  }
  cachedToken = data.access_token;
  tokenExpireAt = Date.now() + (data.expires_in || 2592000) * 1000; // default 30d
  return cachedToken;
}

async function callOCR({ imageBase64, mode }) {
  const accessToken = await fetchAccessToken();
  const endpoint = mode === 'accurate'
    ? 'accurate_basic'
    : 'general_basic';
  const url = `https://aip.baidubce.com/rest/2.0/ocr/v1/${endpoint}?access_token=${accessToken}`;
  const body = new URLSearchParams({ image: imageBase64 });
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body
  });
  const data = await res.json();
  if (data.error_code) {
    throw new Error(`${data.error_code}: ${data.error_msg}`);
  }
  return data.words_result || [];
}

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') {
      res.status(405).json({ error: 'Method Not Allowed' });
      return;
    }
    const { imageBase64, mode = 'standard' } = req.body || {};
    if (!imageBase64) {
      res.status(400).json({ error: 'imageBase64 is required' });
      return;
    }
    const words = await callOCR({ imageBase64, mode });
    res.status(200).json({ words_result: words });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Internal Server Error' });
  }
}
