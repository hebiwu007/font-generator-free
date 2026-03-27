-- Font Generator Free - 会员系统数据库设计
-- 使用 Cloudflare D1 (SQLite)

-- 用户表
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    google_id TEXT UNIQUE NOT NULL,           -- Google OAuth sub
    email TEXT NOT NULL,
    name TEXT,
    picture TEXT,
    subscription_tier TEXT DEFAULT 'free',    -- free | pro | lifetime
    subscription_expires_at INTEGER,          -- Unix timestamp, NULL = 永久
    stripe_customer_id TEXT,                  -- Stripe Customer ID
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
);

CREATE INDEX idx_users_google_id ON users(google_id);
CREATE INDEX idx_users_email ON users(email);

-- 历史记录表（Pro 功能）
CREATE TABLE history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    input_text TEXT NOT NULL,
    font_style TEXT NOT NULL,                 -- Bold, Italic, etc.
    output_text TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_history_user_id ON history(user_id);
CREATE INDEX idx_history_created_at ON history(created_at);

-- 支付记录表
CREATE TABLE payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    stripe_payment_id TEXT UNIQUE NOT NULL,
    amount INTEGER NOT NULL,                  -- 单位：美分
    currency TEXT DEFAULT 'usd',
    plan_type TEXT NOT NULL,                  -- monthly | yearly | lifetime
    status TEXT NOT NULL,                     -- pending | completed | failed | refunded
    created_at INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_payments_stripe_id ON payments(stripe_payment_id);
