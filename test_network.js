import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({headless: true});
  const page = await browser.newPage();
  
  page.on('response', async response => {
    const url = response.url();
    if (response.request().resourceType() === 'xhr' || response.request().resourceType() === 'fetch') {
      console.log('AJAX URL:', url);
    }
  });

  await page.goto('https://ktcgkpv.org/readings/date/2026-07-01', {waitUntil: 'networkidle2'});
  
  await browser.close();
})();
