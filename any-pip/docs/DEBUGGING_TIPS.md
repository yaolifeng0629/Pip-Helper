# Chrome扩展调试技巧大全

## 🔍 调试工具和方法

### 1. Chrome开发者工具

#### 背景脚本调试
\`\`\`javascript
// 在background/index.ts中添加调试代码
console.log('🚀 Background script started')
console.log('📨 Message received:', message)
console.error('❌ Error occurred:', error)

// 使用debugger断点
debugger; // 代码会在此处暂停
\`\`\`

#### 内容脚本调试
\`\`\`javascript
// 在content/index.ts中添加调试代码
console.log('📄 Content script loaded on:', window.location.href)
console.log('🎥 Videos found:', videos.length)

// 检查DOM元素
console.log('🔍 Video elements:', document.querySelectorAll('video'))
\`\`\`

### 2. Vue组件调试

#### 弹出窗口调试
\`\`\`vue
<script setup>
// 在PopupApp.vue中添加调试
import { ref, onMounted, watch } from 'vue'

const videos = ref([])

// 监听数据变化
watch(videos, (newVideos) => {
  console.log('📺 Videos updated:', newVideos)
}, { deep: true })

// 组件挂载时调试
onMounted(() => {
  console.log('🎯 Popup component mounted')
})
</script>
\`\`\`

### 3. 网络请求调试

\`\`\`javascript
// 监听所有fetch请求
const originalFetch = window.fetch
window.fetch = function(...args) {
  console.log('🌐 Fetch request:', args[0])
  return originalFetch.apply(this, args)
    .then(response => {
      console.log('✅ Fetch response:', response.status)
      return response
    })
    .catch(error => {
      console.error('❌ Fetch error:', error)
      throw error
    })
}
\`\`\`

## 🐛 常见问题和解决方案

### 1. 扩展无法加载

**症状：** 扩展在Chrome中显示错误或无法加载

**排查步骤：**
\`\`\`bash
# 1. 检查manifest.json语法
cat dist/manifest.json | jq .

# 2. 检查构建输出
npm run build 2>&1 | tee build.log

# 3. 验证文件权限
ls -la dist/
\`\`\`

**常见错误：**
- JSON语法错误
- 文件路径错误
- 权限配置问题

### 2. 内容脚本不执行

**症状：** 在网页中看不到内容脚本的效果

**调试代码：**
\`\`\`javascript
// 在content script开头添加
(function() {
  console.log('🔥 Content script injection test')
  console.log('📍 Current URL:', window.location.href)
  console.log('📄 Document ready state:', document.readyState)
  
  // 检查匹配规则
  const manifest = chrome.runtime.getManifest()
  console.log('📋 Content script matches:', manifest.content_scripts[0].matches)
})()
\`\`\`

### 3. 背景脚本错误

**症状：** 扩展功能不响应

**调试方法：**
1. 打开 `chrome://extensions/`
2. 找到扩展，点击"检查视图" → "背景页"
3. 查看Console错误

