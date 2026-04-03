/**
 * script.js - Font Generator Free - Core Font Engine
 * 30种 Unicode 花哨字体转换
 * 使用正确的 Unicode 字符映射
 *
 * 重构版本 - 修复 Single/Batch 模式显示问题
 */

// ==================== 基础字符定义 ====================
const baseChars = Array.from('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789');

// ==================== Unicode 映射生成器 ====================
function makeMap(lowerStart, upperStart, digitStart) {
  var lower = '', upper = '', digit = '';
  for (var i = 0; i < 26; i++) lower += String.fromCodePoint(lowerStart + i);
  for (var i = 0; i < 26; i++) upper += String.fromCodePoint(upperStart + i);
  for (var i = 0; i < 10; i++) digit += String.fromCodePoint(digitStart + i);
  return Array.from(lower + upper + digit);
}

// ==================== 30 种字体字典 ====================
var fontDictionaries = [
  { name: 'Bold',          map: makeMap(0x1D41A, 0x1D400, 0x1D7EC) },
  { name: 'Italic',        map: makeMap(0x1D44E, 0x1D434, 0x1D7EC) },
  { name: 'Bold Italic',   map: makeMap(0x1D43C, 0x1D420, 0x1D7EC) },
  { name: 'Double Struck',  map: makeMap(0x1D538, 0x1D53B, 0x1D7D8) },
  { name: 'Cursive',       map: makeMap(0x1D4B6, 0x1D4C0, 0x1D7EC) },
  { name: 'Gothic',        map: makeMap(0x1D51E, 0x1D504, 0x1D7D8) },
  { name: 'Bold Gothic',   map: makeMap(0x1D584, 0x1D56C, 0x1D7D8) },
  { name: 'Monospace',     map: makeMap(0x1D670, 0x1D670, 0x1D7F6) },
  { name: 'Bold Cursive',  map: makeMap(0x1D43C, 0x1D420, 0x1D7EC) },
  { name: 'Bubble',        map: makeMap(0x24D0, 0x24B6, 0x245F) },
  { name: 'Black Bubble',  map: makeMap(0x1F180, 0x1F150, 0x1F1A6) },
  { name: 'Square',        map: makeMap(0x1F130, 0x1F130, 0) },
  { name: 'Black Square',  map: makeMap(0x1F171, 0x1F171, 0) },
  { name: 'Wide',          map: Array.from('ａｂｃｄｅｆｇｈｉｊｋｌｍｎｏｐｑｒｓｔｕｖｗｘｙｚＡＢＣＤＥＦＧＨＩＪＫＬＭＮＯＰＱＲＳＴＵＶＷＸＹＺ０１２３４５６７８９') },
  { name: 'Small Caps',    map: Array.from('ᴀʙᴄᴅᴇғɢʜɪᴊᴋʟᴍɴᴏᴘǫʀsᴛᴜᴠᴡxʏᴢABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789') },
  { name: 'Subscript',     map: Array.from('ₐbcdₑfgₕᵢⱼₖₗₘₙₒpqᵣₛₜᵤᵥwₓyzₐBCDₑFGₕᵢⱼₖₗₘₙₒPQᵣₛₜᵤᵥWₓYZ₀₁₂₃₄₅₆₇₈₉') },
  { name: 'Superscript',   map: Array.from('ᵃᵇᶜᵈᵉᶠᵍʰᶦʲᵏˡᵐⁿᵒᵖᵠʳˢᵗᵘᵛʷˣʸᶻᴬᴮᶜᴰᴱᶠᴳᴴᴵᴶᴷᴸᴹᴺᴼᴾQᴿˢᵀᵁⱽᵂˣʸᶻ⁰¹²³⁴⁵⁶⁷⁸⁹') },
  { name: 'Strikethrough', map: Array.from('a̶b̶c̶d̶e̶f̶g̶h̶i̶j̶k̶l̶m̶n̶o̶p̶q̶r̶s̶t̶u̶v̶w̶x̶y̶z̶A̶B̶C̶D̶E̶F̶G̶H̶I̶J̶K̶L̶M̶N̶O̶P̶Q̶R̶S̶T̶U̶V̶W̶X̶Y̶Z̶0̶1̶2̶3̶4̶5̶6̶7̶8̶9̶') },
  { name: 'Underline',     map: Array.from('a̲b̲c̲d̲e̲f̲g̲h̲i̲j̲k̲l̲m̲n̲o̲p̲q̲r̲s̲t̲u̲v̲w̲x̲y̲z̲A̲B̲C̲D̲E̲F̲G̲H̲I̲J̲K̲L̲M̲N̲O̲P̲Q̲R̲S̲T̲U̲V̲W̲X̲Y̲Z̲0̲1̲2̲3̲4̲5̲6̲7̲8̲9̲') },
  { name: 'Upside Down',   map: Array.from('ɐqɔpǝɟƃɥıɾʞlɯuodbɹsʇnʌʍxʎz∀qƆPƎℲפHIſʞ˥WNOԀQᴚS⊥∩ΛMX⅄Z0123456789') },
  { name: 'Zalgo',         map: Array.from('a̷b̷c̷d̷e̷f̷g̷h̷i̷j̷k̷l̷m̷n̷o̷p̷q̷r̷s̷t̷u̷v̷w̷x̷y̷z̷A̷B̷C̷D̷E̷F̷G̷H̷I̷J̷K̷L̷M̷N̷O̷P̷Q̷R̷S̷T̷U̷V̷W̷X̷Y̷Z̷0̷1̷2̷3̷4̷5̷6̷7̷8̷9̷') },
  { name: 'Heart',         map: Array.from('a♥b♥c♥d♥e♥f♥g♥h♥i♥j♥k♥l♥m♥n♥o♥p♥q♥r♥s♥t♥u♥v♥w♥x♥y♥z♥A♥B♥C♥D♥E♥F♥G♥H♥I♥J♥K♥L♥M♥N♥O♥P♥Q♥R♥S♥T♥U♥V♥W♥X♥Y♥Z♥0♥1♥2♥3♥4♥5♥6♥7♥8♥9♥') },
  { name: 'Star',          map: Array.from('a★b★c★d★e★f★g★h★i★j★k★l★m★n★o★p★q★r★s★t★u★v★w★x★y★z★A★B★C★D★E★F★G★H★I★J★K★L★M★N★O★P★Q★R★S★T★U★V★W★X★Y★Z★0★1★2★3★4★5★6★7★8★9★') },
  { name: 'Dot',           map: Array.from('ȧḃċḋėḟġḣi̇j̇k̇l̇ṁṅȯṗq̇ṙṡṫu̇v̇ẇẋẏżȦḂĊḊĖḞĠḢİJ̇K̇L̇ṀṄȮṖQ̇ṘṠṪU̇V̇ẆẊẎŻ0̇1̇2̇3̇4̇5̇6̇7̇8̇9̇') },
  { name: 'Bracket',       map: Array.from('【a】【b】【c】【d】【e】【f】【g】【h】【i】【j】【k】【l】【m】【n】【o】【p】【q】【r】【s】【t】【u】【v】【w】【x】【y】【z】【A】【B】【C】【D】【E】【F】【G】【H】【I】【J】【K】【L】【M】【N】【O】【P】【Q】【R】【S】【T】【U】【V】【W】【X】【Y】【Z】【0】【1】【2】【3】【4】【5】【6】【7】【8】【9】') },
  { name: 'Wave',          map: Array.from('a〰b〰c〰d〰e〰f〰g〰h〰i〰j〰k〰l〰m〰n〰o〰p〰q〰r〰s〰t〰u〰v〰w〰x〰y〰z〰A〰B〰C〰D〰E〰F〰G〰H〰I〰J〰K〰L〰M〰N〰O〰P〰Q〰R〰S〰T〰U〰V〰W〰X〰Y〰Z〰0〰1〰2〰3〰4〰5〰6〰7〰8〰9〰') },
  { name: 'Parenthesized', map: Array.from('⒜⒝⒞⒟⒠⒡⒢⒣⒤⒥⒦⒧⒨⒩⒪⒫⒬⒭⒮⒯⒰⒱⒲⒳⒴⒵⒜⒝⒞⒟⒠⒡⒢⒣⒤⒥⒦⒧⒨⒩⒪⒫⒬⒭⒮⒯⒰⒱⒲⒳⒴⒵⑴⑵⑶⑷⑸⑹') },
  { name: 'Crossed',       map: Array.from('a⃒b⃒c⃒d⃒e⃒f⃒g⃒h⃒i⃒j⃒k⃒l⃒m⃒n⃒o⃒p⃒q⃒r⃒s⃒t⃒u⃒v⃒w⃒x⃒y⃒z⃒A⃒B⃒C⃒D⃒E⃒F⃒G⃒H⃒I⃒J⃒K⃒L⃒M⃒N⃒O⃒P⃒Q⃒R⃒S⃒T⃒U⃒V⃒W⃒X⃒Y⃒Z⃒0⃒1⃒2⃒3⃒4⃒5⃒6⃒7⃒8⃒9⃒') },
  { name: 'Arrow',         map: Array.from('a⃕b⃕c⃕d⃕e⃕f⃕g⃕h⃕i⃕j⃕k⃕l⃕m⃕n⃕o⃕p⃕q⃕r⃕s⃕t⃕u⃕v⃕w⃕x⃕y⃕z⃕A⃕B⃕C⃕D⃕E⃕F⃕G⃕H⃕I⃕J⃕K⃕L⃕M⃕N⃕O⃕P⃕Q⃕R⃕S⃕T⃕U⃕V⃕W⃕X⃕Y⃕Z⃕0⃕1⃕2⃕3⃕4⃕5⃕6⃕7⃕8⃕9⃕') },
  { name: 'Tiny',          map: Array.from('ᵃᵇᶜᵈᵉᶠᵍʰᶦʲᵏˡᵐⁿᵒᵖᵠʳˢᵗᵘᵛʷˣʸᶻᴬᴮᶜᴰᴱᶠᴳᴴᴵᴶᴷᴸᴹᴺᴼᴾQᴿˢᵀᵁⱽᵂˣʸᶻ⁰¹²³⁴⁵⁶⁷⁸⁹') }
];

