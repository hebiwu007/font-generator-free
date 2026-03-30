/**
 * script.js - Font Generator Free - Core Font Engine
 * 30种 Unicode 花哨字体转换
 */

// 定义字体映射表（使用码点数组）
const fontMaps = {
    "Bold": {
        chars: "𝗮𝗯𝗰𝗱𝗲𝗳𝗴𝗵𝗶𝗷𝗸𝗹𝗺𝗻𝗼𝗽𝗾𝗿𝘀𝘁𝘂𝘷𝘸𝘹𝘆𝘇𝗔𝗕𝗖𝗗𝗘𝗙𝗚𝗛𝗜𝗝𝗞𝗟𝗠𝗡𝗢𝗣𝗤𝗥𝗦𝗧𝗨𝗩𝗪𝗫𝗬𝗭𝟬𝟭𝟮𝟯𝟰𝟱𝟲𝟳𝟴𝟵",
        codePoints: null
    },
    "Italic": {
        chars: "𝘢𝘣𝘤𝘥𝘦𝘧𝘨𝘩𝘪𝘫𝘬𝘭𝘮𝘯𝘰𝘱𝘲𝘳𝘴𝘵𝘶𝘷𝘸𝘹𝘺𝘻𝘈𝘉𝘊𝘋𝘌𝘍𝘎𝘏𝘐𝘑𝘒𝘓𝘔𝘕𝘖𝘗𝘘𝘚𝘛𝘜𝘝𝘞𝘟𝘠𝘕0123456789",
        codePoints: null
    },
    "Bold Italic": {
        chars: "𝙖𝙖𝙘𝙙𝙚𝙛𝙜𝙝𝙞𝙟𝙠𝙡𝙢𝙣𝙤𝙥𝙦𝙧𝙨𝙩𝙪𝙫𝙬𝙭𝙮𝙯𝘈𝘉𝘊𝘋𝘌𝘍𝘎𝘏𝘐𝘑𝘒𝘓𝘔𝘕𝘖𝘗𝘘𝘚𝘛𝘜𝘝𝘞𝘟𝘠𝘕0123456789",
        codePoints: null
    },
    "Cursive": {
        chars: "𝒶𝒷𝒸𝒹𝑒𝒻𝑔𝒽𝒾𝒿𝓀𝓁𝓂𝓃ℴ𝓅𝓆𝓇𝓈𝓉𝓊𝓋𝓌𝓍𝓎𝓏𝒶𝐵𝒞𝒟𝐸𝐹𝒢𝐻𝐼𝒥𝒦𝐿𝑀𝒩𝒪𝒫𝒬𝑅𝒮𝒯𝒰𝒱𝒲𝒳𝒴𝒵0123456789",
        codePoints: null
    },
    "Bold Cursive": {
        chars: "𝓪𝓫𝓬𝓭𝓮𝓯𝓰𝓱𝓲𝓳𝓴𝓵𝓶𝓷𝓸𝓹𝓺𝓻𝓼𝓽𝓾𝓿𝔀𝔁𝔂𝔃𝓐𝓑𝓒𝓓𝓔𝓕𝓖𝓗𝓘𝓙𝓚𝓛𝓜𝓝𝓞𝓟𝓠𝓡𝓢𝓣𝓤𝓥𝓦𝓧𝓨𝓩0123456789",
        codePoints: null
    },
    "Double Struck": {
        chars: "𝕒𝕓𝕔𝕕𝕖𝕗𝕘𝕙𝕚𝕛𝕜𝕝𝕞𝕟𝕠𝕡𝕢𝕣𝕤𝕥𝕦𝕧𝕨𝕩𝕪𝕫𝔸𝔹ℂ𝔻𝔼𝔽𝔾ℍ𝕀𝕁𝕂𝕃𝕄ℕ𝕆ℙℚℝ𝕊𝕋𝕌𝕍𝕎𝕏𝕐ℤ𝟘𝟙𝟚𝟛𝟜𝟝𝟞𝟟𝟠𝟡",
        codePoints: null
    },
    "Bubble": {
        chars: "ⓐⓑⓒⓓⓔⓕⓖⓗⓘⓙⓚⓛⓜⓝⓞⓟⓠⓡⓢⓣⓤⓥⓦⓧⓨⓩⒶⒷⒸⒹⒺⒻⒼⒽⒾⒿⓀⓁⓂⓃⓄⓅⓆⓇⓈⓉⓊⓋⓌⓍⓎⓏ⓪①②③④⑤⑥⑦⑧⑨",
        codePoints: null
    },
    "Black Bubble": {
        chars: "🅐🅑🅒🅓🅔🅕🅖🅗🅘🅙🅚🅛🅜🅝🅞🅟🅠🅡🅢🅣🅤🅥🅦🅧🅨🅩🅐🅑🅒🅓🅔🅕🅖🅗🅘🅙🅚🅛🅜🅝🅞🅟🅠🅡🅢🅣🅤🅥🅦🅧🅨🅩⓿❶❷❸❹❺❻❼❽❾",
        codePoints: null
    },
    "Gothic": {
        chars: "𝔞𝔟𝔠𝔡𝔢𝔣𝔤𝔥𝔦𝔧𝔨𝔩𝔪𝔫𝔬𝔭𝔮𝔯𝔰𝔱𝔲𝔳𝔴𝔵𝔶𝔷𝔄𝔅ℭ𝔇𝔈𝔉𝔊ℌℑ𝔍𝔎𝔏𝔐𝔑𝔒𝔓𝔔ℜ𝔖𝔗𝔘𝔙𝔚𝔛𝔜ℨ0123456789",
        codePoints: null
    },
    "Bold Gothic": {
        chars: "𝖆𝖇𝖈𝖉𝖊𝖋𝖌𝖍𝖎𝖏𝖐𝖑𝖒𝖓𝖔𝖕𝖖𝖗𝖘𝖙𝖚𝖛𝖜𝖝𝖞𝖟𝕬𝕭𝕮𝕯𝕰𝕱𝕲𝕳𝕴𝕵𝕶𝕷𝕸𝕹𝕺𝕻𝕼𝕽𝕾𝕿𝖀𝖁𝖂𝖃𝖄𝖅0123456789",
        codePoints: null
    },
    "Square": {
        chars: "🄰🄱🄲🄳🄴🄵🄶🄷🄸🄹🄺🄻🄼🄽🄾🄿🅀🅁🅂🅃🅄🅅🅆🅇🅈🅉🄰🄱🄲🄳🄴🄵🄶🄷🄸🄹🄺🄻🄼🄽🄾🄿🅀🅁🅂🅃🅄🅅🅆🅇🅈🅉0123456789",
        codePoints: null
    },
    "Black Square": {
        chars: "🅰🅱🅲🅳🅴🅵🅶🅷🅸🅹🅺🅻🅼🅽🅾🅿🆀🆁🆂🆃🆄🆅🆆🆇🆈🆉🅰🅱🅲🅳🅴🅵🅶🅷🅸🅹🅺🅻🅼🅽🅾🅿🆀🆁🆂🆃🆄🆅🆆🆇🆈🆉0123456789",
        codePoints: null
    },
    "Monospace": {
        chars: "𝚊𝚋𝚌𝚍𝚎𝚏𝚐𝚑𝚒𝚓𝚔𝚕𝚖𝚖𝚗𝚘𝚙𝚚𝚛𝚜𝚝𝚞𝚟𝚠𝚡𝚢𝚣𝙰𝙱𝙲𝙳𝙴𝙵𝙶𝙷𝙸𝙹𝙺𝙻𝙼𝙽𝙾𝙿𝚀𝚁𝚂𝚃𝚄𝚅𝚆𝚇𝚈𝚉𝚉𝟶𝟷𝟸𝟹𝟺𝟻𝟼𝟽𝟾𝟿",
        codePoints: null
    },
    "Upside Down": {
        chars: "ɐqɔpǝɟƃɥıɾʞlɯuodbɹsʇnʌʍxʎz∀qƆPƎℲפHIſʞ˥WNOԀQᴚS⊥∩ΛMX⅄Z0ƖᄅƐㄣϛ9ㄥ86",
        codePoints: null
    },
    "Small Caps": "ᴀʙᴄᴅᴇғɢʜɪᴊᴋʟᴍɴᴏᴘǫʀsᴛᴜᴠᴡxʏᴢABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
    "Subscript": "ₐbcdₑfgₕᵢⱼₖₗₘₙₒpqᵣₛₜᵤᵥwₓyzₐBCDₑFGₕᵢⱼₖₗₘₙₒPQᵣₛₜᵤᵥWₓYZ₀₁₂₃₄₅₆₇₈₉",
    "Superscript": "ᵃᵇᶜᵈᵉᶠᵍʰᶦʲᵏˡᵐⁿᵒᵖᵠʳˢᵗᵘᵛʷˣʸᶻᴬᴮᶜᴰᴱᶠᴳᴴᴵᴶᴷᴸᴹᴺᴼᴾQᴿˢᵀᵁⱽᵂˣʸᶻ⁰¹²³⁴⁵⁶⁷⁸⁹",
    "Strikethrough": "a̶b̶c̶d̶e̶f̶g̶h̶i̶j̶k̶l̶m̶n̶o̶p̶q̶r̶s̶t̶u̶v̶w̶x̶y̶z̶A̶B̶C̶D̶E̶F̶G̶H̶I̶J̶K̶L̶M̶N̶O̶P̶Q̶R̶S̶T̶U̶V̶W̶X̶Y̶Z̶0̶1̶2̶3̶4̶5̶6̶7̶8̶9̶",
    "Underline": "a̲b̲c̲d̲e̲f̲g̲h̲i̲j̲k̲l̲m̲n̲o̲p̲q̲r̲s̲t̲u̲v̲w̲x̲y̲z̲A̲B̲C̲D̲E̲F̲G̲H̲I̲J̲K̲L̲M̲N̲O̲P̲Q̲R̲S̲T̲U̲V̲W̲X̲Y̲Z̲0̲1̲2̲3̲4̲5̲6̲7̲8̲9̲",
    "Wide": "ａｂｃｄｅｆｇｈｉｊｋｌｍｎｏｐｑｒｓｔｕｖｗｘｙｚＡＢＣＤＥＦＧＨＩＪＫＬＭＮＯＰＱＲＳＴＵＶＷＸＹＺ０１２３４５６７８９",
    "Parenthesized": "⒜⒝⒞⒟⒠⒡⒢⒣⒤⒥⒦⒧⒨⒩⒪⒫⒬⒭⒮⒯⒰⒱⒲⒳⒴⒵⒜⒝⒞⒟⒠⒡⒢⒣⒤⒥⒦⒧⒨⒩⒪⒫⒬⒭⒮⒯⒰⒱⒲⒳⒴⒵⑴⑵⑶⑷⑸⑹⒇⒢⒣⒤",
    "Tiny": "ᵃᵇᶜᵈᵉᶠᵍʰᶦʲᵏˡᵐⁿᵒᵖᵠʳˢᵗᵘᵛʷˣʸᶻᴬᴮᶜᴰᴱᶠᴳᴴᴵᴶᴷᴸᴹᴺᴼᴾQᴿˢᵀᵁⱽᵂˣʸᶻ⁰¹²³⁴⁵⁶⁷⁸⁹",
    "Zalgo": "a̷b̷c̷d̷e̷f̷g̷h̷i̷j̷k̷l̷m̷n̷o̷p̷q̷r̷s̷t̷u̷v̷w̷x̷y̷z̷A̷B̷C̷D̷E̷F̷G̷H̷I̷J̷K̷L̷M̷N̷O̷P̷Q̷R̷S̷T̷U̷V̷W̷X̷Y̷Z̷0̷1̷2̷3̷4̷5̷6̷7̷8̷9̷",
    "Crossed": "a⃒b⃒c⃒d⃒e⃒f⃒g⃒h⃒i⃒j⃒k⃒l⃒m⃒n⃒o⃒p⃒q⃒r⃒s⃒t⃒u⃒v⃒w⃒x⃒y⃒z⃒A⃒B⃒C⃒D⃒E⃒F⃒G⃒H⃒I⃒J⃒K⃒L⃒M⃒N⃒O⃒P⃒Q⃒R⃒S⃒T⃒U⃒V⃒W⃒X⃒Y⃒Z⃒0⃒1⃒2⃒3⃒4⃒5⃒6⃒7⃒8⃒9⃒",
    "Arrow": "a⃕b⃕c⃕d⃕e⃕f⃕g⃕h⃕i⃕j⃕k⃕l⃕m⃕n⃕o⃕p⃕q⃕r⃕s⃕t⃕u⃕v⃕w⃕x⃕y⃕z⃕A⃕B⃕C⃕D⃕E⃕F⃕G⃕H⃕I⃕J⃕K⃕L⃕M⃕N⃕O⃕P⃕Q⃕R⃕S⃕T⃕U⃕V⃕W⃕X⃕Y⃕Z⃕0⃕1⃕2⃕3⃕4⃕5⃕6⃕7⃕8⃕9⃕",
    "Heart": "a♥b♥c♥d♥e♥f♥g♥h♥i♥j♥k♥l♥m♥n♥o♥p♥q♥r♥s♥t♥u♥v♥w♥x♥y♥z♥A♥B♥C♥D♥E♥F♥G♥H♥I♥J♥K♥L♥M♥N♥O♥P♥Q♥R♥S♥T♥U♥V♥W♥X♥Y♥Z♥0♥1♥2♥3♥4♥5♥6♥7♥8♥9♥",
    "Star": "a★b★c★d★e★f★g★h★i★j★k★l★m★n★o★p★q★r★s★t★u★v★w★x★y★z★A★B★C★D★E★F★G★H★I★J★K★L★M★N★O★P★Q★R★S★T★U★V★W★X★Y★Z★0★1★2★3★4★5★6★7★8★9★",
    "Dot": "ȧḃċḋėḟġḣi̇j̇k̇l̇ṁṅȯṗq̇ṙṡṫu̇v̇ẇẋẏżȦḂĊḊĖḞĠḢİJ̇K̇L̇ṀṄȮṖQ̇ṘṠṪU̇V̇ẆẊẎŻ0̇1̇2̇3̇4̇5̇6̇7̇8̇9̇",
    "Bracket": "【a】【b】【c】【d】【e】【f】【g】【h】【i】【j】【k】【l】【m】【n】【o】【p】【q】【r】【s】【t】【u】【v】【w】【x】【y】【z】【A】【B】【C】【D】【E】【F】【G】【H】【I】【J】【K】【L】【M】【N】【O】【P】【Q】【R】【S】【T】【U】【V】【W】【X】【Y】【Z】【0】【1】【2】【3】【4】【5】【6】【7】【8】【9】",
    "Wave": "a〰b〰c〰d〰e〰f〰g〰h〰i〰j〰k〰l〰m〰n〰o〰p〰q〰r〰s〰t〰u〰v〰w〰x〰y〰z〰A〰B〰C〰D〰E〰F〰G〰H〰I〰J〰K〰L〰M〰N〰O〰P〰Q〰R〰S〰T〰U〰V〰W〰X〰Y〰Z〰0〰1〰2〰3〰4〰5〰6〰7〰8〰9〰"
};

