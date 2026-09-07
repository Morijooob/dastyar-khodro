(() => {
  'use strict';

  const safeChecked = name => document.querySelector(`input[name="${name}"]:checked`);
  const fa = n => Number(n || 0).toLocaleString('fa-IR');

  function getMarketPrice(car) {
    if (!Array.isArray(window.marketPrices)) return car.price;
    const rows = window.marketPrices.filter(x => x.carId === car.id && Number.isFinite(Number(x.price)) && x.date);
    if (!rows.length) return car.price;
    const latestDate = rows.map(x => x.date).sort().reverse()[0];
    const latest = rows.filter(x => x.date === latestDate);
    return Math.round(latest.reduce((s, x) => s + Number(x.price), 0) / latest.length);
  }

  function getListings(car) {
    if (!Array.isArray(window.listings)) return [];
    return window.listings.filter(x => x.carId === car.id && Number.isFinite(Number(x.price))).map(x => ({
      ...x, price: Number(x.price), year: Number(x.year) || null, mileage: Number(x.mileage) || null
    }));
  }

  function scoreCar(car, p) {
    const price = getMarketPrice(car);
    let score = 0;
    const reasons = [];
    const gap = Math.abs(price - p.budget) / Math.max(p.budget, 1);

    // Budget is a hard filter in init(); scoring only ranks cars already inside budget.
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

  function render(results, p) {
    const old = document.getElementById('results');
    if (old) old.remove();
    const section = document.createElement('section');
    section.id = 'results';
    section.className = 'results';
    section.innerHTML = `<div class="results-head"><div><span class="eyebrow">تحلیل دستیار خودرو</span><h2>🚗 پیشنهادهای مناسب تو</h2></div><span class="experimental">نسخه جدید · تحلیل مقاوم‌تر</span></div>` +
      results.map((c,i) => `<article class="result-card ${i === 0 ? 'top-pick' : ''}">
        <div class="result-top"><div><span class="rank">${i === 0 ? '🏆 پیشنهاد اول' : `گزینه ${i+1}`}</span><h3>${c.name || c.title || 'خودرو'}</h3></div><div class="score"><strong>${Number.isFinite(Number(c.match)) ? Number(c.match) : 0}</strong><small>امتیاز</small></div></div>
        <div class="price">💰 ${fa(c.price)} میلیون تومان</div>
        <div class="price-meta">بودجه شما: ${fa(p.budget)} میلیون تومان · فقط خودروهای داخل بودجه نمایش داده می‌شوند.</div>
        <div class="reason-title">چرا این گزینه؟</div><ul>${c.reasons.map(x => `<li>${x}</li>`).join('')}</ul>
        ${c.bestListing ? `<div class="listing-summary"><strong>🔎 آگهی نمونه: ${fa(c.bestListing.price)} میلیون</strong><span>${c.bestListing.city || 'شهر نامشخص'} · ${c.bestListing.year ? 'مدل '+c.bestListing.year : 'سال نامشخص'}${c.bestListing.mileage ? ' · '+fa(c.bestListing.mileage)+' کیلومتر' : ''}</span></div>` : ''}
        ${i === 0 ? '<span class="best-badge">⭐ بهترین تطبیق با انتخاب‌های شما</span>' : ''}
      </article>`).join('') + `<div class="data-note">انتخاب‌ها: ${p.gearbox === 'any' ? 'هر گیربکس' : p.gearbox === 'auto' ? 'اتومات' : 'دنده‌ای'} · ${p.use === 'city' ? 'شهری' : p.use === 'family' ? 'خانوادگی' : 'سفر'} · اولویت: ${p.priority === 'cheap' ? 'هزینه نگهداری' : p.priority === 'fuel' ? 'مصرف سوخت' : 'فروش مجدد'} · ${p.passengers} سرنشین · ${p.year}</div>`;
    document.querySelector('main').appendChild(section);
    section.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function showNoBudgetMatch(p, minPrice) {
    const old = document.getElementById('results');
    if (old) old.remove();
    const section = document.createElement('section');
    section.id = 'results';
    section.className = 'results';
    section.innerHTML = `<div class="results-head"><div><span class="eyebrow">نتیجه تحلیل</span><h2>😕 خودرویی داخل بودجه پیدا نشد</h2></div></div>
      <article class="result-card top-pick">
        <div class="reason-title">بودجه انتخابی شما: ${fa(p.budget)} میلیون تومان</div>
        <p style="color:var(--muted);margin:8px 0 0">در اطلاعات فعلی، ارزان‌ترین خودروی قابل پیشنهاد حدود <strong>${fa(minPrice)} میلیون تومان</strong> است. برای اینکه پیشنهاد اشتباه ندهیم، خودروهای بالاتر از بودجه را به‌عنوان «مناسب» نمایش نمی‌دهیم.</p>
      </article>`;
    document.querySelector('main').appendChild(section);
    section.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function showError(message) {
    const old = document.getElementById('app-error');
    if (old) old.remove();
    const box = document.createElement('div');
    box.id = 'app-error';
    box.style.cssText = 'max-width:720px;margin:16px auto;padding:14px;border-radius:14px;background:#fff2ed;border:1px solid #f1d0c3;color:#8b2e13;font-weight:700;text-align:center;';
    box.textContent = message;
    const form = document.getElementById('car-form');
    if (form) form.before(box);
  }

  function init() {
    const form = document.getElementById('car-form');
    if (!form) return showError('فرم خودرو پیدا نشد. لطفاً برنامه را یک‌بار ببندید و دوباره باز کنید.');
    form.addEventListener('submit', e => {
      e.preventDefault();
      try {
        const budgetEl = document.getElementById('budget');
        const gearbox = safeChecked('gearbox');
        const use = safeChecked('use');
        const priority = safeChecked('priority');
        const year = safeChecked('year');
        const passengers = safeChecked('passengers');
        const budget = Number(budgetEl && budgetEl.value);
        if (!budget || budget <= 0) return showError('لطفاً بودجه را به میلیون تومان وارد کن.');
        if (!gearbox || !use || !priority || !year || !passengers) return showError('لطفاً همه انتخاب‌ها را کامل کن.');
        if (!Array.isArray(window.carData) || !window.carData.length) return showError('اطلاعات خودروها بارگذاری نشده است.');

        const p = { budget, gearbox: gearbox.value, use: use.value, priority: priority.value, year: year.value, passengers: Number(passengers.value) };
        const scored = window.carData.map(c => scoreCar(c,p));

        // HARD BUDGET RULE: never rank or render a car whose current reference price is above the user's budget.
        const affordable = scored.filter(c => Number.isFinite(Number(c.price)) && Number(c.price) <= p.budget);
        if (!affordable.length) {
          const validPrices = scored.map(c => Number(c.price)).filter(Number.isFinite);
          const minPrice = validPrices.length ? Math.min(...validPrices) : 0;
          return showNoBudgetMatch(p, minPrice);
        }

        const ranked = affordable.sort((a,b) => b.match-a.match).slice(0,3);
        render(ranked,p);
      } catch (err) {
        console.error(err);
        showError('در تحلیل خودرو خطایی رخ داد. لطفاً برنامه را دوباره باز کن.');
      }
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
