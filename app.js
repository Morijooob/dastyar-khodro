function getPriceHistory(carId) {
  if (!Array.isArray(marketPrices)) return [];
  return marketPrices
    .filter(p => p.carId === carId && Number.isFinite(Number(p.price)) && p.date)
    .sort((a, b) => String(b.date).localeCompare(String(a.date)));
}

function getAverageForDate(history, date) {
  const sameDay = history.filter(p => p.date === date);
  if (!sameDay.length) return null;
  const average = sameDay.reduce((sum, p) => sum + Number(p.price), 0) / sameDay.length;
  return {
    price: Math.round(average),
    date,
    source: sameDay.length > 1 ? 'میانگین چند منبع' : sameDay[0].source,
    sourceCount: sameDay.length
  };
}

function getLatestMarketPrice(carId) {
  const history = getPriceHistory(carId);
  return history.length ? getAverageForDate(history, history[0].date) : null;
}

function getPreviousMarketPrice(carId) {
  const history = getPriceHistory(carId);
  if (!history.length) return null;
  const previousDate = history.find(p => p.date !== history[0].date)?.date;
  return previousDate ? getAverageForDate(history, previousDate) : null;
}

function getPriceChange(carId) {
  const latest = getLatestMarketPrice(carId);
  const previous = getPreviousMarketPrice(carId);
  if (!latest || !previous || !previous.price) return null;
  const amount = latest.price - previous.price;
  const percent = amount / previous.price * 100;
  return { amount, percent, direction: amount > 0 ? 'up' : amount < 0 ? 'down' : 'flat' };
}

function getValueForMoney(car, budget) {
  const budgetFit = budget > 0 ? Math.max(0, Math.min(100, 100 - Math.abs(car.price - budget) / budget * 100)) : 0;
  const quality = ((car.maintenance || 5) + (car.economy || 5) + (car.resale || 5) + (10 - (car.risk || 5))) * 2.5;
  const pricePressure = car.price <= budget ? 100 : Math.max(0, 100 - (car.price - budget) / budget * 100);
  const trendPenalty = car.priceChange && car.priceChange.percent > 10 ? Math.min(12, car.priceChange.percent - 10) : 0;
  const score = budgetFit * .35 + quality * .35 + pricePressure * .30 - trendPenalty;
  return { score: Math.max(0, Math.min(100, score)), value: score >= 78 ? 'بالا' : score >= 62 ? 'متوسط' : 'پایین' };
}

function getListingsForCar(carId) {
  return (Array.isArray(listings) ? listings : [])
    .filter(x => x.carId === carId && Number.isFinite(Number(x.price)))
    .map(x => ({ ...x, price: Number(x.price), year: Number(x.year) || null, mileage: Number(x.mileage) || null }));
}

function getListingValue(listing, referencePrice) {
  const diff = Number(listing.price) - Number(referencePrice);
  const percent = referencePrice ? diff / referencePrice * 100 : 0;
  return { difference: diff, percent };
}

function getListingVerdict(listing, referencePrice) {
  const value = getListingValue(listing, referencePrice);
  if (value.percent <= -10) return { label: 'خیلی پایین‌تر از مرجع', tone: 'good', risk: 'بررسی علت اختلاف ضروری است' };
  if (value.percent <= -5) return { label: 'پایین‌تر از مرجع', tone: 'good', risk: 'ارزش بررسی بالا' };
  if (value.percent >= 10) return { label: 'بالاتر از مرجع', tone: 'bad', risk: 'احتمال قیمت‌گذاری بالا' };
  if (value.percent >= 5) return { label: 'کمی بالاتر از مرجع', tone: 'warning', risk: 'نیازمند مقایسه' };
  return { label: 'نزدیک به مرجع', tone: 'neutral', risk: 'ارزش بررسی معمولی' };
}

function getListingFreshnessScore(observedAt) {
  if (!observedAt) return 40;
  const parts = String(observedAt).split('-').map(Number);
  if (parts.length !== 3 || parts.some(Number.isNaN)) return 40;
  const day = parts[2] + parts[1] * 31 + parts[0] * 365;
  const now = 1405 * 365 + 6 * 31 + 15;
  const age = Math.max(0, now - day);
  return Math.max(20, 100 - age * 8);
}

function getListingScore(listing, referencePrice) {
  const value = getListingValue(listing, referencePrice);
  const verdict = getListingVerdict(listing, referencePrice);
  const priceScore = value.percent <= 0
    ? Math.max(55, Math.min(100, 82 - Math.abs(value.percent) * 1.5))
    : Math.max(25, 82 - value.percent * 3);
  const mileageScore = listing.mileage ? Math.max(35, Math.min(100, 100 - listing.mileage / 2500)) : 55;
  const yearScore = listing.year ? Math.max(45, Math.min(100, 55 + (listing.year - 1400) * 4)) : 55;
  const freshnessScore = getListingFreshnessScore(listing.observedAt);
  const score = priceScore * .45 + mileageScore * .20 + yearScore * .15 + freshnessScore * .20;
  const confidence = listing.year && listing.mileage && listing.observedAt ? 'متوسط' : 'پایین';
  return {
    ...listing,
    difference: value.difference,
    percent: value.percent,
    verdict,
    score: Math.round(Math.max(0, Math.min(100, score))),
    confidence
  };
}

