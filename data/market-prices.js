// Market snapshots. Values are million tomans and MUST be treated as dated observations, not live prices.
const marketPrices = [
  {carId:'quick-gxl',price:1310,date:'1405-06-14',source:'فرارو'},
  {carId:'peugeot-207-tu3',price:1870,date:'1405-06-14',source:'فرارو'},
  {carId:'dana-plus-auto',price:3220,date:'1405-06-14',source:'فرارو'},
  {carId:'taha-auto-v4',price:3150,date:'1405-06-12',source:'فرارو'},
  {carId:'shahin-plus',price:3145,date:'1405-06-15',source:'نواندیش/نمناک'},
  {carId:'rira',price:4100,date:'1405-06-14',source:'فرارو'}
];
if(typeof module!=='undefined') module.exports={marketPrices};
