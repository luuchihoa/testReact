import http from 'http';
import { exec } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const BASE_DIR = path.resolve(__dirname, '..');

const PORT = 5005;
const PYTHON_BIN = "/Users/tranthithuynhi/OmniVoice-Studio/.venv/bin/python";
const SCRIPT_READING = path.join(BASE_DIR, "scripts", "generate_single_reading_mp3.py");
const SCRIPT_GOSPEL = path.join(BASE_DIR, "scripts", "generate_single_gospel_mp3.py");
const SCRIPT_MANIFEST = path.join(BASE_DIR, "scripts", "rebuild_audio_manifest.py");
const CUSTOM_VOICES_DIR = path.join(BASE_DIR, "public", "audio", "custom_voices");

// Mapping giọng mẫu tích hợp sẵn
const VOICE_MAP = {
  hao: "/Users/tranthithuynhi/OmniVoice-Studio/backend/assets/samples/voice_hao.mp3",
  giang: "/Users/tranthithuynhi/OmniVoice-Studio/backend/assets/samples/voice_giang - northern female narrator.mp3",
  trieu_duong: "/Users/tranthithuynhi/OmniVoice-Studio/backend/assets/samples/voice_trieu_duong.mp3"
};

// Đảm bảo thư mục custom_voices tồn tại
if (!fs.existsSync(CUSTOM_VOICES_DIR)) {
  fs.mkdirSync(CUSTOM_VOICES_DIR, { recursive: true });
}

// Hàm parse multipart form data đơn giản
function parseMultipart(buffer, boundary) {
  const parts = [];
  const boundaryBuffer = Buffer.from(`--${boundary}`);
  let start = buffer.indexOf(boundaryBuffer) + boundaryBuffer.length;

  while (true) {
    const nextBound = buffer.indexOf(boundaryBuffer, start);
    if (nextBound === -1) break;

    const partData = buffer.slice(start, nextBound);
    const headerEnd = partData.indexOf('\r\n\r\n');
    if (headerEnd === -1) { start = nextBound + boundaryBuffer.length; continue; }

    const headers = partData.slice(0, headerEnd).toString();
    const body = partData.slice(headerEnd + 4, partData.length - 2); // trim trailing \r\n

    const filenameMatch = headers.match(/filename="([^"]+)"/);
    const nameMatch = headers.match(/name="([^"]+)"/);

    parts.push({
      name: nameMatch ? nameMatch[1] : '',
      filename: filenameMatch ? filenameMatch[1] : null,
      data: body,
      headers
    });

    start = nextBound + boundaryBuffer.length;
  }

  return parts;
}

