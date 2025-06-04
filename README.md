# 画中画助手

一款简单易用的浏览器扩展，帮助您在任何网页上使用画中画功能观看视频。

## 功能特点

-   **一键激活画中画**：通过点击工具栏图标或使用快捷键快速将视频切换到画中画模式
-   **多平台支持**：兼容 YouTube、Bilibili、腾讯视频、爱奇艺等主流视频网站
-   **黑白名单**：可以设置网站黑白名单，自定义哪些网站允许或禁止使用画中画功能
-   **自定义快捷键**：支持自定义快捷键，方便快速激活画中画
-   **多视频选择**：当页面中有多个视频时，可以选择要画中画的视频
-   **增强视频控件**：使用 Plyr 增强视频控件，提供更好的用户体验

## 快捷键

-   `Alt+P`：激活画中画模式

## 开发技术

-   Vue 3 + TypeScript + Composition API
-   WXT (Web Extension Tools)
-   Plyr 视频播放器增强库

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

-   Chrome / Edge / Opera / Brave 等基于 Chromium 的浏览器
-   Firefox (使用 `pnpm dev:firefox` 和 `pnpm build:firefox` 命令)
