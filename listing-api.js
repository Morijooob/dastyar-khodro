(() => {
  'use strict';

  // Unified listing data layer.
  // Only verified individual live listings are comparable.
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

  async function loadListings() {
    // Prefer the backend API. Fall back to the static feed if the site is not
    // running on Cloudflare Pages yet.
    try {
      const res = await fetch(`${API_URL}?t=${Date.now()}`, { cache: 'no-store' });
      if (!res.ok) throw new Error(`listing API HTTP ${res.status}`);
      return setRows(await res.json());
    } catch (apiError) {
      try {
        const res = await fetch(`${FEED_URL}?t=${Date.now()}`, { cache: 'no-store' });
        if (!res.ok) throw new Error(`listing feed HTTP ${res.status}`);
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
  window.getVerifiedListings = (carId, city) => {
    const rows = Array.isArray(window.liveListings) ? window.liveListings : [];
    return rows.filter(x => x.carId === carId && (!city || city === 'all' || x.city === city));
  };
})();
