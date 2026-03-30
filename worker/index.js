/**
 * Cloudflare Worker - Font Generator Free API
 * 包含: 用户认证、会员状态、历史记录、字体组合、广告、支付
 */

import { handleCreateOrder, handleCaptureOrder, handleWebhook } from './payment.js';
import * as ProApi from './pro_api.js';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    // CORS 处理
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': 'https://fontgeneratorfree.online',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        }
      });
    }

    const corsHeaders = {
      'Access-Control-Allow-Origin': 'https://fontgeneratorfree.online',
      'Content-Type': 'application/json',
    };

    try {
      // === 用户相关 ===
      if (url.pathname === '/api/user/sync') {
        return ProApi.handleUserSync(request, env, corsHeaders);
      }
      if (url.pathname === '/api/user/status') {
        return ProApi.handleUserStatus(request, env, corsHeaders);
      }

      // === 历史记录相关 ===
      if (url.pathname === '/api/history/save') {
        return ProApi.handleHistorySave(request, env, corsHeaders);
      }
      if (url.pathname === '/api/history/batch-save') {
        return ProApi.handleHistoryBatchSave(request, env, corsHeaders);
      }
      if (url.pathname === '/api/history/list') {
        return ProApi.handleHistoryList(request, env, corsHeaders);
      }
      if (url.pathname === '/api/history/batch-get') {
        return ProApi.handleHistoryBatchGet(request, env, corsHeaders);
      }
      if (url.pathname === '/api/history/delete') {
        return ProApi.handleHistoryDelete(request, env, corsHeaders);
      }

      // === 字体组合相关 ===
      if (url.pathname === '/api/combo/save') {
        return ProApi.handleComboSave(request, env, corsHeaders);
      }
      if (url.pathname === '/api/combo/list') {
        return ProApi.handleComboList(request, env, corsHeaders);
      }
      if (url.pathname === '/api/combo/delete') {
        return ProApi.handleComboDelete(request, env, corsHeaders);
      }

      // === 广告相关 ===
      if (url.pathname === '/api/ads/get') {
        return ProApi.handleAdsGet(request, env, corsHeaders);
      }

      // === 支付相关 ===
      if (url.pathname === '/api/payment/create-order') {
        return handleCreateOrder(request, env, corsHeaders);
      }
      if (url.pathname === '/api/payment/capture-order') {
        return handleCaptureOrder(request, env, corsHeaders);
      }
      if (url.pathname === '/api/payment/webhook') {
        return handleWebhook(request, env, corsHeaders);
      }
      
      // 404
      return new Response(JSON.stringify({ error: 'Not found', path: url.pathname }), { 
        status: 404, 
        headers: corsHeaders 
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message, stack: error.stack }), { 
        status: 500, 
        headers: corsHeaders 
      });
    }
  }
};