// Listing links are marketplace search links for MVP. They are not guaranteed to point to one specific live ad.
const listings = [
  {id:'search-tara-v4',carId:'taha-auto-v4',title:'جستجوی آگهی تارا اتوماتیک V4',price:3085,city:'تهران',source:'دیوار',url:'https://divar.ir/s/tehran/car?query=%D8%AA%D8%A7%D8%B1%D8%A7%20%D8%A7%D8%AA%D9%88%D9%85%D8%A7%D8%AA%DB%8C%20V4',observedAt:'1405-06-14'},
  {id:'search-207-tu3',carId:'peugeot-207-tu3',title:'جستجوی آگهی پژو 207 TU3',price:1910,city:'تهران',source:'دیوار',url:'https://divar.ir/s/tehran/car?query=%D9%BE%DA%98%D9%88%20207%20TU3',observedAt:'1405-06-14'},
  {id:'search-quick-gxl',carId:'quick-gxl',title:'جستجوی آگهی کوییک GX L',price:1320,city:'تهران',source:'دیوار',url:'https://divar.ir/s/tehran/car?query=%DA%A9%D9%88%DB%8C%DB%8C%DA%A9%20GX%20L',observedAt:'1405-06-14'},
  {id:'search-quick-rs',carId:'quick-rs',title:'جستجوی آگهی کوییک RS',price:1325,city:'تهران',source:'دیوار',url:'https://divar.ir/s/tehran/car?query=%DA%A9%D9%88%DB%8C%DB%8C%DA%A9%20RS',observedAt:'1405-06-14'},
  {id:'search-saina-s',carId:'saina-s',title:'جستجوی آگهی ساینا S',price:1370,city:'تهران',source:'دیوار',url:'https://divar.ir/s/tehran/car?query=%D8%B3%D8%A7%DB%8C%D9%86%D8%A7%20S',observedAt:'1405-06-14'},
  {id:'search-atlas-s',carId:'atlas-s',title:'جستجوی آگهی اطلس S',price:1445,city:'تهران',source:'دیوار',url:'https://divar.ir/s/tehran/car?query=%D8%A7%D8%B7%D9%84%D8%B3%20S',observedAt:'1405-06-14'},
  {id:'search-atlas-gl',carId:'atlas-gl',title:'جستجوی آگهی اطلس GL',price:1500,city:'تهران',source:'دیوار',url:'https://divar.ir/s/tehran/car?query=%D8%A7%D8%B7%D9%84%D8%B3%20GL',observedAt:'1405-06-14'},
  {id:'search-atlas-g',carId:'atlas-g',title:'جستجوی آگهی اطلس G',price:1590,city:'تهران',source:'دیوار',url:'https://divar.ir/s/tehran/car?query=%D8%A7%D8%B7%D9%84%D8%B3%20G',observedAt:'1405-06-14'},
  {id:'search-sehand-s',carId:'sehand-s',title:'جستجوی آگهی سهند S',price:1510,city:'تهران',source:'دیوار',url:'https://divar.ir/s/tehran/car?query=%D8%B3%D9%87%D9%86%D8%AF%20S',observedAt:'1405-06-14'},
  {id:'search-sehand-e-auto',carId:'sehand-e-auto',title:'جستجوی آگهی سهند E اتوماتیک',price:1977,city:'تهران',source:'دیوار',url:'https://divar.ir/s/tehran/car?query=%D8%B3%D9%87%D9%86%D8%AF%20E%20%D8%A7%D8%AA%D9%88%D9%85%D8%A7%D8%AA%DB%8C%DA%A9',observedAt:'1405-06-14'},
  {id:'search-soren-xu7p',carId:'soren-xu7p',title:'جستجوی آگهی سورن XU7P',price:1870,city:'تهران',source:'دیوار',url:'https://divar.ir/s/tehran/car?query=%D8%B3%D9%88%D8%B1%D9%86%20XU7P',observedAt:'1405-06-14'},
  {id:'search-ranaplus',carId:'ranaplus',title:'جستجوی آگهی رانا پلاس',price:1798,city:'تهران',source:'دیوار',url:'https://divar.ir/s/tehran/car?query=%D8%B1%D8%A7%D9%86%D8%A7%20%D9%BE%D9%84%D8%A7%D8%B3',observedAt:'1405-06-14'},
  {id:'search-shahin-g',carId:'shahin-g',title:'جستجوی آگهی شاهین G',price:2070,city:'تهران',source:'دیوار',url:'https://divar.ir/s/tehran/car?query=%D8%B4%D8%A7%D9%87%DB%8C%D9%86%20G',observedAt:'1405-06-14'},
  {id:'search-shahin-auto-g',carId:'shahin-auto-g',title:'جستجوی آگهی شاهین اتوماتیک G',price:2445,city:'تهران',source:'دیوار',url:'https://divar.ir/s/tehran/car?query=%D8%B4%D8%A7%D9%87%DB%8C%D9%86%20%D8%A7%D8%AA%D9%88%D9%85%D8%A7%D8%AA%DB%8C%DA%A9%20G',observedAt:'1405-06-14'},
  {id:'search-atlas-auto',carId:'atlas-auto',title:'جستجوی آگهی اطلس اتوماتیک',price:2090,city:'تهران',source:'دیوار',url:'https://divar.ir/s/tehran/car?query=%D8%A7%D8%B7%D9%84%D8%B3%20%D8%A7%D8%AA%D9%88%D9%85%D8%A7%D8%AA%DB%8C%DA%A9',observedAt:'1405-06-14'},
  {id:'search-dana-mt6',carId:'dana-mt6',title:'جستجوی آگهی دنا پلاس MT6',price:2440,city:'تهران',source:'دیوار',url:'https://divar.ir/s/tehran/car?query=%D8%AF%D9%86%D8%A7%20%D9%BE%D9%84%D8%A7%D8%B3%20MT6',observedAt:'1405-06-14'},
  {id:'search-dana-auto',carId:'dana-plus-auto',title:'جستجوی آگهی دنا پلاس اتوماتیک',price:3230,city:'تهران',source:'دیوار',url:'https://divar.ir/s/tehran/car?query=%D8%AF%D9%86%D8%A7%20%D9%BE%D9%84%D8%A7%D8%B3%20%D8%A7%D8%AA%D9%88%D9%85%D8%A7%D8%AA%DB%8C%DA%A9',observedAt:'1405-06-14'},
  {id:'search-shahin-plus',carId:'shahin-plus',title:'جستجوی آگهی شاهین اتوماتیک پلاس',price:3090,city:'تهران',source:'دیوار',url:'https://divar.ir/s/tehran/car?query=%D8%B4%D8%A7%D9%87%DB%8C%D9%86%20%D8%A7%D8%AA%D9%88%D9%85%D8%A7%D8%AA%DB%8C%DA%A9%20%D9%BE%D9%84%D8%A7%D8%B3',observedAt:'1405-06-14'},
  {id:'search-rira',carId:'rira',title:'جستجوی آگهی ری‌را توربو',price:4250,city:'تهران',source:'دیوار',url:'https://divar.ir/s/tehran/car?query=%D8%B1%DB%8C%E2%80%8C%D8%B1%D8%A7%20%D8%AA%D9%88%D8%B1%D8%A8%D9%88',observedAt:'1405-06-14'}
];
if (typeof window !== 'undefined') window.listings = listings;
if (typeof module !== 'undefined') module.exports = { listings };
