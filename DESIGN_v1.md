# Font Generator Free - Pro功能设计文档

## 一、项目概述

**项目名称：** Font Generator Free  
**线上地址：** https://fontgeneratorfree.online/  
**技术架构：** Cloudflare Pages (前端) + Cloudflare Workers (API) + Cloudflare D1 (数据库)  
**当前版本：** v2.0 (Pro功能)

---

## 二、功能矩阵

### 2.1 价格体系

| 套餐 | 价格 | 核心功能 | 盈利模式 |
|------|------|----------|----------|
| **Free** | $0 | 30种字体转换 + 批量模式 + 本地保存 | 广告收入 |
| **Pro月度** | $2.99/月 | 云端历史 + 字体组合 + 导出图片/PDF | 订阅收入 |
| **Pro终身** | $9.99一次性 | Pro月全部功能 + 永久有效 | 买断收入 |

### 2.2 功能列表

| 功能 | Free | Pro | 说明 |
|------|------|-----|------|
| 30种字体转换 | ✅ | ✅ | 实时预览+一键复制 |
| 批量文本转换 | ✅ | ✅ | 多行输入，全部字体/指定字体 |
| 本地保存 | ✅ | ✅ | localStorage存储 |
| 云端历史记录 | ❌ | ✅ | D1数据库持久化 |
| 字体组合(Combo) | ✅ | ✅ | 本地/云端保存 |
| 导出图片 | ❌ | ✅ | Canvas生成PNG |
| 导出PDF | ❌ | ✅ | 完整PDF导出 |
| 无广告 | ❌ | ✅ | Pro用户去广告 |

---

## 三、数据库设计

### 3.1 数据库架构

```
┌─────────────────────────────────────────────────────┐
│              Cloudflare D1 (SQLite)                  │
├─────────────────────────────────────────────────────┤
│  users       - 用户表                               │
│  history     - 历史记录表                            │
│  payments    - 支付记录表                            │
│  font_combo  - 字体组合表                           │
│  ads         - 广告配置表                            │
└─────────────────────────────────────────────────────┘
```

### 3.2 表结构

#### users 表（已有）
```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    google_id TEXT UNIQUE NOT NULL,
    email TEXT NOT NULL,
    name TEXT,
    picture TEXT,
    subscription_tier TEXT DEFAULT 'free',
    subscription_expires_at INTEGER,
    stripe_customer_id TEXT,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
);
```

#### history 表（扩展）
```sql
ALTER TABLE history ADD COLUMN batch_id INTEGER DEFAULT NULL;   -- 批量转换ID
ALTER TABLE history ADD COLUMN is_combo INTEGER DEFAULT 0;       -- 是否组合转换
```

