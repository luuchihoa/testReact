import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.goto('https://www.vaticannews.va/vi/loi-chua-hang-ngay/2024/04/13.html');
  
  const data = await page.evaluate(() => {
    const paragraphs = Array.from(document.querySelectorAll('.section__content > p'));
    return paragraphs.map(p => {
      let text = p.innerText.split('\n').map(l => l.trim().replace(/[ \t\r]+/g, ' ')).join('\n').trim();
      return text;
    });
  });
  
  console.log(data);
  await browser.close();
})();
