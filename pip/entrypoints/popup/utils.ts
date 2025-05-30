// 通用工具函数，供 content、popup、background 等复用

/**
 * 获取域名（不带协议和路径）
 */
export function getDomain(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return '';
  }
}

/**
 * 本地存储黑/白名单、快捷键等设置
 */
export async function getUserSettings() {
  return await browser.storage.local.get(['pip_whitelist', 'pip_blacklist', 'pip_shortcut']);
}
export async function saveUserSettings({ whitelist, blacklist, shortcut }: { whitelist?: string[]; blacklist?: string[]; shortcut?: string }) {
  const data: any = {};
  if (whitelist) data.pip_whitelist = whitelist;
  if (blacklist) data.pip_blacklist = blacklist;
  if (shortcut) data.pip_shortcut = shortcut;
  await browser.storage.local.set(data);
}

/**
 * 模拟获取用户额度（实际应替换为真实接口）
 */
export async function fetchQuota(): Promise<number|null> {
  try {
    // const res = await fetch('https://api.example.com/user/quota', { credentials: 'include' });
    // const data = await res.json();
    // return data.quota;
    return 5; // mock: 5次
  } catch {
    return null;
  }
}
