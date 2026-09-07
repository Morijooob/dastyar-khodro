(() => {
  'use strict';

  function removeOldMarketplaceLinks() {
    document.querySelectorAll('.marketplace-actions a').forEach(a => {
      if (/باما|شیپور|Bama|Sheypoor/i.test(a.textContent || '')) a.remove();
    });
    document.querySelectorAll('.listing-summary').forEach(summary => {
      const small = summary.querySelector('small');
      if (small && small.textContent.includes('مسیر جستجوی بازار')) {
        small.textContent = 'این دکمه مسیر جستجوی دیوار است، نه آگهی مشخص. اطلاعات ساختگی وارد سیستم نمی‌کنیم.';
      }
    });
  }

  function openScoreDetails() {
    document.querySelectorAll('details.score-details').forEach(d => { d.open = true; });
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

  function addResultsTools() {
    const results = document.getElementById('results');
    if (!results || results.querySelector('.results-tools')) return;
    const tools = document.createElement('div');
    tools.className = 'results-tools';
    tools.innerHTML = '<button type="button" class="edit-search">✏️ تغییر شرایط جستجو</button><span>می‌توانی بودجه، شهر یا اولویت‌ها را تغییر بدهی.</span>';
    results.insertBefore(tools, results.firstChild);
    tools.querySelector('button').addEventListener('click', () => {
      const form = document.getElementById('car-form');
      if (form) form.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  function addBudgetFormatting() {
    const input = document.getElementById('budget');
    if (!input || input.dataset.polished === '1') return;
    input.dataset.polished = '1';
    input.addEventListener('input', () => {
      const raw = String(input.value || '').replace(/[^0-9۰-۹]/g, '');
      if (!raw) return;
      const latin = raw.replace(/[۰-۹]/g, d => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)));
      input.value = Number(latin).toLocaleString('fa-IR');
    });
  }

  function addFormFeedback() {
    const form = document.getElementById('car-form');
    const button = form?.querySelector('.cta');
    if (!form || !button || button.dataset.feedbackReady === '1') return;
    button.dataset.feedbackReady = '1';
    form.addEventListener('submit', () => {
      button.classList.add('is-loading');
      button.setAttribute('aria-busy', 'true');
      button.innerHTML = '<span>⏳</span> در حال بررسی گزینه‌ها...';
      window.setTimeout(() => {
        button.classList.remove('is-loading');
        button.removeAttribute('aria-busy');
        button.innerHTML = '<span>🚀</span> ماشین مناسب من را پیدا کن';
      }, 2500);
    }, { capture: true });
  }

  function fixAll() {
    removeOldMarketplaceLinks();
    openScoreDetails();
    addSellerPromo();
    addResultsTools();
    addBudgetFormatting();
    addFormFeedback();
  }

  let queued = false;
  const observer = new MutationObserver(() => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => { queued = false; fixAll(); });
  });
  observer.observe(document.body, { childList: true, subtree: true });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fixAll);
  else fixAll();
})();
