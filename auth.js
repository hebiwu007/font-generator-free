/**
 * auth.js - Google OAuth 认证模块
 * 使用 Google Identity Services (GIS) renderButton 模式
 * 适用于纯前端/静态网站（无后端服务器）
 */

const GOOGLE_CLIENT_ID = '1070692973169-kh4nort1uo59s8oq2159dqn6pc0cfp6e.apps.googleusercontent.com';

// ─── JWT 工具 ────────────────────────────────────────────────────────────────

function parseJwt(token) {
    try {
        const parts = token.split('.');
        if (parts.length !== 3) return null;
        const raw = parts[1].replace(/-/g, '+').replace(/_/g, '/');
        return JSON.parse(atob(raw));
    } catch (e) {
        return null;
    }
}

function validateJwtBasic(payload) {
    if (!payload) return false;
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) return false;
    if (payload.aud !== GOOGLE_CLIENT_ID) return false;
    if (payload.iss !== 'https://accounts.google.com' && payload.iss !== 'accounts.google.com') return false;
    return true;
}

// ─── 会话管理 ────────────────────────────────────────────────────────────────

const SESSION_KEY = 'fg_user_session';

function saveSession(user, idToken) {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify({ user, idToken, loginAt: Date.now() }));
}

function loadSession() {
    try {
        const raw = sessionStorage.getItem(SESSION_KEY);
        if (!raw) return null;
        const session = JSON.parse(raw);
        if (!validateJwtBasic(parseJwt(session.idToken))) {
            clearSession();
            return null;
        }
        return session;
    } catch {
        return null;
    }
}

function clearSession() {
    sessionStorage.removeItem(SESSION_KEY);
}

// ─── UI 控制 ─────────────────────────────────────────────────────────────────

function showLoginButton() {
    document.getElementById('auth-login-btn').style.display = 'flex';
    document.getElementById('auth-user-info').style.display = 'none';
}

function showUserInfo(user) {
    document.getElementById('auth-login-btn').style.display = 'none';
    const info = document.getElementById('auth-user-info');
    info.style.display = 'flex';
    const nameEl = document.getElementById('auth-user-name');
    const avatarEl = document.getElementById('auth-user-avatar');
    if (nameEl) nameEl.textContent = user.name || user.email || '';
    if (avatarEl && user.picture) {
        avatarEl.src = user.picture;
        avatarEl.alt = user.name || 'User';
    }
}

// ─── 登录/退出 ───────────────────────────────────────────────────────────────

function handleCredentialResponse(response) {
    const payload = parseJwt(response.credential);
    if (!validateJwtBasic(payload)) {
        showToast('Login failed. Please try again.', 'error');
        return;
    }
    const user = {
        sub: payload.sub,
        email: payload.email,
        name: payload.name,
        picture: payload.picture,
    };
    saveSession(user, response.credential);
    showUserInfo(user);
    showToast(`Welcome, ${user.name || user.email}! 🎉`, 'success');
}

function signOut() {
    clearSession();
    if (window.google && google.accounts && google.accounts.id) {
        google.accounts.id.disableAutoSelect();
    }
    showLoginButton();
    showToast('Signed out successfully.', 'info');
}

// ─── Toast ───────────────────────────────────────────────────────────────────

function showToast(message, type) {
    const toast = document.getElementById('toast');
    const toastText = document.getElementById('toastText');
    if (!toast || !toastText) return;
    toast.classList.remove('toast-error', 'toast-info');
    if (type === 'error') toast.classList.add('toast-error');
    if (type === 'info') toast.classList.add('toast-info');
    toastText.textContent = message;
    toast.classList.add('toast-visible');
    clearTimeout(window._authToastTimer);
    window._authToastTimer = setTimeout(() => {
        toast.classList.remove('toast-visible', 'toast-error', 'toast-info');
    }, 3000);
}

// ─── 初始化：等待 GIS 加载，然后渲染按钮 ────────────────────────────────────

function initGoogleAuth() {
    google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleCredentialResponse,
        auto_select: false,
        cancel_on_tap_outside: true,
    });

    // 渲染标准 Google 登录按钮到容器
    google.accounts.id.renderButton(
        document.getElementById('auth-login-btn'),
        {
            type: 'standard',
            theme: 'outline',
            size: 'medium',
            shape: 'pill',
            text: 'signin_with',
            logo_alignment: 'left',
        }
    );
}

function init() {
    // 先检查已有会话，有则直接显示用户信息
    const session = loadSession();
    if (session) {
        showUserInfo(session.user);
        return;
    }

    // 等 GIS 库加载完（async defer，可能比 DOMContentLoaded 晚）
    if (window.google && google.accounts && google.accounts.id) {
        initGoogleAuth();
    } else {
        // 监听 GIS 加载完成事件（GIS 加载后会触发一次 load）
        const gisScript = document.querySelector('script[src*="accounts.google.com/gsi/client"]');
        if (gisScript) {
            gisScript.addEventListener('load', initGoogleAuth);
        } else {
            // 降级：轮询等待
            const timer = setInterval(() => {
                if (window.google && google.accounts && google.accounts.id) {
                    clearInterval(timer);
                    initGoogleAuth();
                }
            }, 100);
        }
    }
}

// 页面加载完成后执行
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// 暴露给 HTML inline 调用
window.signOut = signOut;
window.handleCredentialResponse = handleCredentialResponse;
