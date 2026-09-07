(() => {
  'use strict';
  const BAMA_HOME = 'https://bama.ir/';
  function fixResults() {
    document.querySelectorAll('.price-change.flat').forEach(el => {
      if (el.textContent.includes('اطلاعات آگهی قابل مقایسه')) {
        el.textContent = 'ℹ️ برای این مدل آگهی مقایسه‌ای ثبت‌شده در بانک فعلی نداریم؛ برای دیدن آگهی‌های زنده از دکمه‌های بازار پایین کارت استفاده کن.';
      }
    });
    document.querySelectorAll('.marketplace-actions').forEach(box => {
      if (!box.querySelector('.listing-bama')) {
        const a = document.createElement('a');
        a.className = 'listing-link listing-bama';
        a.href = BAMA_HOME;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        a.innerHTML = '<b>باما</b><small>جستجوی خودرو</small>';
        box.appendChild(a);
      }
    });
  }
  new MutationObserver(fixResults).observe(document.body, {childList:true,subtree:true});
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fixResults); else fixResults();
})();
