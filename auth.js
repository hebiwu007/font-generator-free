/**
 * auth.js - Google OAuth 认证模块
 * 使用 Google Identity Services (GIS) renderButton 模式
 *
 * 正确执行顺序：
 *   1. auth.js 在 <head> 同步加载 → 只定义函数，不操作 DOM
 *   2. DOMContentLoaded 触发 → DOM 就绪，启动 GIS 等待轮询
 *   3. GIS async 加载完 → 轮询检测到 → renderButton() 注入按钮
 */

var GOOGLE_CLIENT_ID = '1070692973169-kh4nort1uo59s8oq2159dqn6pc0cfp6e.apps.googleusercontent.com';

// ─── JWT 工具 ────────────────────────────────────────────────────────────────

function fg_parseJwt(token) {
    try {
        var raw = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
        return JSON.parse(atob(raw));
    } catch (e) {
        return null;
    }
}

function fg_validateJwt(payload) {
    if (!payload) return false;
    var now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) return false;
    if (payload.aud !== GOOGLE_CLIENT_ID) return false;
    if (['https://accounts.google.com', 'accounts.google.com'].indexOf(payload.iss) === -1) return false;
    return true;
}

// ─── 会话管理 ────────────────────────────────────────────────────────────────

var FG_SESSION_KEY = 'fg_user_session';

function fg_saveSession(user, idToken) {
    try { sessionStorage.setItem(FG_SESSION_KEY, JSON.stringify({ user: user, idToken: idToken })); } catch (e) {}
}

function fg_loadSession() {
    try {
        var raw = sessionStorage.getItem(FG_SESSION_KEY);
        if (!raw) return null;
        var s = JSON.parse(raw);
        if (!fg_validateJwt(fg_parseJwt(s.idToken))) { sessionStorage.removeItem(FG_SESSION_KEY); return null; }
        return s;
    } catch (e) { return null; }
}

// ─── UI（只在 DOM 就绪后调用）───────────────────────────────────────────────

function fg_showLogin() {
    var btn = document.getElementById('auth-login-btn');
    var info = document.getElementById('auth-user-info');
    if (btn) btn.style.display = '';
    if (info) info.style.display = 'none';
}

function fg_showUser(user) {
    var btn = document.getElementById('auth-login-btn');
    var info = document.getElementById('auth-user-info');
    var nameEl = document.getElementById('auth-user-name');
    var avatarEl = document.getElementById('auth-user-avatar');
    var initialEl = document.getElementById('auth-user-initial');
    if (btn) btn.style.display = 'none';
    if (info) info.style.display = 'flex';
    if (nameEl) nameEl.textContent = user.name || user.email || '';
    
    // 显示首字母作为默认
    if (initialEl) {
        var name = user.name || user.email || '?';
        initialEl.textContent = name.charAt(0).toUpperCase();
        initialEl.style.display = '';
    }
    
    // 如果有头像，等加载完成后替换首字母
    if (avatarEl && user.picture) {
        avatarEl.onload = function() {
            avatarEl.style.display = 'block';
            if (initialEl) initialEl.style.display = 'none';
        };
        avatarEl.onerror = function() {
            avatarEl.style.display = 'none';
            if (initialEl) initialEl.style.display = '';
        };
        avatarEl.src = user.picture;
        avatarEl.alt = user.name || 'User';
    }
}

// ─── Toast ───────────────────────────────────────────────────────────────────

function fg_toast(msg, type) {
    var el = document.getElementById('toast');
    var txt = document.getElementById('toast-text') || document.getElementById('toastText');
    if (!el || !txt) return;
    el.classList.remove('toast-error', 'toast-info');
    if (type === 'error') el.classList.add('toast-error');
    if (type === 'info') el.classList.add('toast-info');
    txt.textContent = msg;
    el.classList.add('toast-visible');
    clearTimeout(window._fg_toastTimer);
    window._fg_toastTimer = setTimeout(function () {
        el.classList.remove('toast-visible', 'toast-error', 'toast-info');
    }, 3000);
}

// ─── 登录回调（挂到 window，供 GIS 调用）────────────────────────────────────

window.handleCredentialResponse = function (response) {
    console.log('[Auth] handleCredentialResponse triggered');
    var payload = fg_parseJwt(response.credential);
    if (!fg_validateJwt(payload)) { fg_toast('Login failed. Please try again.', 'error'); return; }
    var user = { sub: payload.sub, email: payload.email, name: payload.name, picture: payload.picture };
    console.log('[Auth] User logged in:', user.email, 'sub:', user.sub);
    fg_saveSession(user, response.credential);
    fg_showUser(user);
    fg_toast('Welcome, ' + (user.name || user.email) + '! 🎉');
    // 记录登录历史

    recordAction('login');
    // 从后端检查 Pro 状态
    checkProFromBackend(user.sub);
    // 同步用户到后端
    if (typeof syncUserToBackend === 'function') {
        syncUserToBackend(user, response.credential);
    }
};

