import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import puppeteer from 'puppeteer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const OUT_DIR = path.join(rootDir, 'public/images/badges');
if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

const BADGES = [
  {
    id: 'badge-khai-tam',
    src: '/Users/tranthithuynhi/.gemini/antigravity/brain/214e8276-5cb7-4934-856d-73f84dfe3c6a/badge_khai_tam_anngai_1790005628275.jpg',
    clipRadius: 236
  },
  {
    id: 'badge-ruoc-le',
    src: '/Users/tranthithuynhi/.gemini/antigravity/brain/214e8276-5cb7-4934-856d-73f84dfe3c6a/badge_ruoc_le_anngai_1790005669084.jpg',
    clipRadius: 238
  },
  {
    id: 'badge-them-suc',
    src: '/Users/tranthithuynhi/.gemini/antigravity/brain/214e8276-5cb7-4934-856d-73f84dfe3c6a/badge_them_suc_1790005203914.jpg',
    clipRadius: 236
  },
  {
    id: 'badge-phung-vu',
    src: '/Users/tranthithuynhi/.gemini/antigravity/brain/214e8276-5cb7-4934-856d-73f84dfe3c6a/badge_phung_vu_1790005289732.jpg',
    clipRadius: 240
  },
  {
    id: 'badge-kinh-thanh',
    src: '/Users/tranthithuynhi/.gemini/antigravity/brain/214e8276-5cb7-4934-856d-73f84dfe3c6a/badge_kinh_thanh_1790005331846.jpg',
    clipRadius: 238
  },
  {
    id: 'badge-vao-doi',
    src: '/Users/tranthithuynhi/.gemini/antigravity/brain/214e8276-5cb7-4934-856d-73f84dfe3c6a/badge_vao_doi_1790005371944.jpg',
    clipRadius: 238
  }
];

async function run() {
  console.log('🚀 Đang khởi động Puppeteer để render bộ 6 Huy hiệu Biểu trưng Khối...');

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  for (const item of BADGES) {
    const page = await browser.newPage();
    const size = 512;
    await page.setViewport({ width: size, height: size, deviceScaleFactor: 1 });

    const imgB64 = fs.readFileSync(item.src).toString('base64');

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            * { margin: 0; padding: 0; }
            body { background: transparent; overflow: hidden; width: ${size}px; height: ${size}px; }
            canvas { display: block; width: ${size}px; height: ${size}px; }
          </style>
        </head>
        <body>
          <canvas id="c" width="${size}" height="${size}"></canvas>
          <script>
            (async () => {
              const canvas = document.getElementById('c');
              const ctx = canvas.getContext('2d');
              const img = new Image();
              img.onload = () => {
                ctx.clearRect(0, 0, ${size}, ${size});
                ctx.save();
                
                // Cắt tròn sát mép viền vàng
                ctx.beginPath();
                ctx.arc(${size/2}, ${size/2}, ${item.clipRadius}, 0, Math.PI * 2);
                ctx.closePath();
                ctx.clip();

                ctx.drawImage(img, 0, 0, ${size}, ${size});
                ctx.restore();

                // Viền vàng kim mịn chống răng cưa
                ctx.beginPath();
                ctx.arc(${size/2}, ${size/2}, ${item.clipRadius - 1}, 0, Math.PI * 2);
                ctx.lineWidth = 2;
                ctx.strokeStyle = '#dfb557';
                ctx.stroke();

                window.done = true;
              };
              img.src = 'data:image/jpeg;base64,${imgB64}';
            })();
          </script>
        </body>
      </html>
    `;

    await page.setContent(html);
    await page.waitForFunction('window.done === true', { timeout: 10000 });

    // Xuất định dạng WebP chất lượng 90% (siêu nhẹ, hiển thị sắc nét)
    const webpB64 = await page.evaluate(() => {
      const c = document.getElementById('c');
      return c.toDataURL('image/webp', 0.90).replace(/^data:image\/webp;base64,/, '');
    });
    const webpPath = path.join(OUT_DIR, `${item.id}.webp`);
    fs.writeFileSync(webpPath, Buffer.from(webpB64, 'base64'));

    // Xuất kèm bản PNG fallback
    const pngB64 = await page.evaluate(() => {
      const c = document.getElementById('c');
      return c.toDataURL('image/png').replace(/^data:image\/png;base64,/, '');
    });
    const pngPath = path.join(OUT_DIR, `${item.id}.png`);
    fs.writeFileSync(pngPath, Buffer.from(pngB64, 'base64'));

    const statsWebp = fs.statSync(webpPath);
    console.log(`✓ Đã xuất: ${item.id}.webp (${(statsWebp.size / 1024).toFixed(1)} KB) & .png`);
    await page.close();
  }

  await browser.close();
  console.log('\n🎉 HOÀN TẤT XUẤT 6 HUY HIỆU BIỂU TRƯNG CHO CÁC KHỐI!');
}

run().catch(err => {
  console.error('Lỗi khi sinh huy hiệu:', err);
  process.exit(1);
});
