(() => {
  'use strict';
  const BAMA_BASE = 'https://bama.ir/car/';

  function bamaUrlForCard(box) {
    const card = box.closest('.result-card');
    const title = card?.querySelector('h3')?.textContent?.trim();
    const car = Array.isArray(window.carData) ? window.carData.find(x => String(x.name || x.title || '').trim() === title) : null;
    if (car?.id) {
      const slug = String(car.id).replace(/-used-\d{4}$/, '');
      return `${BAMA_BASE}${encodeURIComponent(slug)}`;
    }
    return 'https://bama.ir/car';
  }

  function fixResults() {
    document.querySelectorAll('.price-change.flat').forEach(el => {
      if (el.textContent.includes('اطلاعات آگهی قابل مقایسه')) {
        el.textContent = 'ℹ️ برای این مدل آگهی مقایسه‌ای ثبت‌شده در بانک فعلی نداریم؛ برای دیدن آگهی‌های زنده از دکمه‌های بازار پایین کارت استفاده کن.';
      }
    });

    document.querySelectorAll('.marketplace-actions').forEach(box => {
      let a = box.querySelector('.listing-bama');
      if (!a) {
        a = document.createElement('a');
        a.className = 'listing-link listing-bama';
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        a.innerHTML = '<b>باما</b><small>مشاهده مدل در باما</small>';
        box.appendChild(a);
      }
      a.href = bamaUrlForCard(box);
    });
  }

  function addSellerPromo() {
    const main = document.querySelector('main');
    if (!main || document.getElementById('seller-promo')) return;
    const promo = document.createElement('section');
    promo.id = 'seller-promo';
    promo.style.cssText = 'margin:28px 0 12px;padding:20px;border-radius:20px;background:linear-gradient(135deg,#fff8e8,#fff);border:1px solid #f0d89a;box-shadow:0 8px 24px rgba(0,0,0,.06);text-align:center;';
    promo.innerHTML = '<div style="font-size:30px;margin-bottom:6px">🚘</div><h2 style="margin:0 0 8px;font-size:20px">خودروی خود را برای فروش بگذارید</h2><p style="margin:0 0 12px;color:var(--muted,#666);line-height:1.8">به‌زودی می‌توانید آگهی خودروی خود را در دستیار خودرو ثبت کنید و آن را به خریداران معرفی کنید.</p><span style="display:inline-block;padding:7px 14px;border-radius:999px;background:#fff0bf;color:#8a6500;font-weight:800">⏳ به‌زودی</span>';
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
