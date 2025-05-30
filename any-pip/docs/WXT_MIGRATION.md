# 从传统扩展开发迁移到WXT框架

本文档记录了将Chrome PiP扩展从传统的Vite+Vue构建方式迁移到WXT框架的过程和优势。

## 为什么选择WXT？

[WXT](https://wxt.dev)是一个现代化的Web扩展框架，提供了许多优势：

1. **文件系统路由**：基于文件的入口点，自动生成manifest
2. **HMR支持**：快速的热模块替换，提高开发效率
3. **TypeScript支持**：一流的TypeScript支持
4. **MV2和MV3兼容**：同时支持Manifest V2和V3
5. **多浏览器支持**：一套代码，多浏览器部署
6. **自动导入**：减少样板代码

## 迁移步骤

### 1. 项目结构调整

**旧结构**:
\`\`\`
src/
├── background/
├── content/
├── popup/
├── options/
└── shared/
\`\`\`

**新结构**:
\`\`\`
src/
├── background/
├── content/
├── popup/
├── options/
└── utils/
\`\`\`

### 2. 入口点转换

**旧方式**:
手动在manifest.json中配置各个入口点

**新方式**:
使用WXT的文件系统路由，自动生成入口点

### 3. 背景脚本迁移

**旧代码**:
\`\`\`typescript
// 初始化背景服务
new BackgroundService()
\`\`\`

**新代码**:
\`\`\`typescript
import { defineBackground } from 'wxt/background'

export default defineBackground({
  main() {
    // 初始化逻辑
  }
})
\`\`\`

### 4. 内容脚本迁移

**旧代码**:
\`\`\`typescript
// 初始化内容脚本
new ContentScript()
\`\`\`

**新代码**:
\`\`\`typescript
import { defineContentScript } from 'wxt/content-script'

export default defineContentScript({
  matches: ['<all_urls>'],
  runAt: 'document_end',
  main() {
    const contentScript = new ContentScript()
    contentScript.init()
  }
})
\`\`\`

### 5. 弹出窗口和选项页面

**旧方式**:
使用HTML文件作为入口，然后通过脚本挂载Vue应用

**新方式**:
直接使用Vue组件作为入口，WXT自动处理HTML生成

### 6. 构建配置

**旧方式**:
复杂的Vite配置，需要手动设置入口点、输出格式等

**新方式**:
简洁的WXT配置，专为扩展开发优化

\`\`\`typescript
import { defineConfig } from 'wxt'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  manifest: {
    // 扩展配置
  },
  vite: () => ({
    plugins: [vue()]
  })
})
\`\`\`

## 开发体验改进

1. **更快的开发周期**：
   - 旧方式：修改代码 → 等待构建 → 手动刷新扩展 → 测试
   - 新方式：修改代码 → 自动HMR更新 → 立即测试

2. **更少的样板代码**：
   - 旧方式：需要手动设置各种入口点和配置
   - 新方式：专注于业务逻辑，框架处理配置

3. **更好的类型支持**：
   - 旧方式：需要手动导入类型定义
   - 新方式：内置的类型支持和自动导入

4. **更简单的调试**：
   - 旧方式：需要手动设置调试工具
   - 新方式：内置的调试支持

## 性能优化

1. **更小的构建体积**：
   - 旧方式：完整的Vue运行时
   - 新方式：优化的构建，移除未使用的代码

2. **更快的启动时间**：
   - 旧方式：需要加载完整的框架
   - 新方式：优化的代码分割和懒加载

## 结论

迁移到WXT框架为PiP扩展开发带来了显著的改进：

- 开发效率提升
- 代码组织更清晰
- 构建结果更优化
- 跨浏览器兼容性更好

WXT的现代化工具链和开发体验使扩展开发变得更加愉快和高效。
