// Twilio Verify — check submitted 6-digit code
// POST { phone: "+1XXXXXXXXXX", code: "123456" } → { verified: true|false }
// Enforces PHONE_ALLOWLIST env var

exports.handler = async (event) => {
  const HEADERS = { 'Content-Type': 'application/json' };

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: HEADERS, body: JSON.stringify({ error: 'method not allowed' }) };
  }

  let phone, code;
  try {
    ({ phone, code } = JSON.parse(event.body || '{}'));
  } catch (e) {
    return { statusCode: 400, headers: HEADERS, body: JSON.stringify({ error: 'bad json' }) };
  }

  if (!phone || !code) {
    return { statusCode: 400, headers: HEADERS, body: JSON.stringify({ error: 'phone + code required' }) };
  }

  const normalized = phone.replace(/[^\d+]/g, '');
  const cleanCode = String(code).replace(/[^\d]/g, '');

  const allowlist = (process.env.PHONE_ALLOWLIST || '')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);

  if (!allowlist.includes(normalized)) {
    return { statusCode: 403, headers: HEADERS, body: JSON.stringify({ error: 'not authorized' }) };
  }

  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const verifyServiceSid = process.env.TWILIO_VERIFY_SERVICE_SID;

  if (!sid || !token || !verifyServiceSid) {
    return { statusCode: 500, headers: HEADERS, body: JSON.stringify({ error: 'server config missing' }) };
  }

  const url = `https://verify.twilio.com/v2/Services/${verifyServiceSid}/VerificationCheck`;
  const auth = Buffer.from(`${sid}:${token}`).toString('base64');
  const body = new URLSearchParams({ To: normalized, Code: cleanCode });

  try {
    const resp = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body
    });

    const data = await resp.json();

    if (!resp.ok || data.status !== 'approved') {
      return {
        statusCode: 401,
        headers: HEADERS,
        body: JSON.stringify({ verified: false, status: data.status || 'error' })
      };
    }

    return { statusCode: 200, headers: HEADERS, body: JSON.stringify({ verified: true }) };
  } catch (e) {
    return { statusCode: 500, headers: HEADERS, body: JSON.stringify({ error: 'network error' }) };
  }
};
