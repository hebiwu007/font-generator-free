// 保存历史记录（Pro 功能）
async function handleHistorySave(request, env, corsHeaders) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { 
      status: 401, headers: corsHeaders 
    });
  }

  const idToken = authHeader.replace('Bearer ', '');
  const payload = await verifyGoogleToken(idToken);
  if (!payload) {
    return new Response(JSON.stringify({ error: 'Invalid token' }), { 
      status: 401, headers: corsHeaders 
    });
  }

  const user = await env.DB.prepare(
    'SELECT * FROM users WHERE google_id = ?'
  ).bind(payload.sub).first();

  if (!user) {
    return new Response(JSON.stringify({ error: 'User not found' }), { 
      status: 404, headers: corsHeaders 
    });
  }

  // 检查是否 Pro 用户
  const now = Math.floor(Date.now() / 1000);
  const isPro = user.subscription_tier !== 'free' && 
                (user.subscription_expires_at === null || user.subscription_expires_at > now);

  if (!isPro) {
    return new Response(JSON.stringify({ error: 'Pro subscription required' }), { 
      status: 403, headers: corsHeaders 
    });
  }

  const { inputText, fontStyle, outputText } = await request.json();

  await env.DB.prepare(
    'INSERT INTO history (user_id, input_text, font_style, output_text, created_at) VALUES (?, ?, ?, ?, ?)'
  ).bind(user.id, inputText, fontStyle, outputText, now).run();

  return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
}

// 获取历史记录列表
async function handleHistoryList(request, env, corsHeaders) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { 
      status: 401, headers: corsHeaders 
    });
  }

  const idToken = authHeader.replace('Bearer ', '');
  const payload = await verifyGoogleToken(idToken);
  if (!payload) {
    return new Response(JSON.stringify({ error: 'Invalid token' }), { 
      status: 401, headers: corsHeaders 
    });
  }

  const user = await env.DB.prepare(
    'SELECT * FROM users WHERE google_id = ?'
  ).bind(payload.sub).first();

  if (!user) {
    return new Response(JSON.stringify({ error: 'User not found' }), { 
      status: 404, headers: corsHeaders 
    });
  }

  const url = new URL(request.url);
  const limit = parseInt(url.searchParams.get('limit') || '50');
  const offset = parseInt(url.searchParams.get('offset') || '0');

  const { results } = await env.DB.prepare(
    'SELECT * FROM history WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?'
  ).bind(user.id, limit, offset).all();

  return new Response(JSON.stringify({ history: results }), { headers: corsHeaders });
}
