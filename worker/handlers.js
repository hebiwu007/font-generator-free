// 用户同步：登录后创建/更新用户记录
async function handleUserSync(request, env, corsHeaders) {
  const { idToken, user } = await request.json();
  const payload = await verifyGoogleToken(idToken);
  if (!payload) {
    return new Response(JSON.stringify({ error: 'Invalid token' }), { 
      status: 401, headers: corsHeaders 
    });
  }

  const now = Math.floor(Date.now() / 1000);
  
  // 查询用户是否存在
  const existing = await env.DB.prepare(
    'SELECT * FROM users WHERE google_id = ?'
  ).bind(payload.sub).first();

  if (existing) {
    // 更新用户信息
    await env.DB.prepare(
      'UPDATE users SET email=?, name=?, picture=?, updated_at=? WHERE google_id=?'
    ).bind(user.email, user.name, user.picture, now, payload.sub).run();
    
    return new Response(JSON.stringify({ 
      user: existing,
      isPro: existing.subscription_tier !== 'free' && 
             (existing.subscription_expires_at === null || existing.subscription_expires_at > now)
    }), { headers: corsHeaders });
  } else {
    // 创建新用户
    await env.DB.prepare(
      'INSERT INTO users (google_id, email, name, picture, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)'
    ).bind(payload.sub, user.email, user.name, user.picture, now, now).run();
    
    return new Response(JSON.stringify({ 
      user: { google_id: payload.sub, email: user.email, subscription_tier: 'free' },
      isPro: false
    }), { headers: corsHeaders });
  }
}

// 获取用户状态
async function handleUserStatus(request, env, corsHeaders) {
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

  const now = Math.floor(Date.now() / 1000);
  const isPro = user.subscription_tier !== 'free' && 
                (user.subscription_expires_at === null || user.subscription_expires_at > now);

  return new Response(JSON.stringify({ user, isPro }), { headers: corsHeaders });
}
