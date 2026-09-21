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
  await new Promise((resolve) => server.listen(4174, resolve));
  console.log("Static server running on port 4174");

  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"]
  });

  const page = await browser.newPage();

  async function setLightMode() {
    await page.evaluate(() => {
      localStorage.setItem("theme", "light");
      document.documentElement.classList.remove("dark");
    });
  }

  async function saveScreenshot(filename) {
    const docPath = path.join(docsDir, filename);
    await page.screenshot({ path: docPath, fullPage: false });
    if (fs.existsSync(artifactDir)) {
      const artPath = path.join(artifactDir, filename);
      fs.copyFileSync(docPath, artPath);
    }
    console.log(`Saved screenshot: ${filename}`);
  }

  try {
    // 1. Mobile 320px (iPhone SE 1) - Cards View
    await page.setViewport({ width: 320, height: 620, deviceScaleFactor: 2 });
    await page.goto("http://localhost:4174/lịch-học", { waitUntil: "networkidle0" });
    await setLightMode();
    await page.evaluate(() => {
      const target = document.querySelector("#danh-sach-lop");
      if (target) target.scrollIntoView();
    });
    await new Promise((r) => setTimeout(r, 400));
    await saveScreenshot("lich-hoc-320px.png");

    // 2. Mobile 390px (iPhone 14) - Hero View
    await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });
    await page.goto("http://localhost:4174/lịch-học", { waitUntil: "networkidle0" });
    await setLightMode();
    await page.evaluate(() => window.scrollTo(0, 0));
    await new Promise((r) => setTimeout(r, 400));
    await saveScreenshot("lich-hoc-hero-390px.png");

    // 3. Mobile 390px (iPhone 14) - Cards View
    await page.evaluate(() => {
      const target = document.querySelector("#danh-sach-lop");
      if (target) target.scrollIntoView();
    });
    await new Promise((r) => setTimeout(r, 400));
    await saveScreenshot("lich-hoc-390px.png");

    // 4. Mobile 390px - Timeline Open View
    await page.goto("http://localhost:4174/lịch-học", { waitUntil: "networkidle0" });
    await setLightMode();
    await page.evaluate(() => {
      const toggle = document.querySelector(".sched-timeline-toggle");
      if (toggle) toggle.click();
      toggle?.scrollIntoView();
    });
    await new Promise((r) => setTimeout(r, 500));
    await saveScreenshot("lich-hoc-timeline-390px.png");

    // 5. Mobile 390px - Table View with Scroll Hint
    await page.goto("http://localhost:4174/lịch-học", { waitUntil: "networkidle0" });
    await setLightMode();
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll(".sched-view-btn"));
      if (btns[1]) btns[1].click();
    });
    await new Promise((r) => setTimeout(r, 300));
    await page.evaluate(() => {
      const target = document.querySelector(".sched-table-wrapper");
      if (target) target.scrollIntoView();
    });
    await new Promise((r) => setTimeout(r, 400));
    await saveScreenshot("lich-hoc-table-390px.png");

    // 6. Tablet 768px (iPad)
    await page.setViewport({ width: 768, height: 900, deviceScaleFactor: 2 });
    await page.goto("http://localhost:4174/lịch-học", { waitUntil: "networkidle0" });
    await setLightMode();
    await page.evaluate(() => {
      const target = document.querySelector("#danh-sach-lop");
      if (target) target.scrollIntoView();
    });
    await new Promise((r) => setTimeout(r, 400));
    await saveScreenshot("lich-hoc-768px.png");

    // 7. Desktop 1280px (Light Mode)
    await page.setViewport({ width: 1280, height: 900, deviceScaleFactor: 2 });
    await page.goto("http://localhost:4174/lịch-học", { waitUntil: "networkidle0" });
    await setLightMode();
    await page.evaluate(() => {
      const target = document.querySelector("#danh-sach-lop");
      if (target) target.scrollIntoView();
    });
    await new Promise((r) => setTimeout(r, 400));
    await saveScreenshot("lich-hoc-1280px.png");

    // 8. Dark mode 390px
    await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });
    await page.goto("http://localhost:4174/lịch-học", { waitUntil: "networkidle0" });
    await page.evaluate(() => {
      localStorage.setItem("theme", "dark");
      document.documentElement.classList.add("dark");
      const target = document.querySelector("#danh-sach-lop");
      if (target) target.scrollIntoView();
    });
    await new Promise((r) => setTimeout(r, 400));
    await saveScreenshot("lich-hoc-dark-390px.png");

    // 9. Pinned classes 390px (Lớp của con em)
    await page.goto("http://localhost:4174/lịch-học", { waitUntil: "networkidle0" });
    await setLightMode();
    await page.evaluate(() => {
      // Pin two classes
      const pinBtns = Array.from(document.querySelectorAll(".sched-pin-btn"));
      if (pinBtns[0]) pinBtns[0].click();
      if (pinBtns[1]) pinBtns[1].click();
    });
    await new Promise((r) => setTimeout(r, 400));
    await page.evaluate(() => {
      const pinnedSection = document.querySelector(".sched-pinned-section");
      if (pinnedSection) pinnedSection.scrollIntoView();
    });
    await new Promise((r) => setTimeout(r, 400));
    await saveScreenshot("lich-hoc-pinned-390px.png");

    // 10. Mobile Floating Thumb Switcher Bar 390px
    await page.goto("http://localhost:4174/lịch-học", { waitUntil: "networkidle0" });
    await setLightMode();
    await page.evaluate(() => {
      if (window.lenis) {
        window.lenis.scrollTo(1500, { immediate: true });
      } else {
        window.scrollTo({ top: 1500, behavior: "instant" });
      }
    });
    await new Promise((r) => setTimeout(r, 800));
    await saveScreenshot("lich-hoc-thumb-bar-390px.png");

    // 11. Reduced Motion 390px
    await page.emulateMediaFeatures([{ name: "prefers-reduced-motion", value: "reduce" }]);
    await page.goto("http://localhost:4174/lịch-học", { waitUntil: "networkidle0" });
    await setLightMode();
    await page.evaluate(() => {
      const target = document.querySelector("#danh-sach-lop");
      if (target) target.scrollIntoView();
    });
    await new Promise((r) => setTimeout(r, 400));
    await saveScreenshot("lich-hoc-reduced-motion-390px.png");

  } finally {
    await browser.close();
    server.close();
  }
}

capture().catch((err) => {
  console.error("Screenshot capture failed:", err);
  process.exit(1);
});
