(() => {
  'use strict';
  const MIN_BUDGET_TOMAN = 500_000_000;
  const PRICE_WINDOW_MILLION = 100;
  const safeChecked = name => document.querySelector(`input[name="${name}"]:checked`);
  const fa = n => Number(n || 0).toLocaleString('fa-IR');
  const normalizeDigits = value => String(value ?? '').replace(/[۰-۹]/g, d => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d))).replace(/[٠-٩]/g, d => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d))).replace(/[٬,]/g, '').replace(/[٫]/g, '.');
  const parseBudgetToman = value => { const n = Number(normalizeDigits(value).trim()); return Number.isFinite(n) ? n : 0; };
  const cityNames = { all:'همه شهرها',tehran:'تهران',mashhad:'مشهد',isfahan:'اصفهان',shiraz:'شیراز',tabriz:'تبریز',karaj:'کرج',ahvaz:'اهواز',qom:'قم',kermanshah:'کرمانشاه',rasht:'رشت',urmia:'ارومیه',yazd:'یزد',kerman:'کرمان',arak:'اراک','bandar-abbas':'بندرعباس' };

  function getMarketPrice(car) {
    const rows = Array.isArray(window.marketPrices) ? window.marketPrices : [];
    if (!rows.length) return Number(car.price);
    const matches = rows.filter(x => x.carId === car.id && Number.isFinite(Number(x.price)) && x.date);
    if (!matches.length) return Number(car.price);
    const latestDate = matches.map(x => x.date).sort().reverse()[0];
    const latest = matches.filter(x => x.date === latestDate);
    return Math.round(latest.reduce((s,x) => s + Number(x.price), 0) / latest.length);
  }
  function divarUrl(city, carName) {
    const slug = city === 'all' ? 'tehran' : city;
    return `https://divar.ir/s/${encodeURIComponent(slug)}/car?query=${encodeURIComponent(carName || 'خودرو')}`;
  }
  function getListings(car, city='all') {
    if (!Array.isArray(window.listings)) return [];
    return window.listings.filter(x => x.carId === car.id && Number.isFinite(Number(x.price))).filter(x => city === 'all' || !x.city || x.city === cityNames[city]).map(x => ({...x,price:Number(x.price),year:Number(x.year)||null,mileage:Number(x.mileage)||null}));
  }
  function scoreCar(car,p) {
    const price = getMarketPrice(car);
    const difference = price - p.budget;
    const absoluteDifference = Math.abs(difference);
    let score = Math.max(0,55 - absoluteDifference * 0.25);
    const reasons = [];
    reasons.push(`قیمت مرجع در بازه ${fa(p.budget-PRICE_WINDOW_MILLION)} تا ${fa(p.budget+PRICE_WINDOW_MILLION)} میلیون تومان است.`);
    reasons.push(price <= p.budget ? 'قیمت مرجع پایین‌تر یا برابر بودجه شماست.' : `${fa(difference)} میلیون تومان بالاتر از بودجه است؛ برای مقایسه نزدیک نگه داشته شده.`);
    if (p.gearbox === 'any' || car.gearbox === p.gearbox) { score += 15; reasons.push('گیربکس مطابق انتخاب شماست.'); }
    if (Array.isArray(car.uses) && car.uses.includes(p.use)) { score += 10; reasons.push(p.use === 'city' ? 'برای استفاده شهری مناسب است.' : p.use === 'family' ? 'برای استفاده خانوادگی مناسب است.' : 'برای سفر مناسب است.'); }
    if ((p.priority === 'cheap' && car.maintenance >= 7) || (p.priority === 'fuel' && car.economy >= 7) || (p.priority === 'resale' && car.resale >= 8)) score += 10;
    if (p.priority === 'cheap' && car.maintenance >= 7) reasons.push('هزینه نگهداری امتیاز خوبی دارد.');
    if (p.priority === 'fuel' && car.economy >= 7) reasons.push('مصرف اقتصادی‌تری دارد.');
    if (p.priority === 'resale' && car.resale >= 8) reasons.push('بازار فروش بهتری دارد.');
    if (p.passengers >= 5 && (car.passengers || 5) >= 5) { score += 5; reasons.push('برای ۵ سرنشین مناسب است.'); }
    if (p.passengers <= 2 && Array.isArray(car.uses) && car.uses.includes('city')) score += 3;
    if (p.year === 'new') score += Math.min(7,Math.max(0,(Number(car.year)-1398)*1.1));
    if (p.year === 'old') score += Math.min(7,Math.max(0,(1403-Number(car.year))*1.1));
    if (p.year === 'balanced') score += 4;
    const bestListing = getListings(car,p.city).filter(x => Math.abs(x.price-p.budget) <= PRICE_WINDOW_MILLION).sort((a,b) => Math.abs(a.price-p.budget)-Math.abs(b.price-p.budget))[0] || null;
    return {...car,price,difference,absoluteDifference,match:Math.max(0,Math.min(100,Math.round(score))),reasons:reasons.slice(0,4),bestListing,listingCity:cityNames[p.city]||'همه شهرها',divarUrl:bestListing?.url && bestListing.url !== '#' ? bestListing.url : divarUrl(p.city,car.name||car.title)};
  }
  function removeResults(){ document.getElementById('results')?.remove(); document.getElementById('app-error')?.remove(); }
  function marketplaceLinks(c){
    const gap = c.difference === 0 ? 'هم‌قیمت' : `${c.difference > 0 ? '+' : ''}${Math.round(c.difference).toLocaleString('fa-IR')} میلیون`;
    const sheypoor = 'https://www.sheypoor.com/';
    return `<div class="listing-summary"><div><strong>🛒 مسیرهای خرید</strong><span>${c.listingCity} · اختلاف با بودجه: ${gap}</span></div><div class="marketplace-actions"><a class="listing-link" href="${c.divarUrl}" target="_blank" rel="noopener noreferrer">دیوار</a><a class="listing-link" href="${sheypoor}" target="_blank" rel="noopener noreferrer">شیپور</a></div><small>این دکمه‌ها مسیر جستجو در بازارها را باز می‌کنند؛ آگهی زنده داخل برنامه ادعا نمی‌شود.</small></div>`;
  }
  function render(results,p){
    removeResults();
    const section=document.createElement('section'); section.id='results'; section.className='results';
    section.innerHTML=`<div class="results-head"><div><span class="eyebrow">تحلیل دستیار خودرو</span><h2>🚗 پیشنهادهای نزدیک به بودجه تو</h2></div><span class="experimental">نسخه 1.1.7</span></div>`+results.map((c,i)=>`<article class="result-card ${i===0?'top-pick':''}"><div class="result-top"><div><span class="rank">${i===0?'🏆 پیشنهاد اول':`گزینه ${i+1}`}</span><h3>${c.name||c.title||'خودرو'}</h3></div><div class="score"><strong>${c.match}</strong><small>امتیاز</small></div></div><div class="price">💰 ${fa(c.price)} میلیون تومان</div><div class="price-meta">بودجه شما: ${fa(p.budget)} میلیون تومان · بازه جستجو: ${fa(p.budget-PRICE_WINDOW_MILLION)} تا ${fa(p.budget+PRICE_WINDOW_MILLION)} میلیون · شهر: ${cityNames[p.city]}</div><div class="reason-title">چرا این گزینه؟</div><ul>${c.reasons.map(x=>`<li>${x}</li>`).join('')}</ul>${marketplaceLinks(c)}${i===0?'<span class="best-badge">⭐ نزدیک‌ترین گزینه به بودجه</span>':''}</article>`).join('')+`<div class="data-note">نسخه برنامه: 1.1.7 · بودجه ورودی به تومان · دامنه پیشنهاد: ±۱۰۰ میلیون تومان · شهر: ${cityNames[p.city]}</div>`;
    document.querySelector('main').appendChild(section); section.scrollIntoView({behavior:'smooth',block:'start'});
  }
  function showNoBudgetMatch(p,prices){
    removeResults(); const section=document.createElement('section'); section.id='results'; section.className='results';
    const nearest=prices.length?prices.sort((a,b)=>Math.abs(a-p.budget)-Math.abs(b-p.budget))[0]:0;
    section.innerHTML=`<div class="results-head"><div><span class="eyebrow">نتیجه تحلیل</span><h2>😕 در بازه انتخابی خودرو نداریم</h2></div><span class="experimental">نسخه 1.1.7</span></div><article class="result-card top-pick"><div class="reason-title">بودجه: ${fa(p.budget)} میلیون تومان</div><p style="color:var(--muted);margin:8px 0 0">منطق جدید فقط خودروهای حدود ۱۰۰ میلیون تومان پایین‌تر یا بالاتر از بودجه را پیشنهاد می‌دهد. نزدیک‌ترین قیمت موجود در داده فعلی: <strong>${fa(nearest)} میلیون تومان</strong>.</p><div class="data-note">برای بودجه ۵۰۰ میلیون تومان هم جستجو مجاز است؛ اگر نتیجه‌ای نیست، یعنی داده خودرو در آن بازه هنوز در بانک اطلاعاتی برنامه وجود ندارد.</div></article></section>`;
    document.querySelector('main').appendChild(section); section.scrollIntoView({behavior:'smooth',block:'start'});
  }
  function showError(message){ document.getElementById('app-error')?.remove(); const box=document.createElement('div'); box.id='app-error'; box.style.cssText='max-width:720px;margin:16px auto;padding:14px;border-radius:14px;background:#fff2ed;border:1px solid #f1d0c3;color:#8b2e13;font-weight:700;text-align:center;'; box.textContent=message; document.getElementById('car-form')?.before(box); }
  function init(){
    const form=document.getElementById('car-form'); if(!form) return showError('فرم خودرو پیدا نشد.');
    const budgetInput=document.getElementById('budget');
    if(budgetInput) budgetInput.addEventListener('input',()=>{ const digits=normalizeDigits(budgetInput.value).replace(/\D/g,''); budgetInput.value=digits?Number(digits).toLocaleString('fa-IR'):''; });
    form.addEventListener('submit',e=>{
      e.preventDefault();
      try{
        removeResults();
        const budgetToman=parseBudgetToman(document.getElementById('budget')?.value);
        const gearbox=safeChecked('gearbox'),use=safeChecked('use'),priority=safeChecked('priority'),year=safeChecked('year'),passengers=safeChecked('passengers');
        const city=document.getElementById('city')?.value||'all';
        if(!budgetToman||budgetToman<=0) return showError('لطفاً بودجه را به تومان وارد کن؛ مثلاً ۵۰۰,۰۰۰,۰۰۰ تومان.');
        if(budgetToman<MIN_BUDGET_TOMAN) return showError('حداقل بودجه قابل جستجو ۵۰۰ میلیون تومان است.');
        if(!gearbox||!use||!priority||!year||!passengers) return showError('لطفاً همه انتخاب‌ها را کامل کن.');
        if(!cityNames[city]) return showError('لطفاً شهر را انتخاب کن.');
        if(!Array.isArray(window.carData)||!window.carData.length) return showError('اطلاعات خودروها بارگذاری نشده است.');
        const p={budget:budgetToman/1000000,gearbox:gearbox.value,use:use.value,priority:priority.value,year:year.value,passengers:Number(passengers.value),city};
        const scored=window.carData.map(c=>scoreCar(c,p));
        const inWindow=scored.filter(c=>Number.isFinite(c.price)&&c.price>0&&Math.abs(c.price-p.budget)<=PRICE_WINDOW_MILLION);
        if(!inWindow.length){ const prices=scored.map(c=>c.price).filter(price=>Number.isFinite(price)&&price>0); return showNoBudgetMatch(p,prices); }
        render(inWindow.sort((a,b)=>a.absoluteDifference-b.absoluteDifference||b.match-a.match).slice(0,10),p);
      }catch(err){ console.error(err); showError('در تحلیل خودرو خطایی رخ داد. لطفاً دوباره تلاش کن.'); }
    });
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init); else init();
})();
