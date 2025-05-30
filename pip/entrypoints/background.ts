export default defineBackground(() => {
  // 监听工具栏点击
  browser.action.onClicked.addListener(async (tab) => {
    if (!tab.id) return;
    // 弹出多视频选择
    await browser.tabs.sendMessage(tab.id, { type: 'show-video-picker' });
  });

  // 监听内容脚本的错误反馈
  browser.runtime.onMessage.addListener((msg, sender) => {
    if (msg?.type === 'pip-error') {
      let reason = '未知错误';
      if (msg.reason === 'no-video') reason = '未检测到可用视频';
      if (msg.reason === 'not-allowed') reason = '该视频不支持画中画';
      if (sender.tab?.id) {
        browser.tabs.sendMessage(sender.tab.id, { type: 'show-toast', reason });
      }
    }
    // 监听快捷键
    if (msg?.type === 'shortcut-pip' && sender.tab?.id) {
      browser.tabs.sendMessage(sender.tab.id, 'activate-pip');
    }
  });

  // 注册快捷键（manifest需配置commands）
  browser.commands.onCommand.addListener((command, tab) => {
    if (command === 'activate-pip' && tab?.id) {
      browser.tabs.sendMessage(tab.id, 'activate-pip');
    }
  });
});
