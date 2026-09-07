(() => {
  'use strict';

  function addSellerPromo() {
    const main = document.querySelector('main');
    if (!main || document.getElementById('seller-promo')) return;

    const promo = document.createElement('section');
    promo.id = 'seller-promo';
    promo.className = 'seller-promo';
    promo.innerHTML =
      '<div class="seller-promo-icon">🚘</div>' +
      '<h2>خودروی خود را برای فروش بگذارید</h2>' +
      '<p>به‌زودی می‌توانید آگهی خودروی خود را در دستیار خودرو ثبت کنید و آن را به خریداران معرفی کنید.</p>' +
      '<span>⏳ به‌زودی</span>';

    const how = main.querySelector('.how');
    if (how) how.insertAdjacentElement('afterend', promo);
    else main.appendChild(promo);
  }

  function fixAll() {
    addSellerPromo();
  }

  new MutationObserver(fixAll).observe(document.body, { childList: true, subtree: true });
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', fixAll);
  } else {
    fixAll();
  }
})();