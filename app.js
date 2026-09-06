const cars = [
  {
    name:'پژو ۲۰۷ اتومات', price:2550, score:8.9, gearbox:'auto', uses:['city','family'], priorities:['resale','fuel'], year:'new', passengers:4,
    maintenance:7, economy:7, resale:9, comfort:7, reliability:7,
    text:'برای شهر انتخاب متعادلی است؛ اتومات بودن و بازار فروش مناسب امتیاز مهم آن است.',
    weakness:'قیمت بازار بالاتر است و هزینه خرید اولیه بیشتری می‌خواهد.'
  },
  {
    name:'دنا پلاس دنده‌ای', price:2190, score:8.5, gearbox:'manual', uses:['family','travel'], priorities:['cheap','comfort'], year:'new', passengers:5,
    maintenance:7, economy:6, resale:7, comfort:9, reliability:7,
    text:'اگر فضای بیشتر، راحتی خانواده و سفر برایت مهم است، گزینه قدرتمندی است.',
    weakness:'مصرف و ابعاد آن برای استفاده کاملاً شهری ایده‌آل نیست.'
  },
  {
    name:'سورن پلاس', price:1570, score:8.3, gearbox:'manual', uses:['city','family','travel'], priorities:['cheap','comfort'], year:'balanced', passengers:5,
    maintenance:8, economy:7, resale:7, comfort:8, reliability:7,
    text:'ترکیب خوبی از قیمت، فضای کابین و هزینه نگهداری ارائه می‌دهد.',
    weakness:'گیربکس اتومات ندارد و از نظر امکانات به بعضی گزینه‌های جدیدتر نمی‌رسد.'
  },
  {
    name:'پژو ۲۰۷ دنده‌ای', price:1910, score:8.2, gearbox:'manual', uses:['city'], priorities:['resale','fuel'], year:'new', passengers:4,
    maintenance:7, economy:8, resale:9, comfort:6, reliability:7,
    text:'برای استفاده شهری و کسی که فروش آسان‌تر و مصرف منطقی می‌خواهد، مناسب است.',
    weakness:'فضای کابین و صندوق برای خانواده پرجمعیت محدودتر است.'
  },
  {
    name:'تارا اتوماتیک V4', price:2740, score:8.7, gearbox:'auto', uses:['city','family','travel'], priorities:['comfort','resale'], year:'new', passengers:5,
    maintenance:6, economy:7, resale:8, comfort:9, reliability:7,
    text:'اگر بودجه اجازه بدهد، برای خانواده و سفر به‌خاطر فضا و راحتی گزینه جذابی است.',
    weakness:'قیمت خرید بالاتر و هزینه نگهداری احتمالی بیشتر از گزینه‌های ساده‌تر دارد.'
  },
  {
    name:'کوییک S', price:1210, score:7.9, gearbox:'manual', uses:['city'], priorities:['cheap','fuel'], year:'new', passengers:4,
    maintenance:8, economy:8, resale:7, comfort:5, reliability:7,
    text:'برای بودجه محدود و استفاده روزمره شهری، انتخاب اقتصادی‌تری است.',
    weakness:'از نظر فضای کابین و راحتی سفر از گزینه‌های بزرگ‌تر ضعیف‌تر است.'
  }
];

const form = document.getElementById('car-form');

function scoreCar(car, preferences) {
  let score = car.score;
  const reasons = [];

  const budgetFit = 1 - Math.min(Math.abs(car.price - preferences.budget) / Math.max(preferences.budget, 1), 1);
  score += budgetFit * 2.5;
  if (car.price <= preferences.budget) reasons.push('داخل بودجه شماست');
  else reasons.push('کمی بالاتر از بودجه شماست');

  if (preferences.gearbox === 'any' || car.gearbox === preferences.gearbox) {
    score += 2.2;
    reasons.push(preferences.gearbox === 'auto' ? 'گیربکس اتومات مطابق انتخاب شماست' : preferences.gearbox === 'manual' ? 'گیربکس دنده‌ای مطابق انتخاب شماست' : 'نوع گیربکس با نیاز شما سازگار است');
  }

  if (car.uses.includes(preferences.use)) {
    score += 1.8;
    reasons.push(preferences.use === 'city' ? 'برای استفاده شهری مناسب است' : preferences.use === 'family' ? 'برای استفاده خانوادگی مناسب است' : 'برای سفر مناسب است');
  }

  if (car.priorities.includes(preferences.priority)) {
    score += 1.8;
    reasons.push(preferences.priority === 'cheap' ? 'هزینه نگهداری منطقی‌تری دارد' : preferences.priority === 'fuel' ? 'از نظر مصرف امتیاز خوبی دارد' : 'بازار فروش مناسبی دارد');
  }

  if (car.year === preferences.year) score += 1.2;
  if (preferences.passengers >= 5 && car.passengers >= 5) score += 1.5;
  if (preferences.passengers <= 2 && car.uses.includes('city')) score += 0.8;

  return { ...car, match: Math.min(9.9, score), reasons: reasons.slice(0, 3) };
}

if (form) {
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const preferences = {
      budget: Number(document.getElementById('budget').value),
      gearbox: document.querySelector('input[name="gearbox"]:checked').value,
      use: document.querySelector('input[name="use"]:checked').value,
      priority: document.querySelector('input[name="priority"]:checked').value,
      year: document.querySelector('input[name="year"]:checked').value,
      passengers: Number(document.querySelector('input[name="passengers"]:checked').value)
    };

    let ranked = cars
      .map(car => scoreCar(car, preferences))
      .filter(car => car.price <= preferences.budget * 1.12)
      .sort((a, b) => b.match - a.match)
      .slice(0, 3);

    if (!ranked.length) {
      ranked = cars.map(car => scoreCar(car, preferences))
        .sort((a, b) => Math.abs(a.price - preferences.budget) - Math.abs(b.price - preferences.budget))
        .slice(0, 3);
    }

    const old = document.getElementById('results');
    if (old) old.remove();

    const section = document.createElement('section');
    section.id = 'results';
    section.className = 'results';
    section.innerHTML = `
      <div class="results-head">
        <div><span class="eyebrow">تحلیل دستیار خودرو</span><h2>🚗 پیشنهادهای مناسب تو</h2></div>
        <span class="experimental">قیمت‌ها نمونه بازار و قابل به‌روزرسانی هستند</span>
      </div>
      ${ranked.map((car, i) => `
        <article class="result-card ${i === 0 ? 'top-pick' : ''}">
          <div class="result-top"><div><span class="rank">پیشنهاد ${i + 1}</span><h3>${car.name}</h3></div><div class="score"><strong>${car.match.toFixed(1)}</strong><small>از ۱۰</small></div></div>
          <div class="price">حدود ${car.price.toLocaleString('fa-IR')} میلیون تومان</div>
          <p class="reason-title">چرا اینو پیشنهاد دادیم؟</p>
          <ul>${car.reasons.map(reason => `<li>${reason}</li>`).join('')}</ul>
          <div class="weakness"><strong>نقطه ضعف:</strong> ${car.weakness}</div>
          ${i === 0 ? '<div class="best-badge">⭐ انتخاب پیشنهادی</div>' : ''}
        </article>
      `).join('')}
      <p class="data-note">این نسخه از داده‌های نمونه استفاده می‌کند؛ قبل از خرید باید قیمت و آگهی‌های روز بازار بررسی شوند.</p>
    `;

    form.after(section);
    section.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
}