// 字体名称数组（供 UI 使用）
var fontNames = fontDictionaries.map(function(f) { return f.name; });

// ==================== 反向映射表构建 ====================
var reverseCharMap = new Map();

fontDictionaries.forEach(function(font) {
  font.charMap = new Map();
  var mapArr = font.map;

  // 组合字符字体：map 长度是 baseChars 的两倍
  var isCombiningFont = mapArr.length === baseChars.length * 2;

  baseChars.forEach(function(char, index) {
    if (isCombiningFont) {
      font.charMap.set(char, mapArr[index * 2] + mapArr[index * 2 + 1]);
    } else {
      font.charMap.set(char, mapArr[index]);
    }
    // 构建反向映射（仅当特殊字符不是基础字符时才添加）
    var specialChar = font.charMap.get(char);
    if (specialChar && char !== specialChar && !baseChars.includes(specialChar)) {
      // 不覆盖已有的映射（避免后面的字体覆盖前面的正确映射）
      if (!reverseCharMap.has(specialChar)) {
        reverseCharMap.set(specialChar, char);
      }
    }
  });
});

// ==================== 文本处理工具 ====================

// 清理组合修饰符 (U+0300 - U+036F 等)
function cleanSpecialChars(char) {
  return char.replace(/[\u0300-\u036F\u0483-\u0489\u1AB0-\u1ABE\u1DC0-\u1DFF]/g, '');
}

