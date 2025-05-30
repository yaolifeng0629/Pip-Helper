# PiP Video Extension Icons

这个目录包含了画中画视频扩展所需的所有图标文件。

## 📁 文件结构

\`\`\`
icons/
├── icon.svg                    # 基础图标SVG源文件
├── icon-active.svg            # 激活状态图标SVG源文件
├── icon16.png                 # 16×16 基础图标
├── icon32.png                 # 32×32 基础图标
├── icon48.png                 # 48×48 基础图标
├── icon128.png                # 128×128 基础图标
├── icon-active16.png          # 16×16 激活状态图标
├── icon-active32.png          # 32×32 激活状态图标
├── icon-active48.png          # 48×48 激活状态图标
├── icon-active128.png         # 128×128 激活状态图标
├── icon-preview.html          # 图标预览页面
├── icon-manifest.json         # 图标清单文件
└── generate-icons.js          # 图标生成脚本
\`\`\`

## 🎨 设计说明

### 设计理念
图标采用画中画的视觉概念，通过以下元素表达功能：
- **大屏幕**：代表原始视频播放区域
- **小浮动窗口**：代表画中画窗口
- **播放按钮**：表明这是视频相关功能
- **连接线**：显示两者之间的关系
- **激活指示器**：绿色圆点表示功能已激活

### 颜色方案
- **主色调**：#667EEA 到 #764BA2 的渐变
- **激活色**：#22C55E (绿色)
- **屏幕色**：#333 (深灰)
- **背景**：白色半透明

### 状态区分
- **基础状态**：蓝紫色渐变背景，表示功能可用
- **激活状态**：绿色渐变背景，带有激活指示器

## 📏 尺寸规格

| 尺寸 | 用途 | 文件名 |
|------|------|--------|
| 16×16 | 浏览器工具栏小图标 | icon16.png |
| 32×32 | 高分辨率工具栏图标 | icon32.png |
| 48×48 | 扩展管理页面 | icon48.png |
| 128×128 | Chrome Web Store | icon128.png |

## 🛠️ 生成图标

### 方法一：使用预览页面
1. 在浏览器中打开 `icon-preview.html`
2. 点击对应的下载按钮
3. 图标将自动下载为PNG格式

### 方法二：使用生成脚本
\`\`\`bash
node scripts/generate-icons.js
\`\`\`

### 方法三：手动转换
1. 在浏览器中打开对应的 `generate-*.html` 文件
2. 图标会自动下载

## 🔧 在扩展中使用

在 `manifest.json` 中引用图标：

\`\`\`json
{
  "icons": {
    "16": "icons/icon16.png",
    "32": "icons/icon32.png", 
    "48": "icons/icon48.png",
    "128": "icons/icon128.png"
  },
  "action": {
    "default_icon": {
      "16": "icons/icon16.png",
      "32": "icons/icon32.png",
      "48": "icons/icon48.png",
      "128": "icons/icon128.png"
    }
  }
}
\`\`\`

在背景脚本中动态切换图标：

\`\`\`javascript
// 切换到激活状态
chrome.action.setIcon({
  path: {
    "16": "icons/icon-active16.png",
    "32": "icons/icon-active32.png", 
    "48": "icons/icon-active48.png",
    "128": "icons/icon-active128.png"
  }
});

// 切换回基础状态
chrome.action.setIcon({
  path: {
    "16": "icons/icon16.png",
    "32": "icons/icon32.png",
    "48": "icons/icon48.png", 
    "128": "icons/icon128.png"
  }
});
\`\`\`

## 📝 注意事项

1. **文件格式**：Chrome扩展推荐使用PNG格式的图标
2. **透明背景**：图标应该有透明背景以适应不同主题
3. **清晰度**：确保在小尺寸下图标仍然清晰可辨
4. **一致性**：所有尺寸的图标应保持视觉一致性
5. **状态区分**：激活和非激活状态应有明显的视觉区别

## 🎯 最佳实践

- 在设计时考虑不同的浏览器主题（亮色/暗色）
- 确保图标在不同分辨率下都清晰可见
- 使用有意义的视觉隐喻来表达功能
- 保持简洁，避免过多细节
- 测试图标在实际使用环境中的效果