#### font_combo 表（新增）
```sql
CREATE TABLE font_combo (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    fonts TEXT NOT NULL,           -- JSON数组: ["Bold", "Italic", ...]
    is_public INTEGER DEFAULT 0,
    created_at INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

#### ads 表（新增）
```sql
CREATE TABLE ads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ad_type TEXT NOT NULL,        -- banner | popup
    content TEXT NOT NULL,         -- JSON配置
    active INTEGER DEFAULT 1,
    created_at INTEGER NOT NULL
);
```

---

## 四、API 设计

### 4.1 用户相关

| 接口 | 方法 | 说明 | 认证 |
|------|------|------|------|
| `/api/user/sync` | POST | 同步用户到后端 | 需要 |
| `/api/user/status` | GET | 获取用户状态 | 需要 |

### 4.2 历史记录相关

| 接口 | 方法 | 说明 | 认证 |
|------|------|------|------|
| `/api/history/save` | POST | 保存单条历史 | Pro |
| `/api/history/batch-save` | POST | 批量保存历史 | Pro |
| `/api/history/list` | GET | 获取历史列表 | Pro |
| `/api/history/batch-get` | GET | 获取批量详情 | Pro |
| `/api/history/delete` | POST | 删除历史 | Pro |

### 4.3 字体组合相关

| 接口 | 方法 | 说明 | 认证 |
|------|------|------|------|
| `/api/combo/save` | POST | 保存组合 | Pro |
| `/api/combo/list` | GET | 获取组合列表 | Pro |
| `/api/combo/delete` | POST | 删除组合 | Pro |

### 4.4 广告相关

| 接口 | 方法 | 说明 | 认证 |
|------|------|------|------|
| `/api/ads/get` | GET | 获取广告 | 不需要 |

### 4.5 支付相关

| 接口 | 方法 | 说明 | 认证 |
|------|------|------|------|
| `/api/payment/create-order` | POST | 创建订单 | 需要 |
| `/api/payment/capture-order` | POST | 确认支付 | 需要 |
| `/api/payment/webhook` | POST | 支付回调 | 不需要 |

---

## 五、前端页面结构

### 5.1 页面列表

```
font-generator-free/
├── index.html          # 首页（主功能）
├── history.html        # 历史记录页
├── combo.html          # 字体组合页
├── pricing.html        # 价格页
├── upgrade-modal.html  # 升级弹窗
├── script.js           # 字体生成引擎
├── membership.js       # 会员系统模块
├── auth.js             # Google登录模块
└── style.css          # 样式
```

### 5.2 index.html 功能布局

```
┌──────────────────────────────────────────────────────────┐
│  Logo                    [History] [Combos]    [登录]     │
├──────────────────────────────────────────────────────────┤
│  [✨ Single] [📦 Batch]  ← 模式切换                     │
├──────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────┐  │
│  │ 输入框 (单行/多行模式)                              │  │
│  └──────────────────────────────────────────────────┘  │
│                                                          │
│  [批量工具栏] ← 批量模式时显示                           │
│  [字体选择] [统一字体▼] [Convert All] [Save] [Export]  │
├──────────────────────────────────────────────────────────┤
│  Font Styles                                           │
│  [Bold] [Italic] [Bubble] [Gothic] ...  ← 可多选      │
│  [Save as Combo]                                       │
├──────────────────────────────────────────────────────────┤
│  结果卡片网格 (单列/双列)                                │
│  ┌─────────┐ ┌─────────┐                               │
│  │Bold     │ │Italic   │                               │
│  │𝗕𝗼𝗹𝗱    │ │𝘐𝘵𝘢𝘭𝘪𝘤│  [Copy]                        │
│  └─────────┘ └─────────┘                               │
├──────────────────────────────────────────────────────────┤
│  📢 广告Banner (Free版显示)                            │
└──────────────────────────────────────────────────────────┘
```

### 5.3 批量模式交互流程

```
1. 用户输入多行文本
   ↓
2. 点击 [📦 Batch] 切换到批量模式
   ↓
3. 可选择"统一字体"或"全部字体"
   ↓
4. 点击 [Convert All] 批量转换
   ↓
5. 显示所有转换结果（可滚动查看）
   ↓
6. 点击 [Save Batch] 保存到本地/云端
   ↓
7. 点击 [Export] 导出为图片/PDF
```

### 5.4 字体组合(Combo)流程

```
1. 用户在 Font Styles 区域点击选择多种字体
   ↓
2. 点击 [Save as Combo]
   ↓
3. 输入组合名称（如 "My Gaming Fonts"）
   ↓
4. 保存到 localStorage（或云端如果是Pro用户）
   ↓
5. 后续可在 Combo 页面管理/使用组合
```

---

## 六、组件说明

### 6.1 membership.js 模块

```javascript
// 全局会员状态
membershipStatus = {
    isPro: false,       // 是否Pro用户
    user: null,         // 用户信息
    idToken: null       // Google ID Token
};