// 将特殊字体文本还原为基础字符
function normalizeText(inputText) {
  if (!inputText) return '';
  var inputChars = Array.from(inputText);
  return inputChars.map(function(char) {
    var cleaned = cleanSpecialChars(char);
    if (reverseCharMap.has(cleaned)) return reverseCharMap.get(cleaned);
    if (baseChars.includes(char)) return char;
    return char;
  }).join('');
}

// ==================== 核心转换函数 ====================

// 生成所有 30 种字体转换结果
function generateFonts(inputText) {
  if (!inputText) return [];
  var normalizedText = normalizeText(inputText);
  var inputChars = Array.from(normalizedText);

  return fontDictionaries.map(function(font) {
    var transformedText = inputChars.map(function(char) {
      return font.charMap.get(char) || char;
    }).join('');
    return { name: font.name, text: transformedText };
  });
}

// 单个文本转换为指定字体
function convertText(text, fontName) {
  var font = fontDictionaries.find(function(f) { return f.name === fontName; });
  if (!font) return text;
  var normalizedText = normalizeText(text);
  var inputChars = Array.from(normalizedText);
  return inputChars.map(function(char) {
    return font.charMap.get(char) || char;
  }).join('');
}

// ==================== 模式切换 ====================
var currentMode = 'single';

function switchMode(mode) {
  currentMode = mode;
  var singleTab = document.getElementById('tab-single');
  var batchTab = document.getElementById('tab-batch');

  if (mode === 'single') {
    singleTab.classList.add('bg-blue-600', 'text-white', 'shadow-sm');
    singleTab.classList.remove('text-gray-600');
    batchTab.classList.remove('bg-blue-600', 'text-white', 'shadow-sm');
    batchTab.classList.add('text-gray-600');
    document.getElementById('section-single').classList.remove('hidden');
    document.getElementById('section-batch').classList.add('hidden');
  } else {
    batchTab.classList.add('bg-blue-600', 'text-white', 'shadow-sm');
    batchTab.classList.remove('text-gray-600');
    singleTab.classList.remove('bg-blue-600', 'text-white', 'shadow-sm');
    singleTab.classList.add('text-gray-600');
    document.getElementById('section-batch').classList.remove('hidden');
    document.getElementById('section-single').classList.add('hidden');
  }
}

// ==================== 剪贴板 & Toast ====================

function copyToClipboard(text, btn) {
  navigator.clipboard.writeText(text).then(function() {
    if (btn) {
      var originalText = btn.textContent;
      btn.textContent = '✅ Copied!';
      btn.classList.add('bg-green-100', 'text-green-700');
      btn.classList.remove('bg-blue-50', 'text-blue-600');
      setTimeout(function() {
        btn.textContent = originalText;
        btn.classList.remove('bg-green-100', 'text-green-700');
        btn.classList.add('bg-blue-50', 'text-blue-600');
      }, 1500);
    }
    showToast('Copied to clipboard!');
  });
}

function showToast(msg) {
  var toast = document.getElementById('toast');
  var toastText = document.getElementById('toast-text');
  if (toast && toastText) {
    toastText.textContent = msg;
    toast.classList.add('opacity-100');
    toast.classList.remove('opacity-0');
    clearTimeout(window._toastTimer);
    window._toastTimer = setTimeout(function() {
      toast.classList.remove('opacity-100');
      toast.classList.add('opacity-0');
    }, 2000);
  }
}

// ==================== Single 模式 - 输入处理 ====================

function onSingleInput() {
  var input = document.getElementById('input-single');
  if (!input) return;

  var text = input.value;
  var container = document.getElementById('results-single');
  if (!container) return;

  if (!text.trim()) {
    container.innerHTML = '<div class="col-span-full text-center text-gray-400 py-10">Type above to see 30+ font styles ✨</div>';
    return;
  }

  var results = generateFonts(text);
  container.innerHTML = '';

  results.forEach(function(result) {
    var card = document.createElement('div');
    card.className = 'bg-gray-50 p-3 rounded-lg flex justify-between items-center gap-2 border border-gray-100 hover:border-blue-200 transition';

    var infoDiv = document.createElement('div');
    infoDiv.className = 'flex-1 min-w-0';

    var fontLabel = document.createElement('div');
    fontLabel.className = 'text-xs text-gray-500 font-medium mb-0.5';
    fontLabel.textContent = result.name;

    var fontText = document.createElement('div');
    fontText.className = 'text-lg font-semibold text-blue-600 truncate';
    fontText.textContent = result.text;

    infoDiv.appendChild(fontLabel);
    infoDiv.appendChild(fontText);

    var btn = document.createElement('button');
    btn.className = 'text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-100 whitespace-nowrap transition';
    btn.textContent = '📋 Copy';
    btn.onclick = (function(t, b) {
      return function() {
        navigator.clipboard.writeText(t);
        b.textContent = '✅';
        setTimeout(function() { b.textContent = '📋 Copy'; }, 1500);
      };
    })(result.text, btn);

    card.appendChild(infoDiv);
    card.appendChild(btn);
    container.appendChild(card);
  });
}

