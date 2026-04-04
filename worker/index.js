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
        const email = url.searchParams.get('email') || '';
        if (!google_sub) return jsonResponse({ success: false, error: 'Missing google_sub' }, 400, corsHeaders);

        await ensureTables(env);

        let result = await env.DB.prepare(
          `SELECT * FROM pro_users WHERE google_sub = ? AND status = 'active'`
        ).bind(google_sub).first();

        if (!result && email) {
          result = await env.DB.prepare(
            `SELECT * FROM pro_users WHERE email = ? AND status = 'active'`
          ).bind(email).first();
          if (result) {
            await env.DB.prepare(
              `UPDATE pro_users SET google_sub = ? WHERE email = ?`
            ).bind(google_sub, email).run();
            console.log('[Pro/Check] Updated google_sub for email:', email, '->', google_sub);
          }
        }

        return jsonResponse({
          success: true,
          isPro: !!result,
          plan: result ? result.plan : null,
          purchasedAt: result ? result.purchased_at : null
        }, 200, corsHeaders);
      }

      // POST /api/history/save — 保存操作历史（仅行为元数据，不含用户内容）
      if (url.pathname === '/api/history/save' && request.method === 'POST') {
        const body = await request.json();
        const { google_sub, action, font_style, download_type, batch_count } = body;
        if (!google_sub || !action) {
          return jsonResponse({ success: false, error: 'Missing google_sub or action' }, 400, corsHeaders);
        }

        await ensureTables(env);

        await env.DB.prepare(
          `INSERT INTO user_history (google_sub, action, font_style, download_type, batch_count, created_at)
           VALUES (?, ?, ?, ?, ?, datetime('now'))`
        ).bind(
          google_sub,
          action,
          font_style || null,
          download_type || null,
          batch_count || null
        ).run();

        console.log('[History/Save]', action, 'for:', google_sub);
        return jsonResponse({ success: true }, 200, corsHeaders);
      }

      // GET /api/history/list — 获取操作历史列表
      if (url.pathname === '/api/history/list' && request.method === 'GET') {
        const google_sub = url.searchParams.get('google_sub');
        if (!google_sub) return jsonResponse({ success: false, error: 'Missing google_sub' }, 400, corsHeaders);

        await ensureTables(env);

        const results = await env.DB.prepare(
          `SELECT action, font_style, download_type, batch_count, created_at FROM user_history WHERE google_sub = ? ORDER BY id DESC LIMIT 50`
        ).bind(google_sub).all();
        return jsonResponse({ success: true, history: results.results }, 200, corsHeaders);
      }

      // DELETE /api/history/clear — 清除操作历史
      if (url.pathname === '/api/history/clear' && request.method === 'DELETE') {
        const google_sub = url.searchParams.get('google_sub');
        if (!google_sub) return jsonResponse({ success: false, error: 'Missing google_sub' }, 400, corsHeaders);

        await ensureTables(env);

        await env.DB.prepare(`DELETE FROM user_history WHERE google_sub = ?`).bind(google_sub).run();
        return jsonResponse({ success: true }, 200, corsHeaders);
      }

      return jsonResponse({ status: 'ok' }, 200, corsHeaders);

    } catch (err) {
      console.error('[API Error]', err.message, err.stack);
      return jsonResponse({ success: false, error: err.message }, 500, corsHeaders);
    }
  }
};

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
      CREATE TABLE IF NOT EXISTS user_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        google_sub TEXT NOT NULL,
        action TEXT NOT NULL,
        font_style TEXT,
        download_type TEXT,
        batch_count INTEGER,
        created_at TEXT
      )
    `),
    env.DB.prepare(`CREATE INDEX IF NOT EXISTS idx_user_history_google_sub ON user_history(google_sub)`),
  ]);
}

function jsonResponse(data, status, headers) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...headers }
  });
}
