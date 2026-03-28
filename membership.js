/**
 * membership.js - 会员系统前端模块
 * 处理会员状态显示、升级引导、历史记录
 */

const API_BASE = 'https://font-generator-api.hebiwu007.workers.dev';

// 全局会员状态
let membershipStatus = {
  isPro: false,
  user: null,
  expiresAt: null
};

// 同步用户到后端
async function syncUserToBackend(user, idToken) {
  try {
    const response = await fetch(`${API_BASE}/api/user/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user, idToken })
    });
    const data = await response.json();
    membershipStatus.isPro = data.isPro;
    membershipStatus.user = data.user;
    updateMembershipUI();
  } catch (error) {
    console.error('[Membership] Sync failed:', error);
  }
}

// 更新会员 UI
function updateMembershipUI() {
  const badge = document.getElementById('pro-badge');
  if (!badge) return;
  
  if (membershipStatus.isPro) {
    badge.style.display = 'inline-block';
    badge.textContent = '⭐ Pro';
    badge.className = 'text-xs bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-2 py-1 rounded-full font-semibold';
  } else {
    badge.style.display = 'none';
  }
}

// 显示升级弹窗
function showUpgradeModal() {
  const modal = document.getElementById('upgrade-modal');
  if (modal) modal.style.display = 'flex';
}

function closeUpgradeModal() {
  const modal = document.getElementById('upgrade-modal');
  if (modal) modal.style.display = 'none';
}

// 保存历史记录（Pro 功能）
async function saveToHistory(inputText, fontStyle, outputText) {
  if (!membershipStatus.isPro) {
    showUpgradeModal();
    return false;
  }

  const session = fg_loadSession();
  if (!session) return false;

  try {
    await fetch(`${API_BASE}/api/history/save`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.idToken}`
      },
      body: JSON.stringify({ inputText, fontStyle, outputText })
    });
    return true;
  } catch (error) {
    console.error('[Membership] Save history failed:', error);
    return false;
  }
}

// 暴露到全局
window.syncUserToBackend = syncUserToBackend;
window.showUpgradeModal = showUpgradeModal;
window.closeUpgradeModal = closeUpgradeModal;
window.saveToHistory = saveToHistory;
