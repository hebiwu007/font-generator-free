/**
 * membership.js - 会员系统前端模块
 * 处理会员状态、Pro功能、批量转换、历史记录、字体组合、广告
 */

const API_BASE = 'https://font-generator-api.hebiwu007.workers.dev';

// 全局会员状态
let membershipStatus = {
  isPro: false,
  user: null,
  expiresAt: null,
  idToken: null
};

// ==================== 用户认证 ====================

// 同步用户到后端
async function syncUserToBackend(user, idToken) {
  if (!user || !idToken) return false;
  
  membershipStatus.idToken = idToken;
  
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
    return true;
  } catch (error) {
    console.error('[Membership] Sync failed:', error);
    return false;
  }
}

// 更新会员 UI
function updateMembershipUI() {
  // Pro badge
  const badge = document.getElementById('pro-badge');
  if (badge) {
    if (membershipStatus.isPro) {
      badge.style.display = 'inline-block';
      badge.textContent = '⭐ Pro';
      badge.className = 'text-xs bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-2 py-1 rounded-full font-semibold';
    } else {
      badge.style.display = 'none';
    }
  }
  
  // Pro 工具（History/Combos 链接）
  const proTools = document.getElementById('pro-tools');
  if (proTools) {
    if (membershipStatus.isPro) {
      proTools.classList.remove('hidden');
      proTools.classList.add('flex');
    } else {
      proTools.classList.add('hidden');
      proTools.classList.remove('flex');
    }
  }
  
  // 广告显示（Free版显示）
  updateAdBanner();
}

// ==================== 升级引导 ====================

// 显示升级弹窗
function showUpgradeModal() {
  const modal = document.getElementById('upgrade-modal');
  if (modal) modal.style.display = 'flex';
}

function closeUpgradeModal() {
  const modal = document.getElementById('upgrade-modal');
  if (modal) modal.style.display = 'none';
}

// 检查 Pro 并返回布尔值（或弹出提示）
function requirePro(showModal = true) {
  if (membershipStatus.isPro) return true;
  if (showModal) showUpgradeModal();
  return false;
}

// ==================== 历史记录 ====================

// 保存单条历史记录
async function saveToHistory(inputText, fontStyle, outputText) {
  if (!membershipStatus.isPro || !membershipStatus.idToken) return false;
  
  try {
    await fetch(`${API_BASE}/api/history/save`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${membershipStatus.idToken}`
      },
      body: JSON.stringify({ inputText, fontStyle, outputText })
    });
    return true;
  } catch (error) {
    console.error('[Membership] Save history failed:', error);
    return false;
  }
}

// 批量保存历史记录
async function saveBatchHistory(records, batchName) {
  if (!membershipStatus.isPro || !membershipStatus.idToken) {
    showUpgradeModal();
    return false;
  }
  
  try {
    const response = await fetch(`${API_BASE}/api/history/batch-save`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${membershipStatus.idToken}`
      },
      body: JSON.stringify({ records, batchName })
    });
    const data = await response.json();
    return data.batchId || false;
  } catch (error) {
    console.error('[Membership] Batch save failed:', error);
    return false;
  }
}

// 获取历史记录列表
async function getHistoryList(limit = 50, offset = 0, batchOnly = false) {
  if (!membershipStatus.isPro || !membershipStatus.idToken) return [];
  
  try {
    const url = `${API_BASE}/api/history/list?limit=${limit}&offset=${offset}${batchOnly ? '&batchOnly=true' : ''}`;
    const response = await fetch(url, {
      headers: { 'Authorization': `Bearer ${membershipStatus.idToken}` }
    });
    const data = await response.json();
    return data.history || [];
  } catch (error) {
    console.error('[Membership] Get history failed:', error);
    return [];
  }
}

// 获取批量历史详情
async function getBatchHistory(batchId) {
  if (!membershipStatus.isPro || !membershipStatus.idToken) return [];
  
  try {
    const response = await fetch(`${API_BASE}/api/history/batch-get?batchId=${batchId}`, {
      headers: { 'Authorization': `Bearer ${membershipStatus.idToken}` }
    });
    const data = await response.json();
    return data.records || [];
  } catch (error) {
    console.error('[Membership] Get batch failed:', error);
    return [];
  }
}

// 删除历史记录
async function deleteHistory(historyId, batchId) {
  if (!membershipStatus.isPro || !membershipStatus.idToken) return false;
  
  try {
    await fetch(`${API_BASE}/api/history/delete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${membershipStatus.idToken}`
      },
      body: JSON.stringify({ historyId, batchId })
    });
    return true;
  } catch (error) {
    console.error('[Membership] Delete failed:', error);
    return false;
  }
}

// ==================== 字体组合 ====================

