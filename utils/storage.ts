/**
 * 存储相关工具函数
 */

// 定义用户设置的类型
export interface UserSettings {
  whitelist: string[];
  blacklist: string[];
  shortcut: string;
}

// 默认设置
const DEFAULT_SETTINGS: UserSettings = {
  whitelist: [],
  blacklist: [],
  shortcut: 'Alt+P'
};

/**
 * 获取域名（不带协议和路径）
 * @param url URL字符串
 * @returns 域名
 */
export function getDomain(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return '';
  }
}

/**
 * 获取用户设置
 * @returns Promise<UserSettings>
 */
export async function getUserSettings(): Promise<UserSettings> {
  try {
    const data = await browser.storage.local.get([
      'pip_whitelist',
      'pip_blacklist',
      'pip_shortcut'
    ]);

    return {
      whitelist: data.pip_whitelist || DEFAULT_SETTINGS.whitelist,
      blacklist: data.pip_blacklist || DEFAULT_SETTINGS.blacklist,
      shortcut: data.pip_shortcut || DEFAULT_SETTINGS.shortcut
    };
  } catch (error) {
    console.error('获取用户设置失败:', error);
    return DEFAULT_SETTINGS;
  }
}

/**
 * 保存用户设置
 * @param settings 部分或全部设置
 * @returns Promise<void>
 */
export async function saveUserSettings(settings: Partial<UserSettings>): Promise<void> {
  const data: Record<string, any> = {};

  if (settings.whitelist !== undefined) {
    data.pip_whitelist = settings.whitelist;
  }

  if (settings.blacklist !== undefined) {
    data.pip_blacklist = settings.blacklist;
  }

  if (settings.shortcut !== undefined) {
    data.pip_shortcut = settings.shortcut;
  }

  try {
    await browser.storage.local.set(data);
  } catch (error) {
    console.error('保存用户设置失败:', error);
  }
}

/**
 * 检查URL是否在黑名单或白名单中
 * @param url 要检查的URL
 * @returns Promise<boolean> 是否允许在该URL上使用画中画
 */
export async function isUrlAllowed(url: string): Promise<boolean> {
  const domain = getDomain(url);
  if (!domain) return true;

  const settings = await getUserSettings();

  // 如果白名单有内容且当前域名不在白名单中，则不允许
  if (settings.whitelist.length > 0 && !settings.whitelist.includes(domain)) {
    return false;
  }

  // 如果当前域名在黑名单中，则不允许
  if (settings.blacklist.includes(domain)) {
    return false;
  }

  return true;
}
