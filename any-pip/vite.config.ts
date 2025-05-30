import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      'wxt/background': resolve(__dirname, 'node_modules/wxt/dist/background/index.js'),
      'wxt/content': resolve(__dirname, 'node_modules/wxt/dist/content/index.js'),
      'wxt/sandbox': resolve(__dirname, 'node_modules/wxt/dist/sandbox/index.js'),
      'wxt/sandbox/dom': resolve(__dirname, 'node_modules/wxt/dist/sandbox/dom.js'),
      'wxt/storage': resolve(__dirname, 'node_modules/wxt/dist/storage/index.js'),
    }
  },
  build: {
    rollupOptions: {
      external: ['wxt/background', 'wxt/content', 'wxt/sandbox', 'wxt/sandbox/dom', 'wxt/storage']
    }
  }
})
