/**
 * Font Generator Free - Pro API Handlers
 * 包含: 用户、会员、历史记录、字体组合、导出
 */

import { handleCreateOrder, handleCaptureOrder, handleWebhook } from './payment.js';

// ==================== 用户相关 ====================

// 用户同步：登录后创建/更新用户记录
export async function handleUserSync(request, env, corsHeaders) {
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
      isPro: checkProStatus(existing)
    }), { headers: corsHeaders });
  } else {
    // 创建新用户
    const result = await env.DB.prepare(
      'INSERT INTO users (google_id, email, name, picture, subscription_tier, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
    ).bind(payload.sub, user.email, user.name, user.picture, 'free', now, now).run();
    
    return new Response(JSON.stringify({ 
      user: { id: result.lastRowId, google_id: payload.sub, email: user.email, subscription_tier: 'free' },
      isPro: false
    }), { headers: corsHeaders });
  }
}

// 获取用户状态
export async function handleUserStatus(request, env, corsHeaders) {
  const user = await authenticateUser(request, env, corsHeaders);
  if (user instanceof Response) return user;

  return new Response(JSON.stringify({ user, isPro: checkProStatus(user) }), { headers: corsHeaders });
}

// ==================== 历史记录相关 ====================

// 保存单条历史记录（原有）
export async function handleHistorySave(request, env, corsHeaders) {
  const user = await authenticateUser(request, env, corsHeaders);
  if (user instanceof Response) return user;

  if (!checkProStatus(user)) {
    return new Response(JSON.stringify({ error: 'Pro subscription required' }), { 
      status: 403, headers: corsHeaders 
    });
  }

  const { inputText, fontStyle, outputText, batchId, isCombo } = await request.json();
  const now = Math.floor(Date.now() / 1000);

  await env.DB.prepare(
    'INSERT INTO history (user_id, input_text, font_style, output_text, batch_id, is_combo, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
  ).bind(user.id, inputText, fontStyle, outputText, batchId || null, isCombo ? 1 : 0, now).run();

  return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
}

// 批量保存历史记录（新增 Pro）
export async function handleHistoryBatchSave(request, env, corsHeaders) {
  const user = await authenticateUser(request, env, corsHeaders);
  if (user instanceof Response) return user;

  if (!checkProStatus(user)) {
    return new Response(JSON.stringify({ error: 'Pro subscription required' }), { 
      status: 403, headers: corsHeaders 
    });
  }

  const { records, batchName } = await request.json();
  if (!records || !Array.isArray(records)) {
    return new Response(JSON.stringify({ error: 'Invalid records' }), { 
      status: 400, headers: corsHeaders 
    });
  }

  const now = Math.floor(Date.now() / 1000);
  // 生成批次ID
  const batchId = now;

  // 批量插入
  for (const record of records) {
    await env.DB.prepare(
      'INSERT INTO history (user_id, input_text, font_style, output_text, batch_id, is_combo, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
    ).bind(user.id, record.inputText, record.fontStyle, record.outputText, batchId, record.isCombo ? 1 : 0, now).run();
  }

  return new Response(JSON.stringify({ success: true, batchId }), { headers: corsHeaders });
}

// 获取历史记录列表
export async function handleHistoryList(request, env, corsHeaders) {
  const user = await authenticateUser(request, env, corsHeaders);
  if (user instanceof Response) return user;

  const url = new URL(request.url);
  const limit = parseInt(url.searchParams.get('limit') || '50');
  const offset = parseInt(url.searchParams.get('offset') || '0');
  const batchOnly = url.searchParams.get('batchOnly') === 'true';

  let query = 'SELECT * FROM history WHERE user_id = ?';
  let countQuery = 'SELECT COUNT(*) as total FROM history WHERE user_id = ?';
  
  if (batchOnly) {
    query = 'SELECT batch_id, GROUP_CONCAT(font_style) as fonts, COUNT(*) as count, created_at FROM history WHERE user_id = ? AND batch_id IS NOT NULL GROUP BY batch_id';
    countQuery = 'SELECT COUNT(DISTINCT batch_id) as total FROM history WHERE user_id = ? AND batch_id IS NOT NULL';
  }

  const { results } = await env.DB.prepare(
    batchOnly ? query : query + ' ORDER BY created_at DESC LIMIT ? OFFSET ?'
  ).bind(user.id, limit, offset).all();

  const { results: countResult } = await env.DB.prepare(countQuery).bind(user.id).all();
  const total = batchOnly ? countResult[0]?.total || 0 : countResult[0]?.total || 0;

  return new Response(JSON.stringify({ 
    history: results, 
    total,
    hasMore: offset + results.length < total
  }), { headers: corsHeaders });
}

