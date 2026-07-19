import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({headless: true});
  const page = await browser.newPage();
  
  page.on('request', request => {
    if (request.url().includes('mass-reading')) {
      console.log('Method:', request.method());
      console.log('PostData:', request.postData());
    }
  });

  await page.goto('https://ktcgkpv.org/readings/2026-07-01', {waitUntil: 'networkidle2'});
  
  await browser.close();
})();
