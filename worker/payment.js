/**
 * PayPal 支付处理模块
 * 包含 Webhook 签名验证，防止伪造支付通知
 */

const PAYPAL_API_BASE = 'https://api-m.paypal.com'; // 正式环境
const PAYPAL_WEBHOOK_ID = '5HE75056YM641173F';

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

// ==================== Webhook 签名验证 ====================

/**
 * 验证 PayPal Webhook 签名
 * 
 * PayPal 签名验证流程:
 * 1. 从请求头提取 transmission_id, transmission_time, cert_url, transmission_sig
 * 2. 下载 PayPal X.509 证书，提取公钥
 * 3. 构造预期签名内容: transmission_id|transmission_time|webhook_id|crc32(body)
 * 4. 用公钥验证 Base64 签名
 * 
 * Cloudflare Workers 使用 WebCrypto API (crypto.subtle)
 */
async function verifyWebhookSignature(request, env) {
  // 1. 提取请求头
  const transmissionId = request.headers.get('PAYPAL-TRANSMISSION-ID');
  const transmissionTime = request.headers.get('PAYPAL-TRANSMISSION-TIME');
  const certUrl = request.headers.get('PAYPAL-CERT-URL');
  const transmissionSig = request.headers.get('PAYPAL-TRANSMISSION-SIG');
  const authAlgo = request.headers.get('PAYPAL-AUTH-ALGO') || 'SHA256withRSA';

  if (!transmissionId || !transmissionTime || !certUrl || !transmissionSig) {
    console.error('[Webhook Verify] Missing required headers', {
      hasTransmissionId: !!transmissionId,
      hasTransmissionTime: !!transmissionTime,
      hasCertUrl: !!certUrl,
      hasTransmissionSig: !!transmissionSig,
    });
    return { valid: false, reason: 'Missing required PayPal headers' };
  }

  // 验证 certUrl 来自 PayPal 域名（防止 SSRF）
  try {
    const certUrlObj = new URL(certUrl);
    if (!certUrlObj.hostname.endsWith('.paypal.com') && !certUrlObj.hostname.endsWith('.paypalobjects.com')) {
      console.error('[Webhook Verify] Invalid cert URL domain:', certUrlObj.hostname);
      return { valid: false, reason: 'Invalid certificate URL domain' };
    }
  } catch {
    return { valid: false, reason: 'Malformed certificate URL' };
  }

  // 2. 获取请求体（原始文本，用于签名验证和事件解析）
  const body = await request.text();

  // 3. 计算 CRC32
  const crc32Value = crc32(body);

  // 4. 构造待验证的消息
  const expectedMessage = `${transmissionId}|${transmissionTime}|${PAYPAL_WEBHOOK_ID}|${crc32Value}`;

  // 5. 下载 PayPal 证书并提取公钥
  const certResponse = await fetch(certUrl);
  if (!certResponse.ok) {
    console.error('[Webhook Verify] Failed to fetch certificate:', certResponse.status);
    return { valid: false, reason: 'Failed to fetch PayPal certificate' };
  }
  const certPem = await certResponse.text();

  // 6. 解析 X.509 证书，提取 RSA 公钥
  const publicKey = await extractPublicKeyFromCert(certPem);

  // 7. 验证签名
  const isValid = await verifyRSASignature(publicKey, expectedMessage, transmissionSig);

  if (!isValid) {
    console.error('[Webhook Verify] Signature verification FAILED');
    return { valid: false, reason: 'Signature verification failed' };
  }

  console.log('[Webhook Verify] Signature verification PASSED');
  return { valid: true, body: body };
}

/**
 * 从 PEM 格式 X.509 证书中提取 RSA 公钥
 * 使用 WebCrypto API
 */
