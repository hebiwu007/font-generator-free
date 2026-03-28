/**
 * PayPal 支付处理模块
 */

const PAYPAL_API_BASE = 'https://api-m.sandbox.paypal.com'; // 沙箱环境

// 获取 PayPal Access Token
async function getPayPalAccessToken(env) {
  const auth = btoa(`${env.PAYPAL_CLIENT_ID}:${env.PAYPAL_SECRET}`);
  const response = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: 'grant_type=client_credentials'
  });
  const data = await response.json();
  return data.access_token;
}

// 创建 PayPal 订单
export async function handleCreateOrder(request, env, corsHeaders) {
  try {
    const { planType, userId } = await request.json();
    
    // 定价映射
    const prices = {
      'monthly': { amount: '2.99', description: 'Pro Monthly Subscription' },
      'lifetime': { amount: '9.99', description: 'Pro Lifetime Access' }
    };
    
    const plan = prices[planType];
    if (!plan) {
      return new Response(JSON.stringify({ error: 'Invalid plan' }), { 
        status: 400, 
        headers: corsHeaders 
      });
    }

    const accessToken = await getPayPalAccessToken(env);
    
    const orderData = {
      intent: 'CAPTURE',
      purchase_units: [{
        amount: {
          currency_code: 'USD',
          value: plan.amount
        },
        description: plan.description
      }]
    };

    const response = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(orderData)
    });

    const order = await response.json();
    return new Response(JSON.stringify({ orderId: order.id }), { 
      headers: corsHeaders 
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500, 
      headers: corsHeaders 
    });
  }
}

// 捕获支付并更新会员状态
export async function handleCaptureOrder(request, env, corsHeaders) {
  try {
    const { orderId, planType, googleId } = await request.json();
    
    const accessToken = await getPayPalAccessToken(env);
    
    const response = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders/${orderId}/capture`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    const captureData = await response.json();
    
    if (captureData.status === 'COMPLETED') {
      // 更新用户会员状态
      const now = Math.floor(Date.now() / 1000);
      const expiresAt = planType === 'monthly' ? now + 30 * 24 * 3600 : null;
      
      await env.DB.prepare(
        'UPDATE users SET subscription_tier = ?, subscription_expires_at = ?, updated_at = ? WHERE google_id = ?'
      ).bind(planType === 'lifetime' ? 'lifetime' : 'pro', expiresAt, now, googleId).run();
      
      // 记录支付
      const amount = planType === 'monthly' ? 299 : 999;
      await env.DB.prepare(
        'INSERT INTO payments (user_id, stripe_payment_id, amount, currency, plan_type, status, created_at) SELECT id, ?, ?, ?, ?, ?, ? FROM users WHERE google_id = ?'
      ).bind(orderId, amount, 'usd', planType, 'completed', now, googleId).run();
      
      return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
    }
    
    return new Response(JSON.stringify({ error: 'Payment failed' }), { 
      status: 400, 
      headers: corsHeaders 
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500, 
      headers: corsHeaders 
    });
  }
}
