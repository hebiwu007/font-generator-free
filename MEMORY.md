
## 2026-04-02 更新

### 新增功能
1. **跨字体转换** - 自动识别输入字体并转换为目标字体
2. **修正 Gothic/Fraktur Unicode 映射**
3. **修正 Black Bubble Unicode 映射**
4. **下载功能** - TXT/HTML/PNG/PDF 四种格式
5. **重构历史记录页面** - 更好的 UI/UX

### 文件变更
- script.js: 跨字体转换逻辑、反向映射表
- index.html: 下载按钮（4种格式）
- history.html: 重构版本（筛选、弹窗、复制）
- preview-test.html: 预览测试页面

### 测试链接
- 预览测试: https://cdn.jsdelivr.net/gh/hebiwu007/font-generator-free@main/preview-test.html
- 主站: https://fontgeneratorfree.online/

### 注意事项
- Cloudflare Pages 部署可能需要 1-2 分钟
- 如遇缓存问题，使用 Ctrl+F5 强制刷新
- jsDelivr CDN 会立即反映最新代码