async function extractPublicKeyFromCert(pem) {
  // 移除 PEM 头尾和换行
  const pemBody = pem
    .replace(/-----BEGIN CERTIFICATE-----/, '')
    .replace(/-----END CERTIFICATE-----/, '')
    .replace(/\s/g, '');

  // Base64 解码为 DER 二进制
  const binaryStr = atob(pemBody);
  const bytes = new Uint8Array(binaryStr.length);
  for (let i = 0; i < binaryStr.length; i++) {
    bytes[i] = binaryStr.charCodeAt(i);
  }

  // 使用 WebCrypto 导入 X.509 证书并提取公钥
  // Cloudflare Workers 支持 crypto.subtle.importKey 与 SPKI 格式
  // 先从 DER 证书中提取 SubjectPublicKeyInfo (SPKI)
  const spki = extractSPKIFromDER(bytes);

  const publicKey = await crypto.subtle.importKey(
    'spki',
    spki,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['verify']
  );

  return publicKey;
}

/**
 * 从 DER 编码的 X.509 证书中提取 SubjectPublicKeyInfo
 * 简化解析：查找 BIT STRING 标签来定位 SPKI
 */
function extractSPKIFromDER(der) {
  // X.509 证书 DER 结构:
  // SEQUENCE {
  //   SEQUENCE { ... tbsCertificate ... }  <-- 我们需要其中的 subjectPublicKeyInfo
  //   ...
  // }
  // 
  // 简化方法：在 DER 中搜索 RSA 公钥的 OID 并回溯到 SPKI SEQUENCE
  // RSA OID: 1.2.840.113549.1.1.1 = 06 09 2A 86 48 86 F7 0D 01 01 01
  
  // 更可靠的方法：使用 WebCrypto 的 x509 导入（如果支持）
  // Cloudflare Workers 现在支持 importKey with x509 format
  
  // 回退方案：使用 asn1 解析
  // 我们尝试直接搜索 SPKI 的 SEQUENCE 起始位置
  
  // 方法：遍历 DER，找到包含 RSA OID 的 SEQUENCE，那就是 AlgorithmIdentifier
  // SPKI = SEQUENCE { AlgorithmIdentifier, BIT STRING { public key } }
  // 所以需要找到 AlgorithmIdentifier 的外层 SEQUENCE
  
  const rsaOid = [0x06, 0x09, 0x2A, 0x86, 0x48, 0x86, 0xF7, 0x0D, 0x01, 0x01, 0x01];
  
  for (let i = 0; i < der.length - rsaOid.length; i++) {
    let match = true;
    for (let j = 0; j < rsaOid.length; j++) {
      if (der[i + j] !== rsaOid[j]) {
        match = false;
        break;
      }
    }
    if (match) {
      // 找到了 RSA OID，回溯找到包含它的 SEQUENCE (SPKI)
      // AlgorithmIdentifier 前面是 SEQUENCE tag (0x30) + length
      // 继续回溯找到更外层的 SEQUENCE (SPKI)
      
      // 从 OID 位置向前查找 SEQUENCE (0x30) 标签
      for (let k = i - 1; k >= Math.max(0, i - 20); k--) {
        if (der[k] === 0x30) {
          // 找到一个 SEQUENCE，检查它是否包含 OID
          const seqLen = readDERLength(der, k + 1);
          const seqEnd = k + 1 + seqLen.lenBytes + seqLen.length;
          
          // 验证这个 SEQUENCE 包含 RSA OID
          if (i + rsaOid.length <= seqEnd && i > k) {
            // 这可能是 AlgorithmIdentifier 或 SPKI
            // SPKI 更大，包含 BIT STRING，继续向前找
            for (let m = k - 1; m >= Math.max(0, k - 10); m--) {
              if (der[m] === 0x30) {
                const outerLen = readDERLength(der, m + 1);
                const outerEnd = m + 1 + outerLen.lenBytes + outerLen.length;
                // 验证外层 SEQUENCE 包含内层 SEQUENCE 且整体合理
                if (outerEnd <= der.length && k > m && i + rsaOid.length <= outerEnd) {
                  // 检查 BIT STRING 是否存在（公钥数据）
                  // 在 OID 之后应该有 NULL，然后是 BIT STRING
                  return der.slice(m, outerEnd);
                }
              }
            }
            // 没找到外层，返回这个
            return der.slice(k, seqEnd);
          }
        }
      }
    }
  }
  
  throw new Error('Could not extract SPKI from certificate');
}

/**
 * 读取 DER 编码的 length 字段
 */
