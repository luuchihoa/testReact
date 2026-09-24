import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import puppeteer from 'puppeteer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const HTML_PATH = path.join(rootDir, 'public/opt1-preview.html');
const OUT_PATH = path.join(rootDir, 'docs/opt1-preview-screenshot.png');
const ARTIFACT_PATH = '/Users/tranthithuynhi/.gemini/antigravity/brain/214e8276-5cb7-4934-856d-73f84dfe3c6a/opt1-preview-screenshot.png';

async function capture() {
  console.log('📸 Đang chụp ảnh Preview Phương Án 1...');
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 1800, deviceScaleFactor: 2 });
  await page.goto(`file://${HTML_PATH}`, { waitUntil: 'load' });
  await page.waitForSelector('.container');
  await new Promise(r => setTimeout(r, 1500));
  
  await page.screenshot({ path: OUT_PATH, fullPage: true });
  fs.copyFileSync(OUT_PATH, ARTIFACT_PATH);
  
  await browser.close();
  console.log(`✓ Đã lưu ảnh chụp bản test tại: ${OUT_PATH} và ${ARTIFACT_PATH}`);
}

capture().catch((err) => {
  console.error('Lỗi khi chụp ảnh preview:', err);
  process.exit(1);
});
