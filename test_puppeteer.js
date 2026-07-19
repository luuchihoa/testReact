import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({headless: true});
  const page = await browser.newPage();
  await page.goto('https://ktcgkpv.org/readings', {waitUntil: 'networkidle2'});
  
  // Try to change date to 2026-07-01
  await page.evaluate(() => {
    // There is a function changeToday(curDate, mustWait) in their JS
    if (typeof changeToday === 'function') {
      changeToday(new Date(2026, 6, 1), false);
    }
  });

  // wait a bit for AJAX
  await new Promise(r => setTimeout(r, 3000));

  const title = await page.evaluate(() => {
    const el = document.querySelector('.reading1\\[title\\]') || document.querySelector('[class*="reading1[title]"]');
    return el ? el.innerText : 'Not found';
  });
  console.log("Title after change:", title);
  await browser.close();
})();
