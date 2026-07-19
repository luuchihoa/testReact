import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  // Date: 2026/07/01
  const url = 'https://www.vaticannews.va/vi/loi-chua-hang-ngay/2026/07/01.html';
  console.log(`Going to ${url}`);
  
  await page.goto(url, { waitUntil: 'networkidle2' });

  const data = await page.evaluate(() => {
    const paragraphs = Array.from(document.querySelectorAll('.section__content p'));
    
    let currentSection = null;
    const result = {
      r1: { title: '', epitomize: '', lead: '', content: '' },
      psalm: { title: '', epitomize: '', lead: '', content: '' },
      r2: { title: '', epitomize: '', lead: '', content: '' },
      gospelAcclam: { title: '', epitomize: '', lead: '', content: '' },
      gospel: { title: '', epitomize: '', lead: '', content: '' }
    };

    let contentBuffer = [];

    const saveBuffer = () => {
      if (!currentSection || contentBuffer.length === 0) return;
      const text = contentBuffer.join('\n').trim();
      if (currentSection === 'r1') result.r1.content = text;
      else if (currentSection === 'psalm') result.psalm.content = text;
      else if (currentSection === 'r2') result.r2.content = text;
      else if (currentSection === 'gospelAcclam') result.gospelAcclam.content = text;
      else if (currentSection === 'gospel') result.gospel.content = text;
      contentBuffer = [];
    };

    for (let p of paragraphs) {
      let text = p.innerText.trim().replace(/\s+/g, ' ');
      if (!text || text === String.fromCharCode(160)) continue;

      let lowerText = text.toLowerCase();

      if (lowerText.startsWith('bài đọc 1')) {
        saveBuffer();
        currentSection = 'r1';
        result.r1.title = text;
      } else if (lowerText.startsWith('bài đọc 2') || lowerText.startsWith('bài đọc ii')) {
        saveBuffer();
        currentSection = 'r2';
        result.r2.title = text;
      } else if (lowerText.startsWith('đáp ca')) {
        saveBuffer();
        currentSection = 'psalm';
        result.psalm.title = text;
      } else if (lowerText.startsWith('tung hô tin mừng') || lowerText.startsWith('alleluia')) {
        saveBuffer();
        currentSection = 'gospelAcclam';
        result.gospelAcclam.title = text;
      } else if (lowerText.includes('tin mừng chúa giê-su')) {
        saveBuffer();
        currentSection = 'gospel';
        result.gospel.lead = text;
      } else if (lowerText.startsWith('bài trích sách') || lowerText.startsWith('thư của thánh')) {
         if (currentSection) result[currentSection].lead = text;
      } else if (p.querySelector('i') && p.innerText === p.querySelector('i').innerText && currentSection) {
         // It's italic, likely a quote/epitomize
         if (!result[currentSection].epitomize) {
             result[currentSection].epitomize = text;
         } else {
             contentBuffer.push(text);
         }
      } else {
        if (currentSection) contentBuffer.push(text);
      }
    }
    saveBuffer();
    return result;
  });

  console.log(JSON.stringify(data, null, 2));

  await browser.close();
})();
