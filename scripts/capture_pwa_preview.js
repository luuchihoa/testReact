import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import puppeteer from 'puppeteer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const HTML_PATH = path.join(rootDir, 'public/pwa-preview.html');
const OUT_PATH = path.join(rootDir, 'docs/pwa-preview-screenshot.png');

async function capture() {
  console.log('📸 Đang chụp ảnh Preview Logo PWA...');
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 1150, deviceScaleFactor: 2 });
  await page.goto(`file://${HTML_PATH}`, { waitUntil: 'networkidle0' });
  await page.screenshot({ path: OUT_PATH, fullPage: true });
  await browser.close();

  console.log(`✓ Đã lưu ảnh chụp bản test tại: ${OUT_PATH}`);
}

capture().catch((err) => {
  console.error('Lỗi khi chụp ảnh preview:', err);
  process.exit(1);
});