// 核心函数
syncUserToBackend(user, idToken)  // 同步用户
updateMembershipUI()              // 更新UI（badge/工具/广告）
requirePro()                     // 检查Pro状态
saveToHistory()                  // 保存单条历史
saveBatchHistory()               // 批量保存历史
getHistoryList()                 // 获取历史列表
saveFontCombo()                  // 保存字体组合
getFontComboList()               // 获取组合列表
exportAsImage()                  // 导出图片
exportAsPDF()                    // 导出PDF
```

### 6.2 script.js 字体引擎

```javascript
// 30种字体映射
fontDictionaries = [
    { name: "Bold", map: "𝗮𝗯𝗰..." },
    { name: "Italic", map: "𝘢𝘣𝘤..." },
    // ... 30种
];

// 核心函数
generateFonts(inputText)  // 生成所有字体转换
copyToClipboard(index)    // 复制到剪贴板
renderResults(fonts)     // 渲染结果卡片
```

---

## 七、存储策略

### 7.1 前端存储

| 数据 | 存储位置 | 容量 | 说明 |
|------|----------|------|------|
| 用户会话 | sessionStorage | - | Google ID Token |
| 批量历史(临时) | localStorage | 20条 | Free用户本地保存 |
| 字体组合(临时) | localStorage | 无限制 | Free用户本地保存 |

### 7.2 云端存储 (Pro)

| 数据 | 表 | 保留时间 |
|------|-----|----------|
| 用户信息 | users | 永久 |
| 历史记录 | history | 永久 |
| 字体组合 | font_combo | 永久 |

---

## 八、开发计划

### 8.1 已完成 (v2.0)

- ✅ 批量文本转换功能
- ✅ 本地保存批量历史
- ✅ 字体组合保存功能
- ✅ 广告展示系统
- ✅ Pro badge/工具显示
- ✅ 数据库迁移脚本

### 8.2 待开发 (v2.1)

- ⬜ 导出图片功能（Canvas）
- ⬜ 导出PDF功能
- ⬜ 云端历史记录（需要登录+Pro）
- ⬜ 云端字体组合
- ⬜ Stripe/PayPal 支付集成
- ⬜ 订阅管理页面

### 8.3 未来版本

- ⬜ Dark Mode 主题
- ⬜ PWA 支持（离线使用）
- ⬜ 多语言支持
- ⬜ 颜文字(Kaomoji)面板
- ⬜ 自定义装饰符号（翅膀、爱心等）

---

## 九、文件清单

```
font-generator-free/
├── index.html              # 主页面 (368行)
├── history.html            # 历史记录页 (新建)
├── combo.html              # 字体组合页 (新建)
├── pricing.html            # 价格页 (已有)
├── upgrade-modal.html      # 升级弹窗 (已有)
├── script.js               # 字体引擎 (已有)
├── membership.js           # 会员模块 (重构)
├── auth.js                 # 登录模块 (已有)
├── style.css               # 样式 (已有)
├── worker/
│   ├── index.js            # Worker入口 (更新)
│   ├── pro_api.js         # Pro API (新建)
│   ├── payment.js         # 支付 (已有)
│   └── handlers.js        # Handlers (已有)
├── migrations/
│   └── 001_pro_features.sql # 数据库迁移
├── wrangler.toml          # Cloudflare配置
├── schema.sql             # 数据库schema
├── ARCHITECTURE.md        # 架构文档
└── PRD.md                 # 需求文档
```

---

## 十、测试用例

### 10.1 批量模式测试

1. 输入多行文本，验证分隔正确
2. 选择"统一字体"，验证只转换一种字体
3. 不选择字体，验证转换所有30种
4. 点击 Save Batch，验证本地保存成功
5. 刷新页面，验证数据持久化

### 10.2 字体组合测试

1. 选择多种字体，验证高亮显示
2. 点击 Save as Combo，输入名称
3. 验证 localStorage 保存成功
4. 访问 combo.html，验证组合列表显示

### 10.3 广告测试

1. 未登录/Free用户，验证广告显示
2. Pro用户登录，验证广告隐藏

---

_文档版本：v1.0_  
_最后更新：2026-03-30_
