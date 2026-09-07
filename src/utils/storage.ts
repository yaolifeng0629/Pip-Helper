export type SiteAccessMode = 'allow-by-default' | 'block-by-default';

export interface UserSettings {
  siteAccessMode: SiteAccessMode;
  allowedSites: string[];
  blockedSites: string[];
  shortcut: string;
  // Temporary shape compatibility for the legacy settings component.
  whitelist: string[];
  blacklist: string[];
}

const STORAGE_KEYS = [
  'pip_site_access_mode',
  'pip_allowed_sites',
  'pip_blocked_sites',
  'pip_shortcut',
  // Legacy keys are read only for a one-time, lossless migration.
  'pip_whitelist',
  'pip_blacklist',
] as const;

const DEFAULT_SETTINGS: UserSettings = {
  siteAccessMode: 'allow-by-default',
  allowedSites: [],
  blockedSites: [],
  shortcut: 'Alt+P',
  whitelist: [],
  blacklist: [],
};

export function normalizeDomain(value: string): string {
  const candidate = value.trim().toLowerCase();
  if (!candidate) return '';

  try {
    return new URL(candidate.includes('://') ? candidate : `https://${candidate}`).hostname;
  } catch {
    return '';
  }
}

export function getDomain(url: string): string {
  try {
    return new URL(url).hostname.toLowerCase();
  } catch {
    return '';
  }
}

function uniqueDomains(values: unknown): string[] {
  if (!Array.isArray(values)) return [];
  return [...new Set(values.map(value => normalizeDomain(String(value))).filter(Boolean))];
}

function fromStorage(data: Record<string, unknown>): UserSettings {
  const legacyAllowed = uniqueDomains(data.pip_whitelist);
  const legacyBlocked = uniqueDomains(data.pip_blacklist);
  const savedMode = data.pip_site_access_mode;
  const siteAccessMode: SiteAccessMode = savedMode === 'block-by-default' || savedMode === 'allow-by-default'
    ? savedMode
    : legacyAllowed.length > 0
      ? 'block-by-default'
      : 'allow-by-default';

  const savedAllowed = uniqueDomains(data.pip_allowed_sites);
  const savedBlocked = uniqueDomains(data.pip_blocked_sites);

  const allowedSites = savedAllowed.length > 0 ? savedAllowed : legacyAllowed.filter(domain => !legacyBlocked.includes(domain));
  const blockedSites = savedBlocked.length > 0 ? savedBlocked : siteAccessMode === 'allow-by-default' ? legacyBlocked : [];

  return {
    siteAccessMode,
    allowedSites,
    blockedSites,
    shortcut: typeof data.pip_shortcut === 'string' ? data.pip_shortcut : DEFAULT_SETTINGS.shortcut,
    whitelist: allowedSites,
    blacklist: blockedSites,
  };
}

export async function getUserSettings(): Promise<UserSettings> {
  try {
    const data = await chrome.storage.local.get([...STORAGE_KEYS]);
    const settings = fromStorage(data);

    // Persist the explicit model after reading old installations once.
    if (!data.pip_site_access_mode) await saveUserSettings(settings);
    return settings;
  } catch (error) {
    console.error('Failed to get user settings:', error);
    return { ...DEFAULT_SETTINGS };
  }
}

export async function saveUserSettings(settings: Partial<UserSettings>): Promise<void> {
  const data: Record<string, unknown> = {};
  if (settings.siteAccessMode !== undefined) {
    data.pip_site_access_mode = settings.siteAccessMode;
    // Once the explicit mode is written, legacy data must not revive a removed exception.
    data.pip_whitelist = [];
    data.pip_blacklist = [];
  }
  if (settings.allowedSites !== undefined) data.pip_allowed_sites = uniqueDomains(settings.allowedSites);
  if (settings.blockedSites !== undefined) data.pip_blocked_sites = uniqueDomains(settings.blockedSites);
  if (settings.shortcut !== undefined) data.pip_shortcut = settings.shortcut;

  try {
    await chrome.storage.local.set(data);
  } catch (error) {
    console.error('Failed to save user settings:', error);
  }
}

export function isDomainAllowed(domain: string, settings: UserSettings): boolean {
  if (!domain) return true;
  return settings.siteAccessMode === 'block-by-default'
    ? settings.allowedSites.includes(domain)
    : !settings.blockedSites.includes(domain);
}

export async function isUrlAllowed(url: string): Promise<boolean> {
  return isDomainAllowed(getDomain(url), await getUserSettings());
}

export async function toggleUrlRule(url: string): Promise<UserSettings> {
  const domain = getDomain(url);
  const settings = await getUserSettings();
  if (!domain) return settings;

  if (settings.siteAccessMode === 'block-by-default') {
    const allowedSites = settings.allowedSites.includes(domain)
      ? settings.allowedSites.filter(site => site !== domain)
      : [...settings.allowedSites, domain];
    await saveUserSettings({ allowedSites });
    return { ...settings, allowedSites };
  }

  const blockedSites = settings.blockedSites.includes(domain)
    ? settings.blockedSites.filter(site => site !== domain)
    : [...settings.blockedSites, domain];
  await saveUserSettings({ blockedSites });
  return { ...settings, blockedSites };
}
