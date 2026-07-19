import puppeteer from 'puppeteer';
(async () => {
  const browser = await puppeteer.launch({headless: true});
  const page = await browser.newPage();
  await page.goto('https://www.vaticannews.va/vi/loi-chua-hang-ngay/2021/05/01.html', {waitUntil: 'domcontentloaded'});
  const title = await page.evaluate(() => {
    const paragraphs = Array.from(document.querySelectorAll('.section__content p'));
    let titleParts = [];
    for (let p of paragraphs) {
      let text = p.innerText.split('\n').map(l => l.trim().replace(/[ \t\r]+/g, ' ')).join('\n').trim();
      if (!text || text === String.fromCharCode(160)) continue;
      let lowerText = text.toLowerCase();
      if (lowerText.startsWith('bài đọc 1') || lowerText.includes('tin mừng')) {
        break; // Stop when reading begins
      }
      titleParts.push(text);
    }
    return titleParts.join(' - ');
  });
  console.log("Extracted title:", title);
  await browser.close();
})();