// 基础字符（a-zA-Z0-9）
const baseChars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

// 预处理：创建码点映射
Object.keys(fontMaps).forEach(function(fontName) {
    const fontData = fontMaps[fontName];
    let mapStr = typeof fontData === 'string' ? fontData : fontData.chars;
    
    // 将字符串转换为码点数组
    const codePoints = [];
    for (const char of mapStr) {
        codePoints.push(char.codePointAt(0));
    }
    
    // 创建码点到转换字符的映射
    const charMap = {};
    for (let i = 0; i < baseChars.length; i++) {
        if (codePoints[i] !== undefined) {
            charMap[baseChars[i]] = String.fromCodePoint(codePoints[i]);
        }
    }
    
    if (typeof fontData === 'object') {
        fontData.codePoints = codePoints;
        fontData.charMap = charMap;
    } else {
        fontMaps[fontName] = { chars: mapStr, codePoints: codePoints, charMap: charMap };
    }
});

// 字体名称列表
const fontNames = Object.keys(fontMaps);

// 生成所有字体的转换结果
function generateFonts(inputText) {
    if (!inputText) return [];
    
    const results = [];
    fontNames.forEach(function(fontName) {
        const converted = convertToFont(inputText, fontName);
        results.push({
            name: fontName,
            text: converted
        });
    });
    return results;
}

// 单个文本转换为指定字体
function convertToFont(text, fontName) {
    const fontData = fontMaps[fontName];
    if (!fontData || !fontData.charMap) return text;
    
    let result = '';
    const chars = Array.from(text);
    chars.forEach(function(char) {
        result += fontData.charMap[char] || char;
    });
    return result;
}

// 兼容性别名
function convertText(text, fontName) {
    return convertToFont(text, fontName);
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
