/**
 * auth.js - Google OAuth 认证模块
 * 使用 Google Identity Services (GIS) renderButton 模式
 * 适用于纯前端/静态网站（Cloudflare Pages，无后端）
 *
 * 时序说明：
 *   GIS 脚本用 async defer 加载，官方提供 window.onGoogleLibraryLoad 钩子，
 *   GIS 加载完毕后会自动调用此回调，这是最可靠的初始化方式。
 */

const GOOGLE_CLIENT_ID = '1070692973169-kh4nort1uo59s8oq2159dqn6pc0cfp6e.apps.googleusercontent.com';

// ─── JWT 工具 ────────────────────────────────────────────────────────────────

function parseJwt(token) {
    try {
        const raw = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
        return JSON.parse(atob(raw));
    } catch {
        return null;
    }
}

function validateJwtBasic(payload) {
    if (!payload) return false;
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) return false;
    if (payload.aud !== GOOGLE_CLIENT_ID) return false;
    const validIssuers = ['https://accounts.google.com', 'accounts.google.com'];
    if (!validIssuers.includes(payload.iss)) return false;
    return true;
}

// ─── 会话管理（sessionStorage：关闭标签页自动清除）────────────────────────

const SESSION_KEY = 'fg_user_session';

function saveSession(user, idToken) {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify({ user, idToken }));
}

function loadSession() {
    try {
        const raw = sessionStorage.getItem(SESSION_KEY);
        if (!raw) return null;
        const session = JSON.parse(raw);
        if (!validateJwtBasic(parseJwt(session.idToken))) {
            sessionStorage.removeItem(SESSION_KEY);
            return null;
        }
        return session;
    } catch {
        return null;
    }
}

// ─── UI 切换 ─────────────────────────────────────────────────────────────────

function showLoginButton() {
    document.getElementById('auth-login-btn').style.display = '';
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
    clearTimeout(window._toastTimer);
    window._toastTimer = setTimeout(() => {
        toast.classList.remove('toast-visible', 'toast-error', 'toast-info');
    }, 3000);
}

// ─── 登录回调 ─────────────────────────────────────────────────────────────────

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
    showToast('Welcome, ' + (user.name || user.email) + '! 🎉', 'success');
}

// ─── 退出登录 ─────────────────────────────────────────────────────────────────

function signOut() {
    sessionStorage.removeItem(SESSION_KEY);
    if (window.google && google.accounts && google.accounts.id) {
        google.accounts.id.disableAutoSelect();
    }
    showLoginButton();
    showToast('Signed out successfully.', 'info');
}

// ─── GIS 初始化（由 window.onGoogleLibraryLoad 触发）────────────────────────

function initGoogleSignIn() {
    // 检查已有会话，无需重新渲染按钮
    const session = loadSession();
    if (session) {
        showUserInfo(session.user);
        return;
    }

    // 初始化 GIS
    google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleCredentialResponse,
        auto_select: false,
        cancel_on_tap_outside: true,
    });

    // 渲染标准 Google 登录按钮
    const container = document.getElementById('auth-login-btn');
    google.accounts.id.renderButton(container, {
        type: 'standard',
        theme: 'outline',
        size: 'large',
        shape: 'pill',
        text: 'signin_with',
        logo_alignment: 'left',
    });

    showLoginButton();
}

// 暴露给全局调用
window.initGoogleSignIn = initGoogleSignIn;
window.signOut = signOut;
window.handleCredentialResponse = handleCredentialResponse;