function explainListing(listing) {
  const reasons = [];
  if (listing.percent <= -5) reasons.push(`قیمت آگهی حدود ${Math.abs(listing.percent).toFixed(1)}٪ پایین‌تر از مرجع است.`);
  else if (listing.percent >= 5) reasons.push(`قیمت آگهی حدود ${listing.percent.toFixed(1)}٪ بالاتر از مرجع است.`);
  else reasons.push('قیمت آگهی به قیمت مرجع بازار نزدیک است.');
  if (listing.mileage) reasons.push(`کارکرد ثبت‌شده ${listing.mileage.toLocaleString('fa-IR')} کیلومتر است.`);
  if (listing.year) reasons.push(`مدل ${listing.year} است.`);
  if (listing.verdict && listing.verdict.risk) reasons.push(listing.verdict.risk + '.');
  return reasons.slice(0, 3);
}

function getBestListing(car) {
  return getListingsForCar(car.id)
    .map(listing => ({ ...getListingScore(listing, car.price), reasons: explainListing(getListingScore(listing, car.price)) }))
    .sort((a, b) => b.score - a.score)[0] || null;
}

function getListingSummary(car) {
  const items = getListingsForCar(car.id).map(listing => getListingScore(listing, car.price));
  if (!items.length) return { count: 0, best: null, belowReference: 0, aboveReference: 0 };
  return {
    count: items.length,
    best: items.sort((a, b) => b.score - a.score)[0],
    belowReference: items.filter(x => x.percent <= -5).length,
    aboveReference: items.filter(x => x.percent >= 5).length
  };
}

const cars = (Array.isArray(carData) ? carData : []).map(car => {
  const market = getLatestMarketPrice(car.id);
  const change = getPriceChange(car.id);
  return {
    ...car,
    price: market ? market.price : car.price,
    priceDate: market ? market.date : car.priceDate,
    priceSource: market ? market.source : car.priceSource,
    priceIsMarket: Boolean(market),
    priceChange: change
  };
});

const form = document.getElementById('car-form');

function scoreCar(car, p) {
  let s = 0;
  const reasons = [];
  const gap = Math.abs(car.price - p.budget) / Math.max(p.budget, 1);
  s += Math.max(0, 30 - gap * 30);
  if (car.price <= p.budget) { s += 15; reasons.push('داخل بودجه شماست.'); }
  else { s -= Math.min(12, 8 + gap * 10); reasons.push('بالاتر از بودجه شماست؛ گزینه نزدیک‌تری برای مقایسه است.'); }
  if (p.gearbox === 'any' || car.gearbox === p.gearbox) { s += 20; reasons.push(p.gearbox === 'auto' ? 'گیربکس اتومات مطابق انتخاب شماست.' : p.gearbox === 'manual' ? 'گیربکس دنده‌ای مطابق انتخاب شماست.' : 'گیربکس با نیاز شما سازگار است.'); }
  if (car.uses.includes(p.use)) { s += 15; reasons.push(p.use === 'city' ? 'برای استفاده شهری مناسب است.' : p.use === 'family' ? 'برای استفاده خانوادگی مناسب است.' : 'برای سفر مناسب است.'); }
  if ((p.priority === 'cheap' && car.maintenance >= 7) || (p.priority === 'fuel' && car.economy >= 7) || (p.priority === 'resale' && car.resale >= 8)) { s += 15; reasons.push(p.priority === 'cheap' ? 'هزینه نگهداری امتیاز خوبی دارد.' : p.priority === 'fuel' ? 'مصرف اقتصادی‌تری دارد.' : 'بازار فروش بهتری دارد.'); }
  if (p.passengers >= 5 && (car.passengers || 5) >= 5) { s += 5; reasons.push('برای ۵ سرنشین مناسب‌تر است.'); }
  if (p.passengers <= 2 && car.uses.includes('city')) s += 3;
  const value = getValueForMoney(car, p.budget);
  s += Math.min(10, value.score / 10);
  if (value.value === 'بالا') reasons.push('نسبت قیمت به کیفیت و هزینه نگهداری جذاب‌تر است.');
  const listingSummary = getListingSummary(car);
  if (listingSummary.best && listingSummary.best.percent <= -5) {
    s += Math.min(5, Math.abs(listingSummary.best.percent) / 3);
    reasons.push('حداقل یک آگهی نمونه پایین‌تر از مرجع بازار دیده شده است.');
  }
  return {
    ...car,
    match: Math.max(0, Math.min(99, s)),
    reasons: reasons.slice(0, 4),
    valueScore: value.score,
    valueLabel: value.value,
    listingSummary
  };
}

