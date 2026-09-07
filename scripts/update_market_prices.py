import json
import re
from pathlib import Path
from urllib.request import Request, urlopen
from bs4 import BeautifulSoup

URL = 'https://1car.ir/price'
FEED = Path('data/market-prices.json')

# Only map models when the source has an unambiguous row.
TARGETS = {
    'quick-gxl': 'کوییک GX',
    'taha-auto-v4': 'تارا اتوماتیک V4',
    'shahin-plus': 'شاهین پلاس اتوماتیک AT',
    'rira': 'ری را 1.7 لیتر توربو',
}

def fa_to_en(s):
    return str(s).translate(str.maketrans('۰۱۲۳۴۵۶۷۸۹٠١٢٣٤٥٦٧٨٩٬', '01234567890123456789,'))

def price_million(text):
    text = fa_to_en(text).replace(',', '').replace('٬', '')
    nums = re.findall(r'\d+(?:\.\d+)?', text)
    if not nums:
        return None
    values = [float(x) for x in nums]
    # The page can publish a range; use the midpoint as the reference value.
    return round(sum(values) / len(values) / 1_000_000, 2)

def main():
    req = Request(URL, headers={'User-Agent': 'Mozilla/5.0 dastyar-khodro-market-updater'})
    html = urlopen(req, timeout=30).read()
    soup = BeautifulSoup(html, 'html.parser')

    page_text = soup.get_text(' ', strip=True)
    m = re.search(r'تاریخ بروزرسانی\s*:\s*[^0-9۰-۹]*(14[0-9۰-۹]{2})\s+([0-9۰-۹]{1,2})\s+([0-9۰-۹]{1,2})', page_text)
    if not m:
        raise RuntimeError('Could not detect source update date')
    date = '-'.join(fa_to_en(x).zfill(2) for x in m.groups())
    # Year is four digits; only month/day need zero-padding.
    y, mo, day = date.split('-')
    date = f'{y}-{mo}-{day}'

    found = {}
    for tr in soup.find_all('tr'):
        cells = [c.get_text(' ', strip=True) for c in tr.find_all(['td', 'th'])]
        if len(cells) < 3:
            continue
        name, year, market = cells[0], cells[1], cells[2]
        if fa_to_en(year).strip() != '1405':
            continue
        for car_id, needle in TARGETS.items():
            if needle in name and car_id not in found:
                price = price_million(market)
                if price:
                    found[car_id] = {'carId': car_id, 'price': price, 'date': date, 'source': '1car'}

    if not found:
        raise RuntimeError('No target market prices were found')

    data = json.loads(FEED.read_text(encoding='utf-8')) if FEED.exists() else {'updatedAt': date, 'source': '1car', 'prices': []}
    old = data.get('prices', [])
    for item in found.values():
        old = [x for x in old if not (x.get('carId') == item['carId'] and x.get('date') == item['date'])]
        old.append(item)
    data['updatedAt'] = date
    data['source'] = '1car'
    data['prices'] = old
    FEED.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print('Updated:', ', '.join(f"{k}={v['price']}" for k, v in found.items()), 'date=', date)

if __name__ == '__main__':
    main()