function readDERLength(buf, offset) {
  if (buf[offset] < 0x80) {
    return { length: buf[offset], lenBytes: 1 };
  }
  const numBytes = buf[offset] & 0x7F;
  let length = 0;
  for (let i = 0; i < numBytes; i++) {
    length = (length << 8) | buf[offset + 1 + i];
  }
  return { length, lenBytes: 1 + numBytes };
}

/**
 * 使用 RSA PKCS#1 v1.5 验证签名
 */
async function verifyRSASignature(publicKey, message, signatureBase64) {
  try {
    const messageBuffer = new TextEncoder().encode(message);
    
    // Base64 解码签名
    const sigBinary = atob(signatureBase64);
    const signatureBuffer = new Uint8Array(sigBinary.length);
    for (let i = 0; i < sigBinary.length; i++) {
      signatureBuffer[i] = sigBinary.charCodeAt(i);
    }

    return await crypto.subtle.verify(
      'RSASSA-PKCS1-v1_5',
      publicKey,
      signatureBuffer,
      messageBuffer
    );
  } catch (error) {
    console.error('[Webhook Verify] RSA verification error:', error.message);
    return false;
  }
}

/**
 * CRC32 计算（用于 PayPal Webhook 签名验证）
 * PayPal 文档: 使用无符号 CRC32（与 zlib crc32 一致）
 */
function crc32(str) {
  // 标准 CRC32 查找表
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) {
      c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[i] = c;
  }

  let crc = 0xFFFFFFFF;
  for (let i = 0; i < str.length; i++) {
    crc = table[(crc ^ str.charCodeAt(i)) & 0xFF] ^ (crc >>> 8);
  }
  crc = crc ^ 0xFFFFFFFF;

  // 返回无符号 32 位整数的字符串表示（与 PayPal 一致）
  return (crc >>> 0).toString();
}

// ==================== API 处理函数 ====================

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
        description: plan.description,
        custom_id: userId // 传递 Google ID 用于 webhook 对账
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

/**
 * 处理 PayPal Webhook 通知
 * 带完整的签名验证，防止伪造攻击
 */
