import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.goto('https://www.vaticannews.va/vi/loi-chua-hang-ngay/2026/06/18.html');
  
  const data = await page.evaluate(() => {
    const paragraphs = Array.from(document.querySelectorAll('.section__content > p'));
    
    let result = {
      r1: { title: '', lead: '', epitomize: '', content: '' },
      psalm: { title: '', content: '' },
      r2: { title: '', lead: '', epitomize: '', content: '' },
      gospelAcclam: { title: '', content: '' },
      gospel: { title: '', lead: '', epitomize: '', content: '' },
      extraReadings: []
    };
    
    let contentBuffer = [];
    let titleParts = [];
    let isCapturingTitle = true;
    let currentSection = null;
    let extraIndex = -1;

    const saveBuffer = () => {
      if (!currentSection || contentBuffer.length === 0) return;
      const text = contentBuffer.join('\n\n').trim();
      if (currentSection === 'r1') result.r1.content = text;
      else if (currentSection === 'psalm') result.psalm.content = text;
      else if (currentSection === 'r2') result.r2.content = text;
      else if (currentSection === 'gospelAcclam') result.gospelAcclam.content = text;
      else if (currentSection === 'gospel') result.gospel.content = text;
      contentBuffer = [];
    };

    for (let p of paragraphs) {
      let text = p.innerText.split('\n').map(l => l.trim().replace(/[ \t\r]+/g, ' ')).join('\n').trim();
      if (!text || text === String.fromCharCode(160)) continue;

      let lowerText = text.toLowerCase();

      if (isCapturingTitle) {
        if (lowerText.startsWith('bài đọc') || lowerText.startsWith('đáp ca') || lowerText.startsWith('tung hô tin mừng') || lowerText.startsWith('alleluia') || lowerText.includes('tin mừng chúa giê-su')) {
          isCapturingTitle = false;
        } else {
          continue;
        }
      }

      if (lowerText.startsWith('bài đọc 1')) {
        saveBuffer();
        currentSection = 'r1';
      } else if (lowerText.startsWith('đáp ca')) {
        saveBuffer();
        currentSection = 'psalm';
      } else if (lowerText.startsWith('tung hô tin mừng') || lowerText.startsWith('alleluia')) {
        saveBuffer();
        currentSection = 'gospelAcclam';
      } else if (lowerText.includes('tin mừng chúa giê-su')) {
        if (currentSection !== 'gospel') {
          saveBuffer();
          currentSection = 'gospel';
        }
        const gospelMatch = text.match(/^(.*?theo thánh\s+[\p{L}\s-]+[.)]*)\s*\(?(.*?)\)?$/iu);
        if (gospelMatch) {
          result.gospel.lead = gospelMatch[1].trim();
          if (!result.gospel.title) {
            result.gospel.title = gospelMatch[2].replace(/[()]/g, '').trim();
          }
        } else {
          result.gospel.lead = text;
        }
      } else {
        if (lowerText.includes('xin hỗ trợ sứ mạng')) {
           currentSection = null; continue;
        }

        if (currentSection === 'gospelAcclam' && p.querySelector('i') && !lowerText.includes('ha-lê-lui-a')) {
           result.gospel.epitomize = text;
        } else if (currentSection) {
           contentBuffer.push(text);
        }
      }
    }
    saveBuffer();
    return result;
  });
  
  console.log("Gospel Content:");
  console.log(data.gospel);

  await browser.close();
})();
