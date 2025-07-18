import { ref, computed } from 'vue';

export type Language = 'zh-CN' | 'zh-TW' | 'en';

interface Messages {
    [key: string]: {
        [lang in Language]: string;
    };
}

const messages: Messages = {
    // UI Labels
    'extension.name': {
        'zh-CN': 'Pip-Helper - 画中画助手',
        'zh-TW': 'Pip-Helper - 畫中畫助手',
        en: 'Pip-Helper - Picture-in-Picture Assistant',
    },
    'popup.title': {
        'zh-CN': '画中画助手',
        'zh-TW': '畫中畫助手',
        en: 'PiP Assistant',
    },
    'popup.activate': {
        'zh-CN': '激活画中画',
        'zh-TW': '啟用畫中畫',
        en: 'Activate PiP',
    },
    'popup.settings': {
        'zh-CN': '设置',
        'zh-TW': '設定',
        en: 'Settings',
    },
    'settings.title': {
        'zh-CN': '设置',
        'zh-TW': '設定',
        en: 'Settings',
    },
    'settings.language': {
        'zh-CN': '语言',
        'zh-TW': '語言',
        en: 'Language',
    },
    'settings.blacklist': {
        'zh-CN': '黑名单',
        'zh-TW': '黑名單',
        en: 'Blacklist',
    },
    'settings.whitelist': {
        'zh-CN': '白名单',
        'zh-TW': '白名單',
        en: 'Whitelist',
    },
    'settings.save': {
        'zh-CN': '保存',
        'zh-TW': '儲存',
        en: 'Save',
    },
    'settings.cancel': {
        'zh-CN': '取消',
        'zh-TW': '取消',
        en: 'Cancel',
    },
    'status.noVideo': {
        'zh-CN': '未检测到视频',
        'zh-TW': '未檢測到影片',
        en: 'No video detected',
    },
    'status.videoFound': {
        'zh-CN': '发现 {count} 个视频',
        'zh-TW': '發現 {count} 個影片',
        en: 'Found {count} videos',
    },
    'status.activated': {
        'zh-CN': '画中画已激活',
        'zh-TW': '畫中畫已啟用',
        en: 'PiP activated',
    },
    keyboardShortcuts: {
        'zh-CN': '快捷键',
        'zh-TW': '快捷鍵',
        en: 'Keyboard Shortcuts',
    },
    'shortcut.activate': {
        'zh-CN': '激活画中画：Alt+P',
        'zh-TW': '啟用畫中畫：Alt+P',
        en: 'Activate PiP: Alt+P',
    },
    'shortcut.previous': {
        'zh-CN': '上一个视频：←',
        'zh-TW': '上一個影片：←',
        en: 'Previous video: ←',
    },
    'shortcut.next': {
        'zh-CN': '下一个视频：→',
        'zh-TW': '下一個影片：→',
        en: 'Next video: →',
    },
    'popup.disabled': {
        'zh-CN': '此网站已禁用画中画功能',
        'zh-TW': '此網站已停用畫中畫功能',
        en: 'PiP is disabled for this website',
    },
    'popup.selectVideo': {
        'zh-CN': '选择视频 ({count})',
        'zh-TW': '選擇影片 ({count})',
        en: 'Select Video ({count})',
    },
    'settings.add': {
        'zh-CN': '添加',
        'zh-TW': '新增',
        en: 'Add',
    },
    'settings.domainPlaceholder': {
        'zh-CN': '输入域名，例如：bilibili.com',
        'zh-TW': '輸入域名，例如：bilibili.com',
        en: 'Enter domain, e.g.: bilibili.com',
    },
    'settings.whitelistEmpty': {
        'zh-CN': '白名单为空，可在所有网站使用画中画',
        'zh-TW': '白名單為空，可在所有網站使用畫中畫',
        en: 'Whitelist is empty, PiP can be used on all websites',
    },
    'settings.blacklistEmpty': {
        'zh-CN': '黑名单为空，可在所有网站使用画中画',
        'zh-TW': '黑名單為空，可在所有網站使用畫中畫',
        en: 'Blacklist is empty, PiP can be used on all websites',
    },
    'videoPicker.title': {
        'zh-CN': '选择视频进入画中画模式',
        'zh-TW': '選擇影片進入畫中畫模式',
        en: 'Select a video for Picture-in-Picture mode',
    },
    'videoPicker.noPreview': {
        'zh-CN': '无预览',
        'zh-TW': '無預覽',
        en: 'No preview',
    },
    'videoPicker.playing': {
        'zh-CN': '播放中',
        'zh-TW': '播放中',
        en: 'Playing',
    },
    'videoPicker.resolution': {
        'zh-CN': '分辨率：',
        'zh-TW': '解析度：',
        en: 'Resolution:',
    },
    'videoPicker.tip': {
        'zh-CN': '提示：使用 ← → 键快速切换视频',
        'zh-TW': '提示：使用 ← → 鍵快速切換影片',
        en: 'Tip: Use ← → keys to quickly switch videos',
    },
    'videoPicker.cancel': {
        'zh-CN': '取消',
        'zh-TW': '取消',
        en: 'Cancel',
    },
    'videoPicker.selectVideo': {
        'zh-CN': '选择视频：',
        'zh-TW': '選擇影片：',
        en: 'Select a video for PiP:',
    },
};

