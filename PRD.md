# 产品需求文档 (PRD)：Font Generator Free (MVP版)

> 归档日期：2026-03-25

## 1. 项目概述

**项目名称：** Font Generator Free
**产品愿景：** 为用户提供一个极简、快速、免费的在线字体转换工具。用户输入普通文本即可实时获得多种独特风格的艺术字体，支持一键复制，方便在 Instagram、Twitter、TikTok 等社交媒体或游戏昵称中使用。
**技术选型：** 纯前端项目 (HTML/CSS/JavaScript)，无后端数据库。
**部署方案：** Cloudflare Pages (利用其全球 CDN 实现极速加载，且免费额度完全满足需求)。

---

## 2. 目标用户

- **社交媒体活跃用户：** 希望在个人简介（Bio）或帖子中使用特殊字体吸引眼球。
- **游戏玩家：** 需要设计独特的游戏昵称或公会名称。
- **内容创作者/自媒体：** 需要在标题或排版中增加视觉趣味性。

---

## 3. 核心功能需求 (MVP 阶段)

### 3.1 文本输入模块

- **功能描述：** 提供一个多行文本输入框（Textarea）。
- **交互细节：**
  - 支持 Placeholder（如："Type your text here..."）。
  - 自动获取焦点（Autofocus）。
  - 具备清除按钮（一键清空输入框内容）。

### 3.2 实时字体生成引擎

- **功能描述：** 利用 JavaScript 的事件监听（`input` 事件），当用户输入内容时，实时将文本转换为多种预设字体风格。
- **预设字体库（MVP 包含 30 种高频 Unicode 字体）：**

  | # | 字体名称 | 示例效果 |
  |---|----------|----------|
  | 1 | Bold | 𝗕𝗼𝗹𝗱 |
  | 2 | Italic | 𝘐𝘵𝘢𝘭𝘪𝘤 |
  | 3 | Bold Italic | 𝙱𝚘𝚕𝚍 𝙸𝚝𝚊𝚕𝚒𝚌 |
  | 4 | Cursive | 𝒞𝓊𝓇𝓈𝒾𝓋𝑒 |
  | 5 | Bold Cursive | 𝓑𝓸𝓵𝓭 𝓒𝓾𝓻𝓼𝓲𝓿𝓮 |
  | 6 | Double Struck | 𝔻𝕠𝕦𝕓𝕝𝕖 𝕊𝕥𝕣𝕦𝕔𝕜 |
  | 7 | Bubble | Ⓑⓤⓑⓑⓛⓔ |
  | 8 | Black Bubble | 🅑🅛🅐🅒🅚 |
  | 9 | Gothic | 𝔊𝔬𝔱𝔥𝔦𝔠 |
  | 10 | Bold Gothic | 𝕭𝖔𝖑𝖉 𝕲𝖔𝖙𝖍𝖎𝖈 |
  | 11 | Square | 🅂🅀🅄🄰🅁🄴 |
  | 12 | Black Square | 🅂🅀🅄🅰🅁🅴 |
  | 13 | Monospace | 𝙼𝚘𝚗𝚘𝚜𝚙𝚊𝚌𝚎 |
  | 14 | Upside Down | uʍop-ǝpısdn |
  | 15 | Small Caps | ꜱᴍᴀʟʟ ᴄᴀᴘꜱ |
  | 16 | Subscript | ₛᵤᵦₛ꜀ᵣᵢₚₜ |
  | 17 | Superscript | ˢᵘᵖᵉʳˢᶜʳⁱᵖᵗ |
  | 18 | Strikethrough | S̶t̶r̶i̶k̶e̶t̶h̶r̶o̶u̶g̶h̶ |
  | 19 | Underline | U̲n̲d̲e̲r̲l̲i̲n̲e̲ |
  | 20 | Wide | Ｗｉｄｅ |
  | 21 | Parenthesized | ⒫⒜⒭⒠⒩⒯⒣⒠⒮⒤⒵⒠⒟ |
  | 22 | Tiny | ᵗⁱⁿʸ |
  | 23 | Zalgo | Z̷a̷l̷g̷o̷ |
  | 24 | Crossed | C⃒r⃒o⃒s⃒s⃒e⃒d⃒ |
  | 25 | Arrow | A⃕r⃕r⃕o⃕w⃕ |
  | 26 | Heart | H♥e♥a♥r♥t♥ |
  | 27 | Star | S★t★a★r★ |
  | 28 | Dot | Ḋȯṫ |
  | 29 | Bracket | 【B】【r】【a】【c】【k】【e】【t】 |
  | 30 | Wave | W〰a〰v〰e〰 |

