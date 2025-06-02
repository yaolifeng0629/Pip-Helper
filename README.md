# WXT + Vue 3

This template should help get you started developing with Vue 3 in WXT.

## Recommended IDE Setup

- [VS Code](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar).

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
