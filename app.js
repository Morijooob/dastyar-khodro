const latestMarketPrice = (carId) => {
  if (!Array.isArray(marketPrices)) return null;
  return marketPrices
    .filter(p => p.carId === carId)
    .sort((a, b) => String(b.date).localeCompare(String(a.date)))[0] || null;
};

const cars = (Array.isArray(carData) ? carData : []).map(car => {
  const market = latestMarketPrice(car.id);
  return {
    ...car,
    price: market ? market.price : car.price,
    priceDate: market ? market.date : car.priceDate,
    priceSource: market ? market.source : car.priceSource,
    priceIsMarket: Boolean(market)
  };
});

const form = document.getElementById('car-form');

function scoreCar(car, p) {
  let s = 0;
  const reasons = [];
  const gap = Math.abs(car.price - p.budget) / Math.max(p.budget, 1);
  s += Math.max(0, 30 - gap * 30);

  if (car.price <= p.budget) {
    s += 15;
    reasons.push('داخل بودجه شماست.');
  } else {
    s -= Math.min(12, 8 + gap * 10);
    reasons.push('بالاتر از بودجه شماست؛ گزینه نزدیک‌تری برای مقایسه است.');
  }
  if (p.gearbox === 'any' || car.gearbox === p.gearbox) {
    s += 20;
    reasons.push(p.gearbox === 'auto' ? 'گیربکس اتومات مطابق انتخاب شماست.' : p.gearbox === 'manual' ? 'گیربکس دنده‌ای مطابق انتخاب شماست.' : 'گیربکس با نیاز شما سازگار است.');
  }
  if (car.uses.includes(p.use)) {
    s += 15;
    reasons.push(p.use === 'city' ? 'برای استفاده شهری مناسب است.' : p.use === 'family' ? 'برای استفاده خانوادگی مناسب است.' : 'برای سفر مناسب است.');
  }
  if ((p.priority === 'cheap' && car.maintenance >= 7) || (p.priority === 'fuel' && car.economy >= 7) || (p.priority === 'resale' && car.resale >= 8)) {
    s += 15;
    reasons.push(p.priority === 'cheap' ? 'هزینه نگهداری امتیاز خوبی دارد.' : p.priority === 'fuel' ? 'مصرف اقتصادی‌تری دارد.' : 'بازار فروش بهتری دارد.');
  }
  if (p.passengers >= 5 && car.passengers >= 5) {
    s += 5;
    reasons.push('برای ۵ سرنشین مناسب‌تر است.');
  }
  if (p.passengers <= 2 && car.uses.includes('city')) s += 3;
  if (car.year === p.year) s += 5;
  return { ...car, match: Math.max(0, Math.min(99, s)), reasons: reasons.slice(0, 4) };
}

function formatDate(date) {
  if (!date) return 'نامشخص';
  return String(date).replace(/^1405-0?/, 'شهریور ').replace('-', '/');
}

if (form) form.addEventListener('submit', e => {
  e.preventDefault();
  const p = {
    budget: Number(document.getElementById('budget').value),
    gearbox: document.querySelector('input[name="gearbox"]:checked').value,
    use: document.querySelector('input[name="use"]:checked').value,
    priority: document.querySelector('input[name="priority"]:checked').value,
    year: document.querySelector('input[name="year"]:checked').value,
    passengers: Number(document.querySelector('input[name="passengers"]:checked').value)
  };

  const ranked = cars.map(c => scoreCar(c, p)).sort((a, b) => b.match - a.match).slice(0, 3);
  const old = document.getElementById('results');
  if (old) old.remove();

  const section = document.createElement('section');
  section.id = 'results';
  section.className = 'results';
  section.innerHTML = `<div class="results-head"><div><span class="eyebrow">تحلیل دستیار خودرو</span><h2>🚗 پیشنهادهای مناسب تو</h2></div><span class="experimental">قیمت‌ها تاریخ‌دارند؛ زنده نیستند</span></div>${ranked.map((c, i) => `<article class="result-card ${i === 0 ? 'top-pick' : ''}"><div class="result-top"><div><span class="rank">پیشنهاد ${i + 1}</span><h3>${c.name}</h3></div><div class="score"><strong>${Math.round(c.match)}٪</strong><small>تطابق</small></div></div><div class="price">حدود ${c.price.toLocaleString('fa-IR')} میلیون تومان</div><div class="price-meta">📅 آخرین قیمت ثبت‌شده: ${formatDate(c.priceDate)} · منبع: ${c.priceSource || 'داده پایه'}${c.priceIsMarket ? ' · بازار' : ' · پایه'}</div><p class="reason-title">چرا اینو پیشنهاد دادیم؟</p><ul>${c.reasons.map(x => `<li>${x}</li>`).join('')}</ul><div class="pros"><strong>نقاط قوت:</strong> ${c.pros.join('، ')}</div><div class="weakness"><strong>نقطه ضعف:</strong> ${c.cons.join('، ')}</div>${i === 0 ? '<div class="best-badge">⭐ انتخاب پیشنهادی</div>' : ''}</article>`).join('')}<p class="data-note">این قیمت‌ها snapshotهای تاریخ‌دار بازارند، نه قیمت لحظه‌ای. برای خرید واقعی، آگهی، کارکرد، وضعیت بدنه و کارشناسی هم باید بررسی شوند.</p>`;
  form.after(section);
  section.scrollIntoView({ behavior: 'smooth', block: 'start' });
});
