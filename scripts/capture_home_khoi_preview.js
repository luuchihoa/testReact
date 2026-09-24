import path from 'path';
import { fileURLToPath } from 'url';
import puppeteer from 'puppeteer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const OUT_PATH = path.join(rootDir, 'docs/home-khoi-badges-preview.png');

async function capture() {
  console.log('📸 Đang chụp ảnh Preview 6 Khối trên Trang chủ...');
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900, deviceScaleFactor: 2 });
  
  // Mở trang preview của dist build
  // Chúng ta mở trực tiếp file preview hoặc chạy test
  await page.goto('http://localhost:4173', { waitUntil: 'networkidle2', timeout: 8000 }).catch(() => null);

  const section = await page.$('.home-nganh-grid');
  if (section) {
    await section.screenshot({ path: OUT_PATH });
    console.log(`✓ Đã lưu ảnh chụp 6 khối tại: ${OUT_PATH}`);
  }
  await browser.close();
}

capture().catch(err => console.log('Notice:', err.message));