function formatDate(date) {
  if (!date) return 'نامشخص';
  const parts = String(date).split('-');
  const months = {'01':'فروردین','02':'اردیبهشت','03':'خرداد','04':'تیر','05':'مرداد','06':'شهریور','07':'مهر','08':'آبان','09':'آذر','10':'دی','11':'بهمن','12':'اسفند'};
  return parts.length === 3 ? `${parts[2]} ${months[parts[1]] || parts[1]} ${parts[0]}` : String(date);
}

function formatPriceChange(change) {
  if (!change) return '';
  if (change.direction === 'flat') return '↔️ بدون تغییر نسبت به مشاهده قبلی';
  const sign = change.amount > 0 ? '+' : '';
  return `${change.amount > 0 ? '📈' : '📉'} تغییر اخیر: ${sign}${change.amount.toLocaleString('fa-IR')} میلیون (${sign}${change.percent.toFixed(1)}٪)`;
}

function renderListing(listing) {
  if (!listing) return '';
  const diffSign = listing.difference > 0 ? '+' : '';
  const reasons = listing.reasons.map(reason => `<li>${reason}</li>`).join('');
  return `<div class="listing-box">
    <div class="listing-head"><div><span class="listing-eyebrow">🔎 بهترین آگهی نمونه</span><strong>${listing.title}</strong><span>${listing.city || 'شهر نامشخص'} · ${listing.year ? `مدل ${listing.year}` : 'سال نامشخص'}${listing.mileage ? ` · ${listing.mileage.toLocaleString('fa-IR')} کیلومتر` : ''}</span></div><div class="listing-score"><strong>${listing.score}</strong><small>ارزش آگهی</small></div></div>
    <div class="listing-price-row"><strong>${listing.price.toLocaleString('fa-IR')} میلیون</strong><span class="listing-gap ${listing.verdict.tone}">${diffSign}${Math.round(listing.difference).toLocaleString('fa-IR')} میلیون · ${listing.verdict.label}</span></div>
    <ul class="listing-reasons">${reasons}</ul>
    <div class="listing-confidence">اطمینان تحلیل: ${listing.confidence} · ⚠️ نمونه آموزشی؛ کارشناسی بدنه و فنی تأیید نشده.</div>
  </div>`;
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
  section.innerHTML = `<div class="results-head"><div><span class="eyebrow">تحلیل دستیار خودرو</span><h2>🚗 پیشنهادهای مناسب تو</h2></div><span class="experimental">قیمت‌ها تاریخ‌دارند؛ زنده نیستند</span></div>${ranked.map((c, i) => `<article class="result-card ${i === 0 ? 'top-pick' : ''}"><div class="result-top"><div><span class="rank">پیشنهاد ${i + 1}</span><h3>${c.name}</h3></div><div class="score"><strong>${Math.round(c.match)}٪</strong><small>تطابق</small></div></div><div class="price">حدود ${c.price.toLocaleString('fa-IR')} میلیون تومان</div><div class="price-meta">📅 آخرین مشاهده: ${formatDate(c.priceDate)} · منبع: ${c.priceSource || 'داده پایه'}${c.priceIsMarket ? ' · بازار' : ' · پایه'}</div>${c.priceChange ? `<div class="price-change ${c.priceChange.direction}">${formatPriceChange(c.priceChange)}</div>` : ''}<div class="value-box"><strong>💰 ارزش خرید: ${c.valueLabel}</strong><span>امتیاز ارزش ${Math.round(c.valueScore)} از ۱۰۰</span></div><div class="listing-summary"><strong>📋 تحلیل آگهی</strong><span>${c.listingSummary.count ? `${c.listingSummary.count} آگهی نمونه · ${c.listingSummary.belowReference} مورد پایین‌تر از مرجع` : 'فعلاً آگهی نمونه‌ای برای این خودرو نداریم.'}</span></div>${renderListing(c.listingSummary.best)}<p class="reason-title">چرا اینو پیشنهاد دادیم؟</p><ul>${c.reasons.map(x => `<li>${x}</li>`).join('')}</ul><div class="pros"><strong>نقاط قوت:</strong> ${c.pros.join('، ')}</div><div class="weakness"><strong>نقطه ضعف:</strong> ${c.cons.join('، ')}</div>${i === 0 ? '<div class="best-badge">⭐ انتخاب پیشنهادی</div>' : ''}</article>`).join('')}<p class="data-note">تحلیل آگهی فعلی بر پایه داده نمونه است و قیمت مرجع نیز snapshot بازار است. «ارزش آگهی» جای کارشناسی فنی، بررسی سند و تأیید اصالت خودرو را نمی‌گیرد. در نسخه واقعی، آگهی‌های زنده باید سرورمحور جمع‌آوری، نرمال‌سازی و تازه‌سازی شوند.</p>`;
  form.after(section);
  section.scrollIntoView({ behavior: 'smooth', block: 'start' });
});
