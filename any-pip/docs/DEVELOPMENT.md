# Chrome扩展开发调试指南

## 🚀 快速开始

### 1. 环境准备

确保你已安装以下工具：
- Node.js (v16+)
- npm 或 yarn
- Chrome浏览器

### 2. 安装依赖

\`\`\`bash
# 克隆项目
git clone <your-repo-url>
cd chrome-pip-plugin

# 安装依赖
npm install
\`\`\`

### 3. 构建项目

\`\`\`bash
# 开发模式构建（带监听）
npm run dev

# 生产模式构建
npm run build
\`\`\`

## 🔧 加载扩展到Chrome

### 方法一：开发者模式加载

1. **打开Chrome扩展管理页面**
   - 在地址栏输入：`chrome://extensions/`
   - 或者：菜单 → 更多工具 → 扩展程序

2. **启用开发者模式**
   - 点击右上角的"开发者模式"开关

3. **加载未打包的扩展程序**
   - 点击"加载已解压的扩展程序"
   - 选择项目的 `dist` 文件夹

4. **确认加载成功**
   - 扩展应该出现在列表中
   - 工具栏会显示扩展图标

### 方法二：使用脚本自动加载

\`\`\`bash
# 构建并自动在Chrome中加载
npm run dev:chrome
\`\`\`

## 🐛 调试技巧

### 1. 背景脚本调试

**查看背景脚本日志：**
1. 进入 `chrome://extensions/`
2. 找到你的扩展
3. 点击"检查视图"下的"背景页"
4. 在开发者工具的Console中查看日志

**常用调试代码：**
\`\`\`javascript
// 在background/index.ts中添加
console.log('Background script loaded')
console.log('Message received:', message)
\`\`\`

### 2. 内容脚本调试

**在网页中调试：**
1. 打开任意网页（如YouTube）
2. 按F12打开开发者工具
3. 在Console中查看内容脚本的日志

**常用调试代码：**
\`\`\`javascript
// 在content/index.ts中添加
console.log('Content script loaded on:', window.location.href)
console.log('Videos detected:', videos.length)
\`\`\`

### 3. 弹出窗口调试

**调试弹出窗口：**
1. 右键点击扩展图标
2. 选择"检查弹出内容"
3. 在开发者工具中调试Vue组件

### 4. 选项页面调试

**调试选项页面：**
1. 右键扩展图标 → 选项
2. 在选项页面按F12
3. 正常调试Vue应用

## 📝 开发工作流

### 1. 实时开发

\`\`\`bash
# 启动开发模式
npm run dev

# 在另一个终端监听文件变化
npm run watch
\`\`\`

### 2. 代码修改后的步骤

1. **修改代码**
2. **等待自动构建完成**（如果使用`npm run dev`）
3. **刷新扩展**：
   - 进入 `chrome://extensions/`
   - 点击扩展的刷新按钮 🔄
4. **刷新测试页面**（如果修改了内容脚本）

### 3. 快速刷新脚本

创建一个快速刷新的脚本：

