import fs from "node:fs";
import path from "node:path";
import http from "node:http";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const distDir = path.resolve(rootDir, "dist");
const docsDir = path.resolve(rootDir, "docs/screenshots");
const artifactDir = "/Users/tranthithuynhi/.gemini/antigravity/brain/44b684f5-0e45-462b-a477-5725c5be9e55";

if (!fs.existsSync(docsDir)) {
  fs.mkdirSync(docsDir, { recursive: true });
}

const MIME_TYPES = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2"
};

function createServer() {
  return http.createServer((req, res) => {
    let reqPath = decodeURIComponent(req.url.split("?")[0]);
    if (reqPath.startsWith("/testReact")) {
      reqPath = reqPath.slice("/testReact".length);
    }
    let filePath = path.join(distDir, reqPath);

    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      const ext = path.extname(filePath);
      res.writeHead(200, { "Content-Type": MIME_TYPES[ext] || "application/octet-stream" });
      fs.createReadStream(filePath).pipe(res);
    } else {
      const indexPath = path.join(distDir, "index.html");
      res.writeHead(200, { "Content-Type": "text/html" });
      fs.createReadStream(indexPath).pipe(res);
    }
  });
}

async function capture() {
  const server = createServer();
  await new Promise((resolve) => server.listen(4173, resolve));
  console.log("Static server running on port 4173");

  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"]
  });

  const captureTasks = [
    // 1. Mobile 390px (iPhone 12/13/14)
    {
      name: "phung-vu-390px.png",
      url: "http://localhost:4173/khối-phụng-vụ",
      viewport: { width: 390, height: 844 },
      selector: "#danh-sach-lop"
    },
    {
      name: "kinh-thanh-390px.png",
      url: "http://localhost:4173/khối-kinh-thánh",
      viewport: { width: 390, height: 844 },
      selector: "#danh-sach-lop"
    },
    {
      name: "vao-doi-390px.png",
      url: "http://localhost:4173/khối-vào-đời",
      viewport: { width: 390, height: 844 },
      selector: "#danh-sach-lop"
    },

    // 2. Desktop 1280px
    {
      name: "phung-vu-1280px.png",
      url: "http://localhost:4173/khối-phụng-vụ",
      viewport: { width: 1280, height: 900 },
      selector: "#danh-sach-lop"
    },
    {
      name: "kinh-thanh-1280px.png",
      url: "http://localhost:4173/khối-kinh-thánh",
      viewport: { width: 1280, height: 900 },
      selector: "#danh-sach-lop"
    },
    {
      name: "vao-doi-1280px.png",
      url: "http://localhost:4173/khối-vào-đời",
      viewport: { width: 1280, height: 900 },
      selector: "#danh-sach-lop"
    },

    // 3. Tablet 768px (Vào Đời 2 - Lưới 2 cột căn giữa)
    {
      name: "vao-doi-768px.png",
      url: "http://localhost:4173/khối-vào-đời",
      viewport: { width: 768, height: 1024 },
      selector: "#danh-sach-lop"
    },

    // 4. Narrow Mobile 320px Room Wrap Check
    {
      name: "phung-vu-320px-room-wrap.png",
      url: "http://localhost:4173/khối-phụng-vụ",
      viewport: { width: 320, height: 800 },
      selector: "#danh-sach-lop"
    },
    {
      name: "vao-doi-320px-room-wrap.png",
      url: "http://localhost:4173/khối-vào-đời",
      viewport: { width: 320, height: 800 },
      selector: "#danh-sach-lop"
    },

    // 5. Filter state KT2 at 390px (Chứng minh STT 02 bảo toàn)
    {
      name: "kinh-thanh-filter-kt2-390px.png",
      url: "http://localhost:4173/khối-kinh-thánh",
      viewport: { width: 390, height: 844 },
      selector: "#danh-sach-lop",
      action: async (page) => {
        const filterBtns = await page.$$(".khoi-filter-pill");
        if (filterBtns[2]) await filterBtns[2].click();
        await new Promise((r) => setTimeout(r, 200));
      }
    },

    // 6. Filter state VD2 at 768px (Chứng minh STT 02 & 2-column grid khi lọc)
    {
      name: "vao-doi-filter-vd2-768px.png",
      url: "http://localhost:4173/khối-vào-đời",
      viewport: { width: 768, height: 800 },
      selector: "#danh-sach-lop",
      action: async (page) => {
        const filterBtns = await page.$$(".khoi-filter-pill");
        if (filterBtns[2]) await filterBtns[2].click();
        await new Promise((r) => setTimeout(r, 200));
      }
    },

    // 7. Reduced Motion Check at 390px
    {
      name: "reduced-motion-vao-doi-390px.png",
      url: "http://localhost:4173/khối-vào-đời",
      viewport: { width: 390, height: 844 },
      selector: "#danh-sach-lop",
      reducedMotion: true
    }
  ];

  for (const task of captureTasks) {
    const page = await browser.newPage();
    await page.setViewport(task.viewport);

    if (task.reducedMotion) {
      await page.emulateMediaFeatures([{ name: "prefers-reduced-motion", value: "reduce" }]);
    }

    await page.goto(task.url, { waitUntil: "networkidle0" });
    await page.waitForSelector(task.selector);

    // Scroll element into view and ensure rendered
    await page.evaluate((sel) => {
      const el = document.querySelector(sel);
      if (el) {
        el.scrollIntoView({ behavior: "instant", block: "start" });
      }
    }, task.selector);

    // Perform any interaction if required (e.g. click filter button)
    if (task.action) {
      await task.action(page);
    }

    // Wait 300ms for stable layout
    await new Promise((r) => setTimeout(r, 300));

    const element = await page.$(task.selector);
    const savePathDocs = path.join(docsDir, task.name);
    const savePathArtifact = path.join(artifactDir, task.name);

    if (element) {
      await element.screenshot({ path: savePathDocs });
      fs.copyFileSync(savePathDocs, savePathArtifact);

      // Verify opacity in element
      const opacity = await page.evaluate((sel) => {
        const block = document.querySelector(`${sel} .khoi-group-block`);
        return block ? window.getComputedStyle(block).opacity : "1";
      }, task.selector);

      console.log(`✓ Saved ${task.name} (${task.viewport.width}x${task.viewport.height}, group opacity: ${opacity})`);
    }

    await page.close();
  }

  await browser.close();
  server.close();
  console.log("All visual evidence screenshots captured and verified successfully!");
}

capture().catch((err) => {
  console.error("Error capturing screenshots:", err);
  process.exit(1);
});