// 获取批量历史详情
export async function handleHistoryBatchGet(request, env, corsHeaders) {
  const user = await authenticateUser(request, env, corsHeaders);
  if (user instanceof Response) return user;

  const url = new URL(request.url);
  const batchId = url.searchParams.get('batchId');
  
  if (!batchId) {
    return new Response(JSON.stringify({ error: 'batchId required' }), { 
      status: 400, headers: corsHeaders 
    });
  }

  const { results } = await env.DB.prepare(
    'SELECT * FROM history WHERE user_id = ? AND batch_id = ? ORDER BY created_at'
  ).bind(user.id, parseInt(batchId)).all();

  return new Response(JSON.stringify({ records: results }), { headers: corsHeaders });
}

// 删除历史记录
export async function handleHistoryDelete(request, env, corsHeaders) {
  const user = await authenticateUser(request, env, corsHeaders);
  if (user instanceof Response) return user;

  const { historyId, batchId } = await request.json();
  
  if (batchId) {
    // 删除整批
    await env.DB.prepare('DELETE FROM history WHERE user_id = ? AND batch_id = ?')
      .bind(user.id, batchId).run();
  } else if (historyId) {
    await env.DB.prepare('DELETE FROM history WHERE user_id = ? AND id = ?')
      .bind(user.id, historyId).run();
  }

  return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
}

// ==================== 字体组合相关 ====================

// 保存字体组合
export async function handleComboSave(request, env, corsHeaders) {
  const user = await authenticateUser(request, env, corsHeaders);
  if (user instanceof Response) return user;

  const { name, fonts, isPublic } = await request.json();
  if (!name || !fonts || !Array.isArray(fonts)) {
    return new Response(JSON.stringify({ error: 'Invalid name or fonts' }), { 
      status: 400, headers: corsHeaders 
    });
  }

  const now = Math.floor(Date.now() / 1000);
  const fontsJson = JSON.stringify(fonts);

  const result = await env.DB.prepare(
    'INSERT INTO font_combo (user_id, name, fonts, is_public, created_at) VALUES (?, ?, ?, ?, ?)'
  ).bind(user.id, name, fontsJson, isPublic ? 1 : 0, now).run();

  return new Response(JSON.stringify({ success: true, comboId: result.lastRowId }), { headers: corsHeaders });
}

// 获取字体组合列表
export async function handleComboList(request, env, corsHeaders) {
  const user = await authenticateUser(request, env, corsHeaders);
  if (user instanceof Response) return user;

  const { results } = await env.DB.prepare(
    'SELECT * FROM font_combo WHERE user_id = ? ORDER BY created_at DESC'
  ).bind(user.id).all();

  return new Response(JSON.stringify({ combos: results }), { headers: corsHeaders });
}

// 删除字体组合
export async function handleComboDelete(request, env, corsHeaders) {
  const user = await authenticateUser(request, env, corsHeaders);
  if (user instanceof Response) return user;

  const { comboId } = await request.json();
  
  await env.DB.prepare('DELETE FROM font_combo WHERE user_id = ? AND id = ?')
    .bind(user.id, comboId).run();

  return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
}

// ==================== 广告相关 ====================

// 获取广告
export async function handleAdsGet(request, env, corsHeaders) {
  const { results } = await env.DB.prepare(
    'SELECT * FROM ads WHERE active = 1 ORDER BY RANDOM() LIMIT 1'
  ).all();

  return new Response(JSON.stringify({ ad: results[0] || null }), { headers: corsHeaders });
}

// ==================== 工具函数 ====================

// 验证用户并返回用户对象
async function authenticateUser(request, env, corsHeaders) {
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

  return user;
}

// 检查 Pro 状态
function checkProStatus(user) {
  const now = Math.floor(Date.now() / 1000);
  return user.subscription_tier !== 'free' && 
         (user.subscription_expires_at === null || user.subscription_expires_at > now);
}

// 验证 Google ID Token
async function verifyGoogleToken(idToken) {
  const parts = idToken.split('.');
  if (parts.length !== 3) return null;
  
  try {
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp < now) return null;
    if (payload.aud !== '1070692973169-kh4nort1uo59s8oq2159dqn6pc0cfp6e.apps.googleusercontent.com') return null;
    return payload;
  } catch (e) {
    return null;
  }
}