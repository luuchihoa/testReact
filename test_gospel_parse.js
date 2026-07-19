import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({headless: true});
  const page = await browser.newPage();
  
  // Test date: 2021-05-01
  await page.goto('https://www.vaticannews.va/vi/loi-chua-hang-ngay/2021/05/01.html', {waitUntil: 'domcontentloaded'});
  
  const data = await page.evaluate(() => {
    const paragraphs = Array.from(document.querySelectorAll('.section__content p'));
    let result = { r1: {}, psalm: {}, gospel: {}, gospelAcclam: {} };
    let currentSection = null;

    for (let p of paragraphs) {
      let text = p.innerText.split('\n').map(l => l.trim().replace(/[ \t\r]+/g, ' ')).join('\n').trim();
      if (!text) continue;
      let lowerText = text.toLowerCase();

      if (lowerText.startsWith('bài đọc 1')) {
        currentSection = 'r1';
        result.r1.title = text.replace(/^Bài đọc 1\s*/i, '');
      } else if (lowerText.startsWith('đáp ca')) {
        currentSection = 'psalm';
        result.psalm.title = text.replace(/^Đáp ca\s*/i, '');
      } else if (lowerText.startsWith('tung hô tin mừng') || lowerText.startsWith('alleluia')) {
        currentSection = 'gospelAcclam';
        result.gospelAcclam.title = text.replace(/^(Tung hô Tin Mừng|Alleluia)\s*/i, '');
      } else if (lowerText.includes('tin mừng chúa giê-su')) {
        currentSection = 'gospel';
        const match = text.match(/^(✠?\s*Tin Mừng Chúa Giê-su Ki-tô theo thánh [^.]+.)\s*(.*)$/i);
        if (match) {
          result.gospel.lead = match[1].trim();
          result.gospel.title = match[2].trim();
        } else {
          result.gospel.lead = text;
        }
      } else if (p.querySelector('i') && p.innerText === p.querySelector('i').innerText && currentSection) {
        if (!result[currentSection].epitomize) result[currentSection].epitomize = text;
      } else {
        if (currentSection === 'gospelAcclam' && p.querySelector('i') && !lowerText.includes('ha-lê-lui-a')) {
          result.gospel.epitomize = text;
        }
      }
    }
    return result;
  });
  
  console.log(JSON.stringify(data, null, 2));
  await browser.close();
})();
