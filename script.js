/**
 * script.js - Font Generator Free - Core Font Engine
 * 30种 Unicode 花哨字体转换
 * 使用正确的 Unicode 字符映射
 */

// 基础字符
const baseChars = Array.from("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789");

// 使用 Unicode 码点生成字体映射
function makeMap(lowerStart, upperStart, digitStart, count) {
    let lower = '', upper = '', digit = '';
    for (let i = 0; i < 26; i++) lower += String.fromCodePoint(lowerStart + i);
    for (let i = 0; i < 26; i++) upper += String.fromCodePoint(upperStart + i);
    for (let i = 0; i < 10; i++) digit += String.fromCodePoint(digitStart + i);
    return Array.from(lower + upper + digit);
}

// Mathematical Bold
function genBold() { return makeMap(0x1D41A, 0x1D400, 0x1D7EC); }

// Mathematical Bold Italic
function genBoldItalic() { return makeMap(0x1D43C, 0x1D420, 0x1D7EC); }

// Mathematical Italic
function genItalic() { return makeMap(0x1D44E, 0x1D434, 0x1D7EC); }

// Mathematical Sans-Serif Bold (using as Gothic/Bold Gothic)
function genSansSerifBold() { return makeMap(0x1D5D4, 0x1D5EE, 0x1D7EC); }

// Mathematical Double-Struck
function genDoubleStruck() { return makeMap(0x1D538, 0x1D53B, 0x1D7D8); }

// Mathematical Script (using as Cursive)
function genScript() { return makeMap(0x1D4B6, 0x1D4C0, 0x1D7EC); }

