import puppeteer from 'puppeteer';
(async () => {
  const browser = await puppeteer.launch({headless: true});
  const page = await browser.newPage();
  
  console.time('networkidle2');
  await page.goto('https://www.vaticannews.va/vi/loi-chua-hang-ngay/2026/07/01.html', {waitUntil: 'networkidle2'});
  console.timeEnd('networkidle2');

  console.time('domcontentloaded');
  await page.goto('https://www.vaticannews.va/vi/loi-chua-hang-ngay/2026/07/02.html', {waitUntil: 'domcontentloaded'});
  console.timeEnd('domcontentloaded');

  await browser.close();
})();
