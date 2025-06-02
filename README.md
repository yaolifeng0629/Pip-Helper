# 画中画助手

一款简单易用的浏览器扩展，帮助您在任何网页上使用画中画功能观看视频。

## 功能特点

- **一键激活画中画**：通过点击工具栏图标或使用快捷键快速将视频切换到画中画模式
- **多平台支持**：兼容 YouTube、Bilibili、腾讯视频、爱奇艺等主流视频网站
- **黑白名单**：可以设置网站黑白名单，自定义哪些网站允许或禁止使用画中画功能
- **自定义快捷键**：支持自定义快捷键，方便快速激活画中画
- **多视频选择**：当页面中有多个视频时，可以选择要画中画的视频
- **增强视频控件**：使用 Plyr 增强视频控件，提供更好的用户体验

## 快捷键

- `Alt+P`：激活画中画模式
- `Alt+B`：返回原始标签页

## 开发技术

- Vue 3 + TypeScript + Composition API
- WXT (Web Extension Tools)
- Plyr 视频播放器增强库

## 开发指南

### 安装依赖

```bash
pnpm install
```

### 开发模式

```bash
pnpm dev
```

### 构建扩展

```bash
pnpm build
```

### 打包扩展

```bash
pnpm zip
```

## 浏览器兼容性

- Chrome / Edge / Opera / Brave 等基于 Chromium 的浏览器
- Firefox (使用 `pnpm dev:firefox` 和 `pnpm build:firefox` 命令)

## 许可证

MIT

```tree
pip/
├─ assets/                # 静态资源（如 vue.svg）
├─ components/            # Vue 组件目录（如 HelloWorld.vue）
├─ entrypoints/           # 插件各入口文件
│  ├─ background.ts       # 后台脚本（Service Worker/Background Script）
│  ├─ content.ts          # 内容脚本（Content Script，注入网页与视频元素交互）
│  └─ popup/              # 弹窗页面（即点击插件图标弹出的 UI）
│     ├─ App.vue          # 弹窗主 Vue 组件
│     ├─ index.html       # 弹窗 HTML 入口
│     ├─ main.ts          # 弹窗入口脚本
│     └─ style.css        # 弹窗样式
├─ public/                # 公共资源（如插件图标等）
│  ├─ wxt.svg
│  └─ icon/               # 各尺寸插件图标
├─ package.json           # 项目依赖与脚本
├─ pnpm-lock.yaml         # pnpm 锁定文件
├─ README.md              # 项目说明
├─ tsconfig.json          # TypeScript 配置
├─ wxt.config.ts          # wxt 插件配置
└─ ...（其他配置或文档）
```
