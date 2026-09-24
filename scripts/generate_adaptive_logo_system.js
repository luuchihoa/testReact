import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import puppeteer from 'puppeteer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const SRC_PWA = '/Users/tranthithuynhi/.gemini/antigravity/brain/214e8276-5cb7-4934-856d-73f84dfe3c6a/pwa_app_icon_man_coi_1790003739295.jpg';
const SRC_CREST = '/Users/tranthithuynhi/.gemini/antigravity/brain/214e8276-5cb7-4934-856d-73f84dfe3c6a/logo_crest_option_1_1790003487235.jpg';
const SVG_FAVICON = path.join(rootDir, 'public/favicon.svg');
const OUT_DIR_PWA = path.join(rootDir, 'public/images/pwa-v2');

if (!fs.existsSync(OUT_DIR_PWA)) {
  fs.mkdirSync(OUT_DIR_PWA, { recursive: true });
}

async function run() {
  console.log('🚀 Đang khởi động Puppeteer để render hệ thống Logo đa tầng...');
  
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });

  const pwaB64 = fs.readFileSync(SRC_PWA).toString('base64');
  const crestB64 = fs.readFileSync(SRC_CREST).toString('base64');
  const svgFaviconContent = fs.readFileSync(SVG_FAVICON, 'utf-8');

  // Helper render canvas
  async function renderToPng(width, height, drawScript, outPath) {
    const page = await browser.newPage();
    await page.setViewport({ width, height, deviceScaleFactor: 1 });

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            * { margin: 0; padding: 0; }
            body { background: transparent; overflow: hidden; width: ${width}px; height: ${height}px; }
            canvas { display: block; width: ${width}px; height: ${height}px; }
          </style>
        </head>
        <body>
          <canvas id="c" width="${width}" height="${height}"></canvas>
          <script>
            (async () => {
              const canvas = document.getElementById('c');
              const ctx = canvas.getContext('2d');
              ${drawScript}
            })();
          </script>
        </body>
      </html>
    `;

    await page.setContent(html);
    // Chờ script canvas chạy xong
    await page.waitForFunction('window.done === true', { timeout: 10000 });
    
    // Xuất buffer ảnh
    const b64 = await page.evaluate(() => {
      const c = document.getElementById('c');
      return c.toDataURL('image/png').replace(/^data:image\/png;base64,/, '');
    });

    fs.writeFileSync(outPath, Buffer.from(b64, 'base64'));
    console.log('✓ Đã xuất:', path.relative(rootDir, outPath), `(${width}x${height})`);
    await page.close();
  }

  // 1. Web Header & Footer: logo_htdc.png (512x512 - Cắt tròn chuẩn, nền trong suốt)
  console.log('\n--- 1. Render Logo Web Header & Footer (logo_htdc.png) ---');
  await renderToPng(512, 512, `
    const img = new Image();
    img.onload = () => {
      ctx.clearRect(0, 0, 512, 512);
      ctx.save();
      // Bo tròn viền ngoài sát mép vành vàng
      ctx.beginPath();
      ctx.arc(256, 256, 238, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      
      // Vẽ ảnh tâm điểm
      ctx.drawImage(img, 0, 0, 512, 512);
      ctx.restore();
      
      // Viền vàng kim siêu mịn chống răng cưa
      ctx.beginPath();
      ctx.arc(256, 256, 237, 0, Math.PI * 2);
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#dfb557';
      ctx.stroke();

      window.done = true;
    };
    img.src = 'data:image/jpeg;base64,${pwaB64}';
  `, path.join(rootDir, 'public/images/logo_htdc.png'));

  // 2. Master 1024x1024 cho PWA Splash & Showcase
  console.log('\n--- 2. Render PWA Master & Crest ---');
  await renderToPng(1024, 1024, `
    const img = new Image();
    img.onload = () => {
      ctx.clearRect(0, 0, 1024, 1024);
      ctx.save();
      ctx.beginPath();
      ctx.arc(512, 512, 476, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(img, 0, 0, 1024, 1024);
      ctx.restore();

      ctx.beginPath();
      ctx.arc(512, 512, 474, 0, Math.PI * 2);
      ctx.lineWidth = 4;
      ctx.strokeStyle = '#dfb557';
      ctx.stroke();

      window.done = true;
    };
    img.src = 'data:image/jpeg;base64,${pwaB64}';
  `, path.join(OUT_DIR_PWA, 'master-1024.png'));

  // 2b. Crest Master có chữ vòng cung (cho trang Giới thiệu)
  await renderToPng(1024, 1024, `
    const img = new Image();
    img.onload = () => {
      ctx.clearRect(0, 0, 1024, 1024);
      ctx.save();
      ctx.beginPath();
      ctx.arc(512, 512, 490, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(img, 0, 0, 1024, 1024);
      ctx.restore();
      window.done = true;
    };
    img.src = 'data:image/jpeg;base64,${crestB64}';
  `, path.join(OUT_DIR_PWA, 'crest-master.png'));

  // 3. PWA Standard Icons (512x512 & 192x192)
  console.log('\n--- 3. Render PWA Standard Icons ---');
  for (const size of [512, 192]) {
    await renderToPng(size, size, `
      const img = new Image();
      img.onload = () => {
        ctx.clearRect(0, 0, ${size}, ${size});
        ctx.save();
        ctx.beginPath();
        ctx.arc(${size/2}, ${size/2}, ${size * 0.47}, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(img, 0, 0, ${size}, ${size});
        ctx.restore();

        ctx.beginPath();
        ctx.arc(${size/2}, ${size/2}, ${size * 0.465}, 0, Math.PI * 2);
        ctx.lineWidth = ${Math.max(2, size * 0.008)};
        ctx.strokeStyle = '#dfb557';
        ctx.stroke();

        window.done = true;
      };
      img.src = 'data:image/jpeg;base64,${pwaB64}';
    `, path.join(OUT_DIR_PWA, `icon-${size}.png`));
  }

  // 4. Android Maskable Icons (512x512 & 192x192 - Đạt 100% W3C 80% Safe Zone)
  console.log('\n--- 4. Render Android Maskable Icons (80% Safe Zone) ---');
  for (const size of [512, 192]) {
    await renderToPng(size, size, `
      const img = new Image();
      img.onload = () => {
        // Nền xanh ngọc lục bảo tràn 100% canvas chống bị chém góc
        const bgGrad = ctx.createRadialGradient(${size/2}, ${size/2}, ${size * 0.1}, ${size/2}, ${size/2}, ${size * 0.7});
        bgGrad.addColorStop(0, '#1c4430');
        bgGrad.addColorStop(0.7, '#142f22');
        bgGrad.addColorStop(1, '#0a1a12');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, ${size}, ${size});

        // Vẽ huy hiệu nằm lọt vào trong 80% Safe Zone (đường kính = size * 0.78)
        const innerRadius = ${size} * 0.39;
        const scale = 0.82;
        const drawSize = ${size} * scale;
        const offset = (${size} - drawSize) / 2;

        ctx.save();
        ctx.beginPath();
        ctx.arc(${size/2}, ${size/2}, innerRadius, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(img, offset, offset, drawSize, drawSize);
        ctx.restore();

        // Viền vàng kim tinh xảo
        ctx.beginPath();
        ctx.arc(${size/2}, ${size/2}, innerRadius, 0, Math.PI * 2);
        ctx.lineWidth = ${Math.max(2, size * 0.01)};
        ctx.strokeStyle = '#dfb557';
        ctx.stroke();

        window.done = true;
      };
      img.src = 'data:image/jpeg;base64,${pwaB64}';
    `, path.join(OUT_DIR_PWA, `maskable-${size}.png`));
  }

  // 5. iOS Apple Touch Icons (180x180, 167x167, 152x152)
  console.log('\n--- 5. Render iOS Apple Touch Icons ---');
  for (const size of [180, 167, 152]) {
    await renderToPng(size, size, `
      const img = new Image();
      img.onload = () => {
        // Nền xanh sang trọng cho Apple Web Clip
        const bgGrad = ctx.createRadialGradient(${size/2}, ${size/2}, ${size * 0.1}, ${size/2}, ${size/2}, ${size * 0.7});
        bgGrad.addColorStop(0, '#1c4430');
        bgGrad.addColorStop(1, '#0e2319');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, ${size}, ${size});

        // Huy hiệu ở tâm với viền vàng
        const r = ${size} * 0.42;
        const scale = 0.88;
        const drawSize = ${size} * scale;
        const offset = (${size} - drawSize) / 2;

        ctx.save();
        ctx.beginPath();
        ctx.arc(${size/2}, ${size/2}, r, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(img, offset, offset, drawSize, drawSize);
        ctx.restore();

        ctx.beginPath();
        ctx.arc(${size/2}, ${size/2}, r, 0, Math.PI * 2);
        ctx.lineWidth = 2.5;
        ctx.strokeStyle = '#dfb557';
        ctx.stroke();

        window.done = true;
      };
      img.src = 'data:image/jpeg;base64,${pwaB64}';
    `, path.join(OUT_DIR_PWA, `apple-touch-${size}.png`));
  }

  // 6. Favicon PNG (48x48 & 32x32 - Render từ SVG Marian Monogram Crest)
  console.log('\n--- 6. Render Favicon 48x48 & 32x32 từ SVG Vector ---');
  for (const size of [48, 32]) {
    const page = await browser.newPage();
    await page.setViewport({ width: size, height: size, deviceScaleFactor: 2 });
    await page.setContent(`
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            * { margin: 0; padding: 0; }
            body { background: transparent; overflow: hidden; width: ${size}px; height: ${size}px; display: flex; align-items: center; justify-content: center; }
            svg { width: 100%; height: 100%; }
          </style>
        </head>
        <body>
          ${svgFaviconContent}
        </body>
      </html>
    `);
    const buf = await page.screenshot({ type: 'png', omitBackground: true });
    fs.writeFileSync(path.join(OUT_DIR_PWA, `favicon-${size}.png`), buf);
    console.log('✓ Đã xuất:', `favicon-${size}.png`, `(${size}x${size})`);
    await page.close();
  }

  await browser.close();
  console.log('\n🎉 ĐÃ HOÀN TẤT XUẤT TOÀN BỘ HỆ THỐNG LOGO ĐA TẦNG CHUẨN XÁC!');
}

run().catch(err => {
  console.error('Lỗi sinh logo:', err);
  process.exit(1);
});