function clearSingle() {
  var input = document.getElementById('input-single');
  if (input) input.value = '';
  onSingleInput();
}

// ==================== Batch 模式 - 字体网格 ====================

var selectedFonts = []; // Batch 模式选中的字体列表

function initFontGrid() {
  // Batch 模式 - Font Grid
  var batchGrid = document.getElementById('batch-font-grid');
  if (batchGrid) {
    batchGrid.innerHTML = '';
    fontNames.forEach(function(name) {
      var btn = document.createElement('button');
      btn.className = 'font-btn p-2 rounded-lg bg-gray-100 hover:bg-blue-100 text-sm font-medium text-gray-700 transition';
      btn.textContent = name;
      btn.dataset.font = name;
      btn.onclick = function() { toggleFont(name, this); };
      batchGrid.appendChild(btn);
    });
  }

  // Batch 模式 - Single Font Select 下拉框
  var singleFontSelect = document.getElementById('single-font-select');
  if (singleFontSelect) {
    singleFontSelect.innerHTML = '<option value="">Select a font...</option>';
    fontNames.forEach(function(name) {
      var opt = document.createElement('option');
      opt.value = name;
      opt.textContent = name;
      singleFontSelect.appendChild(opt);
    });
  }

  // Batch 模式 - Combo Select 下拉框（异步加载）
  loadComboOptions();
}

function toggleFont(name, btn) {
  var idx = selectedFonts.indexOf(name);
  if (idx >= 0) {
    selectedFonts.splice(idx, 1);
    btn.classList.remove('bg-blue-600', 'text-white');
    btn.classList.add('bg-gray-100');
  } else {
    selectedFonts.push(name);
    btn.classList.remove('bg-gray-100');
    btn.classList.add('bg-blue-600', 'text-white');
  }
  window.selectedFonts = selectedFonts;

  var countEl = document.getElementById('selected-count');
  if (countEl) countEl.textContent = selectedFonts.length;
}

// ==================== Batch 模式 - 字体模式切换 ====================

// 加载 Combo 选项（先从 localStorage，再尝试从后端 API）
function loadComboOptions() {
  var comboSelect = document.getElementById('combo-select');
  if (!comboSelect) return;

  comboSelect.innerHTML = '<option value="">Loading combos...</option>';

  var allCombos = [];

  // 1. 先从 localStorage 加载本地 combos
  try {
    var savedCombos = localStorage.getItem('fg_saved_combos');
    if (savedCombos) {
      var localCombos = JSON.parse(savedCombos);
      if (Array.isArray(localCombos)) {
        localCombos.forEach(function(c) {
          allCombos.push({ name: c.name, fonts: c.fonts, source: 'local' });
        });
      }
    }
  } catch (e) {}

  // 2. 尝试从后端 API 加载云端 combos
  if (typeof getFontComboList === 'function') {
    getFontComboList().then(function(apiCombos) {
      if (Array.isArray(apiCombos)) {
        window._cachedCloudCombos = apiCombos; // 缓存供 getComboFonts 使用
        apiCombos.forEach(function(c) {
          var exists = allCombos.some(function(ac) { return ac.name === c.name; });
          if (!exists) {
            try {
              allCombos.push({ name: c.name, fonts: JSON.parse(c.fonts), source: 'cloud' });
            } catch (e2) {
              allCombos.push({ name: c.name, fonts: c.fonts || [], source: 'cloud' });
            }
          }
        });
      }
      renderComboOptions(comboSelect, allCombos);
    }).catch(function() {
      renderComboOptions(comboSelect, allCombos);
    });
  } else {
    renderComboOptions(comboSelect, allCombos);
  }
}

function renderComboOptions(selectEl, combos) {
  selectEl.innerHTML = '<option value="">Select a combo...</option>';
  if (combos.length === 0) {
    var opt = document.createElement('option');
    opt.disabled = true;
    opt.textContent = 'No combos saved yet';
    selectEl.appendChild(opt);
    return;
  }
  combos.forEach(function(combo) {
    var opt = document.createElement('option');
    opt.value = combo.name;
    opt.textContent = combo.name + ' (' + combo.fonts.length + ' fonts) ' + (combo.source === 'cloud' ? '☁️' : '💾');
    selectEl.appendChild(opt);
  });
}

// Batch 模式中 batchConvert 需要查找 combo 的字体列表
function getComboFonts(comboName) {
  // 1. 先从 localStorage 查找
  try {
    var savedCombos = localStorage.getItem('fg_saved_combos');
    if (savedCombos) {
      var combos = JSON.parse(savedCombos);
      var found = combos.find(function(c) { return c.name === comboName; });
      if (found && found.fonts) return found.fonts;
    }
  } catch (e) {}

  // 2. 查缓存的云端 combos
  if (window._cachedCloudCombos) {
    var combo = window._cachedCloudCombos.find(function(c) { return c.name === comboName; });
    if (combo) {
      try { return JSON.parse(combo.fonts); } catch (e) { return combo.fonts || []; }
    }
  }

  return [];
}

function initBatchFontModeHandlers() {
  var radios = document.querySelectorAll('input[name="font-mode"]');
  radios.forEach(function(radio) {
    radio.addEventListener('change', function() {
      document.getElementById('mode-single-font').classList.add('hidden');
      document.getElementById('mode-multiple-fonts').classList.add('hidden');
      document.getElementById('mode-combo').classList.add('hidden');

      if (this.value === 'single') {
        document.getElementById('mode-single-font').classList.remove('hidden');
      } else if (this.value === 'multiple') {
        document.getElementById('mode-multiple-fonts').classList.remove('hidden');
      } else if (this.value === 'combo') {
        document.getElementById('mode-combo').classList.remove('hidden');
      }
    });
  });
}

