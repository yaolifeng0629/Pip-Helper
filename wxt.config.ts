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
                '16': 'icon/16.png',
                '32': 'icon/32.png',
                '48': 'icon/48.png',
                '96': 'icon/96.png',
                '128': 'icon/128.png',
            },
        },
        icons: {
            '16': 'icon/16.png',
            '32': 'icon/32.png',
            '48': 'icon/48.png',
            '96': 'icon/96.png',
            '128': 'icon/128.png',
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