**常见错误处理：**
\`\`\`javascript
// 全局错误捕获
self.addEventListener('error', (event) => {
  console.error('🚨 Global error in background:', event.error)
})

// Promise错误捕获
self.addEventListener('unhandledrejection', (event) => {
  console.error('🚨 Unhandled promise rejection:', event.reason)
})
\`\`\`

### 4. 消息传递问题

**症状：** 组件间无法通信

**调试代码：**
\`\`\`javascript
// 发送消息时添加调试
browser.runtime.sendMessage(message)
  .then(response => {
    console.log('📤 Message sent successfully:', message)
    console.log('📥 Response received:', response)
  })
  .catch(error => {
    console.error('❌ Message sending failed:', error)
  })

// 接收消息时添加调试
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('📨 Message received:', message)
  console.log('👤 Sender:', sender)
  
  // 处理消息...
  
  sendResponse({ success: true })
})
\`\`\`

## 📊 性能调试

### 1. 内存使用监控

\`\`\`javascript
// 在background script中监控内存
setInterval(() => {
  if (performance.memory) {
    const memory = performance.memory
    console.log('💾 Memory usage:', {
      used: Math.round(memory.usedJSHeapSize / 1024 / 1024) + 'MB',
      total: Math.round(memory.totalJSHeapSize / 1024 / 1024) + 'MB',
      limit: Math.round(memory.jsHeapSizeLimit / 1024 / 1024) + 'MB'
    })
  }
}, 30000) // 每30秒检查一次
\`\`\`

### 2. 视频检测性能

\`\`\`javascript
// 监控视频检测性能
function detectVideosWithTiming() {
  const startTime = performance.now()
  
  const videos = document.querySelectorAll('video')
  
  const endTime = performance.now()
  console.log(`🎥 Video detection took ${endTime - startTime} milliseconds`)
  console.log(`📊 Found ${videos.length} videos`)
  
  return videos
}
\`\`\`

### 3. DOM操作性能

\`\`\`javascript
// 监控DOM变化的性能影响
const observer = new MutationObserver((mutations) => {
  const startTime = performance.now()
  
  // 处理DOM变化...
  
  const endTime = performance.now()
  if (endTime - startTime > 10) { // 超过10ms的操作
    console.warn(`⚠️ Slow DOM operation: ${endTime - startTime}ms`)
  }
})
\`\`\`

## 🧪 测试和验证

### 1. 功能测试脚本

\`\`\`javascript
// 在Console中运行的测试脚本
function runExtensionTests() {
  console.log('🧪 开始扩展功能测试...')
  
  // 测试1: 检查扩展是否加载
  if (typeof chrome !== 'undefined' && chrome.runtime) {
    console.log('✅ Chrome扩展API可用')
  } else {
    console.error('❌ Chrome扩展API不可用')
    return
  }
  
  // 测试2: 检查视频元素
  const videos = document.querySelectorAll('video')
  console.log(`📺 找到 ${videos.length} 个视频元素`)
  
  // 测试3: 检查PiP支持
  if ('pictureInPictureEnabled' in document) {
    console.log('✅ 浏览器支持画中画')
  } else {
    console.log('❌ 浏览器不支持画中画')
  }
  
  // 测试4: 检查视频PiP能力
  videos.forEach((video, index) => {
    if (!video.disablePictureInPicture) {
      console.log(`✅ 视频 ${index + 1} 支持画中画`)
    } else {
      console.log(`❌ 视频 ${index + 1} 不支持画中画`)
    }
  })
  
  console.log('🎯 测试完成')
}

// 运行测试
runExtensionTests()
\`\`\`

### 2. 平台兼容性测试

\`\`\`javascript
// 测试不同平台的适配器
function testPlatformAdapters() {
  const hostname = window.location.hostname
  console.log(`🌐 当前网站: ${hostname}`)
  
  // 测试YouTube
  if (hostname.includes('youtube.com')) {
    console.log('🔴 YouTube平台检测')
    const ytVideos = document.querySelectorAll('.html5-video-player video')
    console.log(`找到 ${ytVideos.length} 个YouTube视频`)
  }
  
  // 测试Bilibili
  if (hostname.includes('bilibili.com')) {
    console.log('📺 Bilibili平台检测')
    const biliVideos = document.querySelectorAll('video, bwp-video')
    console.log(`找到 ${biliVideos.length} 个Bilibili视频`)
  }
  
  // 测试Netflix
  if (hostname.includes('netflix.com')) {
    console.log('🎬 Netflix平台检测')
    const netflixVideos = document.querySelectorAll('video')
    console.log(`找到 ${netflixVideos.length} 个Netflix视频`)
  }
}
\`\`\`

## 🔧 开发工具配置

### 1. VS Code调试配置

创建 `.vscode/launch.json`：
\`\`\`json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug Chrome Extension",
      "type": "chrome",
      "request": "launch",
      "url": "chrome://extensions/",
      "webRoot": "${workspaceFolder}/dist",
      "userDataDir": "${workspaceFolder}/.chrome-debug"
    }
  ]
}
\`\`\`

### 2. 自动化调试脚本

\`\`\`bash
#!/bin/bash
# debug.sh - 一键调试脚本

echo "🔧 启动调试环境..."

# 构建项目
npm run build

# 启动文件监听
npm run dev &
DEV_PID=$!

# 启动Chrome（调试模式）
google-chrome \
  --load-extension=./dist \
  --user-data-dir=./chrome-debug \
  --enable-logging \
  --log-level=0 &
CHROME_PID=$!

echo "✅ 调试环境已启动"
echo "📝 开发进程PID: $DEV_PID"
echo "🌐 Chrome进程PID: $CHROME_PID"

# 等待用户输入退出
read -p "按Enter键停止调试..."

# 清理进程
kill $DEV_PID 2>/dev/null
kill $CHROME_PID 2>/dev/null

echo "👋 调试环境已停止"
\`\`\`

这个调试指南涵盖了Chrome扩展开发的各个方面，从基础的环境设置到高级的性能调试技巧。按照这些步骤，你可以高效地开发和调试你的画中画扩展。