// 从后端 D1 数据库检查 Pro 状态
function checkProFromBackend(googleSub) {
    // 同时传 email 用于备查
    var session = null;
    try { session = JSON.parse(sessionStorage.getItem('fg_user_session')); } catch(e) {}
    var email = (session && session.user && session.user.email) || '';
    
    console.log('[Auth] Checking Pro status from backend for:', googleSub, 'email:', email);
    var url = 'https://font-generator-api.hebiwu007.workers.dev/api/pro/check?google_sub=' + encodeURIComponent(googleSub) + '&email=' + encodeURIComponent(email);
    fetch(url)
        .then(function(r) { return r.json(); })
        .then(function(d) {
            console.log('[Auth] Pro check result:', JSON.stringify(d));
            if (d.success && d.isPro) {
                // 后端确认是 Pro，更新本地状态
                var proData = {
                    status: 'pro',
                    plan: d.plan,
                    purchasedAt: d.purchasedAt,
                    source: 'backend'
                };
                localStorage.setItem('fg_pro_status', JSON.stringify(proData));
                if (window.membershipStatus) window.membershipStatus.isPro = true;
                if (typeof updateProUI === 'function') updateProUI();
                console.log('[Auth] Pro status verified from backend:', d);
                // 加载云端历史记录
                if (typeof loadHistoryFromBackend === 'function') loadHistoryFromBackend();
            } else {
                console.log('[Auth] User is not Pro (backend check)');
            }
        })
        .catch(function(e) {
            console.error('[Auth] Failed to check Pro status:', e);
        });
}

// ─── 退出登录 ─────────────────────────────────────────────────────────────────

window.signOut = function () {
    // 清除所有 session 数据
    sessionStorage.removeItem(FG_SESSION_KEY);
    // 清除所有 localStorage 中与 fg_ 前缀相关的数据（保留 combos 已迁移到云端，但仍清理本地缓存）
    try {
        var keysToRemove = [];
        for (var i = 0; i < localStorage.length; i++) {
            var key = localStorage.key(i);
            if (key && key.indexOf('fg_') === 0) {
                keysToRemove.push(key);
            }
        }
        keysToRemove.forEach(function(k) { localStorage.removeItem(k); });
    } catch (e) {}
    // 重置全局 membershipStatus
    if (window.membershipStatus) {
        window.membershipStatus.isPro = false;
        window.membershipStatus.user = null;
        window.membershipStatus.idToken = null;
    }
    try { if (window.google) google.accounts.id.disableAutoSelect(); } catch (e) {}
    fg_showLogin();
    // 重新渲染 Google Sign-In 按钮
    fg_renderButton();
    // 更新 UI 状态
    if (typeof updateProUI === 'function') updateProUI();
    fg_toast('Signed out.', 'info');
};

// ─── GIS 渲染按钮 ─────────────────────────────────────────────────────────────

function fg_renderButton() {
    var container = document.getElementById('auth-login-btn');
    if (!container) { console.error('[Auth] #auth-login-btn not found'); return; }

    google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: window.handleCredentialResponse,
        auto_select: false,
        cancel_on_tap_outside: true
    });

    google.accounts.id.renderButton(container, {
        type: 'standard',
        theme: 'outline',
        size: 'large',
        shape: 'pill',
        text: 'signin_with',
        logo_alignment: 'left'
    });

    console.log('[Auth] Google Sign-In button rendered ✅');
}

// ─── 主入口：DOM 就绪后才启动 ─────────────────────────────────────────────────

function fg_init() {
    console.log('[Auth] DOM ready, starting auth init...');

    // 如果已有会话，直接显示用户
    var session = fg_loadSession();
    if (session) {
        console.log('[Auth] Existing session found:', session.user.email, 'sub:', session.user.sub);
        fg_showUser(session.user);
        // 检查后端 Pro 状态
        if (session.user && session.user.sub) {
            checkProFromBackend(session.user.sub);
        }
        return;
    }

    // GIS 已加载（缓存命中时可能已就绪）
    if (window.google && window.google.accounts && window.google.accounts.id) {
        console.log('[Auth] GIS already loaded, rendering button immediately');
        fg_renderButton();
        return;
    }

    // 等待 GIS 加载（轮询，最多 10s）
    console.log('[Auth] Waiting for GIS library...');
    var attempts = 0;
    var timer = setInterval(function () {
        attempts++;
        if (window.google && window.google.accounts && window.google.accounts.id) {
            clearInterval(timer);
            console.log('[Auth] GIS loaded after ' + (attempts * 100) + 'ms, rendering button');
            fg_renderButton();
        } else if (attempts >= 100) {
            clearInterval(timer);
            console.error('[Auth] GIS failed to load after 10s. Check network / ad blocker.');
        }
    }, 100);
}

// ─── 操作历史记录（仅行为元数据，不含用户内容）──────────────────────────────

function recordAction(action, extra) {
    var session = null;
    try { session = JSON.parse(sessionStorage.getItem('fg_user_session')); } catch(e) {}
    if (!session || !session.user) return;

    var data = {
        google_sub: session.user.sub,
        action: action
    };
    if (extra) {
        if (extra.font_style) data.font_style = extra.font_style;
        if (extra.download_type) data.download_type = extra.download_type;
        if (extra.batch_count) data.batch_count = extra.batch_count;
    }

    fetch('https://font-generator-api.hebiwu007.workers.dev/api/history/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    }).then(function(r) { return r.json(); }).then(function(d) {
        console.log('[History] Recorded:', action, d.success ? '✅' : '❌');
    }).catch(function(e) {
        console.error('[History] Record failed:', e);
    });
}

// 暴露为全局函数供 script.js 调用
window.recordAction = recordAction;

// 确保在 DOM 就绪后执行（auth.js 在 <head> 同步加载，DOM 尚未解析）
document.addEventListener('DOMContentLoaded', fg_init);
