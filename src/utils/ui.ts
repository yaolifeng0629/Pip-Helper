import type { VideoCandidate } from './video';

/**
 * UI相关工具函数
 */

// 获取当前语言设置
function getCurrentLanguage(): string {
  return localStorage.getItem('pip-helper-language') || 
         (navigator.language.startsWith('zh') ? 
           (navigator.language.startsWith('zh-CN') || navigator.language.startsWith('zh-SG') ? 'zh-CN' : 'zh-TW') : 
           'en');
}

// 获取翻译文本的辅助函数
function t(key: string, params?: Record<string, string | number>): string {
  const translations: Record<string, Record<string, string>> = {
    'videoPicker.selectVideo': {
      'zh-CN': '选择视频：',
      'zh-TW': '選擇影片：',
      'en': 'Select a video for PiP:'
    },
    'videoPicker.cancel': {
      'zh-CN': '取消',
      'zh-TW': '取消',
      'en': 'Cancel'
    }
  };

  const currentLang = getCurrentLanguage();
  const message = translations[key]?.[currentLang] || translations[key]?.['en'] || key;
  
  if (params) {
    return message.replace(/\{(\w+)\}/g, (match, param) => {
      return String(params[param] ?? match);
    });
  }
  
  return message;
}

/**
 * 弹出多视频选择器，供用户手动选择要画中画的视频
 * @param videos 视频元素数组
 */
export function showVideoPicker(videos: HTMLVideoElement[]): void {
  // 如果已存在选择器，则不重复创建
  if (document.getElementById('pip-video-picker')) return;

  // 创建选择器容器
  const picker = document.createElement('div');
  picker.id = 'pip-video-picker';
  picker.style.cssText = `
    position: fixed;
    z-index: 999999;
    right: 24px;
    bottom: 24px;
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 16px rgba(0, 0, 0, 0.1);
    padding: 16px 20px;
    min-width: 220px;
    max-width: 320px;
    font-size: 15px;
    line-height: 2;
  `;

  // 添加标题
  picker.innerHTML = `<b>${t('videoPicker.selectVideo')}</b><br>`;

  // 为每个视频创建按钮
  videos.forEach((v, i) => {
    const label = v.currentSrc || v.src || `Video ${i+1}`;
    const btn = document.createElement('button');
    btn.textContent = label.length > 60 ? label.slice(0, 60) + '...' : label;
    btn.style.cssText = `
      display: block;
      width: 100%;
      margin: 6px 0;
      padding: 6px 8px;
      border-radius: 5px;
      border: none;
      background: #42b883;
      color: #fff;
      cursor: pointer;
      text-align: left;
    `;

    // 点击按钮激活画中画
    btn.onclick = () => {
      v.requestPictureInPicture();
      picker.remove();
    };

    picker.appendChild(btn);
  });

  // 添加取消按钮
  const cancel = document.createElement('button');
  cancel.textContent = t('videoPicker.cancel');
  cancel.style.cssText = `
    display: block;
    width: 100%;
    margin: 6px 0;
    padding: 6px 8px;
    border-radius: 5px;
    border: none;
    background: #aaa;
    color: #fff;
    cursor: pointer;
    text-align: left;
  `;
  cancel.onclick = () => picker.remove();
  picker.appendChild(cancel);

  // 添加到页面
  document.body.appendChild(picker);
}

async function getPickerLabels(): Promise<{ title: string; playing: string; cancel: string; noPreview: string }> {
  const labels = {
    'zh-CN': { title: '选择视频', playing: '播放中', cancel: '取消', noPreview: '暂无预览' },
    'zh-TW': { title: '選擇影片', playing: '播放中', cancel: '取消', noPreview: '暫無預覽' },
    en: { title: 'Select a video', playing: 'Playing', cancel: 'Cancel', noPreview: 'No preview' },
  };

  try {
    const stored = await chrome.storage.local.get('pip-helper-language');
    const language: unknown = stored['pip-helper-language'];
    if (language === 'zh-CN' || language === 'zh-TW' || language === 'en') return labels[language];
  } catch {
    // The browser locale below is a safe fallback when extension storage is unavailable.
  }

  return navigator.language.startsWith('zh-CN') || navigator.language.startsWith('zh-SG')
    ? labels['zh-CN']
    : navigator.language.startsWith('zh')
      ? labels['zh-TW']
      : labels.en;
}

