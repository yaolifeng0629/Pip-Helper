import { defineConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
    modules: ['@wxt-dev/module-vue'],
    manifest: {
        name: '画中画助手',
        description: '一键激活网页视频画中画模式，支持多平台视频网站',
        version: '1.0.0',
        permissions: ['scripting', 'activeTab', 'storage'],
        host_permissions: ['<all_urls>'],
        action: {
            default_popup: 'entrypoints/popup/index.html',
            default_icon: {
                '16': 'icon/icon16.png',
                '32': 'icon/icon32.png',
                '48': 'icon/icon48.png',
                '96': 'icon/icon96.png',
                '128': 'icon/icon128.png',
            },
        },
        icons: {
            '16': 'icon/icon16.png',
            '32': 'icon/icon32.png',
            '48': 'icon/icon48.png',
            '96': 'icon/icon96.png',
            '128': 'icon/icon128.png',
        },
        commands: {
            'activate-pip': {
                suggested_key: {
                    default: 'Alt+P',
                    mac: 'Alt+P',
                },
                description: '一键激活画中画',
            },
            'return-to-tab': {
                suggested_key: {
                    default: 'Alt+B',
                    mac: 'Alt+B',
                },
                description: '返回原始标签页',
            },
        },
        content_scripts: [
            {
                matches: ['<all_urls>'],
                js: ['entrypoints/content.ts'],
            },
        ],
        background: {
            service_worker: 'entrypoints/background.ts',
            type: 'module',
        },
    },
});
