/**
 * script.js - Font Generator Free - Core Font Engine
 * 只提供字体转换核心函数，不做UI初始化
 * UI逻辑由 index.html 处理
 */

// 1. 定义基础字符和对应的高频 Unicode 字体映射字典
const baseChars = Array.from("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789");

const fontDictionaries = [
    { name: "Bold", map: Array.from("𝗮𝗯𝗰𝗱𝗲𝗳𝗴𝗵𝗶𝗷𝗸𝗹𝗺𝗻𝗼𝗽𝗾𝗿𝘀𝘁𝘂𝘃𝘄𝘅𝘆𝘇𝗔𝗕𝗖𝗗𝗘𝗙𝗚𝗛𝗜𝗝𝗞𝗟𝗠𝗡𝗢𝗣𝗤𝗥𝗦𝗧𝗨𝗩𝗪𝗫𝗬𝗭𝟬𝟭𝟮𝟯𝟰𝟱𝟲𝟳𝟴𝟵") },
    { name: "Italic", map: Array.from("𝘢𝘣𝘤𝘥𝘦𝘧𝘨𝘩𝘪𝘫𝘬𝘭𝘮𝘯𝘰𝘱𝘦𝘳𝘴𝘵𝘶𝘷𝘸𝘹𝘺𝘻𝘈𝘉𝘊𝘋𝘌𝘍𝘎𝘏𝘐𝘑𝘒𝘓𝘔𝘕𝘖𝘗𝘘𝘙𝘚𝘛𝘜𝘝𝘞𝘟𝘠𝘡0123456789") },
    { name: "Bold Italic", map: Array.from("𝙖𝙗𝙘𝙙𝙚𝙛𝙜𝙝𝙞𝙟𝙠𝙡𝙢𝙣𝙤𝙥𝙦𝙧𝙨𝙩𝙪𝙫𝙬𝙭𝙮𝙯𝘈𝘉𝘊𝘋𝘌𝘍𝘎𝘏𝘐𝘑𝘒𝘓𝘔𝘕𝘖𝘗𝘘𝘙𝘚𝘛𝘜𝘝𝘞𝘟𝘠𝘡0123456789") },
    { name: "Cursive", map: Array.from("𝒶𝒷𝒸𝒹𝑒𝒻𝑔𝒽𝒾𝒿𝓀𝓁𝓂𝓃ℴ𝓅𝓆𝓇𝓈𝓉𝓊𝓋𝓌𝓍𝓎𝓏𝒶𝐵𝒞𝒟𝐸𝐹𝒢𝐻𝐼𝒥𝒦𝐿𝑀𝒩𝒪𝒫𝒬𝑅𝒮𝒯𝒰𝒱𝒲𝒳𝒴𝒵0123456789") },
    { name: "Bold Cursive", map: Array.from("𝓪𝓫𝓬𝓭𝓮𝓯𝓰𝓱𝓲𝓳𝓴𝓵𝓶𝓷𝓸𝓹𝓺𝓻𝓼𝓽𝓾𝓿𝔀𝔁𝔂𝔃𝓐𝓑𝓒𝓓𝓔𝓕𝓖𝓗𝓘𝓙𝓚𝓛𝓜𝓝𝓞𝓟𝓠𝓡𝓢𝓣𝓤𝓥𝓦𝓧𝓨𝓩0123456789") },
    { name: "Double Struck", map: Array.from("𝕒𝕓𝕔𝕕𝕖𝕗𝕘𝕙𝕚𝕛𝕜𝕝𝕞𝕟𝕠𝕡𝕢𝕣𝕤𝕥𝕦𝕧𝕨𝕩𝕪𝕫𝔸𝔹ℂ𝔻𝔼𝔽𝔾ℍ𝕀𝕁𝕂𝕃𝕄ℕ𝕆ℙℚℝ𝕊𝕋𝕌𝕍𝕎𝕏𝕐ℤ𝟘𝟙𝟚𝟛𝟜𝟝𝟞𝟟𝟠𝟡") },
    { name: "Bubble", map: Array.from("ⓐⓑⓒⓓⓔⓕⓖⓗⓘⓙⓚⓛⓜⓝⓞⓟⓠⓡⓢⓣⓤⓥⓦⓧⓨⓩⒶⒷⒸⒹⒺⒻⒼⒽⒾⒿⓀⓁⓂⓃⓄⓅⓆⓇⓈⓉⓊⓋⓌⓍⓎⓏ⓪①②③④⑤⑥⑦⑧⑨") },
    { name: "Black Bubble", map: Array.from("🅐🅑🅒🅓🅔🅕🅖🅗🅘🅙🅚🅛🅜🅝🅞🅟🅠🅡🅢🅣🅤🅥🅦🅧🅨🅩🅐🅑🅒🅓🅔🅕🅖🅗🅘🅙🅚🅛🅜🅝🅞🅟🅠🅡🅢🅣🅤🅥🅦🅧🅨🅩⓿❶❷❸❹❺❻❼❽❾") },
    { name: "Gothic", map: Array.from("𝔞𝔟𝔠𝔡𝔢𝔣𝔤𝔥𝔦𝔧𝔨𝔩𝔪𝔫𝔬𝔭𝔮𝔯𝔰𝔱𝔲𝔳𝔴𝔵𝔶𝔷𝔄𝔅ℭ𝔇𝔈𝔉𝔊ℌℑ𝔍𝔎𝔏𝔐𝔑𝔒𝔓𝔔ℜ𝔖𝔗𝔘𝔙𝔚𝔛𝔜ℨ0123456789") },
    { name: "Bold Gothic", map: Array.from("𝖆𝖇𝖈𝖉𝖊𝖋𝖌𝖍𝖎𝖏𝖐𝖑𝖒𝖓𝖔𝖕𝖖𝖗𝖘𝖙𝖚𝖛𝖜𝖝𝖞𝖟𝕬𝕭𝕮𝕯𝕰𝕱𝕲𝕳𝕴𝕵𝕶𝕷𝕸𝕹𝕺𝕻𝕼𝕽𝕾𝕿𝖀𝖁𝖂𝖃𝖄𝖅0123456789") },
    { name: "Square", map: Array.from("🄰🄱🄲🄳🄴🄵🄶🄷🄸🄹🄺🄻🄼🄽🄾🄿🅀🅁🅂🅃🅄🅅🅆🅇🅈🅉🄰🄱🄲🄳🄴🄵🄶🄷🄸🄹🄺🄻🄼🄽🄾🄿🅀🅁🅂🅃🅄🅅🅆🅇🅈🅉0123456789") },
    { name: "Black Square", map: Array.from("🅰🅱🅲🅳🅴🅵🅶🅷🅸🅹🅺🅻🅼🅽🅾🅿🆀🆁🆂🆃🆄🆅🆆🆇🆈🆉🅰🅱🅲🅳🅴🅵🅶🅷🅸🅹🅺🅻🅼🅽🅾🅿🆀🆁🆂🆃🆄🆅🆆🆇🆈🆉0123456789") },
    { name: "Monospace", map: Array.from("𝚊𝚋𝚌𝚍𝚎𝚏𝚐𝚑𝚒𝚓𝚔𝚕𝚖𝚗𝚘𝚙𝚚𝚛𝚜𝚝𝚞𝚟𝚠𝚡𝚢𝚣𝙰𝙱𝙲𝙳𝙴𝙵𝙶𝙷𝙸𝙹𝙺𝙻𝙼𝙽𝙾𝙿𝚀𝚁𝚂𝚃𝚄𝚅𝚆𝚇𝚈𝚉𝟶𝟷𝟸𝟹𝟺𝟻𝟼𝟽𝟾𝟿") },
    { name: "Upside Down", map: Array.from("ɐqɔpǝɟƃɥıɾʞlɯuodbɹsʇnʌʍxʎz∀qƆPƎℲפHIſʞ˥WNOԀQᴚS⊥∩ΛMX⅄Z0ƖᄅƐㄣϛ9ㄥ86") },
    { name: "Small Caps", map: Array.from("ᴀʙᴄᴅᴇғɢʜɪᴊᴋʟᴍɴᴏᴘǫʀsᴛᴜᴠᴡxʏᴢABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789") },
    { name: "Subscript", map: Array.from("ₐbcdₑfgₕᵢⱼₖₗₘₙₒpqᵣₛₜᵤᵥwₓyzₐBCDₑFGₕᵢⱼₖₗₘₙₒPQᵣₛₜᵤᵥWₓYZ₀₁₂₃₄₅₆₇₈₉") },
    { name: "Superscript", map: Array.from("ᵃᵇᶜᵈᵉᶠᵍʰᶦʲᵏˡᵐⁿᵒᵖᵠʳˢᵗᵘᵛʷˣʸᶻᴬᴮᶜᴰᴱᶠᴳᴴᴵᴶᴷᴸᴹᴺᴼᴾQᴿˢᵀᵁⱽᵂˣʸᶻ⁰¹²³⁴⁵⁶⁷⁸⁹") },
    { name: "Strikethrough", map: Array.from("a̶b̶c̶d̶e̶f̶g̶h̶i̶j̶k̶l̶m̶n̶o̶p̶q̶r̶s̶t̶u̶v̶w̶x̶y̶z̶A̶B̶C̶D̶E̶F̶G̶H̶I̶J̶K̶L̶M̶N̶O̶P̶Q̶R̶S̶T̶U̶V̶W̶X̶Y̶Z̶0̶1̶2̶3̶4̶5̶6̶7̶8̶9̶") },
    { name: "Underline", map: Array.from("a̲b̲c̲d̲e̲f̲g̲h̲i̲j̲k̲l̲m̲n̲o̲p̲q̲r̲s̲t̲u̲v̲w̲x̲y̲z̲A̲B̲C̲D̲E̲F̲G̲H̲I̲J̲K̲L̲M̲N̲O̲P̲Q̲R̲S̲T̲U̲V̲W̲X̲Y̲Z̲0̲1̲2̲3̲4̲5̲6̲7̲8̲9̲") },
    { name: "Wide", map: Array.from("ａｂｃｄｅｆｇｈｉｊｋｌｍｎｏｐｑｒｓｔｕｖｗｘｙｚＡＢＣＤＥＦＧＨＩＪＫＬＭＮＯＰＱＲＳＴＵＶＷＸＹＺ０１２３４５６７８９") },
    { name: "Parenthesized", map: Array.from("⒜⒝⒞⒟⒠⒡⒢⒣⒤⒥⒦⒧⒨⒩⒪⒫⒬⒭⒮⒯⒰⒱⒲⒳⒴⒵⒜⒝⒞⒟⒠⒡⒢⒣⒤⒥⒦⒧⒨⒩⒪⒫⒬⒭⒮⒯⒰⒱⒲⒳⒴⒵⑴⑵⑶⑷⑸⑹⒇⒢⒣⒤") },
    { name: "Tiny", map: Array.from("ᵃᵇᶜᵈᵉᶠᵍʰᶦʲᵏˡᵐⁿᵒᵖᵠʳˢᵗᵘᵛʷˣʸᶻᴬᴮᶜᴰᴱᶠᴳᴴᴵᴶᴷᴸᴹᴺᴼᴾQᴿˢᵀᵁⱽᵂˣʸᶻ⁰¹²³⁴⁵⁶⁷⁸⁹") },
    { name: "Zalgo", map: Array.from("a̷b̷c̷d̷e̷f̷g̷h̷i̷j̷k̷l̷m̷n̷o̷p̷q̷r̷s̷t̷u̷v̷w̷x̷y̷z̷A̷B̷C̷D̷E̷F̷G̷H̷I̷J̷K̷L̷M̷N̷O̷P̷Q̷R̷S̷T̷U̷V̷W̷X̷Y̷Z̷0̷1̷2̷3̷4̷5̷6̷7̷8̷9̷") },
    { name: "Crossed", map: Array.from("a⃒b⃒c⃒d⃒e⃒f⃒g⃒h⃒i⃒j⃒k⃒l⃒m⃒n⃒o⃒p⃒q⃒r⃒s⃒t⃒u⃒v⃒w⃒x⃒y⃒z⃒A⃒B⃒C⃒D⃒E⃒F⃒G⃒H⃒I⃒J⃒K⃒L⃒M⃒N⃒O⃒P⃒Q⃒R⃒S⃒T⃒U⃒V⃒W⃒X⃒Y⃒Z⃒0⃒1⃒2⃒3⃒4⃒5⃒6⃒7⃒8⃒9⃒") },
    { name: "Arrow", map: Array.from("a⃕b⃕c⃕d⃕e⃕f⃕g⃕h⃕i⃕j⃕k⃕l⃕m⃕n⃕o⃕p⃕q⃕r⃕s⃕t⃕u⃕v⃕w⃕x⃕y⃕z⃕A⃕B⃕C⃕D⃕E⃕F⃕G⃕H⃕I⃕J⃕K⃕L⃕M⃕N⃕O⃕P⃕Q⃕R⃕S⃕T⃕U⃕V⃕W⃕X⃕Y⃕Z⃕0⃕1⃕2⃕3⃕4⃕5⃕6⃕7⃕8⃕9⃕") },
    { name: "Heart", map: Array.from("a♥b♥c♥d♥e♥f♥g♥h♥i♥j♥k♥l♥m♥n♥o♥p♥q♥r♥s♥t♥u♥v♥w♥x♥y♥z♥A♥B♥C♥D♥E♥F♥G♥H♥I♥J♥K♥L♥M♥N♥O♥P♥Q♥R♥S♥T♥U♥V♥W♥X♥Y♥Z♥0♥1♥2♥3♥4♥5♥6♥7♥8♥9♥") },
    { name: "Star", map: Array.from("a★b★c★d★e★f★g★h★i★j★k★l★m★n★o★p★q★r★s★t★u★v★w★x★y★z★A★B★C★D★E★F★G★H★I★J★K★L★M★N★O★P★Q★R★S★T★U★V★W★X★Y★Z★0★1★2★3★4★5★6★7★8★9★") },
    { name: "Dot", map: Array.from("ȧḃċḋėḟġḣi̇j̇k̇l̇ṁṅȯṗq̇ṙṡṫu̇v̇ẇẋẏżȦḂĊḊĖḞĠḢİJ̇K̇L̇ṀṄȮṖQ̇ṘṠṪU̇V̇ẆẊẎŻ0̇1̇2̇3̇4̇5̇6̇7̇8̇9̇") },
    { name: "Bracket", map: Array.from("【a】【b】【c】【d】【e】【f】【g】【h】【i】【j】【k】【l】【m】【n】【o】【p】【q】【r】【s】【t】【u】【v】【w】【x】【y】【z】【A】【B】【C】【D】【E】【F】【G】【H】【I】【J】【K】【L】【M】【N】【O】【P】【Q】【R】【S】【T】【U】【V】【W】【X】【Y】【Z】【0】【1】【2】【3】【4】【5】【6】【7】【8】【9】") },
    { name: "Wave", map: Array.from("a〰b〰c〰d〰e〰f〰g〰h〰i〰j〰k〰l〰m〰n〰o〰p〰q〰r〰s〰t〰u〰v〰w〰x〰y〰z〰A〰B〰C〰D〰E〰F〰G〰H〰I〰J〰K〰L〰M〰N〰O〰P〰Q〰R〰S〰T〰U〰V〰W〰X〰Y〰Z〰0〰1〰2〰3〰4〰5〰6〰7〰8〰9〰") }
];

// 字体名称数组（供UI使用）
const fontNames = fontDictionaries.map(f => f.name);

// 预处理映射表
fontDictionaries.forEach(font => {
    font.charMap = new Map();
    baseChars.forEach((char, index) => {
        font.charMap.set(char, font.map[index]);
    });
});

// 核心转换算法
function generateFonts(inputText) {
    if (!inputText) return [];
    const inputChars = Array.from(inputText);
    return fontDictionaries.map(font => {
        const transformedText = inputChars.map(char => {
            return font.charMap.get(char) || char;
        }).join('');
        return { name: font.name, text: transformedText };
    });
}

// 单个文本转换为单个字体
function convertText(text, fontName) {
    const font = fontDictionaries.find(f => f.name === fontName);
    if (!font) return text;
    
    const inputChars = Array.from(text);
    return inputChars.map(char => {
        return font.charMap.get(char) || char;
    }).join('');
}

// 复制到剪贴板
window.copyToClipboard = function(text, btn) {
    navigator.clipboard.writeText(text).then(function() {
        // 按钮反馈
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
        
        // Toast 提示
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
