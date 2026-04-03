export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {

      // POST /api/pro/save — 支付成功后保存 Pro 状态
      if (url.pathname === '/api/pro/save' && request.method === 'POST') {
        const body = await request.json();
        const { google_sub, email, name, plan, order_id, amount, paypal_email } = body;
        if (!google_sub || !plan || !order_id) {
          return jsonResponse({ success: false, error: 'Missing required fields' }, 400, corsHeaders);
        }

        // 确保表存在
        await ensureTables(env);

        await env.DB.prepare(
          `INSERT OR REPLACE INTO pro_users (google_sub, email, name, plan, order_id, amount, paypal_email, purchased_at, status)
           VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'), 'active')`
        ).bind(google_sub, email || '', name || '', plan, order_id, amount || '', paypal_email || '').run();

        console.log('[Pro/Save] Saved pro user:', google_sub, 'plan:', plan, 'order:', order_id);
        return jsonResponse({ success: true }, 200, corsHeaders);
      }

      // GET /api/pro/check — 检查用户是否 Pro
      if (url.pathname === '/api/pro/check' && request.method === 'GET') {
        const google_sub = url.searchParams.get('google_sub');
        if (!google_sub) return jsonResponse({ success: false, error: 'Missing google_sub' }, 400, corsHeaders);

        // 确保表存在
        await ensureTables(env);

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

      // POST /api/history/save — 保存历史记录
      if (url.pathname === '/api/history/save' && request.method === 'POST') {
        const body = await request.json();
        const { google_sub, text } = body;
        if (!google_sub || !text) return jsonResponse({ success: false, error: 'Missing fields' }, 400, corsHeaders);

        // 确保表存在
        await ensureTables(env);

        await env.DB.prepare(
          `INSERT INTO history (google_sub, text, created_at) VALUES (?, ?, datetime('now'))`
        ).bind(google_sub, text).run();

        console.log('[History/Save] Saved for:', google_sub, 'text length:', text.length);
        return jsonResponse({ success: true }, 200, corsHeaders);
      }

      // GET /api/history/list — 获取历史记录列表
      if (url.pathname === '/api/history/list' && request.method === 'GET') {
        const google_sub = url.searchParams.get('google_sub');
        if (!google_sub) return jsonResponse({ success: false, error: 'Missing google_sub' }, 400, corsHeaders);

        // 确保表存在
        await ensureTables(env);

        const results = await env.DB.prepare(
          `SELECT text, created_at FROM history WHERE google_sub = ? ORDER BY id DESC LIMIT 20`
        ).bind(google_sub).all();
        return jsonResponse({ success: true, history: results.results }, 200, corsHeaders);
      }

      // DELETE /api/history/clear — 清除历史记录
      if (url.pathname === '/api/history/clear' && request.method === 'DELETE') {
        const google_sub = url.searchParams.get('google_sub');
        if (!google_sub) return jsonResponse({ success: false, error: 'Missing google_sub' }, 400, corsHeaders);

        await ensureTables(env);

        await env.DB.prepare(`DELETE FROM history WHERE google_sub = ?`).bind(google_sub).run();
        return jsonResponse({ success: true }, 200, corsHeaders);
      }

      return jsonResponse({ status: 'ok' }, 200, corsHeaders);

    } catch (err) {
      console.error('[API Error]', err.message, err.stack);
      return jsonResponse({ success: false, error: err.message }, 500, corsHeaders);
    }
  }
};

// 确保 D1 数据库中有所需的表
async function ensureTables(env) {
  await env.DB.batch([
    env.DB.prepare(`
      CREATE TABLE IF NOT EXISTS pro_users (
        google_sub TEXT PRIMARY KEY,
        email TEXT DEFAULT '',
        name TEXT DEFAULT '',
        plan TEXT NOT NULL,
        order_id TEXT NOT NULL,
        amount TEXT DEFAULT '',
        paypal_email TEXT DEFAULT '',
        purchased_at TEXT,
        status TEXT DEFAULT 'active'
      )
    `),
    env.DB.prepare(`
      CREATE TABLE IF NOT EXISTS history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        google_sub TEXT NOT NULL,
        text TEXT NOT NULL,
        created_at TEXT
      )
    `),
    env.DB.prepare(`CREATE INDEX IF NOT EXISTS idx_history_google_sub ON history(google_sub)`),
  ]);
}

function jsonResponse(data, status, headers) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...headers }
  });
}
