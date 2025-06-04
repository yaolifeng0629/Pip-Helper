/**
 * 背景脚本 - 管理浏览器扩展的核心功能
 *
 * 负责处理：
 * 1. 工具栏图标点击事件
 * 2. 快捷键命令
 * 3. 右键菜单
 * 4. 图标状态更新
 * 5. 消息通信
 */

// 图标路径配置
const ICON_PATH = {
  normal: {
    16: 'icon/16.png',
    32: 'icon/32.png',
    48: 'icon/48.png',
    96: 'icon/96.png',
    128: 'icon/128.png',
  },
  active: {
    16: 'icon/active-16.png',
    32: 'icon/active-32.png',
    48: 'icon/active-48.png',
    96: 'icon/active-96.png',
    128: 'icon/active-128.png',
  },
};

export default defineBackground(() => {
  /**
   * 处理工具栏图标点击事件
   * @param tab 当前标签页
   */
  async function handleToolbarClick(tab: any): Promise<void> {
    if (!tab.id) return;
    await browser.tabs.sendMessage(tab.id, { type: 'toggle-pip' });
  }

  /**
   * 处理来自内容脚本的消息
   * @param msg 消息对象
   * @param sender 发送者信息
   */
  function handleRuntimeMessage(msg: any, sender: any): void {
    // 处理画中画错误
    if (msg?.type === 'pip-error') {
      let reason = '未知错误';
      if (msg.reason === 'no-video') reason = '未检测到可用视频';
      if (msg.reason === 'not-allowed') reason = '该视频不支持画中画';

      if (sender.tab?.id) {
        browser.tabs.sendMessage(sender.tab.id, { type: 'show-toast', reason });
      }
    }

    // 处理快捷键触发的画中画
    if (msg?.type === 'shortcut-pip' && sender.tab?.id) {
      browser.tabs.sendMessage(sender.tab.id, { type: 'toggle-pip' });
    }

    // 更新画中画状态图标
    if (msg?.type === 'pip-status-changed' && sender.tab?.id) {
      updateIcon(sender.tab.id, msg.active);
    }

    // 更新视频数量角标
    if (msg?.type === 'video-detected' && sender.tab?.id) {
      updateBadge(sender.tab.id, msg.count);
    }
  }

  /**
   * 处理快捷键命令
   * @param command 命令名称
   */
  async function handleCommand(command: string): Promise<void> {
    // 激活画中画快捷键
    if (command === 'activate-pip') {
      const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
      if (tab?.id) {
        await browser.tabs.sendMessage(tab.id, { type: 'toggle-pip' });
      }
    }
  }

  /**
   * 创建右键菜单
   */
  async function createContextMenus(): Promise<void> {
    try {
      await browser.contextMenus.removeAll();

      // 视频上的右键菜单
      browser.contextMenus.create({
        id: 'pip-toggle',
        title: '画中画播放',
        contexts: ['video'],
      });

      // 监听右键菜单点击
      browser.contextMenus.onClicked.addListener(async (info, tab) => {
        if (info.menuItemId === 'pip-toggle' && tab?.id) {
          await browser.tabs.sendMessage(tab.id, { type: 'toggle-pip' });
        }
      });
    } catch (error) {
      console.error('创建右键菜单失败', error);
    }
  }

  /**
   * 更新扩展图标状态
   * @param tabId 标签页ID
   * @param pipActive 画中画是否激活
   */
  async function updateIcon(tabId: number, pipActive: boolean): Promise<void> {
    try {
      await browser.action.setIcon({
        path: pipActive ? ICON_PATH.active : ICON_PATH.normal,
        tabId,
      });
    } catch (error) {
      // 某些环境可能不支持 setIcon
      console.error('更新图标失败:', error);
    }
  }

  /**
   * 更新扩展角标
   * @param tabId 标签页ID
   * @param count 视频数量
   */
  async function updateBadge(tabId: number, count: number): Promise<void> {
    try {
      await browser.action.setBadgeText({
        text: count > 0 ? String(count) : '',
        tabId,
      });

      await browser.action.setBadgeBackgroundColor({
        color: '#4285f4',
        tabId,
      });
    } catch (error) {
      console.error('更新角标失败:', error);
    }
  }

  // 初始化：注册事件监听器
  browser.action.onClicked.addListener(handleToolbarClick);
  browser.runtime.onMessage.addListener(handleRuntimeMessage);
  browser.commands.onCommand.addListener(handleCommand);
  createContextMenus();
});