- **业务逻辑：** 仅对英文字母（A-Z, a-z）和数字（0-9）进行 Unicode 字典映射，忽略不支持的标点符号和中文字符（保持原样输出）。

### 3.3 结果展示与一键复制模块

- **功能描述：** 将生成的字体以列表或卡片形式展示在输入框下方。
- **交互细节：**
  - 每个结果卡片右侧提供显眼的"复制 (Copy)"按钮。
  - 点击复制后，利用 JS `navigator.clipboard.writeText()` API 写入剪贴板。
  - 按钮文字短暂变为"Copied!"并变绿，同时底部弹出 Toast 提示，2秒后恢复原状。

### 3.4 响应式与 UI 界面

- **功能描述：** 界面必须简洁且兼容各端。
- **交互细节：**
  - **移动端优先：** 移动端布局单列展示，按钮区域易于手指点击。
  - **桌面端：** 结果卡片采用双列网格布局（`grid-cols-2`）。
  - **极简设计：** 突出核心的输入框和生成结果，避免视觉干扰。

---

## 4. 非功能性需求

### 4.1 性能需求

- **纯前端处理：** 字体转换逻辑全部在客户端完成，零后端请求，毫秒级响应。
- **极速加载：** 页面文件需压缩，目标首屏加载时间 < 1.5 秒。

### 4.2 SEO 需求

- **Title:** `Free Font Generator - Copy and Paste Fancy Text for Instagram & TikTok`
- **Description:** 包含 Instagram fonts、text generator 等长尾词。
- **Keywords:** `font generator, fancy text, instagram fonts, copy and paste fonts, cool text generator`
- **语义化标签：** 合理使用 `<h1>`、`<h2>`。
- **Canonical URL：** 配置规范链接，防止内容重复。

### 4.3 部署需求

- **部署平台：** Cloudflare Pages
- **工作流：** GitHub 仓库绑定 Cloudflare Pages，Push 到 `main` 分支后自动构建部署（CI/CD）。
- **自定义域名：** 绑定自定义域名，开启免费 SSL 证书（HTTPS 强制跳转）。

---

## 5. 技术架构

| 层级 | 技术选型 | 说明 |
|------|----------|------|
| 结构 | HTML5 | 语义化标签，SEO 友好 |
| 样式 | Tailwind CSS (CDN) | 极简响应式 UI，无需构建 |
| 逻辑 | Vanilla JavaScript | 零依赖，包体积最小 |
| 部署 | Cloudflare Pages | 全球 CDN，免费额度充足 |

**核心数据结构：**
```javascript
const fontDictionaries = [
  { name: "Bold", map: Array.from("𝗮𝗯𝗰...") },
  { name: "Italic", map: Array.from("𝘢𝘣𝘤...") },
  // ... 共 30 种
];
```

---

## 6. 文件结构

```
font-generator-free/
├── index.html   # 页面结构 & SEO TDK
├── style.css    # 自定义样式（滚动条、选中色、Toast）
├── script.js    # 字体映射引擎 & 交互逻辑
└── PRD.md       # 本需求文档
```

---

## 7. 上线验收标准

1. 输入大段英文、数字或混合符号，页面不卡顿，30 种结果即时更新。
2. 在 iOS Safari、Android Chrome、Windows Edge、Mac Chrome 均能成功复制并粘贴到其他应用。
3. 部署到 Cloudflare 后支持 HTTPS 访问，Lighthouse 评分（Performance、Accessibility、Best Practices、SEO）均达到 90 分以上。

---

## 8. Future Roadmap (v2.0)

- **Dark Mode：** 支持系统级深色/浅色主题切换。
- **更多装饰器：** 在文字前后添加翅膀、爱心等特殊符号（如 `꧁༺ Text ༻꧂`）。
- **Kaomoji 颜文字面板：** 提供常见颜文字的快速点击复制模块。
- **PWA 支持：** 允许添加到手机主屏幕，支持离线使用。
- **多语言支持：** 考虑支持中文、日文等字符集的特殊变换。
