(() => {
  'use strict';
  const VERSION_URL = 'https://raw.githubusercontent.com/Morijooob/dastyar-khodro/main/version.json';
  const localVersion = window.APP_VERSION_CODE || 0;

  function injectStyles() {
    if (document.getElementById('update-style')) return;
    const style = document.createElement('style');
    style.id = 'update-style';
    style.textContent = '.update-overlay{position:fixed;inset:0;background:rgba(15,23,42,.58);display:flex;align-items:center;justify-content:center;padding:20px;z-index:9999}.update-card{width:min(440px,100%);background:#fff;border-radius:24px;padding:26px;box-shadow:0 25px 70px rgba(0,0,0,.2);text-align:center}.update-card h2{margin:0 0 8px}.update-card p{color:#697386;margin:8px 0 18px}.update-card .update-btn{display:block;width:100%;border:0;border-radius:14px;padding:13px;background:#2563eb;color:#fff;font:inherit;font-weight:800;cursor:pointer;margin-top:10px}.update-card .later{background:#eef2f7;color:#172033}.update-note{font-size:.72rem;color:#8a94a6;margin-top:12px}';
    document.head.appendChild(style);
  }

  function showUpdate(remote) {
    injectStyles();
    if (document.getElementById('update-overlay')) return;
    const overlay = document.createElement('div');
    overlay.id = 'update-overlay';
    overlay.className = 'update-overlay';
    overlay.innerHTML = `<div class="update-card"><div style="font-size:42px">🚗✨</div><h2>نسخه جدید آماده است</h2><p>نسخه <strong>${remote.version || remote.versionCode}</strong> از دستیار خودرو منتشر شده.</p><p>${remote.notes || 'بهبود عملکرد و رفع خطاها'}</p><button class="update-btn" id="update-now">⬆️ دریافت نسخه جدید</button><button class="update-btn later" id="update-later">بعداً</button><div class="update-note">برای دریافت نسخه جدید، اینترنت روشن باشد.</div></div>`;
    document.body.appendChild(overlay);
    document.getElementById('update-now').onclick = () => window.open(remote.downloadUrl || 'https://github.com/Morijooob/dastyar-khodro/actions', '_blank');
    document.getElementById('update-later').onclick = () => overlay.remove();
  }

  async function check() {
    try {
      const res = await fetch(`${VERSION_URL}?t=${Date.now()}`, { cache: 'no-store' });
      if (!res.ok) return;
      const remote = await res.json();
      if (Number(remote.versionCode || 0) > Number(localVersion)) showUpdate(remote);
    } catch (e) {
      console.log('Update check skipped:', e);
    }
  }

  const start = () => setTimeout(check, 900);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
