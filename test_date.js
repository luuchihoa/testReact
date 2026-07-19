import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({headless: true});
  const page = await browser.newPage();
  
  await page.goto('https://ktcgkpv.org/readings/date/2026-07-01', {waitUntil: 'networkidle2'});
  const title = await page.evaluate(() => {
    const el = document.querySelector('.reading1\\[title\\]') || document.querySelector('[class*="reading1[title]"]');
    return el ? el.innerText : 'Not found';
  });
  console.log("Title for 2026-07-01:", title);
  await browser.close();
})();