\`\`\`bash
# 添加到package.json的scripts中
"refresh": "npm run build && echo '请手动刷新Chrome扩展'"
\`\`\`

## 🔍 常见问题排查

### 1. 扩展无法加载

**检查清单：**
- [ ] `manifest.json` 语法是否正确
- [ ] `dist` 文件夹是否存在
- [ ] 构建是否成功完成
- [ ] 权限配置是否正确

**解决方法：**
\`\`\`bash
# 重新构建
npm run build

# 检查构建输出
ls -la dist/
\`\`\`

### 2. 内容脚本不工作

**检查清单：**
- [ ] `matches` 配置是否正确
- [ ] 页面是否符合匹配规则
- [ ] 脚本是否有语法错误

**调试方法：**
\`\`\`javascript
// 在content script开头添加
console.log('Content script injected into:', window.location.href)
\`\`\`

### 3. 背景脚本错误

**常见错误：**
- Service Worker语法错误
- 权限不足
- API调用失败

**调试方法：**
1. 查看背景页控制台
2. 检查权限配置
3. 验证API调用

### 4. 弹出窗口空白

**可能原因：**
- Vue构建错误
- 路径配置错误
- CSP策略限制

**解决方法：**
\`\`\`bash
# 检查构建日志
npm run build -- --verbose

# 检查生成的文件
cat dist/popup.html
\`\`\`

## 🛠️ 开发工具推荐

### 1. Chrome扩展开发工具

- **Extension Reloader**：自动刷新扩展
- **Vue.js devtools**：调试Vue组件
- **React Developer Tools**：如果使用React

### 2. VS Code插件

- **Chrome Extension**：语法高亮和代码补全
- **Vue Language Features (Volar)**：Vue3支持
- **TypeScript Importer**：自动导入

### 3. 调试配置

创建 `.vscode/launch.json`：

\`\`\`json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Launch Chrome",
      "request": "launch",
      "type": "chrome",
      "url": "chrome://extensions/",
      "webRoot": "${workspaceFolder}/dist"
    }
  ]
}
\`\`\`

## 📊 性能调试

### 1. 内存使用监控

\`\`\`javascript
// 在background script中
setInterval(() => {
  console.log('Memory usage:', performance.memory)
}, 10000)
\`\`\`

### 2. 网络请求监控

\`\`\`javascript
// 监控fetch请求
const originalFetch = window.fetch
window.fetch = function(...args) {
  console.log('Fetch request:', args[0])
  return originalFetch.apply(this, args)
}
\`\`\`

### 3. 性能分析

使用Chrome DevTools的Performance面板：
1. 打开扩展的调试窗口
2. 切换到Performance标签
3. 录制性能数据
4. 分析瓶颈

## 🧪 测试策略

### 1. 手动测试清单

**基础功能：**
- [ ] 扩展正常加载
- [ ] 图标显示正确
- [ ] 弹出窗口打开
- [ ] 设置页面可访问

**核心功能：**
- [ ] 视频检测正常
- [ ] PiP激活成功
- [ ] 快捷键响应
- [ ] 右键菜单工作

**平台兼容性：**
- [ ] YouTube正常工作
- [ ] Bilibili正常工作
- [ ] Netflix正常工作
- [ ] 其他HTML5视频网站

### 2. 自动化测试

\`\`\`javascript
// 简单的功能测试
function testVideoDetection() {
  const videos = document.querySelectorAll('video')
  console.log(`Found ${videos.length} videos`)
  return videos.length > 0
}

// 在console中运行
testVideoDetection()
\`\`\`

### 3. 错误监控

\`\`\`javascript
// 全局错误捕获
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error)
})

// Promise错误捕获
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason)
})
\`\`\`

## 📦 发布准备

### 1. 构建检查

\`\`\`bash
# 生产构建
npm run build

# 检查文件大小
du -sh dist/*

# 验证manifest
cat dist/manifest.json | jq .
\`\`\`

### 2. 图标检查

确保所有尺寸的图标都存在：
\`\`\`bash
ls -la icons/icon*.png
\`\`\`

### 3. 权限审查

检查是否使用了最小权限原则：
- 只请求必要的权限
- host_permissions尽可能具体
- 避免使用过于宽泛的权限

## 🔄 持续开发

### 1. Git工作流

\`\`\`bash
# 功能开发
git checkout -b feature/new-platform-support
# 开发...
git commit -m "feat: add support for new platform"
git push origin feature/new-platform-support
\`\`\`

### 2. 版本管理

更新版本号：
\`\`\`bash
# 更新package.json和manifest.json
npm version patch
\`\`\`

### 3. 自动化脚本

\`\`\`bash
# 完整的开发流程
npm run dev:full
\`\`\`

这个脚本应该包括：
- 构建项目
- 刷新扩展
- 打开测试页面
- 显示调试信息
