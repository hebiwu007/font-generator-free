export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      // POST /api/pro/save — 支付成功后保存 Pro 记录
      if (url.pathname === '/api/pro/save' && request.method === 'POST') {
        const body = await request.json();
        const { google_sub, email, name, plan, order_id, amount, paypal_email } = body;

        if (!google_sub || !plan || !order_id) {
          return jsonResponse({ success: false, error: 'Missing required fields' }, 400, corsHeaders);
        }

        await env.DB.prepare(
          `INSERT OR REPLACE INTO pro_users (google_sub, email, name, plan, order_id, amount, paypal_email, purchased_at, status)
           VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'), 'active')`
        ).bind(google_sub, email || '', name || '', plan, order_id, amount || '', paypal_email || '').run();

        return jsonResponse({ success: true }, 200, corsHeaders);
      }

      // GET /api/pro/check?google_sub=xxx — 检查是否是 Pro
      if (url.pathname === '/api/pro/check' && request.method === 'GET') {
        const google_sub = url.searchParams.get('google_sub');
        if (!google_sub) {
          return jsonResponse({ success: false, error: 'Missing google_sub' }, 400, corsHeaders);
        }

        const result = await env.DB.prepare(
          `SELECT * FROM pro_users WHERE google_sub = ? AND status = 'active'`
        ).bind(google_sub).first();

        return jsonResponse({
          success: true,
          isPro: !!result,
          plan: result ? result.plan : null,
          purchasedAt: result ? result.purchased_at : null
        }, 200, corsHeaders);
      }

      // 默认响应
      return jsonResponse({ status: 'ok', endpoints: ['/api/pro/save', '/api/pro/check'] }, 200, corsHeaders);

    } catch (err) {
      return jsonResponse({ success: false, error: err.message }, 500, corsHeaders);
    }
  }
};

function jsonResponse(data, status, headers) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...headers }
  });
}
