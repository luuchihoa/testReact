import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.goto('https://www.vaticannews.va/vi/loi-chua-hang-ngay/2024/03/24.html');
  
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
      else if (currentSection === 'extra_reading' && extraIndex >= 0) {
        result.extraReadings[extraIndex].content = text;
      }
      else if (currentSection === 'extra_psalm' && extraIndex >= 0) {
        result.extraReadings[extraIndex].psalm_content = text;
      }
      contentBuffer = [];
    };

    for (let p of paragraphs) {
      let text = p.innerText.split('\n').map(l => l.trim().replace(/[ \t\r]+/g, ' ')).join('\n').trim();
      if (!text || text === String.fromCharCode(160)) continue;

      let lowerText = text.toLowerCase();

      if (isCapturingTitle) {
        if (lowerText.startsWith('bài đọc') || 
            lowerText.startsWith('đáp ca') || 
            lowerText.startsWith('tung hô tin mừng') || 
            lowerText.startsWith('alleluia') || 
            lowerText.startsWith('phúc âm rước lá') || 
            lowerText.match(/^(✠\s*)?(tin mừng chúa giê-su|cuộc thương khó|khởi đầu tin mừng)/i) || 
            lowerText.includes('dấu ký hiệu viết tắt')) {
          isCapturingTitle = false;
          result.mainTitle = titleParts.join(' - ');
        } else {
          titleParts.push(text);
          continue;
        }
      }

      if (lowerText.startsWith('bài đọc 1') || lowerText.startsWith('bài đọc i ')) {
        saveBuffer();
        currentSection = 'r1';
        result.r1.title = text.replace(/^(Bài đọc 1|Bài đọc I)\s*/i, '').trim();
      } else if (lowerText.startsWith('đáp ca')) {
        saveBuffer();
        if (currentSection === 'extra_reading' || currentSection === 'extra_psalm') {
          currentSection = 'extra_psalm';
          if (extraIndex >= 0) {
            result.extraReadings[extraIndex].psalm_title = text.replace(/^Đáp ca\s*/i, '').trim();
          }
        } else {
          currentSection = 'psalm';
          result.psalm.title = text.replace(/^Đáp ca\s*/i, '').trim();
        }
      } else if (lowerText.startsWith('bài đọc 2') || lowerText.startsWith('bài đọc ii ')) {
        saveBuffer();
        currentSection = 'r2';
        result.r2.title = text.replace(/^(Bài đọc 2|Bài đọc II)\s*/i, '').trim();
      } else if (lowerText.match(/^bài đọc [3-9]/i) || lowerText.match(/^thánh thư/i) && !lowerText.includes('tung hô') || lowerText.startsWith('phúc âm rước lá')) {
        saveBuffer();
        currentSection = 'extra_reading';
        result.extraReadings.push({ title: text.trim(), lead: '', epitomize: '', content: '', psalm_title: '', psalm_content: '' });
        extraIndex = result.extraReadings.length - 1;
      } else if (lowerText.startsWith('tung hô tin mừng') || lowerText.startsWith('alleluia')) {
        saveBuffer();
        currentSection = 'gospelAcclam';
        result.gospelAcclam.title = text.replace(/^(Tung hô Tin Mừng|Alleluia)\s*/i, '').trim();
      } else if (lowerText.match(/^tin mừng\s/i) && !lowerText.includes('chúa giê-su')) {
        saveBuffer();
        currentSection = 'gospel';
        result.gospel.title = text.replace(/^Tin Mừng\s*/i, '').trim();
      } else if (lowerText.match(/^(✠\s*)?(tin mừng chúa giê-su|cuộc thương khó|khởi đầu tin mừng)/i)) {
        if (currentSection === 'extra_reading') {
            const gospelMatch = text.match(/^(.*?theo thánh\s+[\p{L}\s-]+[.)]*)\s*\(?(.*?)\)?$/iu);
            if (gospelMatch) {
              result.extraReadings[extraIndex].lead = gospelMatch[1].trim();
            } else {
              result.extraReadings[extraIndex].lead = text;
            }
        } else {
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
        }
      } else if (lowerText.includes('dấu ký hiệu viết tắt') || (currentSection === 'gospelAcclam' && lowerText.match(/^✠\s*:/))) {
        if (currentSection !== 'gospel') {
          saveBuffer();
          currentSection = 'gospel';
        }
        contentBuffer.push(text);
      } else if (lowerText.startsWith('bài trích sách') || lowerText.startsWith('thư của thánh') || lowerText.startsWith('bài trích thư') || lowerText.startsWith('khởi đầu') || lowerText.startsWith('trích sách') || lowerText.startsWith('trích thư')) {
         if (currentSection) {
           if (currentSection === 'extra_reading' && extraIndex >= 0) result.extraReadings[extraIndex].lead = text;
           else if (result[currentSection]) result[currentSection].lead = text;
         }
      } else if (p.querySelector('i') && p.innerText === p.querySelector('i').innerText && currentSection) {
         if (currentSection === 'extra_reading' && extraIndex >= 0) {
           if (!result.extraReadings[extraIndex].epitomize) result.extraReadings[extraIndex].epitomize = text;
           else contentBuffer.push(text);
         } else if (result[currentSection]) {
           if (!result[currentSection].epitomize) result[currentSection].epitomize = text;
           else contentBuffer.push(text);
         }
      } else {
        if (lowerText.includes('xin hỗ trợ sứ mạng') || lowerText.includes('góp ý cải thiện') || lowerText.includes('điền form') || lowerText.includes('đóng góp cho lời chúa hằng ngày')) {
           currentSection = null; 
           continue;
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
  
  console.log("Extra Readings:");
  console.log(data.extraReadings);
  console.log("Gospel:");
  console.log(data.gospel);
  await browser.close();
})();