// ==================== Batch 模式 - 文件处理 ====================

var batchInputTexts = []; // { source: filename, text: line }
var batchFiles = [];      // 去重后的文件名列表

function handleFiles(files) {
  var fileInput = document.getElementById('file-input');
  if (!files || files.length === 0) return;

  var fileNames = [];
  Array.from(files).forEach(function(file) {
    if (file.size > 1024 * 1024) {
      showToast('File too large: ' + file.name + ' (max 1MB)');
      return;
    }
    fileNames.push(file.name);

    var reader = new FileReader();
    reader.onload = function(e) {
      var content = e.target.result;
      var lines = content.split('\n').filter(function(l) { return l.trim(); });
      lines.forEach(function(line) {
        batchInputTexts.push({ source: file.name, text: line.trim() });
      });

      // 更新文件名列表
      if (batchFiles.indexOf(file.name) === -1) {
        batchFiles.push(file.name);
      }
      updateImportList();
    };
    reader.readAsText(file);
  });
  fileInput.value = '';
}

function updateImportList() {
  var container = document.getElementById('import-list');
  var emptyState = document.getElementById('batch-empty');
  var clearBtn = document.getElementById('clear-all-container');

  if (batchFiles.length === 0) {
    container.innerHTML = '';
    if (emptyState) emptyState.style.display = '';
    if (clearBtn) clearBtn.style.display = 'none';
    return;
  }

  if (emptyState) emptyState.style.display = 'none';
  if (clearBtn) clearBtn.style.display = '';

  container.innerHTML = '';

  // 按文件名分组显示，只显示文件名
  batchFiles.forEach(function(fileName) {
    var lineCount = batchInputTexts.filter(function(item) { return item.source === fileName; }).length;
    var div = document.createElement('div');
    div.className = 'flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2 text-sm';
    div.innerHTML =
      '<div class="flex items-center gap-2 flex-1 min-w-0">' +
        '<span class="text-blue-500">📄</span>' +
        '<span class="text-gray-800 font-medium truncate">' + escapeHtml(fileName) + '</span>' +
        '<span class="text-gray-400 text-xs">(' + lineCount + ' lines)</span>' +
      '</div>' +
      '<button class="text-gray-400 hover:text-red-500 ml-2 text-lg" onclick="removeFile(\'' + escapeHtml(fileName).replace(/'/g, "\\'") + '\')">✕</button>';
    container.appendChild(div);
  });
}

function removeFile(fileName) {
  batchFiles = batchFiles.filter(function(f) { return f !== fileName; });
  batchInputTexts = batchInputTexts.filter(function(item) { return item.source !== fileName; });
  updateImportList();
}

function removeBatchItem(index) {
  batchInputTexts.splice(index, 1);
  updateImportList();
}

function clearAllInput() {
  batchInputTexts = [];
  batchFiles = [];
  var batchText = document.getElementById('batch-text');
  if (batchText) batchText.value = '';
  updateImportList();
}

function escapeHtml(text) {
  var div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// ==================== Batch 模式 - 转换 ====================

var PREVIEW_LIMIT = 10; // 预览默认显示条数

function batchConvert() {
  // 收集粘贴的文本
  var batchText = document.getElementById('batch-text');
  if (batchText && batchText.value.trim()) {
    var lines = batchText.value.split('\n').filter(function(l) { return l.trim(); });
    lines.forEach(function(line) {
      var exists = batchInputTexts.some(function(item) { return item.text === line.trim() && item.source === 'paste'; });
      if (!exists) {
        batchInputTexts.push({ source: 'paste', text: line.trim() });
      }
    });
    batchText.value = '';
    updateImportList();
  }

  if (batchInputTexts.length === 0) {
    showToast('Please import files or paste text first');
    return;
  }

  // 确定字体
  var fontModeEl = document.querySelector('input[name="font-mode"]:checked');
  var fontMode = fontModeEl ? fontModeEl.value : 'multiple';
  var fonts = [];

  if (fontMode === 'single') {
    var singleFont = document.getElementById('single-font-select').value;
    if (!singleFont) { showToast('Please select a font'); return; }
    fonts = [singleFont];
  } else if (fontMode === 'combo') {
    var comboName = document.getElementById('combo-select').value;
    if (!comboName) { showToast('Please select a combo'); return; }
    fonts = getComboFonts(comboName);
    if (fonts.length === 0) { showToast('Combo not found. Create one first.'); return; }
  } else {
    fonts = selectedFonts.slice();
    if (fonts.length === 0) { showToast('Please select at least one font'); return; }
  }

  // 执行转换
  var allResults = [];
  batchInputTexts.forEach(function(item) {
    fonts.forEach(function(fontName) {
      allResults.push({
        source: item.source,
        font: fontName,
        input: item.text,
        output: convertText(item.text, fontName)
      });
    });
  });

  window._batchResults = allResults;

  // 预览
  var previewArea = document.getElementById('preview-area');
  var downloadArea = document.getElementById('download-area');
  if (previewArea) previewArea.classList.remove('hidden');
  if (downloadArea) downloadArea.classList.remove('hidden');

  document.getElementById('result-count').textContent = allResults.length;
  renderPreview(allResults, false);

  showToast('Converted ' + allResults.length + ' results!');
}

function renderPreview(results, showAll) {
  var content = document.getElementById('preview-content');
  var moreDiv = document.getElementById('preview-more');
  if (!content) return;

  var displayCount = showAll ? results.length : Math.min(PREVIEW_LIMIT, results.length);
  var html = '';

  for (var i = 0; i < displayCount; i++) {
    var r = results[i];
    html += '<div class="flex items-center gap-2 py-1.5 border-b border-gray-100">' +
      '<span class="text-gray-400 text-xs w-6 shrink-0">' + (i + 1) + '</span>' +
      '<span class="text-xs text-gray-400 w-20 shrink-0 truncate">' + escapeHtml(r.font) + '</span>' +
      '<span class="text-blue-700 text-sm truncate flex-1">' + escapeHtml(r.output) + '</span>' +
    '</div>';
  }
  content.innerHTML = html;

  // Show more
  if (results.length > PREVIEW_LIMIT) {
    if (moreDiv) {
      moreDiv.classList.remove('hidden');
      document.getElementById('preview-showing').textContent = displayCount;
      document.getElementById('preview-total').textContent = results.length;
    }
  } else {
    if (moreDiv) moreDiv.classList.add('hidden');
  }
}

function showAllPreview() {
  if (window._batchResults) renderPreview(window._batchResults, true);
}

// ==================== Batch 模式 - 内容生成工具 ====================

// 获取 Output Format
function getOutputFormat() {
  var el = document.querySelector('input[name="output-format"]:checked');
  return el ? el.value : 'merged';
}

// 按 Output Format 生成纯文本内容（每行只有转换后的文本，不加前缀）
function generateTXTContent(results, format) {
  var content = '';
  if (format === 'merged') {
    results.forEach(function(r) {
      content += r.output + '\n';
    });
  } else if (format === 'byFont') {
    var byFont = {};
    results.forEach(function(r) {
      if (!byFont[r.font]) byFont[r.font] = [];
      byFont[r.font].push(r);
    });
    Object.keys(byFont).forEach(function(font) {
      content += '── ' + font + ' ──\n';
      byFont[font].forEach(function(r) { content += r.output + '\n'; });
      content += '\n';
    });
  } else if (format === 'bySource') {
    var bySource = {};
    results.forEach(function(r) {
      if (!bySource[r.source]) bySource[r.source] = [];
      bySource[r.source].push(r);
    });
    Object.keys(bySource).forEach(function(source) {
      content += '── ' + source + ' ──\n';
      bySource[source].forEach(function(r) { content += r.output + '\n'; });
      content += '\n';
    });
  }
  return content;
}

// 按 Output Format 分组（用于 ZIP/PNG/PDF）
function groupResults(results, format) {
  if (format === 'merged') {
    return [{ title: 'All Results', items: results }];
  } else if (format === 'byFont') {
    var groups = {};
    results.forEach(function(r) {
      if (!groups[r.font]) groups[r.font] = [];
      groups[r.font].push(r);
    });
    return Object.keys(groups).map(function(k) { return { title: k, items: groups[k] }; });
  } else if (format === 'bySource') {
    var groups2 = {};
    results.forEach(function(r) {
      if (!groups2[r.source]) groups2[r.source] = [];
      groups2[r.source].push(r);
    });
    return Object.keys(groups2).map(function(k) { return { title: k, items: groups2[k] }; });
  }
  return [{ title: 'Results', items: results }];
}

// ==================== Batch 模式 - 下载 ====================

// 📄 TXT 下载
function downloadAsTXT() {
  var results = window._batchResults;
  if (!results || !results.length) { showToast('No results'); return; }
  var format = getOutputFormat();
  var content = generateTXTContent(results, format);
  downloadFile('font-results.txt', content, 'text/plain');
  showToast('TXT downloaded!');
}

// 📁 ZIP 下载（按 Output Format 决定文件结构）
function downloadAsZIP() {
  var results = window._batchResults;
  if (!results || !results.length) { showToast('No results'); return; }
  if (typeof JSZip === 'undefined') { showToast('ZIP library not loaded'); return; }

  var format = getOutputFormat();
  var zip = new JSZip();

  if (format === 'merged') {
    // Merged: 一个文件包含所有结果
    zip.file('all-results.txt', generateTXTContent(results, 'merged'));
  } else if (format === 'byFont') {
    // By Font: 每种字体一个文件
    var byFont = {};
    results.forEach(function(r) {
      if (!byFont[r.font]) byFont[r.font] = [];
      byFont[r.font].push(r);
    });
    Object.keys(byFont).forEach(function(font) {
      var content = byFont[font].map(function(r) { return r.output; }).join('\n');
      zip.file(font + '.txt', content);
    });
  } else if (format === 'bySource') {
    // By Source: 每个来源一个文件
    var bySource = {};
    results.forEach(function(r) {
      if (!bySource[r.source]) bySource[r.source] = [];
      bySource[r.source].push(r);
    });
    Object.keys(bySource).forEach(function(source) {
      var content = bySource[source].map(function(r) { return r.output; }).join('\n');
      // 清理文件名中的特殊字符
      var safeName = source.replace(/[^a-zA-Z0-9._-]/g, '_');
      zip.file(safeName + '.txt', content);
    });
  }

  zip.generateAsync({ type: 'blob' }).then(function(blob) {
    var link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'font-results.zip';
    link.click();
    showToast('ZIP downloaded!');
  });
}

// 🖼️ PNG 下载（按分组渲染）
function downloadAsImage() {
  var results = window._batchResults;
  if (!results || !results.length) { showToast('No results'); return; }

  var format = getOutputFormat();
  var groups = groupResults(results, format);

  var canvas = document.createElement('canvas');
  var ctx = canvas.getContext('2d');

  var fontSize = 16;
  var lineHeight = 26;
  var titleHeight = 28;
  var padding = 30;
  var maxWidth = 800;

  // 计算总高度
  var totalHeight = padding + 30; // 标题
  groups.forEach(function(group) {
    totalHeight += titleHeight + 10;
    group.items.forEach(function() { totalHeight += lineHeight; });
    totalHeight += 15; // 分组间距
  });
  totalHeight += padding;

  canvas.width = maxWidth;
  canvas.height = Math.max(200, totalHeight);

  // 白色背景
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // 主标题
  ctx.fillStyle = '#1e40af';
  ctx.font = 'bold 18px Arial, sans-serif';
  ctx.fillText('Font Generator Results', padding, padding + 18);

  var y = padding + 40;

  groups.forEach(function(group) {
    // 分组标题
    ctx.fillStyle = '#374151';
    ctx.font = 'bold 14px Arial, sans-serif';
    ctx.fillText('── ' + group.title + ' ──', padding, y);
    y += titleHeight;

    // 每行纯文本
    ctx.fillStyle = '#1e40af';
    ctx.font = fontSize + 'px Arial, sans-serif';
    group.items.forEach(function(r) {
      var text = r.output;
      if (text.length > 70) text = text.substring(0, 70) + '...';
      ctx.fillText(text, padding + 10, y);
      y += lineHeight;
    });

    y += 15; // 分组间距
  });

  // 水印
  if (!window.membershipStatus || !window.membershipStatus.isPro) {
    ctx.fillStyle = '#9ca3af';
    ctx.font = '11px Arial, sans-serif';
    ctx.fillText('Generated by Font Generator Free', padding, canvas.height - 12);
  }

  var link = document.createElement('a');
  link.download = 'font-results-' + Date.now() + '.png';
  link.href = canvas.toDataURL('image/png');
  link.click();
  showToast('PNG downloaded!');
}

// 📕 PDF 下载（Canvas 绘制后嵌入）
function downloadAsPDF() {
  var results = window._batchResults;
  if (!results || !results.length) { showToast('No results'); return; }

  var jsPDFConstructor = (typeof jspdf !== 'undefined' && jspdf.jsPDF) ? jspdf.jsPDF : (typeof jsPDF !== 'undefined' ? jsPDF : null);
  if (!jsPDFConstructor) { showToast('PDF library not loaded'); return; }

  var format = getOutputFormat();
  var groups = groupResults(results, format);

  // 用 Canvas 渲染
  var canvas = document.createElement('canvas');
  var ctx = canvas.getContext('2d');
  var fontSize = 14;
  var lineHeight = 22;
  var titleHeight = 24;
  var padding = 30;
  var maxWidth = 800;

  var totalHeight = padding + 20;
  groups.forEach(function(group) {
    totalHeight += titleHeight + 8;
    group.items.forEach(function() { totalHeight += lineHeight; });
    totalHeight += 12;
  });
  totalHeight += padding;

  canvas.width = maxWidth;
  canvas.height = Math.max(300, totalHeight);

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  var y = padding;
  groups.forEach(function(group) {
    ctx.fillStyle = '#374151';
    ctx.font = 'bold 13px Arial, sans-serif';
    ctx.fillText('── ' + group.title + ' ──', padding, y);
    y += titleHeight;

    ctx.fillStyle = '#1e40af';
    ctx.font = fontSize + 'px Arial, sans-serif';
    group.items.forEach(function(r) {
      var text = r.output;
      if (text.length > 70) text = text.substring(0, 70) + '...';
      ctx.fillText(text, padding + 8, y);
      y += lineHeight;
    });
    y += 12;
  });

  // 嵌入 PDF
  var imgData = canvas.toDataURL('image/png');
  var doc = new jsPDFConstructor();
  var pdfWidth = doc.internal.pageSize.getWidth();
  var pdfHeight = doc.internal.pageSize.getHeight();
  var imgWidth = pdfWidth - 20;
  var imgHeight = (canvas.height / canvas.width) * imgWidth;

  if (imgHeight <= pdfHeight - 20) {
    doc.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
  } else {
    // 分页：按 PDF 页面高度切割 canvas
    var pageImgHeight = (pdfHeight - 20) / imgWidth * canvas.width;
    var remaining = canvas.height;
    var srcY = 0;
    var page = 0;

    while (remaining > 0) {
      if (page > 0) doc.addPage();

      var sliceHeight = Math.min(remaining, pageImgHeight);
      var pageCanvas = document.createElement('canvas');
      pageCanvas.width = canvas.width;
      pageCanvas.height = sliceHeight;
      var pageCtx = pageCanvas.getContext('2d');
      pageCtx.drawImage(canvas, 0, srcY, canvas.width, sliceHeight, 0, 0, canvas.width, sliceHeight);

      var sliceImg = pageCanvas.toDataURL('image/png');
      var slicePdfHeight = (sliceHeight / canvas.width) * imgWidth;
      doc.addImage(sliceImg, 'PNG', 10, 10, imgWidth, slicePdfHeight);

      srcY += sliceHeight;
      remaining -= sliceHeight;
      page++;
    }
  }

  doc.save('font-results-' + Date.now() + '.pdf');
  showToast('PDF downloaded!');
}

function downloadFile(filename, content, mimeType) {
  var blob = new Blob([content], { type: mimeType });
  var link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
}

// ==================== Combo 管理 ====================

var comboSelectedFonts = []; // 弹窗中选中的字体

function openComboModal() {
  document.getElementById('combo-modal').classList.remove('hidden');
  document.getElementById('combo-modal').classList.add('flex');
  comboSelectedFonts = [];
  initComboFontSelector();
  loadComboManageList();
}

function closeComboModal() {
  document.getElementById('combo-modal').classList.add('hidden');
  document.getElementById('combo-modal').classList.remove('flex');
  comboSelectedFonts = [];
  // 刷新 Batch 模式的 combo-select
  loadComboOptions();
}

function initComboFontSelector() {
  var container = document.getElementById('combo-font-selector');
  if (!container) return;
  container.innerHTML = '';
  fontNames.forEach(function(name) {
    var btn = document.createElement('button');
    btn.className = 'p-1.5 rounded bg-gray-100 hover:bg-blue-100 text-xs font-medium text-gray-700 transition';
    btn.textContent = name;
    btn.dataset.font = name;
    btn.onclick = function() { toggleComboFont(name, this); };
    container.appendChild(btn);
  });
  updateComboSelectedCount();
}

function toggleComboFont(name, btn) {
  var idx = comboSelectedFonts.indexOf(name);
  if (idx >= 0) {
    comboSelectedFonts.splice(idx, 1);
    btn.classList.remove('bg-blue-600', 'text-white');
    btn.classList.add('bg-gray-100');
  } else {
    comboSelectedFonts.push(name);
    btn.classList.remove('bg-gray-100');
    btn.classList.add('bg-blue-600', 'text-white');
  }
  updateComboSelectedCount();
}

function updateComboSelectedCount() {
  var el = document.getElementById('combo-selected-count');
  if (el) el.textContent = comboSelectedFonts.length;
}

function saveNewCombo() {
  var nameInput = document.getElementById('new-combo-name');
  var name = nameInput ? nameInput.value.trim() : '';
  if (!name) { showToast('Please enter a combo name'); return; }
  if (comboSelectedFonts.length === 0) { showToast('Please select at least one font'); return; }

  // 保存到 localStorage
  var combos = [];
  try {
    var saved = localStorage.getItem('fg_saved_combos');
    if (saved) combos = JSON.parse(saved);
  } catch (e) {}

  // 检查重名
  var existing = combos.findIndex(function(c) { return c.name === name; });
  var newCombo = { name: name, fonts: comboSelectedFonts.slice() };

  if (existing >= 0) {
    combos[existing] = newCombo;
  } else {
    combos.push(newCombo);
  }

  localStorage.setItem('fg_saved_combos', JSON.stringify(combos));

  // 如果已登录 Pro，也保存到云端
  if (typeof saveFontCombo === 'function' && window.membershipStatus && window.membershipStatus.isPro) {
    saveFontCombo(name, comboSelectedFonts);
  }

  // 清空输入
  if (nameInput) nameInput.value = '';
  comboSelectedFonts = [];
  initComboFontSelector();
  loadComboManageList();

  showToast('Combo "' + name + '" saved!');
}

function loadComboManageList() {
  var container = document.getElementById('combo-manage-list');
  if (!container) return;

  var combos = [];
  try {
    var saved = localStorage.getItem('fg_saved_combos');
    if (saved) combos = JSON.parse(saved);
  } catch (e) {}

  if (combos.length === 0) {
    container.innerHTML = '<div class="text-center text-gray-400 py-4 text-sm">No combos yet. Create one below!</div>';
    return;
  }

  container.innerHTML = '';
  combos.forEach(function(combo) {
    var div = document.createElement('div');
    div.className = 'flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2';

    var info = document.createElement('div');
    info.className = 'flex-1 min-w-0';
    info.innerHTML =
      '<div class="font-medium text-gray-800 text-sm">' + escapeHtml(combo.name) + '</div>' +
      '<div class="text-xs text-gray-500">' + combo.fonts.length + ' fonts: ' + combo.fonts.slice(0, 3).join(', ') + (combo.fonts.length > 3 ? '...' : '') + '</div>';

    var actions = document.createElement('div');
    actions.className = 'flex gap-2 ml-2';

    var useBtn = document.createElement('button');
    useBtn.className = 'text-blue-600 text-xs font-medium hover:text-blue-800';
    useBtn.textContent = 'Use';
    useBtn.onclick = (function(c) {
      return function() {
        document.getElementById('combo-select').value = c.name;
        closeComboModal();
        showToast('Combo "' + c.name + '" selected');
      };
    })(combo);

    var delBtn = document.createElement('button');
    delBtn.className = 'text-red-400 text-xs font-medium hover:text-red-600';
    delBtn.textContent = 'Delete';
    delBtn.onclick = (function(c) {
      return function() {
        if (!confirm('Delete combo "' + c.name + '"?')) return;
        deleteLocalCombo(c.name);
        loadComboManageList();
      };
    })(combo);

    actions.appendChild(useBtn);
    actions.appendChild(delBtn);
    div.appendChild(info);
    div.appendChild(actions);
    container.appendChild(div);
  });
}

function deleteLocalCombo(name) {
  var combos = [];
  try {
    var saved = localStorage.getItem('fg_saved_combos');
    if (saved) combos = JSON.parse(saved);
  } catch (e) {}
  combos = combos.filter(function(c) { return c.name !== name; });
  localStorage.setItem('fg_saved_combos', JSON.stringify(combos));
  // 如果有云端删除功能
  if (typeof deleteFontCombo === 'function' && window.membershipStatus && window.membershipStatus.isPro) {
    // 查找 combo ID 并删除（简化处理，按名称匹配）
  }
  showToast('Combo deleted');
}

// ==================== 页面初始化 ====================

document.addEventListener('DOMContentLoaded', function() {
  initFontGrid();
  initBatchFontModeHandlers();

  // 自动聚焦输入框
  var singleInput = document.getElementById('input-single');
  if (singleInput) singleInput.focus();
});
