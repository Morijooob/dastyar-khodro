// Daily market snapshots. Values are million tomans.
// These are dated observations, not guaranteed live prices. The app uses the latest dated observations as its reference market price.
const marketPrices = [
  {carId:'quick-gxl',price:1220,date:'1405-06-02',source:'فرارو'},
  {carId:'quick-gxl',price:1310,date:'1405-06-14',source:'فرارو'},
  {carId:'quick-gxl',price:1380,date:'1405-06-16',source:'1car'},
  {carId:'peugeot-207-tu3',price:1700,date:'1405-06-02',source:'فرارو'},
  {carId:'peugeot-207-tu3',price:1870,date:'1405-06-14',source:'فرارو'},
  {carId:'peugeot-207-tu3',price:1880,date:'1405-06-14',source:'نمناک'},
  {carId:'peugeot-207-tu3',price:1940,date:'1405-06-16',source:'1car'},
  {carId:'dana-plus-auto',price:2900,date:'1405-06-02',source:'فرارو'},
  {carId:'dana-plus-auto',price:3220,date:'1405-06-14',source:'فرارو'},
  {carId:'dana-plus-auto',price:3300,date:'1405-06-16',source:'1car'},
  {carId:'taha-auto-v4',price:2850,date:'1405-06-02',source:'فرارو'},
  {carId:'taha-auto-v4',price:3150,date:'1405-06-12',source:'فرارو'},
  {carId:'taha-auto-v4',price:3150,date:'1405-06-14',source:'خودروبانک/منابع بازار'},
  {carId:'taha-auto-v4',price:3200,date:'1405-06-16',source:'1car'},
  {carId:'shahin-plus',price:2600,date:'1405-06-01',source:'نمناک'},
  {carId:'shahin-plus',price:3145,date:'1405-06-15',source:'نواندیش/نمناک'},
  {carId:'shahin-plus',price:3180,date:'1405-06-16',source:'1car'},
  {carId:'rira',price:3800,date:'1405-06-02',source:'فرارو'},
  {carId:'rira',price:4100,date:'1405-06-14',source:'فرارو'},
  {carId:'rira',price:4250,date:'1405-06-14',source:'آخرین خودرو'},
  {carId:'rira',price:4250,date:'1405-06-16',source:'1car'}
];
if(typeof module!=='undefined') module.exports={marketPrices};
