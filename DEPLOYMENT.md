# 会员系统部署指南

## 第一步：创建 D1 数据库

```bash
# 1. 创建数据库
wrangler d1 create font-generator-db

# 2. 记录返回的 database_id，填入 wrangler.toml

# 3. 初始化数据库表
wrangler d1 execute font-generator-db --file=schema.sql
```

## 第二步：部署 Worker API

```bash
# 1. 安装依赖
npm install -g wrangler

# 2. 登录 Cloudflare
wrangler login

# 3. 部署 Worker
wrangler deploy

# 4. 记录 Worker URL（例如：https://font-generator-api.xxx.workers.dev）
```

## 第三步：配置 Stripe（可选，后期添加）

1. 注册 [Stripe](https://stripe.com)
2. 获取 API Key
3. 添加到 Worker secrets：
   ```bash
   wrangler secret put STRIPE_SECRET_KEY
   ```

## 第四步：更新前端

1. 修改 `membership.js` 中的 `API_BASE` 为你的 Worker URL
2. 在 `index.html` 的 `</body>` 前添加：
   ```html
   <script src="membership.js"></script>
   <!-- 复制 upgrade-modal.html 的内容到这里 -->
   ```
3. 在 `auth.js` 的 `handleCredentialResponse` 函数里添加：
   ```javascript
   syncUserToBackend(user, response.credential);
   ```

## 第五步：重新部署前端

```bash
wrangler pages deploy . --project-name=font-generator-free
```

## 成本估算

| 服务 | 免费额度 | 预计成本 |
|------|----------|----------|
| Cloudflare Pages | 无限请求 | $0 |
| Cloudflare Workers | 10万请求/天 | $0（超出后 $0.50/百万） |
| Cloudflare D1 | 5GB 存储 | $0 |
| Stripe | 无月费 | 2.9% + $0.30/笔 |

**预计月成本：$0-5**（1万用户内）
