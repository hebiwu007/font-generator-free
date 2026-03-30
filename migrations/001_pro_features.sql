-- Font Generator Free - Pro功能数据库迁移脚本
-- 运行方式: wrangler d1 execute font-generator-db --local --file=migrations/001_pro_features.sql
-- 或: wrangler d1 execute font-generator-db --remote --command="..."

-- 扩展 history 表添加批量和组合字段
ALTER TABLE history ADD COLUMN batch_id INTEGER DEFAULT NULL;
ALTER TABLE history ADD COLUMN is_combo INTEGER DEFAULT 0;

-- 创建字体组合表
CREATE TABLE IF NOT EXISTS font_combo (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    fonts TEXT NOT NULL,
    is_public INTEGER DEFAULT 0,
    created_at INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_font_combo_user_id ON font_combo(user_id);

-- 创建广告配置表
CREATE TABLE IF NOT EXISTS ads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ad_type TEXT NOT NULL,
    content TEXT NOT NULL,
    active INTEGER DEFAULT 1,
    created_at INTEGER NOT NULL
);

-- 插入默认广告
INSERT INTO ads (ad_type, content, active, created_at) VALUES 
('banner', '{"text":"❤️ Love Font Generator? Upgrade to Pro for ad-free experience!", "link":"pricing.html"}', 1, strftime('%s', 'now'));