// 字体字典
const fontDictionaries = [
    { name: "Bold", map: genBold() },
    { name: "Italic", map: genItalic() },
    { name: "Bold Italic", map: genBoldItalic() },
    { name: "Double Struck", map: genDoubleStruck() },
    { name: "Cursive", map: genScript() },
    { name: "Gothic", map: genSansSerifBold() },
    { name: "Bold Gothic", map: genSansSerifBold() },
    { name: "Monospace", map: makeMap(0x1D670, 0x1D670, 0x1D7F6) },
    { name: "Bold Cursive", map: genBoldItalic() },
    { name: "Bubble", map: makeMap(0x24D0, 0x24B6, 0x245F) },
    { name: "Black Bubble", map: makeMap(0x1F180, 0x1F150, 0x1F1A6) },
    { name: "Square", map: makeMap(0x1F130, 0x1F130, 0) },
    { name: "Black Square", map: makeMap(0x1F171, 0x1F171, 0) },
    { name: "Wide", map: Array.from("ａｂｃｄｅｆｇｈｉｊｋｌｍｎｏｐｑｒｓｔｕｖｗｘｙｚＡＢＣＤＥＦＧＨＩＪＫＬＭＮＯＰＱＲＳＴＵＶＷＸＹＺ０１２３４５６７８９") },
    { name: "Small Caps", map: Array.from("ᴀʙᴄᴅᴇғɢʜɪᴊᴋʟᴍɴᴏᴘǫʀsᴛᴜᴠᴡxʏᴢABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789") },
    { name: "Subscript", map: Array.from("ₐbcdₑfgₕᵢⱼₖₗₘₙₒpqᵣₛₜᵤᵥwₓyzₐBCDₑFGₕᵢⱼₖₗₘₙₒPQᵣₛₜᵤᵥWₓYZ₀₁₂₃₄₅₆₇₈₉") },
    { name: "Superscript", map: Array.from("ᵃᵇᶜᵈᵉᶠᵍʰᶦʲᵏˡᵐⁿᵒᵖᵠʳˢᵗᵘᵛʷˣʸᶻᴬᴮᶜᴰᴱᶠᴳᴴᴵᴶᴷᴸᴹᴺᴼᴾQᴿˢᵀᵁⱽᵂˣʸᶻ⁰¹²³⁴⁵⁶⁷⁸⁹") },
    { name: "Strikethrough", map: Array.from("a̶b̶c̶d̶e̶f̶g̶h̶i̶j̶k̶l̶m̶n̶o̶p̶q̶r̶s̶t̶u̶v̶w̶x̶y̶z̶A̶B̶C̶D̶E̶F̶G̶H̶I̶J̶K̶L̶M̶N̶O̶P̶Q̶R̶S̶T̶U̶V̶W̶X̶Y̶Z̶0̶1̶2̶3̶4̶5̶6̶7̶8̶9̶") },
    { name: "Underline", map: Array.from("a̲b̲c̲d̲e̲f̲g̲h̲i̲j̲k̲l̲m̲n̲o̲p̲q̲r̲s̲t̲u̲v̲w̲x̲y̲z̲A̲B̲C̲D̲E̲F̲G̲H̲I̲J̲K̲L̲M̲N̲O̲P̲Q̲R̲S̲T̲U̲V̲W̲X̲Y̲Z̲0̲1̲2̲3̲4̲5̲6̲7̲8̲9̲") },
    { name: "Upside Down", map: Array.from("ɐqɔpǝɟƃɥıɾʞlɯuodbɹsʇnʌʍxʎz∀qƆPƎℲפHIſʞ˥WNOԀQᴚS⊥∩ΛMX⅄Z0123456789") },
    { name: "Zalgo", map: Array.from("a̷b̷c̷d̷e̷f̷g̷h̷i̷j̷k̷l̷m̷n̷o̷p̷q̷r̷s̷t̷u̷v̷w̷x̷y̷z̷A̷B̷C̷D̷E̷F̷G̷H̷I̷J̷K̷L̷M̷N̷O̷P̷Q̷R̷S̷T̷U̷V̷W̷X̷Y̷Z̷0̷1̷2̷3̷4̷5̷6̷7̷8̷9̷") },
    { name: "Heart", map: Array.from("a♥b♥c♥d♥e♥f♥g♥h♥i♥j♥k♥l♥m♥n♥o♥p♥q♥r♥s♥t♥u♥v♥w♥x♥y♥z♥A♥B♥C♥D♥E♥F♥G♥H♥I♥J♥K♥L♥M♥N♥O♥P♥Q♥R♥S♥T♥U♥V♥W♥X♥Y♥Z♥0♥1♥2♥3♥4♥5♥6♥7♥8♥9♥") },
    { name: "Star", map: Array.from("a★b★c★d★e★f★g★h★i★j★k★l★m★n★o★p★q★r★s★t★u★v★w★x★y★z★A★B★C★D★E★F★G★H★I★J★K★L★M★N★O★P★Q★R★S★T★U★V★W★X★Y★Z★0★1★2★3★4★5★6★7★8★9★") },
    { name: "Dot", map: Array.from("ȧḃċḋėḟġḣi̇j̇k̇l̇ṁṅȯṗq̇ṙṡṫu̇v̇ẇẋẏżȦḂĊḊĖḞĠḢİJ̇K̇L̇ṀṄȮṖQ̇ṘṠṪU̇V̇ẆẊẎŻ0̇1̇2̇3̇4̇5̇6̇7̇8̇9̇") },
    { name: "Bracket", map: Array.from("【a】【b】【c】【d】【e】【f】【g】【h】【i】【j】【k】【l】【m】【n】【o】【p】【q】【r】【s】【t】【u】【v】【w】【x】【y】【z】【A】【B】【C】【D】【E】【F】【G】【H】【I】【J】【K】【L】【M】【N】【O】【P】【Q】【R】【S】【T】【U】【V】【W】【X】【Y】【Z】【0】【1】【2】【3】【4】【5】【6】【7】【8】【9】") },
    { name: "Wave", map: Array.from("a〰b〰c〰d〰e〰f〰g〰h〰i〰j〰k〰l〰m〰n〰o〰p〰q〰r〰s〰t〰u〰v〰w〰x〰y〰z〰A〰B〰C〰D〰E〰F〰G〰H〰I〰J〰K〰L〰M〰N〰O〰P〰Q〰R〰S〰T〰U〰V〰W〰X〰Y〰Z〰0〰1〰2〰3〰4〰5〰6〰7〰8〰9〰") },
    { name: "Parenthesized", map: Array.from("⒜⒝⒞⒟⒠⒡⒢⒣⒤⒥⒦⒧⒨⒩⒪⒫⒬⒭⒮⒯⒰⒱⒲⒳⒴⒵⒜⒝⒞⒟⒠⒡⒢⒣⒤⒥⒦⒧⒨⒩⒪⒫⒬⒭⒮⒯⒰⒱⒲⒳⒴⒵⑴⑵⑶⑷⑸⑹") },
    { name: "Crossed", map: Array.from("a⃒b⃒c⃒d⃒e⃒f⃒g⃒h⃒i⃒j⃒k⃒l⃒m⃒n⃒o⃒p⃒q⃒r⃒s⃒t⃒u⃒v⃒w⃒x⃒y⃒z⃒A⃒B⃒C⃒D⃒E⃒F⃒G⃒H⃒I⃒J⃒K⃒L⃒M⃒N⃒O⃒P⃒Q⃒R⃒S⃒T⃒U⃒V⃒W⃒X⃒Y⃒Z⃒0⃒1⃒2⃒3⃒4⃒5⃒6⃒7⃒8⃒9⃒") },
    { name: "Arrow", map: Array.from("a⃕b⃕c⃕d⃕e⃕f⃕g⃕h⃕i⃕j⃕k⃕l⃕m⃕n⃕o⃕p⃕q⃕r⃕s⃕t⃕u⃕v⃕w⃕x⃕y⃕z⃕A⃕B⃕C⃕D⃕E⃕F⃕G⃕H⃕I⃕J⃕K⃕L⃕M⃕N⃕O⃕P⃕Q⃕R⃕S⃕T⃕U⃕V⃕W⃕X⃕Y⃕Z⃕0⃕1⃕2⃕3⃕4⃕5⃕6⃕7⃕8⃕9⃕") },
    { name: "Tiny", map: Array.from("ᵃᵇᶜᵈᵉᶠᵍʰᶦʲᵏˡᵐⁿᵒᵖᵠʳˢᵗᵘᵛʷˣʸᶻᴬᴮᶜᴰᴱᶠᴳᴴᴵᴶᴷᴸᴹᴺᴼᴾQᴿˢᵀᵁⱽᵂˣʸᶻ⁰¹²³⁴⁵⁶⁷⁸⁹") }
];

