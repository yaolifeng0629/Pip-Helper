/**
 * UI相关工具函数
 */

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
  picker.innerHTML = `<b>选择要画中画的视频：</b><br>`;

  // 为每个视频创建按钮
  videos.forEach((v, i) => {
    const label = v.currentSrc || v.src || `视频${i+1}`;
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
  cancel.textContent = '取消';
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
