export default defineBackground(() => {
    console.log('Video-PiP 后台服务启动');

    // PiP 激活/未激活图标路径
    const ICON_PATH = {
        normal: {
            16: 'icon/icon16.png',
            32: 'icon/icon32.png',
            48: 'icon/icon48.png',
            128: 'icon/icon128.png',
        },
        active: {
            16: 'icon/icon-active16.png',
            32: 'icon/icon-active32.png',
            48: 'icon/icon-active48.png',
            128: 'icon/icon-active128.png',
        },
    };

    /**
     * 处理工具栏点击事件 - 激活画中画
     */
    async function handleToolbarClick(tab: chrome.tabs.Tab) {
        if (!tab.id) {
            console.warn('无效的标签页ID');
            return;
        }

        try {
            await chrome.tabs.sendMessage(tab.id, { type: 'toggle-pip' });
        } catch (error) {
            console.error('发送消息到内容脚本失败:', error);
            // 尝试注入内容脚本
            try {
                await chrome.scripting.executeScript({
                    target: { tabId: tab.id },
                    files: ['content-scripts/content.js'],
                });
                // 重新发送消息
                await chrome.tabs.sendMessage(tab.id, { type: 'toggle-pip' });
            } catch (injectError) {
                console.error('注入内容脚本失败:', injectError);
            }
        }
    }

    /**
     * 处理来自内容脚本的消息
     */
    function handleRuntimeMessage(
        message: any,
        sender: chrome.runtime.MessageSender,
        sendResponse: (response?: any) => void
    ) {
        console.log('收到消息:', message, '来自:', sender.tab?.url);

        // 处理画中画错误
        if (message?.type === 'pip-error') {
            let reason = '未知错误';
            switch (message.reason) {
                case 'no-video':
                    reason = '未检测到可用视频';
                    break;
                case 'not-allowed':
                    reason = '该视频不支持画中画';
                    break;
                case 'security-error':
                    reason = '安全限制，无法启动画中画';
                    break;
            }

            if (sender.tab?.id) {
                chrome.tabs
                    .sendMessage(sender.tab.id, {
                        type: 'show-toast',
                        message: reason,
                    })
                    .catch(err => console.warn('发送错误提示失败:', err));
            }
        }

        // 处理快捷键触发的画中画
        else if (message?.type === 'shortcut-pip' && sender.tab?.id) {
            chrome.tabs
                .sendMessage(sender.tab.id, { type: 'toggle-pip' })
                .catch(err => console.warn('快捷键触发画中画失败:', err));
        }

        // 处理画中画状态变化
        else if (message?.type === 'pip-status-changed' && sender.tab?.id) {
            updateIcon(sender.tab.id, message.active);
        }

        // 处理视频检测结果
        else if (message?.type === 'video-detected' && sender.tab?.id) {
            updateBadge(sender.tab.id, message.count);
        }

        // 处理视频探测结果
        else if (message?.type === 'probe-result') {
            sendResponse(message);
        }

        return true; // 保持消息通道开启
    }

    /**
     * 处理快捷键命令
     */
    async function handleCommand(command: string) {
        console.log('触发快捷键命令:', command);

        if (command === 'activate-pip') {
            try {
                const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
                if (tab?.id) {
                    await chrome.tabs.sendMessage(tab.id, { type: 'toggle-pip' });
                }
            } catch (error) {
                console.error('快捷键激活画中画失败:', error);
            }
        } else if (command === 'open-settings') {
            chrome.runtime.openOptionsPage?.();
        }
    }

    /**
     * 创建右键上下文菜单
     */
    async function createContextMenus() {
        try {
            await chrome.contextMenus.removeAll();

            // 视频右键菜单
            chrome.contextMenus.create({
                id: 'pip-toggle',
                title: '画中画播放',
                contexts: ['video'],
            });

            // 插件图标右键菜单
            chrome.contextMenus.create({
                id: 'pip-settings',
                title: '插件设置',
                contexts: ['action'],
            });

            console.log('右键菜单创建成功');
        } catch (error) {
            console.error('创建右键菜单失败:', error);
        }
    }

    /**
     * 处理右键菜单点击
     */
    async function handleContextMenuClick(info: chrome.contextMenus.OnClickData, tab?: chrome.tabs.Tab) {
        if (info.menuItemId === 'pip-toggle' && tab?.id) {
            try {
                await chrome.tabs.sendMessage(tab.id, {
                    type: 'toggle-pip',
                    contextMenu: true,
                });
            } catch (error) {
                console.error('右键菜单激活画中画失败:', error);
            }
        } else if (info.menuItemId === 'pip-settings') {
            chrome.runtime.openOptionsPage?.();
        }
    }

    /**
     * 动态切换插件图标状态
     */
    async function updateIcon(tabId: number, pipActive: boolean) {
        try {
            await chrome.action.setIcon({
                path: pipActive ? ICON_PATH.active : ICON_PATH.normal,
                tabId,
            });
            console.log(`图标状态更新: ${pipActive ? '激活' : '普通'}`);
        } catch (error) {
            console.warn('更新图标失败:', error);
        }
    }

    /**
     * 动态设置徽章数字
     */
    async function updateBadge(tabId: number, count: number) {
        try {
            await chrome.action.setBadgeText({
                text: count > 0 ? String(count) : '',
                tabId,
            });

            if (count > 0) {
                await chrome.action.setBadgeBackgroundColor({
                    color: '#4285f4',
                    tabId,
                });
            }

            console.log(`徽章更新: ${count} 个视频`);
        } catch (error) {
            console.warn('更新徽章失败:', error);
        }
    }

    /**
     * 处理标签页更新 - 重置图标状态
     */
    function handleTabUpdate(tabId: number, changeInfo: chrome.tabs.TabChangeInfo, tab: chrome.tabs.Tab) {
        if (changeInfo.status === 'complete') {
            // 页面加载完成，重置图标状态
            updateIcon(tabId, false);
            updateBadge(tabId, 0);
        }
    }

    /**
     * 处理标签页激活 - 更新当前标签页状态
     */
    async function handleTabActivated(activeInfo: chrome.tabs.TabActiveInfo) {
        try {
            // 可以在这里检查当前标签页的视频状态
            await chrome.tabs.sendMessage(activeInfo.tabId, { type: 'probe-video' });
        } catch (error) {
            // 标签页可能还没有内容脚本，忽略错误
        }
    }

    // 注册事件监听器
    chrome.action.onClicked.addListener(handleToolbarClick);
    chrome.runtime.onMessage.addListener(handleRuntimeMessage);
    chrome.commands.onCommand.addListener(handleCommand);
    chrome.contextMenus.onClicked.addListener(handleContextMenuClick);
    chrome.tabs.onUpdated.addListener(handleTabUpdate);
    chrome.tabs.onActivated.addListener(handleTabActivated);

    // 初始化
    createContextMenus();

    console.log('Video-PiP 后台服务初始化完成');
});
