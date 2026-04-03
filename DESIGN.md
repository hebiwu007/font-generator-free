# Font Generator Free - 设计文档 v3.0

## 一、项目概述

**项目名称：** Font Generator Free  
**线上地址：** https://fontgeneratorfree.online/  
**技术架构：** Cloudflare Pages (前端) + Cloudflare Workers (API) + Cloudflare D1 (数据库)  
**当前版本：** v3.0

## 二、核心功能设计

### 2.1 两种模式

**Single（单次转换）**
- 输入单行/单段文字
- 实时预览 30 种字体
- 一键复制单个结果

**Batch（批量处理）**
- 导入文件或粘贴文本
- 选择字体（单个/多个/Combo）
- 预览 + 多种格式下载

### 2.2 Combo（字体组合）

- 在 Batch 页面内创建和管理（弹窗）
- 保存一组常用字体，快速复用
- 存储在 localStorage，Pro 用户同步云端

---

## 三、Batch 模式详细设计

### 3.1 输入方式

| 方式 | 说明 |
|------|------|
| 导入文件 | TXT/CSV/MD，每次最多 10 个，单个最大 1MB |
| 粘贴文本 | 每行一个文本块 |

**文件列表只显示文件名和行数**，不展示文件内容：
```
📄 file1.txt (5 lines)                        ✕
📄 file2.txt (12 lines)                       ✕
```

### 3.2 字体选择

三种模式切换：

| 模式 | UI | 说明 |
|------|-----|------|
| Single Font | 下拉框 | 选一种字体 |
| Multiple Fonts | 按钮网格（多选） | 选多种字体 |
| Use Combo | 下拉框 + Manage 按钮 | 使用已保存的组合 |

### 3.3 Output Format（输出排列方式）

**影响所有下载类型**，决定内容的排列方式。

#### Merged（合并）
所有结果平铺，每行只有转换后的纯文本：
```
𝐇𝐞𝐥𝐥𝐨
𝐻𝑒𝑙𝐥𝐨
𝐖𝐨𝐫𝐥𝐝
𝑊𝑜𝑟𝑙𝑑
```

#### Group by Font（按字体分组）
每种字体一个区块，只有标题和纯文本：
```
── Bold ──
𝐇𝐞𝐥𝐥𝐨
𝐖𝐨𝐫𝐥𝐝

── Italic ──
𝐻𝑒𝑙𝑙𝑜
𝑊𝑜𝑟𝑙𝑑
```

#### Group by Source（按来源分组）
每个来源/输入一个区块：
```
── Hello ──
𝐇𝐞𝐥𝐥𝐨
𝐻𝑒𝑙𝐥𝑙𝑜

── World ──
𝐖𝐨𝐫𝐥𝐝
𝑊𝑜𝑟𝑙𝑑
```

**规则：每行只输出转换后的纯文本，不加字体类型前缀。**

### 3.4 Download Type（下载格式）

| 按钮 | 格式 | 说明 |
|------|------|------|
| 📄 TXT | .txt 文件 | 按 Output Format 排列的纯文本 |
| 📁 ZIP | .zip 压缩包 | 按 Output Format 决定文件结构 |
| 🖼️ PNG | .png 图片 | Canvas 渲染，按排列方式展示 |
| 📕 PDF | .pdf 文件 | Canvas 渲染后图片嵌入 PDF |
| 🌐 HTML | .html 文件 | 浏览器查看，支持复制 |

#### ZIP 与 Output Format 的关系

| Output Format | ZIP 内文件结构 |
|---------------|----------------|
| Merged | 1 个 `all-results.txt` |
| Group by Font | 每种字体一个文件：`Bold.txt`、`Italic.txt` ... |
| Group by Source | 每个来源一个文件：`input-1.txt`、`file1.txt` ... |

### 3.5 Preview（预览区域）

- 默认只显示前 **10 条**结果
- 底部显示 `Showing 10 of 150 results`
- 提供 **"Show All"** 按钮，点击展开全部

---

## 四、Combo 管理设计

### 4.1 入口

Batch 页面 → 选择 "Use Combo" → 点击 ⚙️ Manage 按钮

### 4.2 弹窗功能

```
┌──────────────────────────────────┐
│  🎨 Manage Combos            ✕  │
├──────────────────────────────────┤
│  已保存的 Combos:                │
│  ┌──────────────────────────┐    │
│  │ 社交媒体 (3 fonts)  Use Del│   │
│  │ 游戏昵称 (2 fonts)  Use Del│   │
│  └──────────────────────────┘    │
│                                  │
│  ── Create New Combo ──          │
│  [Combo name        ]           │
│  [Bold] [Italic] [Bubble] ...   │ ← 30 种字体按钮，点击选中
│  Selected: 3                     │
│  [💾 Save Combo]                │
└──────────────────────────────────┘
```

### 4.3 数据存储

- **localStorage**: `fg_saved_combos` → `[{name, fonts}]`
- **云端** (Pro): 通过 API 同步

---

## 五、价格体系

| 套餐 | 价格 | 功能 |
|------|------|------|
| Free | $0 | Single + Batch + 3 个 Combo + TXT/HTML 下载 |
| Pro 月度 | $2.99/月 | 无限 Combo + PNG/PDF 下载 + 云端同步 |
| Pro 终身 | $9.99 | Pro 月度全部 + 永久有效 |

---

## 六、文件清单

```
font-generator-free/
├── index.html          # 主页面 (Single + Batch)
├── combo.html          # 字体组合页 (独立页面)
├── pricing.html        # 价格页
├── script.js           # 字体引擎 + Batch 逻辑
├── membership.js       # 会员模块
├── auth.js             # 登录模块
├── style.css           # 样式
├── worker/
│   ├── index.js        # Worker 入口
│   ├── handlers.js     # 用户认证
│   ├── history.js      # 历史记录
│   ├── payment.js      # 支付
│   └── pro_api.js      # Pro API
├── wrangler.toml       # Cloudflare 配置
└── schema.sql          # 数据库表结构
```

---

_文档版本：v3.0_  
_最后更新：2026-04-03_
