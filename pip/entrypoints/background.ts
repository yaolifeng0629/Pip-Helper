export default defineBackground(() => {
  // PiP 激活/未激活图标路径
  const ICON_PATH = {
    normal: {
      16: 'public/icon/16.png',
      32: 'public/icon/32.png',
      48: 'public/icon/48.png',
      128: 'public/icon/128.png',
    },
    active: {
      16: 'public/icon/icon-active16.png',
      32: 'public/icon/icon-active32.png',
      48: 'public/icon/icon-active48.png',
      128: 'public/icon/icon-active128.png',
    },
  };

  // 监听工具栏点击，激活PiP
  async function handleToolbarClick(tab: any) {
    if (!tab.id) return;
    await browser.tabs.sendMessage(tab.id, { type: 'toggle-pip' });
  }

  // 处理内容脚本的消息
  function handleRuntimeMessage(msg: any, sender: any) {
    if (msg?.type === 'pip-error') {
      let reason = '未知错误';
      if (msg.reason === 'no-video') reason = '未检测到可用视频';
      if (msg.reason === 'not-allowed') reason = '该视频不支持画中画';
      if (sender.tab?.id) {
        browser.tabs.sendMessage(sender.tab.id, { type: 'show-toast', reason });
      }
    }
    if (msg?.type === 'shortcut-pip' && sender.tab?.id) {
      browser.tabs.sendMessage(sender.tab.id, { type: 'toggle-pip' });
    }
    if (msg?.type === 'pip-status-changed' && sender.tab?.id) {
      updateIcon(sender.tab.id, msg.active);
    }
    if (msg?.type === 'video-detected' && sender.tab?.id) {
      updateBadge(sender.tab.id, msg.count);
    }
  }

  // 监听快捷键命令
  async function handleCommand(command: string) {
    if (command === 'activate-pip') {
      const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
      if (tab?.id) {
        await browser.tabs.sendMessage(tab.id, { type: 'toggle-pip' });
      }
    }
    if (command === 'open-settings') {
      browser.runtime.openOptionsPage && browser.runtime.openOptionsPage();
    }
  }

  // 创建右键菜单
  async function createContextMenus() {
    try {
      await browser.contextMenus.removeAll();
      browser.contextMenus.create({
        id: 'pip-toggle',
        title: '画中画播放',
        contexts: ['video'],
      });
      browser.contextMenus.create({
        id: 'pip-settings',
        title: '插件设置',
        contexts: ['action'],
      });
      browser.contextMenus.onClicked.addListener(async (info, tab) => {
        if (info.menuItemId === 'pip-toggle' && tab?.id) {
          await browser.tabs.sendMessage(tab.id, { type: 'toggle-pip' });
        } else if (info.menuItemId === 'pip-settings') {
          browser.runtime.openOptionsPage && browser.runtime.openOptionsPage();
        }
      });
    } catch (e) {
      console.error('创建右键菜单失败', e);
    }
  }

  // 动态切换图标
  async function updateIcon(tabId: number, pipActive: boolean) {
    try {
      await browser.action.setIcon({
        path: pipActive ? ICON_PATH.active : ICON_PATH.normal,
        tabId,
      });
    } catch (e) {
      // 某些环境可能不支持 setIcon
    }
  }

  // 动态设置 badge
  async function updateBadge(tabId: number, count: number) {
    try {
      await browser.action.setBadgeText({
        text: count > 0 ? String(count) : '',
        tabId,
      });
      await browser.action.setBadgeBackgroundColor({
        color: '#4285f4',
        tabId,
      });
    } catch (e) {}
  }

  // 监听工具栏点击
  browser.action.onClicked.addListener(handleToolbarClick);
  // 监听内容脚本的消息
  browser.runtime.onMessage.addListener(handleRuntimeMessage);
  // 监听快捷键
  browser.commands.onCommand.addListener(handleCommand);
  // 创建右键菜单
  createContextMenus();
});
