/**
 * auth.js - Google OAuth 认证模块
 * 使用 Google Identity Services (GIS) JWT 模式
 * 适用于纯前端/静态网站（无后端服务器）
 */

const GOOGLE_CLIENT_ID = '1070692973169-kh4nort1uo59s8oq2159dqn6pc0cfp6e.apps.googleusercontent.com';

// ─── 工具函数 ───────────────────────────────────────────────────────────────

/**
 * Base64URL 解码
 */
function base64UrlDecode(str) {
    const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + (4 - base64.length % 4) % 4, '=');
    const binary = atob(padded);
    return new Uint8Array([...binary].map(c => c.charCodeAt(0)));
}

/**
 * 解析 JWT payload（不验证签名，仅用于读取用户信息）
 * 注意：完整验证需在服务端完成；前端仅做基本校验
 */
function parseJwt(token) {
    try {
        const parts = token.split('.');
        if (parts.length !== 3) throw new Error('Invalid JWT');
        const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
        return payload;
    } catch (e) {
        console.error('JWT parse error:', e);
        return null;
    }
}

/**
 * 验证 JWT 基本字段（客户端侧基础校验）
 * 完整签名验证需后端配合；此处做时间和 audience 校验
 */
function validateJwtBasic(payload) {
    if (!payload) return false;
    const now = Math.floor(Date.now() / 1000);
    // 检查是否过期
    if (payload.exp && payload.exp < now) {
        console.warn('ID Token expired');
        return false;
    }
    // 检查 audience
    if (payload.aud !== GOOGLE_CLIENT_ID) {
        console.warn('ID Token audience mismatch');
        return false;
    }
    // 检查 issuer
    if (payload.iss !== 'https://accounts.google.com' && payload.iss !== 'accounts.google.com') {
        console.warn('ID Token issuer mismatch');
        return false;
    }
    return true;
}

// ─── 会话管理 ───────────────────────────────────────────────────────────────

const SESSION_KEY = 'fg_user_session';

function saveSession(user, idToken) {
    const session = {
        user,
        idToken,
        loginAt: Date.now()
    };
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

function loadSession() {
    try {
        const raw = sessionStorage.getItem(SESSION_KEY);
        if (!raw) return null;
        const session = JSON.parse(raw);
        // 验证 token 是否还有效（本地时间检查）
        const payload = parseJwt(session.idToken);
        if (!validateJwtBasic(payload)) {
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

// ─── UI 控制 ────────────────────────────────────────────────────────────────

function updateAuthUI(user) {
    const loginBtn = document.getElementById('auth-login-btn');
    const userInfo = document.getElementById('auth-user-info');
    const userName = document.getElementById('auth-user-name');
    const userAvatar = document.getElementById('auth-user-avatar');

    if (user) {
        loginBtn && (loginBtn.style.display = 'none');
        if (userInfo) {
            userInfo.style.display = 'flex';
            userName && (userName.textContent = user.name || user.email);
            if (userAvatar && user.picture) {
                userAvatar.src = user.picture;
                userAvatar.alt = user.name || 'User';
            }
        }
    } else {
        loginBtn && (loginBtn.style.display = 'flex');
        userInfo && (userInfo.style.display = 'none');
    }
}

// ─── 登录处理 ────────────────────────────────────────────────────────────────

function handleCredentialResponse(response) {
    const idToken = response.credential;
    const payload = parseJwt(idToken);

    if (!validateJwtBasic(payload)) {
        showAuthToast('Login failed. Please try again.', 'error');
        return;
    }

    const user = {
        sub: payload.sub,
        email: payload.email,
        name: payload.name,
        picture: payload.picture,
        emailVerified: payload.email_verified
    };

    saveSession(user, idToken);
    updateAuthUI(user);
    showAuthToast(`Welcome, ${user.name}! 🎉`, 'success');
}

function signOut() {
    clearSession();
    updateAuthUI(null);

    // 通知 Google 撤销登录状态
    if (window.google && google.accounts && google.accounts.id) {
        google.accounts.id.disableAutoSelect();
    }

    showAuthToast('Signed out successfully.', 'info');
}

function showAuthToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const toastText = document.getElementById('toastText');
    if (!toast || !toastText) return;

    // 重置状态类
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

// ─── 初始化 ────────────────────────────────────────────────────────────────

function initAuth() {
    // 检查已有会话
    const session = loadSession();
    if (session) {
        updateAuthUI(session.user);
        return;
    }

    // 等待 GIS 库加载完成后初始化
    function tryInitGoogle() {
        if (window.google && google.accounts && google.accounts.id) {
            google.accounts.id.initialize({
                client_id: GOOGLE_CLIENT_ID,
                callback: handleCredentialResponse,
                auto_select: false,
                cancel_on_tap_outside: true
            });
            updateAuthUI(null);
        } else {
            // GIS 尚未加载，100ms 后重试
            setTimeout(tryInitGoogle, 100);
        }
    }
    tryInitGoogle();
}

// 挂载到全局，供 HTML 调用
window.signOut = signOut;
window.initAuth = initAuth;
window.handleCredentialResponse = handleCredentialResponse;
