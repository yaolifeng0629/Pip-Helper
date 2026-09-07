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
    'popup.enterPip': {
      'zh-CN': '进入画中画',
      'zh-TW': '進入子母畫面',
      en: 'Enter PiP',
    },
    'popup.exitPip': {
      'zh-CN': '退出画中画',
      'zh-TW': '退出子母畫面',
      en: 'Exit PiP',
    },
    'popup.chooseVideo': {
      'zh-CN': '选择其他视频',
      'zh-TW': '選擇其他影片',
      en: 'Choose another video',
    },
    'popup.detectedVideos': {
      'zh-CN': '检测到的视频',
      'zh-TW': '偵測到的影片',
      en: 'Detected videos',
    },
    'popup.noPreview': {
      'zh-CN': '暂无预览',
      'zh-TW': '暫無預覽',
      en: 'No preview',
    },
    'popup.siteAllowed': {
      'zh-CN': '当前网站已允许',
      'zh-TW': '目前網站已允許',
      en: 'This site is allowed',
    },
    'popup.siteBlocked': {
      'zh-CN': '当前网站已限制',
      'zh-TW': '目前網站已限制',
      en: 'This site is restricted',
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
    'settings.siteAccess': {
      'zh-CN': '网站访问规则',
      'zh-TW': '網站存取規則',
      en: 'Site access rules',
    },
    'settings.allowByDefault': {
      'zh-CN': '默认允许，仅限制指定网站',
      'zh-TW': '預設允許，僅限制指定網站',
      en: 'Allow by default, restrict selected sites',
    },
    'settings.blockByDefault': {
      'zh-CN': '默认限制，仅允许指定网站',
      'zh-TW': '預設限制，僅允許指定網站',
      en: 'Restrict by default, allow selected sites',
    },
    'settings.exceptions': {
      'zh-CN': '例外网站',
      'zh-TW': '例外網站',
      en: 'Exception sites',
    },
    'settings.noExceptions': {
      'zh-CN': '尚未添加例外网站',
      'zh-TW': '尚未新增例外網站',
      en: 'No exception sites yet',
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
    'status.active': {
      'zh-CN': '画中画正在播放',
      'zh-TW': '子母畫面正在播放',
      en: 'Picture-in-Picture is active',
    },
    'status.ready': {
      'zh-CN': '检测到 {count} 个可用视频',
      'zh-TW': '偵測到 {count} 個可用影片',
      en: '{count} videos are available',
    },
    'status.blocked': {
      'zh-CN': '当前网站已限制画中画',
      'zh-TW': '目前網站已限制子母畫面',
      en: 'PiP is restricted for this site',
    },
    'status.unsupported': {
      'zh-CN': '当前浏览器不支持画中画',
      'zh-TW': '目前瀏覽器不支援子母畫面',
      en: 'This browser does not support PiP',
    },
    'status.unavailable': {
      'zh-CN': '请在普通网页中打开画中画助手',
      'zh-TW': '請在一般網頁中開啟子母畫面助手',
      en: 'Open Pip-Helper on a regular webpage',
    },
    'status.notAllowed': {
      'zh-CN': '该视频不允许进入画中画',
      'zh-TW': '這部影片不允許進入子母畫面',
      en: 'This video does not allow PiP',
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
        void chrome.storage.local.set({ 'pip-helper-language': lang });
    },

    async loadSavedLanguage() {
        try {
            const result = await chrome.storage.local.get('pip-helper-language');
            const storedLanguage = result['pip-helper-language'];
            if (typeof storedLanguage === 'string' && ['zh-CN', 'zh-TW', 'en'].includes(storedLanguage)) {
                currentLanguage.value = storedLanguage as Language;
                return;
            }

            const savedLanguage = localStorage.getItem('pip-helper-language') as Language;
            if (savedLanguage && ['zh-CN', 'zh-TW', 'en'].includes(savedLanguage)) {
                currentLanguage.value = savedLanguage;
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
        chrome.storage.onChanged.addListener(changes => {
            if (changes['pip-helper-language']) {
                const newLang = changes['pip-helper-language'].newValue as Language;
                if (newLang && ['zh-CN', 'zh-TW', 'en'].includes(newLang)) {
                    currentLanguage.value = newLang;
                }
            }
        });
    },
};