export async function handleWebhook(request, env, corsHeaders) {
  try {
    // ======== 第一步：验证签名 ========
    const verification = await verifyWebhookSignature(request, env);
    if (!verification.valid) {
      console.error('[Webhook] Signature verification failed:', verification.reason);
      return new Response(JSON.stringify({ error: 'Invalid signature', reason: verification.reason }), { 
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // ======== 第二步：解析事件 ========
    const event = JSON.parse(verification.body);
    console.log('[Webhook] Verified event:', event.event_type, 'id:', event.id);

    // 幂等性检查：通过 PayPal event ID 防止重复处理
    const existingEvent = await env.DB.prepare(
      'SELECT id FROM webhook_events WHERE event_id = ?'
    ).bind(event.id).first();
    
    if (existingEvent) {
      console.log('[Webhook] Duplicate event, skipping:', event.id);
      return new Response('OK', { status: 200 });
    }

    // ======== 第三步：处理支付完成事件 ========
    if (event.event_type === 'PAYMENT.CAPTURE.COMPLETED') {
      const resource = event.resource;
      const captureId = resource.id;
      
      // 从 custom_id 获取用户 Google ID
      const googleId = resource.custom_id || 
                       resource.purchase_units?.[0]?.custom_id;
      if (!googleId) {
        console.error('[Webhook] No custom_id found in PAYMENT.CAPTURE.COMPLETED');
        // 仍然记录事件
        await recordWebhookEvent(env, event, 'no_custom_id');
        return new Response('Missing custom_id', { status: 400 });
      }

      // 从 supplementary_data 或直接从 resource 获取金额和描述
      const amount = resource.amount?.value;
      const currency = resource.amount?.currency_code || 'USD';

      // 更新用户会员状态
      const now = Math.floor(Date.now() / 1000);
      
      // 根据金额判断 planType
      const planType = parseFloat(amount) >= 9.99 ? 'lifetime' : 'monthly';
      const expiresAt = planType === 'monthly' ? now + 30 * 24 * 3600 : null;
      
      await env.DB.prepare(
        'UPDATE users SET subscription_tier = ?, subscription_expires_at = ?, updated_at = ? WHERE google_id = ?'
      ).bind(planType, expiresAt, now, googleId).run();
      
      // 记录支付
      const amountCents = Math.round(parseFloat(amount) * 100);
      await env.DB.prepare(
        'INSERT INTO payments (user_id, stripe_payment_id, amount, currency, plan_type, status, created_at) SELECT id, ?, ?, ?, ?, ?, ? FROM users WHERE google_id = ?'
      ).bind(captureId, amountCents, currency.toLowerCase(), planType, 'completed', now, googleId).run();
      
      // 记录 webhook 事件
      await recordWebhookEvent(env, event, 'processed', googleId);
      
      console.log('[Webhook] User upgraded:', googleId, 'plan:', planType, 'amount:', amount, currency);
    } 
    else if (event.event_type === 'CHECKOUT.ORDER.COMPLETED') {
      // checkout.order.completed 包含完整订单信息
      const resource = event.resource;
      const orderId = resource.id;
      
      const purchaseUnit = resource.purchase_units?.[0];
      const googleId = purchaseUnit?.custom_id;
      if (!googleId) {
        console.error('[Webhook] No custom_id found in CHECKOUT.ORDER.COMPLETED');
        await recordWebhookEvent(env, event, 'no_custom_id');
        return new Response('Missing custom_id', { status: 400 });
      }

      const amount = purchaseUnit.amount?.value;
      const currency = purchaseUnit.amount?.currency_code || 'USD';
      const description = purchaseUnit.description || '';
      const planType = description.includes('Monthly') ? 'monthly' : 'lifetime';

      const now = Math.floor(Date.now() / 1000);
      const expiresAt = planType === 'monthly' ? now + 30 * 24 * 3600 : null;
      
      await env.DB.prepare(
        'UPDATE users SET subscription_tier = ?, subscription_expires_at = ?, updated_at = ? WHERE google_id = ?'
      ).bind(planType, expiresAt, now, googleId).run();
      
      const amountCents = Math.round(parseFloat(amount) * 100);
      await env.DB.prepare(
        'INSERT INTO payments (user_id, stripe_payment_id, amount, currency, plan_type, status, created_at) SELECT id, ?, ?, ?, ?, ?, ? FROM users WHERE google_id = ?'
      ).bind(orderId, amountCents, currency.toLowerCase(), planType, 'completed', now, googleId).run();
      
      await recordWebhookEvent(env, event, 'processed', googleId);
      
      console.log('[Webhook] User upgraded:', googleId, 'plan:', planType, 'amount:', amount, currency);
    }
    else {
      // 其他事件类型，仅记录
      console.log('[Webhook] Unhandled event type:', event.event_type);
      await recordWebhookEvent(env, event, 'unhandled');
    }

    return new Response('OK', { status: 200 });
  } catch (error) {
    console.error('[Webhook] Error:', error.message, error.stack);
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

/**
 * 记录 webhook 事件（用于幂等性和审计）
 */
async function recordWebhookEvent(env, event, status, googleId = null) {
  try {
    await env.DB.prepare(
      `INSERT OR IGNORE INTO webhook_events (event_id, event_type, status, google_id, created_at) 
       VALUES (?, ?, ?, ?, datetime('now'))`
    ).bind(event.id, event.event_type, status, googleId).run();
  } catch (err) {
    // webhook_events 表可能不存在，尝试创建
    try {
      await env.DB.prepare(`
        CREATE TABLE IF NOT EXISTS webhook_events (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          event_id TEXT UNIQUE NOT NULL,
          event_type TEXT NOT NULL,
          status TEXT DEFAULT 'received',
          google_id TEXT,
          created_at TEXT
        )
      `).run();
      await env.DB.prepare(
        `INSERT OR IGNORE INTO webhook_events (event_id, event_type, status, google_id, created_at) 
         VALUES (?, ?, ?, ?, datetime('now'))`
      ).bind(event.id, event.event_type, status, googleId).run();
    } catch (err2) {
      console.error('[Webhook] Failed to record event:', err2.message);
    }
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
