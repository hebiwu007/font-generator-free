import re

from jsdom import JSDOM;
const fs = require('fs');

const code = fs.readFileSync('script.js', 'utf8');

const lines = code.split('\n');
    let startIdx = lines.indexOf('const reverseCharMap = new Map();');
    let endIdx = lines.indexOf('    font.charMap = new Map();');
    if (startIdx === -1 || endIdx === -1) {
        // 替换 charMap 构建逻辑
        old_code = lines[startIdx];
        new_code = lines[startIdx] + 
`    // 修复 charMap 构建：排除组合字符字体的错误 is isCombiningFont 检测
        // 添加对所有组合字体的排除
        const combiningFonts = ['Strikethrough', 'Underline', 'Zalgo', 'Heart', 'Star', 'Wave', 'Crossed', 'Arrow', 'Dot', 'Bracket', 'Parenthesized'];
        const combiningFontNames = new Set(combiningFonts);
        
        const newPreprocess = `
fontDictionaries.forEach(font => {
    font.charMap = new Map();
    const mapArr = font.map;
    const isCombiningFont = combiningFontNames.has(font.name);
    
    baseChars.forEach((char, index) => {
        if (isCombiningFont) {
            font.charMap.set(char, mapArr[index * 2] + mapArr[index * 2 + 1]);
        } else {
            font.charMap.set(char, mapArr[index]);
        }
        const specialChar = font.charMap.get(char);
        if (specialChar && char !== specialChar) {
            reverseCharMap.set(specialChar, char);
        }
    });
});`;
`;
        new_code = new_code.replace(old_code, lines[endIdx]));
        
        with open('script.js', 'w') as f:
            f.write(content);
        
        console("✅ 修复完成！");
