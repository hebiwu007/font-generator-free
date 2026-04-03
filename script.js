/**
 * script.js - Font Generator Free - Core Font Engine
 * 30种 Unicode 花哨字体转换
 * 使用正确的 Unicode 字符映射
 *
 * 重构版本 - 修复 Single/Batch 模式显示问题
 */

// ==================== 基础字符定义 ====================
const baseChars = Array.from('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789');

// ==================== 30 种字体字典 ====================
// 使用 ES6 \u{XXXXX} 转义确保 Unicode 正确（码点超过 BMP 需要 surrogate pairs）

var fontDictionaries = [
  { name: 'Bold',          map: Array.from('\u{1D41A}\u{1D41B}\u{1D41C}\u{1D41D}\u{1D41E}\u{1D41F}\u{1D420}\u{1D421}\u{1D422}\u{1D423}\u{1D424}\u{1D425}\u{1D426}\u{1D427}\u{1D428}\u{1D429}\u{1D42A}\u{1D42B}\u{1D42C}\u{1D42D}\u{1D42E}\u{1D42F}\u{1D430}\u{1D431}\u{1D432}\u{1D433}\u{1D400}\u{1D401}\u{1D402}\u{1D403}\u{1D404}\u{1D405}\u{1D406}\u{1D407}\u{1D408}\u{1D409}\u{1D40A}\u{1D40B}\u{1D40C}\u{1D40D}\u{1D40E}\u{1D40F}\u{1D410}\u{1D411}\u{1D412}\u{1D413}\u{1D414}\u{1D415}\u{1D416}\u{1D417}\u{1D418}\u{1D419}\u{1D7EC}\u{1D7ED}\u{1D7EE}\u{1D7EF}\u{1D7F0}\u{1D7F1}\u{1D7F2}\u{1D7F3}\u{1D7F4}\u{1D7F5}') },
  { name: 'Italic',        map: Array.from('\u{1D44E}\u{1D44F}\u{1D450}\u{1D451}\u{1D452}\u{1D453}\u{1D454}\u{1D455}\u{1D456}\u{1D457}\u{1D458}\u{1D459}\u{1D45A}\u{1D45B}\u{1D45C}\u{1D45D}\u{1D45E}\u{1D45F}\u{1D460}\u{1D461}\u{1D462}\u{1D463}\u{1D464}\u{1D465}\u{1D466}\u{1D467}\u{1D434}\u{1D435}\u{1D436}\u{1D437}\u{1D438}\u{1D439}\u{1D43A}\u{1D43B}\u{1D43C}\u{1D43D}\u{1D43E}\u{1D43F}\u{1D440}\u{1D441}\u{1D442}\u{1D443}\u{1D444}\u{1D445}\u{1D446}\u{1D447}\u{1D448}\u{1D449}\u{1D44A}\u{1D44B}\u{1D44C}\u{1D44D}\u{1D7EC}\u{1D7ED}\u{1D7EE}\u{1D7EF}\u{1D7F0}\u{1D7F1}\u{1D7F2}\u{1D7F3}\u{1D7F4}\u{1D7F5}') },
  { name: 'Bold Italic',   map: Array.from('\u{1D482}\u{1D483}\u{1D484}\u{1D485}\u{1D486}\u{1D487}\u{1D488}\u{1D489}\u{1D48A}\u{1D48B}\u{1D48C}\u{1D48D}\u{1D48E}\u{1D48F}\u{1D490}\u{1D491}\u{1D492}\u{1D493}\u{1D494}\u{1D495}\u{1D496}\u{1D497}\u{1D498}\u{1D499}\u{1D49A}\u{1D49B}\u{1D468}\u{1D469}\u{1D46A}\u{1D46B}\u{1D46C}\u{1D46D}\u{1D46E}\u{1D46F}\u{1D470}\u{1D471}\u{1D472}\u{1D473}\u{1D474}\u{1D475}\u{1D476}\u{1D477}\u{1D478}\u{1D479}\u{1D47A}\u{1D47B}\u{1D47C}\u{1D47D}\u{1D47E}\u{1D47F}\u{1D480}\u{1D481}\u{1D7EC}\u{1D7ED}\u{1D7EE}\u{1D7EF}\u{1D7F0}\u{1D7F1}\u{1D7F2}\u{1D7F3}\u{1D7F4}\u{1D7F5}') },
  { name: 'Double Struck',  map: Array.from('\u{1D552}\u{1D553}\u{1D554}\u{1D555}\u{1D556}\u{1D557}\u{1D558}\u{1D559}\u{1D55A}\u{1D55B}\u{1D55C}\u{1D55D}\u{1D55E}\u{1D55F}\u{1D560}\u{1D561}\u{1D562}\u{1D563}\u{1D564}\u{1D565}\u{1D566}\u{1D567}\u{1D568}\u{1D569}\u{1D56A}\u{1D56B}\u{1D538}\u{1D539}\u{2102}\u{1D53B}\u{1D53C}\u{1D53D}\u{1D53E}\u{210D}\u{1D540}\u{1D541}\u{1D542}\u{1D543}\u{1D544}\u{2115}\u{1D546}\u{2119}\u{211A}\u{211D}\u{1D54A}\u{1D54B}\u{1D54C}\u{1D54D}\u{1D54E}\u{1D54F}\u{1D550}\u{2124}\u{1D7D8}\u{1D7D9}\u{1D7DA}\u{1D7DB}\u{1D7DC}\u{1D7DD}\u{1D7DE}\u{1D7DF}\u{1D7E0}\u{1D7E1}') },
  { name: 'Cursive',       map: Array.from('\u{1D4B6}\u{1D4B7}\u{1D4B8}\u{1D4B9}\u{1D4BA}\u{1D4BB}\u{1D4BC}\u{1D4BD}\u{1D4BE}\u{1D4BF}\u{1D4C0}\u{1D4C1}\u{1D4C2}\u{1D4C3}\u{1D4C4}\u{1D4C5}\u{1D4C6}\u{1D4C7}\u{1D4C8}\u{1D4C9}\u{1D4CA}\u{1D4CB}\u{1D4CC}\u{1D4CD}\u{1D4CE}\u{1D4CF}\u{1D49C}\u{212C}\u{1D49E}\u{1D49F}\u{2130}\u{2131}\u{1D4A5}\u{210B}\u{2110}\u{1D4A9}\u{1D4AA}\u{2133}\u{2134}\u{1D4AE}\u{1D4AF}\u{1D4B0}\u{1D4B1}\u{211B}\u{1D4B4}\u{1D4B5}\u{1D4B6}\u{1D4B7}\u{1D4B8}\u{1D4B9}\u{1D4BA}\u{1D4BB}\u{1D7EC}\u{1D7ED}\u{1D7EE}\u{1D7EF}\u{1D7F0}\u{1D7F1}\u{1D7F2}\u{1D7F3}\u{1D7F4}\u{1D7F5}') },
  { name: 'Gothic',        map: Array.from('\u{1D51E}\u{1D51F}\u{1D520}\u{1D521}\u{1D522}\u{1D523}\u{1D524}\u{1D525}\u{1D526}\u{1D527}\u{1D528}\u{1D529}\u{1D52A}\u{1D52B}\u{1D52C}\u{1D52D}\u{1D52E}\u{1D52F}\u{1D530}\u{1D531}\u{1D532}\u{1D533}\u{1D534}\u{1D535}\u{1D536}\u{1D537}\u{1D504}\u{1D505}\u{212D}\u{1D507}\u{1D508}\u{1D509}\u{1D50A}\u{210C}\u{2111}\u{1D50D}\u{1D50E}\u{1D50F}\u{1D510}\u{1D511}\u{1D512}\u{1D513}\u{1D514}\u{211C}\u{1D516}\u{1D517}\u{1D518}\u{1D519}\u{1D51A}\u{1D51B}\u{1D51C}\u{1D51D}\u{1D7D8}\u{1D7D9}\u{1D7DA}\u{1D7DB}\u{1D7DC}\u{1D7DD}\u{1D7DE}\u{1D7DF}\u{1D7E0}\u{1D7E1}') },
  { name: 'Bold Gothic',   map: Array.from('\u{1D586}\u{1D587}\u{1D588}\u{1D589}\u{1D58A}\u{1D58B}\u{1D58C}\u{1D58D}\u{1D58E}\u{1D58F}\u{1D590}\u{1D591}\u{1D592}\u{1D593}\u{1D594}\u{1D595}\u{1D596}\u{1D597}\u{1D598}\u{1D599}\u{1D59A}\u{1D59B}\u{1D59C}\u{1D59D}\u{1D59E}\u{1D59F}\u{1D56C}\u{1D56D}\u{1D56E}\u{1D56F}\u{1D570}\u{1D571}\u{1D572}\u{1D573}\u{1D574}\u{1D575}\u{1D576}\u{1D577}\u{1D578}\u{1D579}\u{1D57A}\u{1D57B}\u{1D57C}\u{1D57D}\u{1D57E}\u{1D57F}\u{1D580}\u{1D581}\u{1D582}\u{1D583}\u{1D584}\u{1D585}\u{1D7D8}\u{1D7D9}\u{1D7DA}\u{1D7DB}\u{1D7DC}\u{1D7DD}\u{1D7DE}\u{1D7DF}\u{1D7E0}\u{1D7E1}') },
  { name: 'Monospace',     map: Array.from('\u{1D68A}\u{1D68B}\u{1D68C}\u{1D68D}\u{1D68E}\u{1D68F}\u{1D690}\u{1D691}\u{1D692}\u{1D693}\u{1D694}\u{1D695}\u{1D696}\u{1D697}\u{1D698}\u{1D699}\u{1D69A}\u{1D69B}\u{1D69C}\u{1D69D}\u{1D69E}\u{1D69F}\u{1D6A0}\u{1D6A1}\u{1D6A2}\u{1D6A3}\u{1D670}\u{1D671}\u{1D672}\u{1D673}\u{1D674}\u{1D675}\u{1D676}\u{1D677}\u{1D678}\u{1D679}\u{1D67A}\u{1D67B}\u{1D67C}\u{1D67D}\u{1D67E}\u{1D67F}\u{1D680}\u{1D681}\u{1D682}\u{1D683}\u{1D684}\u{1D685}\u{1D686}\u{1D687}\u{1D688}\u{1D689}\u{1D7F6}\u{1D7F7}\u{1D7F8}\u{1D7F9}\u{1D7FA}\u{1D7FB}\u{1D7FC}\u{1D7FD}\u{1D7FE}\u{1D7FF}') },
  { name: 'Bold Cursive',  map: Array.from('\u{1D482}\u{1D483}\u{1D484}\u{1D485}\u{1D486}\u{1D487}\u{1D488}\u{1D489}\u{1D48A}\u{1D48B}\u{1D48C}\u{1D48D}\u{1D48E}\u{1D48F}\u{1D490}\u{1D491}\u{1D492}\u{1D493}\u{1D494}\u{1D495}\u{1D496}\u{1D497}\u{1D498}\u{1D499}\u{1D49A}\u{1D49B}\u{1D468}\u{1D469}\u{1D46A}\u{1D46B}\u{1D46C}\u{1D46D}\u{1D46E}\u{1D46F}\u{1D470}\u{1D471}\u{1D472}\u{1D473}\u{1D474}\u{1D475}\u{1D476}\u{1D477}\u{1D478}\u{1D479}\u{1D47A}\u{1D47B}\u{1D47C}\u{1D47D}\u{1D47E}\u{1D47F}\u{1D480}\u{1D481}\u{1D7EC}\u{1D7ED}\u{1D7EE}\u{1D7EF}\u{1D7F0}\u{1D7F1}\u{1D7F2}\u{1D7F3}\u{1D7F4}\u{1D7F5}') },
  { name: 'Bubble',        map: Array.from('\u24D0\u24D1\u24D2\u24D3\u24D4\u24D5\u24D6\u24D7\u24D8\u24D9\u24DA\u24DB\u24DC\u24DD\u24DE\u24DF\u24E0\u24E1\u24E2\u24E3\u24E4\u24E5\u24E6\u24E7\u24E8\u24E9\u24B6\u24B7\u24B8\u24B9\u24BA\u24BB\u24BC\u24BD\u24BE\u24BF\u24C0\u24C1\u24C2\u24C3\u24C4\u24C5\u24C6\u24C7\u24C8\u24C9\u24CA\u24CB\u24CC\u24CD\u24CE\u24CF\u2460\u2461\u2462\u2463\u2464\u2465\u2466\u2467\u2468\u2469') },
  { name: 'Black Bubble',  map: Array.from('\u{1F170}\u{1F171}\u{1F172}\u{1F173}\u{1F174}\u{1F175}\u{1F176}\u{1F177}\u{1F178}\u{1F179}\u{1F17A}\u{1F17B}\u{1F17C}\u{1F17D}\u{1F17E}\u{1F17F}\u{1F180}\u{1F181}\u{1F182}\u{1F183}\u{1F184}\u{1F185}\u{1F186}\u{1F187}\u{1F188}\u{1F189}\u{1F170}\u{1F171}\u{1F172}\u{1F173}\u{1F174}\u{1F175}\u{1F176}\u{1F177}\u{1F178}\u{1F179}\u{1F17A}\u{1F17B}\u{1F17C}\u{1F17D}\u{1F17E}\u{1F17F}\u{1F180}\u{1F181}\u{1F182}\u{1F183}\u{1F184}\u{1F185}\u{1F186}\u{1F187}\u{1F188}\u{1F189}0123456789') },
  { name: 'Square',        map: Array.from('\u{1F130}\u{1F131}\u{1F132}\u{1F133}\u{1F134}\u{1F135}\u{1F136}\u{1F137}\u{1F138}\u{1F139}\u{1F13A}\u{1F13B}\u{1F13C}\u{1F13D}\u{1F13E}\u{1F13F}\u{1F140}\u{1F141}\u{1F142}\u{1F143}\u{1F144}\u{1F145}\u{1F146}\u{1F147}\u{1F148}\u{1F149}\u{1F130}\u{1F131}\u{1F132}\u{1F133}\u{1F134}\u{1F135}\u{1F136}\u{1F137}\u{1F138}\u{1F139}\u{1F13A}\u{1F13B}\u{1F13C}\u{1F13D}\u{1F13E}\u{1F13F}\u{1F140}\u{1F141}\u{1F142}\u{1F143}\u{1F144}\u{1F145}\u{1F146}\u{1F147}\u{1F148}\u{1F149}0123456789') },
  { name: 'Black Square',  map: Array.from('\u{1F170}\u{1F171}\u{1F172}\u{1F173}\u{1F174}\u{1F175}\u{1F176}\u{1F177}\u{1F178}\u{1F179}\u{1F17A}\u{1F17B}\u{1F17C}\u{1F17D}\u{1F17E}\u{1F17F}\u{1F180}\u{1F181}\u{1F182}\u{1F183}\u{1F184}\u{1F185}\u{1F186}\u{1F187}\u{1F188}\u{1F189}\u{1F170}\u{1F171}\u{1F172}\u{1F173}\u{1F174}\u{1F175}\u{1F176}\u{1F177}\u{1F178}\u{1F179}\u{1F17A}\u{1F17B}\u{1F17C}\u{1F17D}\u{1F17E}\u{1F17F}\u{1F180}\u{1F181}\u{1F182}\u{1F183}\u{1F184}\u{1F185}\u{1F186}\u{1F187}\u{1F188}\u{1F189}0123456789') },
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
  { name: 'Dot',           map: (function(){ var m=[]; 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'.split('').forEach(function(c){m.push(c+'\u0307')}); return m; })() },
  { name: 'Bracket',       map: (function(){ var m=[]; 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'.split('').forEach(function(c){m.push('【'+c+'】')}); return m; })() },
  { name: 'Wave',          map: Array.from('a〰b〰c〰d〰e〰f〰g〰h〰i〰j〰k〰l〰m〰n〰o〰p〰q〰r〰s〰t〰u〰v〰w〰x〰y〰z〰A〰B〰C〰D〰E〰F〰G〰H〰I〰J〰K〰L〰M〰N〰O〰P〰Q〰R〰S〰T〰U〰V〰W〰X〰Y〰Z〰0〰1〰2〰3〰4〰5〰6〰7〰8〰9〰') },
  { name: 'Parenthesized', map: Array.from('⒜⒝⒞⒟⒠⒡⒢⒣⒤⒥⒦⒧⒨⒩⒪⒫⒬⒭⒮⒯⒰⒱⒲⒳⒴⒵⒜⒝⒞⒟⒠⒡⒢⒣⒤⒥⒦⒧⒨⒩⒪⒫⒬⒭⒮⒯⒰⒱⒲⒳⒴⒵⑴⑵⑶⑷⑸⑹⑺⑻⑼⑽') },
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

// 旧版 Black Bubble 映射的反向映射（兼容旧数据）
// 旧版使用 U+1F150-U+1F169 (uppercase) 和 U+1F180-U+1F199 (lowercase)
// 新版统一使用 U+1F170-U+1F189
(function() {
  var oldUpperStart = 0x1F150;
  var oldLowerStart = 0x1F180;
  var base = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  for (var i = 0; i < 26; i++) {
    var oldLowerChar = String.fromCodePoint(oldLowerStart + i);
    var oldUpperChar = String.fromCodePoint(oldUpperStart + i);
    if (!reverseCharMap.has(oldLowerChar)) reverseCharMap.set(oldLowerChar, base[i]);
    if (!reverseCharMap.has(oldUpperChar)) reverseCharMap.set(oldUpperChar, base[i + 26]);
  }
})();

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

  function safeName(s) { return s.replace(/[^a-zA-Z0-9._-]/g, '_'); }

  if (format === 'merged') {
    // Merged: 一个文件包含所有结果
    zip.file('all-results.txt', generateTXTContent(results, 'merged'));

  } else if (format === 'byFont') {
    // By Font: 每种字体×每个来源 = 一个文件，命名: 字体名-来源名.txt
    var groups = {};
    results.forEach(function(r) {
      var key = r.font + '|||' + r.source;
      if (!groups[key]) groups[key] = { font: r.font, source: r.source, outputs: [] };
      groups[key].outputs.push(r.output);
    });
    Object.keys(groups).forEach(function(key) {
      var g = groups[key];
      var content = g.outputs.join('\n');
      zip.file(safeName(g.font) + '-' + safeName(g.source) + '.txt', content);
    });

  } else if (format === 'bySource') {
    // By Source: 每个来源×每种字体 = 一个文件，命名: 来源名-字体名.txt
    var groups2 = {};
    results.forEach(function(r) {
      var key = r.source + '|||' + r.font;
      if (!groups2[key]) groups2[key] = { source: r.source, font: r.font, outputs: [] };
      groups2[key].outputs.push(r.output);
    });
    Object.keys(groups2).forEach(function(key) {
      var g = groups2[key];
      var content = g.outputs.join('\n');
      zip.file(safeName(g.source) + '-' + safeName(g.font) + '.txt', content);
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
  var htmlBody = buildResultHTMLBody(groups);

  // 用 SVG foreignObject 将 HTML 渲染到 Canvas
  var width = 800;
  var svgData = '<svg xmlns="http://www.w3.org/2000/svg" width="' + width + '">' +
    '<foreignObject width="100%" height="100%">' +
    '<div xmlns="http://www.w3.org/1999/xhtml" style="font-family:Segoe UI Symbol,Noto Sans,Noto Sans Symbols 2,Apple Color Emoji,sans-serif;padding:30px;background:#fff;color:#1e40af;">' +
    htmlBody +
    '</div></foreignObject></svg>';

  var svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
  var url = URL.createObjectURL(svgBlob);
  var img = new Image();
  img.onload = function() {
    var canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    var ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);
    URL.revokeObjectURL(url);

    var link = document.createElement('a');
    link.download = 'font-results-' + Date.now() + '.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
    showToast('PNG downloaded!');
  };
  img.onerror = function() {
    URL.revokeObjectURL(url);
    // Fallback: 新窗口打开
    var fallbackHtml = '<!DOCTYPE html><html><head><meta charset="utf-8"><style>body{font-family:Segoe UI Symbol,Noto Sans,sans-serif;padding:30px;color:#1e40af;}</style></head><body>' + htmlBody + '</body></html>';
    var blob = new Blob([fallbackHtml], { type: 'text/html;charset=utf-8' });
    window.open(URL.createObjectURL(blob), '_blank');
    showToast('Opened in new tab - right-click to save image');
  };
  img.src = url;
}

// 📕 PDF 下载（新窗口 + 自动打印）
function downloadAsPDF() {
  var results = window._batchResults;
  if (!results || !results.length) { showToast('No results'); return; }

  var format = getOutputFormat();
  var groups = groupResults(results, format);
  var htmlBody = buildResultHTMLBody(groups);

  var fullHTML = '<!DOCTYPE html><html><head><meta charset="utf-8"><title>Font Generator Results</title>' +
    '<style>@page{margin:15mm;}body{font-family:Segoe UI Symbol,Noto Sans,Noto Sans Symbols 2,Apple Color Emoji,sans-serif;padding:20px;color:#1e40af;font-size:14px;line-height:1.6;}' +
    '.group-title{font-weight:bold;color:#374151;margin-top:12px;border-bottom:1px solid #ddd;padding-bottom:4px;}' +
    '.result-line{padding:2px 0 2px 8px;white-space:pre-wrap;word-break:break-all;}' +
    '.watermark{font-size:10px;color:#999;margin-top:20px;}</style></head><body>' +
    htmlBody +
    '</body></html>';

  var blob = new Blob([fullHTML], { type: 'text/html;charset=utf-8' });
  var url = URL.createObjectURL(blob);
  var w = window.open(url, '_blank');
  if (w) {
    w.onload = function() {
      setTimeout(function() { w.print(); }, 500);
    };
  }
  showToast('PDF opened - use Save as PDF in print dialog');
}

// 构建结果 HTML body 内容
function buildResultHTMLBody(groups) {
  var parts = [];
  parts.push('<div style="font-size:20px;font-weight:bold;margin-bottom:20px;">Font Generator Results</div>');
  groups.forEach(function(group) {
    parts.push('<div class="group-title" style="font-weight:bold;color:#374151;margin-top:12px;border-bottom:1px solid #e5e7eb;padding-bottom:4px;">── ' + escapeHtml(group.title) + ' ──</div>');
    group.items.forEach(function(r) {
      parts.push('<div class="result-line" style="padding:2px 0 2px 12px;white-space:pre-wrap;word-break:break-all;">' + escapeHtml(r.output) + '</div>');
    });
  });
  parts.push('<div class="watermark" style="font-size:11px;color:#9ca3af;margin-top:16px;">Generated by Font Generator Free</div>');
  return parts.join('');
}

function downloadFile(filename, content, mimeType) {
  // 添加 UTF-8 BOM 确保编码正确
  var BOM = '\uFEFF';
  var blob = new Blob([BOM + content], { type: (mimeType || 'text/plain') + '; charset=utf-8' });
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