// 保存字体组合
async function saveFontCombo(name, fonts, isPublic = false) {
  if (!membershipStatus.isPro || !membershipStatus.idToken) {
    showUpgradeModal();
    return false;
  }
  
  try {
    const response = await fetch(`${API_BASE}/api/combo/save`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${membershipStatus.idToken}`
      },
      body: JSON.stringify({ name, fonts, isPublic })
    });
    const data = await response.json();
    return data.comboId || false;
  } catch (error) {
    console.error('[Membership] Save combo failed:', error);
    return false;
  }
}

// 获取字体组合列表
async function getFontComboList() {
  if (!membershipStatus.isPro || !membershipStatus.idToken) return [];
  
  try {
    const response = await fetch(`${API_BASE}/api/combo/list`, {
      headers: { 'Authorization': `Bearer ${membershipStatus.idToken}` }
    });
    const data = await response.json();
    return data.combos || [];
  } catch (error) {
    console.error('[Membership] Get combos failed:', error);
    return [];
  }
}

// 删除字体组合
async function deleteFontCombo(comboId) {
  if (!membershipStatus.isPro || !membershipStatus.idToken) return false;
  
  try {
    await fetch(`${API_BASE}/api/combo/delete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${membershipStatus.idToken}`
      },
      body: JSON.stringify({ comboId })
    });
    return true;
  } catch (error) {
    console.error('[Membership] Delete combo failed:', error);
    return false;
  }
}

// ==================== 广告 ====================

// 获取并显示广告
async function updateAdBanner() {
  if (membershipStatus.isPro) {
    // Pro版无广告
    const adBanner = document.getElementById('ad-banner');
    if (adBanner) adBanner.style.display = 'none';
    return;
  }
  
  try {
    const response = await fetch(`${API_BASE}/api/ads/get`);
    const data = await response.json();
    
    const adBanner = document.getElementById('ad-banner');
    if (adBanner && data.ad) {
      const adContent = JSON.parse(data.ad.content);
      adBanner.innerHTML = `
        <div class="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100 rounded-lg p-3 text-center">
          <a href="${adContent.link || 'pricing.html'}" class="text-blue-600 hover:text-blue-700 font-medium">
            ${adContent.text}
          </a>
        </div>
      `;
      adBanner.style.display = 'block';
    }
  } catch (error) {
    console.error('[Membership] Get ad failed:', error);
  }
}

// ==================== 导出功能 ====================

// 导出为图片
async function exportAsImage(texts, fonts) {
  // 创建 canvas
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  // 计算尺寸
  const fontSize = 24;
  const lineHeight = fontSize + 16;
  const padding = 40;
  const width = 600;
  const height = padding * 2 + texts.length * fonts.length * lineHeight;
  
  canvas.width = width;
  canvas.height = height;
  
  // 背景
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);
  
  // 字体映射（简化）
  let y = padding;
  
  ctx.font = `${fontSize}px sans-serif`;
  ctx.fillStyle = '#1a1a1a';
  ctx.textBaseline = 'top';
  
  for (const text of texts) {
    for (const font of fonts) {
      const outputText = convertText(text, font);
      ctx.fillText(`${font}: ${outputText}`, padding, y);
      y += lineHeight;
    }
  }
  
  // 非 Pro 添加水印
  if (!membershipStatus.isPro) {
    ctx.fillStyle = '#999999';
    ctx.font = '14px sans-serif';
    ctx.fillText('Generated by Font Generator Free', padding, height - 30);
  }
  
  // 下载
  const link = document.createElement('a');
  link.download = `font-generator-${Date.now()}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
}

// 简易文本转换 - 委托给 script.js 的字体引擎
function convertText(text, fontStyle) {
  // 使用 script.js 中定义的 convertText 函数进行转换
  if (typeof window.convertText === 'function') {
    return window.convertText(text, fontStyle);
  }
  // 如果 script.js 未加载，返回原文本
  return text;
}

// 导出为 PDF（简化版，用图片方式）
async function exportAsPDF(texts, fonts) {
  await exportAsImage(texts, fonts);
  // TODO: 完整 PDF 实现
}

// ==================== 批量转换模式 ====================

// 批量转换入口
function enterBatchMode() {
  if (!requirePro()) return;
  
  const input = document.getElementById('textInput');
  if (input) {
    input.placeholder = 'Enter each text on a new line...\nLine 1\nLine 2\nLine 3';
    input.dataset.batchMode = 'true';
  }
  
  // 显示批量工具栏
  const batchToolbar = document.getElementById('batch-toolbar');
  if (batchToolbar) batchToolbar.style.display = 'flex';
}

// 退出批量模式
function exitBatchMode() {
  const input = document.getElementById('textInput');
  if (input) {
    input.placeholder = 'Type your text here to see the magic...';
    delete input.dataset.batchMode;
  }
  
  const batchToolbar = document.getElementById('batch-toolbar');
  if (batchToolbar) batchToolbar.style.display = 'none';
}

// ==================== 公开 API ====================

window.membershipStatus = membershipStatus;
window.syncUserToBackend = syncUserToBackend;
window.showUpgradeModal = showUpgradeModal;
window.closeUpgradeModal = closeUpgradeModal;
window.requirePro = requirePro;
window.saveToHistory = saveToHistory;
window.saveBatchHistory = saveBatchHistory;
window.getHistoryList = getHistoryList;
window.getBatchHistory = getBatchHistory;
window.deleteHistory = deleteHistory;
window.saveFontCombo = saveFontCombo;
window.getFontComboList = getFontComboList;
window.deleteFontCombo = deleteFontCombo;
window.exportAsImage = exportAsImage;
window.exportAsPDF = exportAsPDF;
window.enterBatchMode = enterBatchMode;
window.exitBatchMode = exitBatchMode;
window.API_BASE = API_BASE;