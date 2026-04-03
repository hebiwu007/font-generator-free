# Font Generator Free - 设计文档 v3.1

## 一、项目概述

**项目名称：** Font Generator Free  
**线上地址：** https://fontgeneratorfree.online/  
**技术架构：** Cloudflare Pages (前端) + Cloudflare Workers (API) + Cloudflare D1 (数据库)  
**当前版本：** v3.1  
**最后更新：** 2026-04-03

## 二、核心功能设计

### 2.1 两种模式

**Single（单次转换）**
- 输入单行/单段文字
- 实时预览 30 种字体
- 一键复制单个结果
- 历史记录：导航栏 🕐 History 入口，浮动面板，最多 20 条，点击回填

**Batch（批量处理）**
- 导入文件或粘贴文本
- 选择字体（单个/多个/Combo）
- 预览 + 多种格式下载

### 2.2 Combo（字体组合）

- 在 combo.html 独立页面管理
- localStorage 存储，免费用户限 3 个，Pro 用户无限 + 云端同步
- 点击 Use 跳转到 index.html 使用该 Combo

---

## 三、Batch 模式详细设计

### 3.1 输入方式

| 方式 | 说明 |
|------|------|
| 导入文件 | TXT/CSV/MD，每次最多 **10 个**，单个最大 **1MB** |
| 粘贴文本 | 每行一个文本块 |

**文件限制：**
- 单文件大小上限：1MB（超出提示错误）
- 文件数量上限：10 个（超出提示错误）
- 支持格式：.txt, .csv, .md, .text

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
所有结果平铺，每行只有转换后的纯文本

#### Group by Font（按字体分组）
每种字体一个区块，只有标题和纯文本

#### Group by Source（按来源分组）
每个来源/输入一个区块

**规则：每行只输出转换后的纯文本，不加字体类型前缀。**

### 3.4 Download Type（下载格式）

| 按钮 | 格式 | 说明 |
|------|------|------|
| 📄 HTML | .html 文件 | 浏览器打开，完美渲染所有 Unicode 字体 |
| 📁 ZIP | .zip 压缩包 | 内含多个 .html 文件，按 Output Format 决定文件结构 |
| 🖼️ PNG | .png 图片 | html-to-image 截图渲染 |
| 📕 PDF | .pdf 文件 | html-to-image 截图 + jsPDF 嵌入 |

> **注意**：所有下载格式统一为 HTML/图片方式，确保 Unicode 特殊字体（Bold、Strikethrough、Dot 等组合字符）在所有平台正确显示。

#### ZIP 与 Output Format 的关系

| Output Format | ZIP 内文件结构 |
|---------------|----------------|
| Merged | 1 个 `all-results.html` |
| Group by Font | `字体名-来源名.html`（如 `Bold-file1.html`） |
| Group by Source | `来源名-字体名.html`（如 `file1-Bold.html`） |

### 3.5 Preview（预览区域）

- 默认只显示前 **10 条**结果
- 底部显示 `Showing 10 of 150 results`
- 提供 **"Show All"** 按钮，点击展开全部

---

## 四、Combo 管理设计

### 4.1 入口

导航栏 → 🎨 Combos → combo.html 独立页面

### 4.2 页面功能

- 查看已保存的 Combo 列表
- 创建新 Combo（选择名称 + 多选字体）
- Use：跳转 index.html 使用该 Combo
- Delete：删除 Combo

### 4.3 数据存储

- **localStorage**: `fg_saved_combos` → `[{name, fonts, created}]`
- **云端** (Pro): 通过 API 同步（待实现）

---

## 五、历史记录

### 5.1 入口

导航栏 → 🕐 History → 右侧浮动面板

### 5.2 功能

- 自动记录 Single 模式输入的文本
- 最多 20 条，去重（最新排前面）
- 点击历史记录 → 自动填入输入框 + 切换到 Single 模式
- Clear All 清空所有历史

### 5.3 存储

- **localStorage**: `fg_history` → `[text1, text2, ...]`

---

## 六、价格体系

| 套餐 | 价格 | 功能 |
|------|------|------|
| Free | $0 | Single + Batch + 3 个 Combo + HTML/ZIP 下载 |
| Pro 月度 | $2.99/月 | 无限 Combo + PNG/PDF 下载 + 云端同步 |
| Pro 终身 | $9.99 | Pro 月度全部 + 永久有效 |

---

## 七、隐私说明与合规

