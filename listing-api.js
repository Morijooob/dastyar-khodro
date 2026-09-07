(() => {
  'use strict';

  // Unified listing data layer.
  // IMPORTANT: only records with verificationStatus='verified' and isLive=true
  // are treated as real comparable listings. Search pages are never promoted to listings.
  const FEED_URL = 'data/listings-feed.json';

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

  async function loadListings() {
    try {
      const res = await fetch(`${FEED_URL}?t=${Date.now()}`, { cache: 'no-store' });
      if (!res.ok) throw new Error(`listing feed HTTP ${res.status}`);
      const data = await res.json();
      const rows = Array.isArray(data) ? data : data.listings;
      window.liveListings = Array.isArray(rows) ? rows.map(normalizeListing).filter(valid) : [];
      window.listingFeedMeta = data && !Array.isArray(data) ? (data.meta || {}) : {};
    } catch (err) {
      console.warn('Listing feed unavailable:', err);
      window.liveListings = [];
      window.listingFeedMeta = { status: 'unavailable' };
    }
    return window.liveListings;
  }

  window.listingApiPromise = loadListings();
  window.getVerifiedListings = (carId, city) => {
    const rows = Array.isArray(window.liveListings) ? window.liveListings : [];
    return rows.filter(x => x.carId === carId && (!city || city === 'all' || x.city === city));
  };
})();
