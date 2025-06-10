import { defineConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
    modules: ['@wxt-dev/module-vue'],
    manifest: {
        name: 'Pip-Helper - Picture-in-Picture Assistant',
        description: 'A simple and easy-to-use browser extension that helps you watch videos in picture-in-picture mode on any webpage',
        version: '0.0.1',
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
                description: 'Activate PiP',
            },
            'return-to-tab': {
                suggested_key: {
                    default: 'Alt+B',
                    mac: 'Alt+B',
                },
                description: 'Return to Tab',
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
