const FEED_URL = 'https://raw.githubusercontent.com/Morijooob/dastyar-khodro/main/data/listings-feed.json';

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
      'access-control-allow-origin': '*'
    }
  });
}

function normalize(x) {
  return {
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
  };
}

function valid(x) {
  return x.id && x.carId && x.city && Number.isFinite(x.price) && x.price > 0 && x.url && x.isLive && x.verificationStatus === 'verified';
}

export async function onRequestGet({ request }) {
  const url = new URL(request.url);
  const carId = url.searchParams.get('carId') || '';
  const city = url.searchParams.get('city') || 'all';
  const minPrice = Number(url.searchParams.get('minPrice'));
  const maxPrice = Number(url.searchParams.get('maxPrice'));

  try {
    const res = await fetch(`${FEED_URL}?t=${Date.now()}`, { cf: { cacheTtl: 0, cacheEverything: false } });
    if (!res.ok) throw new Error(`feed HTTP ${res.status}`);
    const raw = await res.json();
    const rows = Array.isArray(raw) ? raw : raw.listings;
    let listings = Array.isArray(rows) ? rows.map(normalize).filter(valid) : [];

    if (carId) listings = listings.filter(x => x.carId === carId);
    if (city !== 'all') listings = listings.filter(x => x.city === city);
    if (Number.isFinite(minPrice)) listings = listings.filter(x => x.price >= minPrice);
    if (Number.isFinite(maxPrice)) listings = listings.filter(x => x.price <= maxPrice);

    listings.sort((a, b) => {
      const target = Number.isFinite(maxPrice) && Number.isFinite(minPrice) ? (minPrice + maxPrice) / 2 : 0;
      return Math.abs(a.price - target) - Math.abs(b.price - target);
    });

    return json({
      ok: true,
      count: listings.length,
      listings,
      meta: raw && !Array.isArray(raw) ? (raw.meta || {}) : {}
    });
  } catch (error) {
    return json({ ok: false, count: 0, listings: [], error: 'listing_feed_unavailable' }, 503);
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      'access-control-allow-origin': '*',
      'access-control-allow-methods': 'GET, OPTIONS',
      'access-control-allow-headers': 'Content-Type'
    }
  });
}