### 7.1 首页 Footer 信息

首页底部包含以下链接和信息：

- **Privacy Policy** 链接 → privacy.html
- **Terms of Service** 链接 → terms.html
- © 年份 Font Generator Free. All rights reserved.

### 7.2 数据处理声明

- 所有文本转换在浏览器本地完成，不发送到服务器
- 历史记录和 Combo 存储在浏览器 localStorage
- 不收集个人文本内容
- Google 登录仅用于 Pro 会员验证

---

## 八、30 种字体列表

| # | 字体名称 | Unicode 范围 | 示例 |
|---|----------|-------------|------|
| 1 | Bold | U+1D41A+ | 𝐁𝐨𝐥𝐝 |
| 2 | Italic | U+1D44E+ | 𝐼𝑡𝑎𝑙𝑖𝑐 |
| 3 | Bold Italic | U+1D482/U+1D468 | 𝑩𝒐𝒍𝒅 𝑰𝒕𝒂𝒍𝒊𝒄 |
| 4 | Double Struck | U+1D552+ (有缺口) | 𝔻𝕠𝕦𝕓𝕝𝕖 |
| 5 | Cursive | U+1D4B6+ (有缺口) | 𝒞𝓊𝓇𝓈𝒾𝓋𝑒 |
| 6 | Gothic | U+1D51E+ (有缺口) | 𝔊𝔬𝔱𝔥𝔦𝔠 |
| 7 | Bold Gothic | U+1D586/U+1D56C | 𝕭𝖔𝖑𝖉 𝕲𝖔𝖙𝖍𝖎𝖈 |
| 8 | Monospace | U+1D68A/U+1D670 | 𝙼𝚘𝚗𝚘𝚜𝚙𝚊𝚌𝚎 |
| 9 | Bold Cursive | 同 Bold Italic | 𝑩𝒐𝒍𝒅 𝑪𝒖𝒓𝒔𝒊𝒗𝒆 |
| 10 | Bubble | U+24D0/U+24B6 | Ⓑⓤⓑⓑⓛⓔ |
| 11 | Black Bubble | U+1F170 | 🅱🅻🅰🅲🅺 |
| 12 | Square | U+1F130 | 🅂🅀🅄🄰🅁🄴 |
| 13 | Black Square | U+1F170 | 🅂🅀🅄🅰🅁🅴 |
| 14 | Wide | U+FF21+ | Ｗｉｄｅ |
| 15 | Small Caps | U+1D00+ | ꜱᴍᴀʟʟ ᴄᴀᴘꜱ |
| 16 | Subscript | U+2090+ | ₛᵤᵦₛ꜀ᵣᵢₚₜ |
| 17 | Superscript | U+2070+ | ˢᵘᵖᵉʳˢᶜʳⁱᵖᵗ |
| 18 | Strikethrough | base+U+0336 | S̶t̶r̶i̶k̶e̶ |
| 19 | Underline | base+U+0332 | U̲n̲d̲e̲r̲ |
| 20 | Upside Down | 自定义映射 | uʍop-ǝpısdn |
| 21 | Zalgo | base+U+0337 | Z̷a̷l̷g̷o̷ |
| 22 | Heart | base+U+2665 | H♥e♥a♥r♥t♥ |
| 23 | Star | base+U+2605 | S★t★a★r★ |
| 24 | Dot | base+U+0307 | Ḋȯṫ |
| 25 | Bracket | 【base】 | 【B】【r】【a】 |
| 26 | Wave | base+U+3030 | W〰a〰v〰e〰 |
| 27 | Parenthesized | U+249C+ | ⒫⒜⒭⒠⒩ |
| 28 | Crossed | base+U+20D2 | C⃒r⃒o⃒s⃒s⃒e⃒d⃒ |
| 29 | Arrow | base+U+20D5 | A⃕r⃕r⃕o⃕w⃕ |
| 30 | Tiny | U+1D2C+ | ᵗⁱⁿʸ |

---

## 九、文件清单

```
font-generator-free/
├── index.html          # 主页面 (Single + Batch)
├── combo.html          # 字体组合管理页
├── pricing.html        # 价格页
├── history.html        # 历史记录独立页（保留）
├── script.js           # 字体引擎 + Batch 逻辑
├── membership.js       # 会员模块
├── auth.js             # 登录模块
├── style.css           # 样式
├── DESIGN.md           # 本文档
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

_文档版本：v3.1_  
_最后更新：2026-04-03_
