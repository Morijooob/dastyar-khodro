(() => {
  'use strict';

  const safeChecked = name => document.querySelector(`input[name="${name}"]:checked`);
  const fa = n => Number(n || 0).toLocaleString('fa-IR');
  const normalizeDigits = value => String(value ?? '')
    .replace(/[۰-۹]/g, d => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)))
    .replace(/[٠-٩]/g, d => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)))
    .replace(/[٬,]/g, '')
    .replace(/[٫]/g, '.');
  const parseBudgetToman = value => {
    const n = Number(normalizeDigits(value).trim());
    return Number.isFinite(n) ? n : 0;
  };

  function getMarketPrice(car) {
    const rows = Array.isArray(window.marketPrices) ? window.marketPrices : [];
    if (!rows.length) return Number(car.price);
    const matches = rows.filter(x => x.carId === car.id && Number.isFinite(Number(x.price)) && x.date);
    if (!matches.length) return Number(car.price);
    const latestDate = matches.map(x => x.date).sort().reverse()[0];
    const latest = matches.filter(x => x.date === latestDate);
    return Math.round(latest.reduce((s, x) => s + Number(x.price), 0) / latest.length);
  }

  function getListings(car) {
    if (!Array.isArray(window.listings)) return [];
    return window.listings.filter(x => x.carId === car.id && Number.isFinite(Number(x.price))).map(x => ({ ...x, price: Number(x.price), year: Number(x.year) || null, mileage: Number(x.mileage) || null }));
  }

  function scoreCar(car, p) {
    const price = getMarketPrice(car);
    let score = 0;
    const reasons = [];
    const gap = Math.abs(price - p.budget) / Math.max(p.budget, 1);
    score += Math.max(0, 30 - gap * 30);
    if (price <= p.budget) reasons.push('داخل بودجه شماست.');
    if (p.gearbox === 'any' || car.gearbox === p.gearbox) { score += 20; reasons.push('گیربکس مطابق انتخاب شماست.'); }
    if (Array.isArray(car.uses) && car.uses.includes(p.use)) { score += 15; reasons.push(p.use === 'city' ? 'برای استفاده شهری مناسب است.' : p.use === 'family' ? 'برای استفاده خانوادگی مناسب است.' : 'برای سفر مناسب است.'); }
    if ((p.priority === 'cheap' && car.maintenance >= 7) || (p.priority === 'fuel' && car.economy >= 7) || (p.priority === 'resale' && car.resale >= 8)) score += 15;
    if (p.priority === 'cheap' && car.maintenance >= 7) reasons.push('هزینه نگهداری امتیاز خوبی دارد.');
    if (p.priority === 'fuel' && car.economy >= 7) reasons.push('مصرف اقتصادی‌تری دارد.');
    if (p.priority === 'resale' && car.resale >= 8) reasons.push('بازار فروش بهتری دارد.');
    if (p.passengers >= 5 && (car.passengers || 5) >= 5) { score += 5; reasons.push('برای ۵ سرنشین مناسب است.'); }
    if (p.passengers <= 2 && Array.isArray(car.uses) && car.uses.includes('city')) score += 3;
    if (p.year === 'new') score += Math.min(8, Math.max(0, (Number(car.year) - 1398) * 1.2));
    if (p.year === 'old') score += Math.min(8, Math.max(0, (1403 - Number(car.year)) * 1.2));
    if (p.year === 'balanced') score += 5;
    const bestListing = getListings(car).sort((a,b) => Math.abs(a.price-price) - Math.abs(b.price-price))[0];
    if (bestListing && bestListing.price <= price * .95) { score += 5; reasons.push('یک آگهی نمونه پایین‌تر از قیمت مرجع دارد.'); }
    return { ...car, price, match: Math.max(0, Math.min(100, Math.round(score))), reasons: reasons.slice(0, 4), bestListing };
  }

  function removeResults() {
    document.getElementById('results')?.remove();
    document.getElementById('app-error')?.remove();
  }

  function render(results, p) {
    removeResults();
    const section = document.createElement('section');
    section.id = 'results';
    section.className = 'results';
    section.innerHTML = `<div class="results-head"><div><span class="eyebrow">تحلیل دستیار خودرو</span><h2>🚗 پیشنهادهای مناسب تو</h2></div><span class="experimental">نسخه 1.1.4</span></div>` + results.map((c,i) => `<article class="result-card ${i === 0 ? 'top-pick' : ''}">
      <div class="result-top"><div><span class="rank">${i === 0 ? '🏆 پیشنهاد اول' : `گزینه ${i+1}`}</span><h3>${c.name || c.title || 'خودرو'}</h3></div><div class="score"><strong>${c.match}</strong><small>امتیاز</small></div></div>
      <div class="price">💰 ${fa(c.price)} میلیون تومان</div>
      <div class="price-meta">بودجه شما: ${fa(p.budget)} میلیون تومان · فقط خودروهای داخل بودجه</div>
      <div class="reason-title">چرا این گزینه؟</div><ul>${c.reasons.map(x => `<li>${x}</li>`).join('')}</ul>
      ${c.bestListing ? `<div class="listing-summary"><strong>🔎 آگهی نمونه: ${fa(c.bestListing.price)} میلیون</strong><span>${c.bestListing.city || 'شهر نامشخص'}${c.bestListing.year ? ' · مدل '+c.bestListing.year : ''}${c.bestListing.mileage ? ' · '+fa(c.bestListing.mileage)+' کیلومتر' : ''}</span></div>` : ''}
      ${i === 0 ? '<span class="best-badge">⭐ بهترین تطبیق با انتخاب‌های شما</span>' : ''}
    </article>`).join('') + `<div class="data-note">نسخه برنامه: 1.1.4 · بودجه: ${fa(p.budget)} میلیون · ${p.gearbox === 'any' ? 'هر گیربکس' : p.gearbox === 'auto' ? 'اتومات' : 'دنده‌ای'} · ${p.use === 'city' ? 'شهری' : p.use === 'family' ? 'خانوادگی' : 'سفر'} · اولویت: ${p.priority === 'cheap' ? 'هزینه نگهداری' : p.priority === 'fuel' ? 'مصرف سوخت' : 'فروش مجدد'} · ${p.passengers} سرنشین · ${p.year}</div>`;
    document.querySelector('main').appendChild(section);
    section.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function showNoBudgetMatch(p, minPrice) {
    removeResults();
    const section = document.createElement('section');
    section.id = 'results';
    section.className = 'results';
    section.innerHTML = `<div class="results-head"><div><span class="eyebrow">نتیجه تحلیل</span><h2>😕 خودرویی داخل بودجه پیدا نشد</h2></div><span class="experimental">نسخه 1.1.4</span></div><article class="result-card top-pick"><div class="reason-title">بودجه انتخابی شما: ${fa(p.budget)} میلیون تومان</div><p style="color:var(--muted);margin:8px 0 0">در اطلاعات فعلی، ارزان‌ترین خودروی قابل پیشنهاد حدود <strong>${fa(minPrice)} میلیون تومان</strong> است. خودروهای بالاتر از بودجه نمایش داده نمی‌شوند.</p><div class="data-note">نسخه برنامه: 1.1.4 · فیلتر بودجه فعال است · هیچ خودروی بالاتر از بودجه اجازه نمایش ندارد.</div></article>`;
    document.querySelector('main').appendChild(section);
    section.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function showError(message) {
    document.getElementById('app-error')?.remove();
    const box = document.createElement('div');
    box.id = 'app-error';
    box.style.cssText = 'max-width:720px;margin:16px auto;padding:14px;border-radius:14px;background:#fff2ed;border:1px solid #f1d0c3;color:#8b2e13;font-weight:700;text-align:center;';
    box.textContent = message;
    document.getElementById('car-form')?.before(box);
  }

  function init() {
    const form = document.getElementById('car-form');
    if (!form) return showError('فرم خودرو پیدا نشد.');

    const budgetInput = document.getElementById('budget');
    if (budgetInput) {
      budgetInput.addEventListener('input', () => {
        const digits = normalizeDigits(budgetInput.value).replace(/\D/g, '');
        budgetInput.value = digits ? Number(digits).toLocaleString('fa-IR') : '';
      });
    }

    form.addEventListener('submit', e => {
      e.preventDefault();
      try {
        removeResults();
        const budgetToman = parseBudgetToman(document.getElementById('budget')?.value);
        const budget = budgetToman / 1000000;
        const gearbox = safeChecked('gearbox'), use = safeChecked('use'), priority = safeChecked('priority'), year = safeChecked('year'), passengers = safeChecked('passengers');
        if (!budgetToman || budgetToman <= 0) return showError('لطفاً مبلغ دقیق بودجه را به تومان وارد کن. مثلاً ۵۰۰,۰۰۰,۰۰۰ تومان.');
        if (!gearbox || !use || !priority || !year || !passengers) return showError('لطفاً همه انتخاب‌ها را کامل کن.');
        if (!Array.isArray(window.carData) || !window.carData.length) return showError('اطلاعات خودروها بارگذاری نشده است.');
        const p = { budget, gearbox: gearbox.value, use: use.value, priority: priority.value, year: year.value, passengers: Number(passengers.value) };

        const scored = window.carData.map(c => scoreCar(c, p));
        const affordable = scored.filter(c => Number.isFinite(c.price) && c.price > 0 && c.price <= p.budget);

        if (!affordable.length) {
          const prices = scored.map(c => c.price).filter(price => Number.isFinite(price) && price > 0);
          return showNoBudgetMatch(p, prices.length ? Math.min(...prices) : 0);
        }

        const finalResults = affordable
          .filter(c => c.price <= p.budget)
          .sort((a,b) => b.match - a.match)
          .slice(0,3);

        if (!finalResults.length) {
          const prices = scored.map(c => c.price).filter(price => Number.isFinite(price) && price > 0);
          return showNoBudgetMatch(p, prices.length ? Math.min(...prices) : 0);
        }

        render(finalResults, p);
      } catch (err) {
        console.error(err);
        showError('در تحلیل خودرو خطایی رخ داد. لطفاً دوباره تلاش کن.');
      }
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
