/**
 * auth.js - Google OAuth 认证模块
 * 使用 Google Identity Services (GIS) renderButton 模式
 * 适用于纯前端/静态网站（Cloudflare Pages，无后端）
 */

var GOOGLE_CLIENT_ID = '1070692973169-kh4nort1uo59s8oq2159dqn6pc0cfp6e.apps.googleusercontent.com';

// ─── JWT 工具 ────────────────────────────────────────────────────────────────

function parseJwt(token) {
    try {
        var raw = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
        return JSON.parse(atob(raw));
    } catch (e) {
        return null;
    }
}

function validateJwtBasic(payload) {
    if (!payload) return false;
    var now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) return false;
    if (payload.aud !== GOOGLE_CLIENT_ID) return false;
    var validIssuers = ['https://accounts.google.com', 'accounts.google.com'];
    if (validIssuers.indexOf(payload.iss) === -1) return false;
    return true;
}

// ─── 会话管理 ────────────────────────────────────────────────────────────────

var SESSION_KEY = 'fg_user_session';

function saveSession(user, idToken) {
    try {
        sessionStorage.setItem(SESSION_KEY, JSON.stringify({ user: user, idToken: idToken }));
    } catch (e) {}
}

function loadSession() {
    try {
        var raw = sessionStorage.getItem(SESSION_KEY);
        if (!raw) return null;
        var session = JSON.parse(raw);
        if (!validateJwtBasic(parseJwt(session.idToken))) {
            sessionStorage.removeItem(SESSION_KEY);
            return null;
        }
        return session;
    } catch (e) {
        return null;
    }
}

// ─── UI 控制 ─────────────────────────────────────────────────────────────────

function showLoginButton() {
    var btn = document.getElementById('auth-login-btn');
    var info = document.getElementById('auth-user-info');
    if (btn) btn.style.display = '';
    if (info) info.style.display = 'none';
}

function showUserInfo(user) {
    var btn = document.getElementById('auth-login-btn');
    var info = document.getElementById('auth-user-info');
    if (btn) btn.style.display = 'none';
    if (info) info.style.display = 'flex';
    var nameEl = document.getElementById('auth-user-name');
    var avatarEl = document.getElementById('auth-user-avatar');
    if (nameEl) nameEl.textContent = user.name || user.email || '';
    if (avatarEl && user.picture) {
        avatarEl.src = user.picture;
        avatarEl.alt = user.name || 'User';
    }
}

// ─── Toast ───────────────────────────────────────────────────────────────────

function showToast(message, type) {
    var toast = document.getElementById('toast');
    var toastText = document.getElementById('toastText');
    if (!toast || !toastText) return;
    toast.classList.remove('toast-error', 'toast-info');
    if (type === 'error') toast.classList.add('toast-error');
    if (type === 'info') toast.classList.add('toast-info');
    toastText.textContent = message;
    toast.classList.add('toast-visible');
    clearTimeout(window._toastTimer);
    window._toastTimer = setTimeout(function() {
        toast.classList.remove('toast-visible', 'toast-error', 'toast-info');
    }, 3000);
}

// ─── 登录回调 ─────────────────────────────────────────────────────────────────

function handleCredentialResponse(response) {
    var payload = parseJwt(response.credential);
    if (!validateJwtBasic(payload)) {
        showToast('Login failed. Please try again.', 'error');
        return;
    }
    var user = {
        sub: payload.sub,
        email: payload.email,
        name: payload.name,
        picture: payload.picture,
    };
    saveSession(user, response.credential);
    showUserInfo(user);
    showToast('Welcome, ' + (user.name || user.email) + '! 🎉', 'success');
}

// ─── 退出登录 ─────────────────────────────────────────────────────────────────

function signOut() {
    sessionStorage.removeItem(SESSION_KEY);
    try {
        if (window.google && google.accounts && google.accounts.id) {
            google.accounts.id.disableAutoSelect();
        }
    } catch (e) {}
    showLoginButton();
    showToast('Signed out successfully.', 'info');
}

// ─── 核心初始化：渲染 Google 登录按钮 ────────────────────────────────────────

function renderGoogleButton() {
    google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleCredentialResponse,
        auto_select: false,
        cancel_on_tap_outside: true,
    });

    var container = document.getElementById('auth-login-btn');
    if (!container) return;

    google.accounts.id.renderButton(container, {
        type: 'standard',
        theme: 'outline',
        size: 'large',
        shape: 'pill',
        text: 'signin_with',
        logo_alignment: 'left',
    });
}

// ─── 入口：等 DOM 和 GIS 都就绪后初始化 ──────────────────────────────────────

function startAuth() {
    // 已有会话，直接显示用户信息
    var session = loadSession();
    if (session) {
        showUserInfo(session.user);
        return;
    }

    // 等待 GIS 库就绪（轮询，最多等 10 秒）
    var attempts = 0;
    var maxAttempts = 100; // 100 * 100ms = 10s
    var timer = setInterval(function() {
        attempts++;
        if (window.google && window.google.accounts && window.google.accounts.id) {
            clearInterval(timer);
            renderGoogleButton();
        } else if (attempts >= maxAttempts) {
            clearInterval(timer);
            console.warn('[Auth] Google GIS library failed to load after 10s');
        }
    }, 100);
}

// DOM 就绪后执行
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startAuth);
} else {
    startAuth();
}

// 暴露给全局
window.signOut = signOut;
window.handleCredentialResponse = handleCredentialResponse;
