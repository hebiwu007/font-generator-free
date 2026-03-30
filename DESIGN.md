# Font Generator Free - Pro功能设计文档 v2.0

## 一、项目概述

**项目名称：** Font Generator Free  
**线上地址：** https://fontgeneratorfree.online/  
**技术架构：** Cloudflare Pages (前端) + Cloudflare Workers (API) + Cloudflare D1 (数据库)  
**当前版本：** v2.0

## 二、核心功能设计

### 2.1 三种模式定位

**Single（单次转换）**
- 输入单行/单段文字
- 实时预览30种字体
- 一键复制单个结果

**Batch（批量导入）**
- 导入1个或多个文件（TXT、CSV）
- 每个文件应用选定的字体组
- 批量导出结果（多种格式）

**Combo（字体组合）**
- 保存一组预设字体
- 快速切换使用场景
- 一键应用到当前转换

### 2.2 价格体系

| 套餐 | 价格 | 功能 |
|------|------|------|
| Free | $0 | Single + Batch本地 + 3个Combo |
| Pro月度 | $2.99/月 | 无限Batch云端 + 无限Combo云端 + 导出图片/PDF |
| Pro终身 | $9.99 | Pro月度全部 + 永久有效 |

## 三、功能详解

### 3.1 Single 模式

**UI布局：**
- 输入框输入单行/单段文字
- 实时显示30种字体预览网格
- 点击任意结果一键复制

### 3.2 Batch 模式

**输入方式：**
- 导入文件（支持TXT、CSV，每次最多10个文件，单文件最大1MB）
- 或粘贴多个文本块（每行一个文本块）

**字体选择：**
- 单个字体
- 多个字体（多选）
- 使用已保存的Combo

**输出格式：**
1. Merged - 一个文件包含所有结果
2. By Font - 按字体分组
3. By Source - 按源文件分组
4. ZIP - 所有结果打包

### 3.3 Combo 功能

**用途：**
- 保存常用字体组合
- 快速应用到Single或Batch
- 预设使用场景

**示例组合：**
| 组合名称 | 包含字体 | 适用场景 |
|---------|---------|---------|
| 社交媒体 | Bold, Italic, Bubble | Instagram Bio, Twitter |
| 游戏昵称 | Gothic, Bold Gothic, Square | 游戏ID |
| 工作签名 | Cursive, Italic, Bold | 邮件签名 |

## 四、数据库设计

### 4.1 font_combo 表

```sql
CREATE TABLE font_combo (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    fonts TEXT NOT NULL,
    use_case TEXT,
    is_default INTEGER DEFAULT 0,
    sort_order INTEGER DEFAULT 0,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
);
```

### 4.2 batch_history 表

```sql
CREATE TABLE batch_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    file_names TEXT NOT NULL,
    font_count INTEGER NOT NULL,
    output_format TEXT NOT NULL,
    record_count INTEGER NOT NULL,
    created_at INTEGER NOT NULL
);
```

## 五、API 设计

| 接口 | 方法 | 说明 |
|------|------|------|
| POST /api/combo/save | 保存组合 | 需要登录 |
| GET /api/combo/list | 获取列表 | 需要登录 |
| DELETE /api/combo/delete | 删除组合 | 需要登录 |
| POST /api/batch/save-history | 保存批次 | Pro |

## 六、开发计划

### Phase 1: Single模式完善 ✅
- 单次转换30种字体
- 一键复制

### Phase 2: Batch批量处理 ✅ (本次开发)
- 文件导入（TXT、CSV）
- 批量转换引擎
- 多种输出格式
- 本地保存历史

### Phase 3: Combo字体组合 ✅
- 创建/管理组合
- 快速应用

### Phase 4: Pro功能 ⬜
- 云端同步
- 导出图片/PDF
- 支付集成

## 七、文件清单

```
font-generator-free/
├── index.html              # 主页面 (重写)
├── combo.html              # 字体组合页
├── pricing.html            # 价格页
├── script.js               # 字体引擎
├── membership.js           # 会员模块
├── auth.js                 # 登录模块
├── worker/
│   ├── index.js            # Worker入口
│   └── pro_api.js          # Pro API
└── migrations/
    └── 001_pro_features.sql
```

## 八、测试用例

### Batch 模式测试
1. 导入单个/多个TXT文件
2. 粘贴多行文本
3. 选择单个/多个字体
4. 选择输出格式
5. 下载验证内容

### Combo 模式测试
1. 选择多种字体
2. 保存为Combo
3. 在Batch模式使用Combo

---

_文档版本：v2.0_  
_最后更新：2026-03-30_