(() => {
  'use strict';
  const BAMA_BASE = 'https://bama.ir/car/';

  function bamaSlugForCar(car) {
    const id = String(car?.id || '').toLowerCase();
    const map = [
      [/^peugeot-405/, 'peugeot-405'],
      [/^peugeot-206/, 'peugeot-206'],
      [/^peugeot-207/, 'peugeot-207'],
      [/^quick/, 'quick'],
      [/^tiba2?/, 'tiba'],
      [/^saina/, 'saina'],
      [/^atlas/, 'atlas'],
      [/^sehand/, 'sehand'],
      [/^soren/, 'soren'],
      [/^rana/, 'rana'],
      [/^dena/, 'dena'],
      [/^samand/, 'samand'],
      [/^tara/, 'tara'],
      [/^shahin/, 'shahin'],
      [/^pride/, 'pride']
    ];
    const hit = map.find(([re]) => re.test(id));
    if (hit) return hit[1];
    return id.replace(/-used-\d{4}$/, '').replace(/-(manual|auto|gxl|gl|rs|s|e-auto|tu3)$/, '');
  }

  function bamaUrlForCard(box) {
    const card = box.closest('.result-card');
    const title = card?.querySelector('h3')?.textContent?.trim();
    const car = Array.isArray(window.carData) ? window.carData.find(x => String(x.name || x.title || '').trim() === title) : null;
    const slug = bamaSlugForCar(car);
    return slug ? `${BAMA_BASE}${encodeURIComponent(slug)}` : BAMA_BASE.slice(0, -1);
  }

  function fixResults() {
    document.querySelectorAll('.price-change.flat').forEach(el => {
      if (el.textContent.includes('اطلاعات آگهی قابل مقایسه')) {
        el.textContent = 'ℹ️ برای این مدل آگهی مقایسه‌ای ثبت‌شده در بانک فعلی نداریم؛ برای دیدن آگهی‌های زنده از دکمه‌های بازار پایین کارت استفاده کن.';
      }
    });

    document.querySelectorAll('.marketplace-actions').forEach(box => {
      const links = [...box.querySelectorAll('a')];
      const bamaLinks = links.filter(a => /باما/.test(a.textContent || ''));
      let a = bamaLinks[0];
      if (!a) {
        a = document.createElement('a');
        a.className = 'listing-link listing-bama';
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        a.innerHTML = '<b>باما</b><small>مشاهده مدل در باما</small>';
        box.appendChild(a);
      }
      a.classList.add('listing-bama');
      a.href = bamaUrlForCard(box);
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      bamaLinks.slice(1).forEach(x => x.remove());
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