// 字体名称数组
const fontNames = fontDictionaries.map(f => f.name);

// 全局反向映射表：特殊字符 → 基础字符
const reverseCharMap = new Map();

// 预处理映射表
fontDictionaries.forEach(font => {
    font.charMap = new Map();
    const mapArr = font.map;
    
    // 检查是否是组合字符字体（map 长度是 baseChars 的两倍）
    const isCombiningFont = mapArr.length === baseChars.length * 2;
    
    baseChars.forEach((char, index) => {
        if (isCombiningFont) {
            // 组合字符字体：每两个元素一组，组合成完整字符
            font.charMap.set(char, mapArr[index * 2] + mapArr[index * 2 + 1]);
        } else {
            // 普通字体：直接映射
            font.charMap.set(char, mapArr[index]);
        }
        // 构建反向映射（特殊字符 → 基础字符）
        const specialChar = font.charMap.get(char);
        if (specialChar && char !== specialChar) {
            reverseCharMap.set(specialChar, char);
        }
    });
});

// 清理特殊修饰符（如 Zalgo、Strikethrough 的组合字符）
function cleanSpecialChars(char) {
    // 移除 combining marks (U+0300 - U+036F)
    return char.replace(/[\u0300-\u036F\u0483-\u0489\u1AB0-\u1ABE\u1DC0-\u1DFF]/g, '');
}

// 将特殊字体文本还原为基础字符
function normalizeText(inputText) {
    if (!inputText) return '';
    const inputChars = Array.from(inputText);
    return inputChars.map(char => {
        // 先清理组合字符
        const cleaned = cleanSpecialChars(char);
        // 尝试直接匹配
        if (reverseCharMap.has(cleaned)) {
            return reverseCharMap.get(cleaned);
        }
        // 如果是基础字符，直接返回
        if (baseChars.includes(char)) {
            return char;
        }
        // 无法识别的字符保留原样
        return char;
    }).join('');
}

// 核心转换算法（支持跨字体转换）
function generateFonts(inputText) {
    if (!inputText) return [];
    
    // 步骤1：还原输入文本（识别任意字体 → 普通字符）
    const normalizedText = normalizeText(inputText);
    const inputChars = Array.from(normalizedText);
    
    return fontDictionaries.map(font => {
        const transformedText = inputChars.map(char => {
            return font.charMap.get(char) || char;
        }).join('');
        return { name: font.name, text: transformedText };
    });
}

// 单个文本转换为单个字体（自动识别输入字体并转换）
function convertText(text, fontName) {
    const font = fontDictionaries.find(f => f.name === fontName);
    if (!font) return text;
    
    // 步骤1：还原输入文本（识别任意字体 → 普通字符）
    const normalizedText = normalizeText(text);
    
    // 步骤2：转换为目标字体
    const inputChars = Array.from(normalizedText);
    const result = inputChars.map(char => {
        return font.charMap.get(char) || char;
    }).join('');
    
    // Debug log in browser console
    if (typeof console !== 'undefined' && text.trim().length > 0 && text.trim().length < 50) {
        console.log('convertText("' + text.trim().substring(0, 10) + '", "' + fontName + '") => "' + result.trim().substring(0, 20) + '"');
    }
    
    return result;
}

// 复制到剪贴板
window.copyToClipboard = function(text, btn) {
    navigator.clipboard.writeText(text).then(function() {
        if (btn) {
            var originalText = btn.textContent;
            btn.textContent = 'Copied!';
            btn.classList.add('bg-green-100', 'text-green-700');
            btn.classList.remove('bg-blue-50', 'text-blue-600');
            setTimeout(function() {
                btn.textContent = originalText;
                btn.classList.remove('bg-green-100', 'text-green-700');
                btn.classList.add('bg-blue-50', 'text-blue-600');
            }, 1500);
        }
        
        var toast = document.getElementById('toast');
        var toastText = document.getElementById('toastText');
        if (toast && toastText) {
            toastText.textContent = 'Copied to clipboard!';
            toast.classList.add('opacity-100');
            toast.classList.remove('opacity-0', 'pointer-events-none');
            clearTimeout(window._toastTimer);
            window._toastTimer = setTimeout(function() {
                toast.classList.remove('opacity-100');
                toast.classList.add('opacity-0', 'pointer-events-none');
            }, 2000);
        }
    });
};
