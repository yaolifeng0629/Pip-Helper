import { defineConfig } from "wxt"
import vue from "@vitejs/plugin-vue"
import { resolve } from "path"

export default defineConfig({
  entrypointsDir: ".",
  entrypoints: {
    background: "src/background/index.ts",
    content: "src/content/index.ts",
    popup: "src/popup/index.html",
    options: "src/options/index.html",
    injected: "src/injected/index.ts"
  },
  manifest: {
    name: "PiP Video Extension",
    description: "Enhanced Picture-in-Picture for all video platforms",
    version: "1.0.0",
    permissions: ["activeTab", "scripting", "storage", "contextMenus"],
    host_permissions: ["<all_urls>"],
    action: {
      default_title: "PiP Video",
      default_icon: {
        16: "assets/icons/icon16.png",
        32: "assets/icons/icon32.png",
        48: "assets/icons/icon48.png",
        128: "assets/icons/icon128.png",
      },
    },
    icons: {
      16: "assets/icons/icon16.png",
      32: "assets/icons/icon32.png",
      48: "assets/icons/icon48.png",
      128: "assets/icons/icon128.png",
    },
    commands: {
      "toggle-pip": {
        suggested_key: {
          default: "Alt+P",
        },
        description: "Toggle Picture-in-Picture",
      },
    },
    options_ui: {
      page: "options.html",
      open_in_tab: true,
    },
  },
  vite: () => ({
    plugins: [vue()],
  }),
  outDir: "extension",
  srcDir: "src",
})