export async function showCandidatePicker(
  candidates: VideoCandidate[],
  onSelect: (candidate: VideoCandidate) => void,
): Promise<void> {
  document.getElementById('pip-video-picker')?.remove();
  const labels = await getPickerLabels();

  const backdrop = document.createElement('div');
  backdrop.id = 'pip-video-picker';
  backdrop.setAttribute('role', 'dialog');
  backdrop.setAttribute('aria-modal', 'true');
  backdrop.style.cssText = [
    'position:fixed', 'inset:0', 'z-index:2147483647', 'display:grid',
    'place-items:center', 'padding:20px', 'background:rgba(15, 23, 42, .42)',
    "font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif",
  ].join(';');

  const panel = document.createElement('div');
  panel.style.cssText = [
    'width:min(560px,100%)', 'max-height:min(680px,calc(100vh - 32px))',
    'overflow:auto', 'border-radius:14px', 'background:#fff', 'padding:18px',
    'box-shadow:0 18px 48px rgba(15, 23, 42, .24)', 'color:#172033',
  ].join(';');

  const title = document.createElement('h2');
  title.textContent = `${labels.title} (${candidates.length})`;
  title.style.cssText = 'margin:0 0 14px;font-size:16px;line-height:1.3';
  panel.appendChild(title);

  candidates.forEach(candidate => {
    const button = document.createElement('button');
    button.type = 'button';
    button.style.cssText = [
      'width:100%', 'display:grid', 'grid-template-columns:128px minmax(0,1fr)',
      'gap:12px', 'margin:0 0 10px', 'padding:8px', 'border:1px solid #d8dee8',
      'border-radius:10px', 'background:#fff', 'color:#172033', 'cursor:pointer', 'text-align:left',
    ].join(';');

    const preview = document.createElement('div');
    preview.style.cssText = [
      'position:relative', 'height:72px', 'overflow:hidden', 'border-radius:7px',
      'background:#eef1f4', 'display:grid', 'place-items:center', 'color:#667085', 'font-size:11px',
    ].join(';');
    const fallback = document.createElement('span');
    fallback.textContent = candidate.dimensions || labels.noPreview;
    preview.appendChild(fallback);

    if (candidate.thumbnail) {
      const image = document.createElement('img');
      image.src = candidate.thumbnail;
      image.alt = '';
      image.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;object-fit:cover;background:#eef1f4';
      image.addEventListener('error', () => image.remove());
      preview.appendChild(image);
    }

    const content = document.createElement('span');
    content.style.cssText = 'min-width:0;display:grid;align-content:center;gap:6px';
    const label = document.createElement('strong');
    label.textContent = candidate.title;
    label.style.cssText = 'overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:13px;font-weight:650';
    const meta = document.createElement('span');
    meta.textContent = [candidate.isPlaying ? labels.playing : '', candidate.duration, candidate.dimensions].filter(Boolean).join(' · ');
    meta.style.cssText = 'color:#667085;font-size:11px';
    content.append(label, meta);
    button.append(preview, content);
    button.addEventListener('click', () => {
      backdrop.remove();
      onSelect(candidate);
    });
    panel.appendChild(button);
  });

  const cancel = document.createElement('button');
  cancel.type = 'button';
  cancel.textContent = labels.cancel;
  cancel.style.cssText = 'width:100%;margin-top:4px;padding:10px;border:0;border-radius:8px;background:#f1f3f5;color:#344054;cursor:pointer';
  cancel.addEventListener('click', () => backdrop.remove());
  panel.appendChild(cancel);

  backdrop.addEventListener('click', event => {
    if (event.target === backdrop) backdrop.remove();
  });
  backdrop.appendChild(panel);
  document.body.appendChild(backdrop);
}

/**
 * 显示提示消息
 * @param message 消息内容
 * @param type 消息类型
 * @param duration 显示时长（毫秒）
 */
export function showToast(message: string, type: 'success' | 'error' | 'info' = 'info', duration: number = 3000): void {
  // 移除现有提示
  const existingToast = document.getElementById('pip-toast');
  if (existingToast) existingToast.remove();

  // 创建提示元素
  const toast = document.createElement('div');
  toast.id = 'pip-toast';

  // 设置样式
  let backgroundColor = 'rgba(0, 0, 0, 0.8)';
  let borderColor = 'transparent';

  if (type === 'success') {
    backgroundColor = 'rgba(66, 184, 131, 0.9)';
    borderColor = 'rgba(66, 184, 131, 0.3)';
  } else if (type === 'error') {
    backgroundColor = 'rgba(255, 76, 76, 0.9)';
    borderColor = 'rgba(255, 76, 76, 0.3)';
  }

  toast.style.cssText = `
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: ${backgroundColor};
    color: white;
    padding: 10px 20px;
    border-radius: 8px;
    z-index: 999999;
    font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 14px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    border: 1px solid ${borderColor};
    opacity: 0;
    transition: opacity 0.3s, transform 0.3s;
    transform: translateX(-50%) translateY(-10px);
  `;

  toast.textContent = message;

  // 添加到页面
  document.body.appendChild(toast);

  // 显示动画
  setTimeout(() => {
    toast.style.opacity = '1';
    toast.style.transform = 'translateX(-50%) translateY(0)';
  }, 10);

  // 自动消失
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(-50%) translateY(-10px)';

    // 移除元素
    setTimeout(() => toast.remove(), 300);
  }, duration);
}
