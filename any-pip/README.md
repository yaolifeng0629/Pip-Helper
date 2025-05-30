# PiP Video Extension

使用WXT框架构建的增强型画中画视频扩展。

## 功能特点

- **一键画中画激活**：工具栏图标、右键菜单、快捷键
- **多平台支持**：YouTube、Bilibili、Netflix等
- **智能视频检测**：自动识别页面中的视频
- **用户友好界面**：Vue3构建的现代化界面
- **自定义设置**：网站黑白名单、通知控制等

## 开发技术

- **WXT**：下一代Web扩展框架
- **Vue 3**：响应式UI框架
- **TypeScript**：类型安全的JavaScript超集
- **Chrome Extension API**：浏览器扩展API

## 快速开始

### 安装依赖

\`\`\`bash
npm install
\`\`\`

### 开发模式

\`\`\`bash
npm run dev
\`\`\`

### 构建生产版本

\`\`\`bash
npm run build
\`\`\`

### 打包扩展

\`\`\`bash
npm run zip
\`\`\`

## 项目结构

\`\`\`
pip-extension-wxt/
├── src/
│   ├── background/       # 后台脚本
│   ├── content/          # 内容脚本
│   ├── popup/            # 弹出窗口
│   ├── options/          # 设置页面
│   └── utils/            # 共享工具和类型
├── assets/
│   └── icons/            # 扩展图标
├── wxt.config.ts         # WXT配置
└── package.json          # 项目配置
\`\`\`

## 平台适配

扩展使用适配器模式支持不同的视频平台：

- **HTML5**：基础视频支持
- **YouTube**：针对YouTube的特殊处理
- **Bilibili**：针对Bilibili的特殊处理
- **Netflix**：针对Netflix的特殊处理

## 调试指南

1. 运行 `npm run dev` 启动开发模式
2. 打开 Chrome 扩展管理页面 (`chrome://extensions/`)
3. 启用开发者模式
4. 点击"加载已解压的扩展程序"
5. 选择项目的 `extension` 文件夹

## 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 打开 Pull Request

## 许可证

MIT
