(() => {
  'use strict';

  function fixResults() {
    document.querySelectorAll('.price-change.flat').forEach(el => {
      if (el.textContent.includes('اطلاعات آگهی قابل مقایسه')) {
        el.textContent = 'ℹ️ برای این مدل آگهی مقایسه‌ای ثبت‌شده در بانک فعلی نداریم؛ برای دیدن آگهی‌های زنده از دکمه دیوار پایین کارت استفاده کن.';
      }
    });

    document.querySelectorAll('.marketplace-actions').forEach(box => {
      [...box.querySelectorAll('a')].forEach(a => {
        if (/باما|شیپور/.test(a.textContent || '')) a.remove();
      });

      const links = [...box.querySelectorAll('a')];
      const divar = links.find(a => /دیوار/.test(a.textContent || ''));
      if (divar) {
        divar.classList.add('listing-divar');
        divar.target = '_blank';
        divar.rel = 'noopener noreferrer';
      }
    });

    document.querySelectorAll('.listing-summary').forEach(summary => {
      const small = summary.querySelector('small');
      if (small && small.textContent.includes('مسیر جستجوی بازار')) {
        small.textContent = 'این دکمه مسیر جستجوی دیوار است، نه آگهی مشخص. اطلاعات ساختگی وارد سیستم نمی‌کنیم.';
      }
    });
  }

  function addSellerPromo() {
    const main = document.querySelector('main');
    if (!main || document.getElementById('seller-promo')) return;
    const promo = document.createElement('section');
    promo.id = 'seller-promo';
    promo.className = 'seller-promo';
    promo.innerHTML = '<div class="seller-promo-icon">🚘</div><h2>خودروی خود را برای فروش بگذارید</h2><p>به‌زودی می‌توانید آگهی خودروی خود را در دستیار خودرو ثبت کنید و آن را به خریداران معرفی کنید.</p><span>⏳ به‌زودی</span>';
    const how = main.querySelector('.how');
    if (how) how.insertAdjacentElement('afterend', promo); else main.appendChild(promo);
  }

  function fixAll() {
    fixResults();
    addSellerPromo();
  }

  new MutationObserver(fixAll).observe(document.body, {childList:true,subtree:true});
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fixAll); else fixAll();
})();