const currentLanguage = ref<Language>('en');

export const i18n = {
    currentLanguage,

    t(key: string, params?: Record<string, string | number>): string {
        const message = messages[key]?.[currentLanguage.value] || key;

        if (params) {
            return message.replace(/\{(\w+)\}/g, (match, param) => {
                return String(params[param] ?? match);
            });
        }

        return message;
    },

    setLanguage(lang: Language) {
        currentLanguage.value = lang;
        // 使用Chrome扩展存储API同步到所有上下文
        if (typeof chrome !== 'undefined' && chrome.storage) {
            chrome.storage.local.set({ 'pip-helper-language': lang });
        } else {
            localStorage.setItem('pip-helper-language', lang);
        }
    },

    async loadSavedLanguage() {
        try {
            // 优先使用Chrome扩展存储API
            if (typeof chrome !== 'undefined' && chrome.storage) {
                const result = await chrome.storage.local.get('pip-helper-language');
                if (result['pip-helper-language'] && ['zh-CN', 'zh-TW', 'en'].includes(result['pip-helper-language'])) {
                    currentLanguage.value = result['pip-helper-language'];
                    return;
                }
            }

            // 回退到localStorage
            const saved = localStorage.getItem('pip-helper-language') as Language;
            if (saved && ['zh-CN', 'zh-TW', 'en'].includes(saved)) {
                currentLanguage.value = saved;
            } else {
                // Auto-detect browser language
                const browserLang = navigator.language;
                if (browserLang.startsWith('zh-CN') || browserLang.startsWith('zh-SG')) {
                    currentLanguage.value = 'zh-CN';
                } else if (
                    browserLang.startsWith('zh') ||
                    browserLang.startsWith('zh-TW') ||
                    browserLang.startsWith('zh-HK')
                ) {
                    currentLanguage.value = 'zh-TW';
                } else {
                    currentLanguage.value = 'en';
                }
            }
        } catch (error) {
            console.error('Error loading language:', error);
        }
    },

    // 监听语言变化
    setupLanguageSync() {
        if (typeof chrome !== 'undefined' && chrome.storage) {
            chrome.storage.onChanged.addListener(changes => {
                if (changes['pip-helper-language']) {
                    const newLang = changes['pip-helper-language'].newValue as Language;
                    if (newLang && ['zh-CN', 'zh-TW', 'en'].includes(newLang)) {
                        currentLanguage.value = newLang;
                    }
                }
            });
        }
    },
};
