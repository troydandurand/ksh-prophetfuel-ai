// Twilio Verify — start SMS verification
// POST { phone: "+1XXXXXXXXXX" } → sends 6-digit code via SMS
// Enforces PHONE_ALLOWLIST env var (comma-separated E.164 numbers)

exports.handler = async (event) => {
  const HEADERS = { 'Content-Type': 'application/json' };

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: HEADERS, body: JSON.stringify({ error: 'method not allowed' }) };
  }

  let phone;
  try {
    ({ phone } = JSON.parse(event.body || '{}'));
  } catch (e) {
    return { statusCode: 400, headers: HEADERS, body: JSON.stringify({ error: 'bad json' }) };
  }

  if (!phone || typeof phone !== 'string') {
    return { statusCode: 400, headers: HEADERS, body: JSON.stringify({ error: 'phone required' }) };
  }

  const normalized = phone.replace(/[^\d+]/g, '');

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

  const url = `https://verify.twilio.com/v2/Services/${verifyServiceSid}/Verifications`;
  const auth = Buffer.from(`${sid}:${token}`).toString('base64');
  const body = new URLSearchParams({ To: normalized, Channel: 'sms' });

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

    if (!resp.ok) {
      return {
        statusCode: 502,
        headers: HEADERS,
        body: JSON.stringify({ error: 'twilio error', detail: data.message || 'unknown' })
      };
    }

    return { statusCode: 200, headers: HEADERS, body: JSON.stringify({ status: data.status }) };
  } catch (e) {
    return { statusCode: 500, headers: HEADERS, body: JSON.stringify({ error: 'network error' }) };
  }
};
