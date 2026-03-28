/**
 * Cloudflare Worker - Font Generator Free API
 * 处理用户认证、会员状态、历史记录、支付
 */

import { handleCreateOrder, handleCaptureOrder, handleWebhook } from './payment.js';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    // CORS 处理
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': 'https://fontgeneratorfree.online',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        }
      });
    }

    const corsHeaders = {
      'Access-Control-Allow-Origin': 'https://fontgeneratorfree.online',
      'Content-Type': 'application/json',
    };

    try {
      // 路由
      if (url.pathname === '/api/user/sync') {
        return handleUserSync(request, env, corsHeaders);
      }
      if (url.pathname === '/api/user/status') {
        return handleUserStatus(request, env, corsHeaders);
      }
      if (url.pathname === '/api/history/save') {
        return handleHistorySave(request, env, corsHeaders);
      }
      if (url.pathname === '/api/history/list') {
        return handleHistoryList(request, env, corsHeaders);
      }
      if (url.pathname === '/api/payment/create-order') {
        return handleCreateOrder(request, env, corsHeaders);
      }
      if (url.pathname === '/api/payment/capture-order') {
        return handleCaptureOrder(request, env, corsHeaders);
      }
      if (url.pathname === '/api/payment/webhook') {
        return handleWebhook(request, env, corsHeaders);
      }
      
      return new Response(JSON.stringify({ error: 'Not found' }), { 
        status: 404, 
        headers: corsHeaders 
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), { 
        status: 500, 
        headers: corsHeaders 
      });
    }
  }
};

// 验证 Google ID Token（简化版，生产环境需完整验证）
async function verifyGoogleToken(idToken) {
  // 解析 JWT payload
  const parts = idToken.split('.');
  if (parts.length !== 3) return null;
  const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
  
  // 基础校验
  const now = Math.floor(Date.now() / 1000);
  if (payload.exp < now) return null;
  if (payload.aud !== '1070692973169-kh4nort1uo59s8oq2159dqn6pc0cfp6e.apps.googleusercontent.com') return null;
  
  return payload;
}
