(() => {
  'use strict';

  const FEED_URL = 'data/listings-feed.json';
  const API_URL = '/api/listings';

  const normalizeListing = (x) => ({
    id: String(x.id || ''),
    source: String(x.source || ''),
    sourceListingId: x.sourceListingId ? String(x.sourceListingId) : null,
    carId: String(x.carId || ''),
    title: String(x.title || ''),
    city: String(x.city || ''),
    price: Number(x.price),
    year: Number(x.year) || null,
    mileage: Number(x.mileage) || null,
    gearbox: x.gearbox ? String(x.gearbox) : null,
    url: String(x.url || ''),
    observedAt: String(x.observedAt || ''),
    isLive: x.isLive === true,
    verificationStatus: String(x.verificationStatus || 'unverified')
  });

  const valid = (x) => x.id && x.carId && x.city && Number.isFinite(x.price) && x.price > 0 && x.url && x.isLive && x.verificationStatus === 'verified';

  function setRows(data) {
    const rows = Array.isArray(data) ? data : data?.listings;
    window.liveListings = Array.isArray(rows) ? rows.map(normalizeListing).filter(valid) : [];
    window.listingFeedMeta = data && !Array.isArray(data) ? (data.meta || {}) : {};
    return window.liveListings;
  }

  async function loadListings(carId = '', city = 'all', budget = 0) {
    try {
      const params = new URLSearchParams();
      if (carId) params.set('carId', carId);
      if (city && city !== 'all') params.set('city', city);
      if (Number.isFinite(Number(budget)) && Number(budget) > 0) {
        params.set('minPrice', String(Math.max(0, Number(budget) - 100)));
        params.set('maxPrice', String(Number(budget) + 100));
      }
      params.set('t', String(Date.now()));
      const res = await fetch(`${API_URL}?${params.toString()}`, { cache: 'no-store' });
      if (!res.ok) throw new Error(`listing API HTTP ${res.status}`);
      window.listingApiSource = 'api';
      return setRows(await res.json());
    } catch (apiError) {
      try {
        const res = await fetch(`${FEED_URL}?t=${Date.now()}`, { cache: 'no-store' });
        if (!res.ok) throw new Error(`listing feed HTTP ${res.status}`);
        window.listingApiSource = 'local-fallback';
        return setRows(await res.json());
      } catch (feedError) {
        console.warn('Listing service unavailable:', apiError, feedError);
        window.liveListings = [];
        window.listingFeedMeta = { status: 'unavailable' };
        return [];
      }
    }
  }

  window.listingApiPromise = loadListings();
  window.refreshVerifiedListings = (carId, city, budget) => loadListings(carId, city, budget);
  window.getVerifiedListings = (carId, city) => {
    const rows = Array.isArray(window.liveListings) ? window.liveListings : [];
    return rows.filter(x => x.carId === carId && (!city || city === 'all' || x.city === city));
  };
})();