const server = http.createServer((req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // ── API Upload Giọng Mẫu Tùy Chỉnh ──
  if (req.method === 'POST' && req.url === '/api/upload-voice') {
    const chunks = [];
    req.on('data', chunk => chunks.push(chunk));
    req.on('end', () => {
      try {
        const buffer = Buffer.concat(chunks);
        const contentType = req.headers['content-type'] || '';
        const boundaryMatch = contentType.match(/boundary=(.+)/);

        if (!boundaryMatch) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Thiếu boundary trong Content-Type' }));
          return;
        }

        const parts = parseMultipart(buffer, boundaryMatch[1]);
        const filePart = parts.find(p => p.name === 'voice_file' && p.filename);

        if (!filePart) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Không tìm thấy file giọng mẫu trong request' }));
          return;
        }

        // Lưu file vào thư mục custom_voices
        const safeName = filePart.filename.replace(/[^a-zA-Z0-9._\-\s]/g, '').replace(/\s+/g, '_');
        const destPath = path.join(CUSTOM_VOICES_DIR, safeName);
        fs.writeFileSync(destPath, filePart.data);

        console.log(`📁 [UPLOAD] Đã lưu giọng mẫu tùy chỉnh: ${destPath} (${(filePart.data.length / 1024).toFixed(1)} KB)`);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          filename: safeName,
          path: destPath
        }));
      } catch (err) {
        console.error('❌ Upload Error:', err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });

  // ── API Render Audio ──
  } else if (req.method === 'POST' && req.url === '/api/render-audio') {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        const {
          ref = "Bai_Doc_Tu_Chinh",
          intro = "",
          content = "",
          voice = "hao", // "hao", "giang", "trieu_duong", "custom"
          section = "r1",  // "r1", "r2", "gospel"
          section_label = "Bài đọc một.",
          overwrite = true,
          custom_voice_path = null,
          pause_config = {}
        } = data;

        const paragraphPause = pause_config.paragraph ?? 0.60;
        const sentencePause = pause_config.sentence ?? 0.45;
        const majorPause = pause_config.major ?? 0.30;
        const mediumPause = pause_config.medium ?? 0.25;

        if (!content || !content.trim()) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Nội dung bài đọc không được để trống' }));
          return;
        }

        // Tách đường dẫn thư mục lưu trữ
        let outSubfolder = "readings/r1";
        let scriptToRun = SCRIPT_READING;
        let prefix = "r1";

        if (section === "r2") {
          outSubfolder = "readings/r2";
          prefix = "r2";
        } else if (section === "gospel" || (voice === "trieu_duong" && section !== "r1" && section !== "r2")) {
          outSubfolder = "gospels";
          scriptToRun = SCRIPT_GOSPEL;
          prefix = "gospel";
        }

        // Clean ref filename
        let cleanRef = ref.trim()
          .replace(/[\.,:;()\\/*?"<>|]/g, '')
          .replace(/\s*-\s*/g, '-')
          .replace(/\s+/g, '_');
        
        if (!cleanRef) cleanRef = "custom_audio";
        const filename = `${prefix}_${cleanRef}.mp3`;
        const outAbsPath = path.join(BASE_DIR, "public", "audio", outSubfolder, filename);
        const relUrl = `/audio/${outSubfolder}/${filename}`;

        console.log(`🎙️ [SERVER API] Đang render audio: ${filename} (Giọng: ${voice}${custom_voice_path ? ' - Custom: ' + path.basename(custom_voice_path) : ''})`);

        // Escape shell arguments
        const esc = (str) => `"${str.replace(/"/g, '\\"')}"`;

        // Giải quyết đường dẫn giọng mẫu: custom > built-in map > rỗng
        let resolvedVoicePath = '';
        if (voice === 'custom' && custom_voice_path) {
          resolvedVoicePath = custom_voice_path;
        } else if (VOICE_MAP[voice]) {
          resolvedVoicePath = VOICE_MAP[voice];
        }
        const voiceArg = resolvedVoicePath ? esc(resolvedVoicePath) : '""';
        
        let cmd = "";
        if (scriptToRun === SCRIPT_READING) {
          cmd = `${PYTHON_BIN} ${SCRIPT_READING} ${esc(ref)} ${esc(intro)} ${esc(content)} ${esc(outAbsPath)} ${esc(section_label)} 16 false ${overwrite ? 'true' : 'false'} ${voiceArg} ${paragraphPause} ${sentencePause} ${majorPause} ${mediumPause}`;
        } else {
          cmd = `${PYTHON_BIN} ${SCRIPT_GOSPEL} ${esc(ref)} ${esc(intro)} ${esc(content)} ${esc(outAbsPath)} 16 false ${overwrite ? 'true' : 'false'} ${voiceArg} ${paragraphPause} ${sentencePause} ${majorPause} ${mediumPause}`;
        }

        exec(cmd, { maxBuffer: 1024 * 1024 * 10 }, (error, stdout, stderr) => {
          if (error) {
            console.error(`❌ [SERVER ERROR]:`, stderr || error.message);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: stderr || error.message }));
            return;
          }

          // Rebuild manifest
          exec(`python3 ${SCRIPT_MANIFEST}`, (mErr) => {
            console.log(`✅ [SERVER API] Hoàn thành render: ${relUrl}`);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
              success: true,
              url: relUrl,
              filename: filename,
              path: outAbsPath,
              output: stdout
            }));
          });
        });

      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Dữ liệu JSON không hợp lệ' }));
      }
    });

  } else if (req.method === 'GET' && (req.url === '/' || req.url === '/api/status')) {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(`
      <!DOCTYPE html>
      <html lang="vi">
      <head>
        <meta charset="UTF-8">
        <title>Audio Studio Render API Server</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #0f172a; color: #f8fafc; display: flex; align-items: center; justify-content: center; min-h: 100vh; height: 100vh; margin: 0; text-align: center; }
          .card { background: #1e293b; padding: 2.5rem; border-radius: 1.5rem; border: 1px solid #334155; max-width: 480px; shadow: 0 20px 25px -5px rgba(0,0,0,0.5); }
          h1 { color: #f59e0b; font-size: 1.5rem; margin-top: 0; }
          p { color: #94a3b8; font-size: 0.95rem; line-height: 1.6; }
          a { display: inline-block; margin-top: 1.25rem; padding: 0.85rem 1.75rem; background: #d97706; color: white; text-decoration: none; border-radius: 0.75rem; font-weight: bold; transition: background 0.2s; }
          a:hover { background: #b45309; }
        </style>
      </head>
      <body>
        <div class="card">
          <h1>🎙️ Audio Studio Render API Server</h1>
          <p>Server Backend AI đang hoạt động bình thường tại cổng <strong>5005</strong>.</p>
          <p>Để xem giao diện ứng dụng và nhập văn bản bài đọc, vui lòng mở liên kết bên dưới:</p>
          <a href="http://localhost:5173/studio-audio">👉 Mở Giao Diện Studio Audio (Cổng 5173)</a>
        </div>
      </body>
      </html>
    `);
  } else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not Found' }));
  }
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.log(`\nℹ️ Audio Studio Render API Server ĐÃ ĐANG CHẠY SẴN tại http://localhost:${PORT}!`);
    console.log(`👉 Bạn có thể dùng trực tiếp trên giao diện web và bấm Render ngay mà không cần bật lại.\n`);
    process.exit(0);
  } else {
    console.error('❌ Server Error:', err);
  }
});

server.listen(PORT, () => {
  console.log(`🚀 Audio Studio Render API Server đang chạy tại http://localhost:${PORT}`);
});
