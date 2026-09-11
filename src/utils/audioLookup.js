import audioManifest from './audioManifest.json';

const norm = (s) => {
  if (!s) return '';
  return s.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
};

const AUDIO_BASE_URL = (import.meta.env.VITE_AUDIO_BASE_URL || '').replace(/\/+$/, '');

/**
 * Chuyển tương đối /audio/... thành đường dẫn tuyệt đối Cloudflare R2 / CDN nếu VITE_AUDIO_BASE_URL được cấu hình
 */
const resolveAudioUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return AUDIO_BASE_URL ? `${AUDIO_BASE_URL}${cleanPath}` : cleanPath;
};

/**
 * Tìm đường dẫn URL âm thanh (Cloudflare R2 / CDN hoặc local MP3) dựa trên refString và prefix
 * @param {string} refString - Trích dẫn bài đọc (ví dụ: "1 V 3, 5.7-12", "Rm 8, 28-30", "Lc 11, 1-13")
 * @param {string} prefix - Loại bài đọc ('gospel', 'r1', 'r2', 'psalm')
 * @returns {string|null} Đường dẫn URL âm thanh thực tế
 */
export const findAudioUrl = (refString, prefix = '') => {
  if (!refString) return null;

  const rawKey = norm(refString);
  const prefixedKey = norm(`${prefix}_${refString}`);

  // 1. Khớp chính xác key có prefix (ví dụ: r11v35712 ➔ https://r2.dev/audio/readings/r1/r1_1_V_357-12.mp3)
  if (prefixedKey && audioManifest[prefixedKey]) {
    return resolveAudioUrl(audioManifest[prefixedKey]);
  }

  // 2. Khớp tiền tố r_ dùng chung nếu có
  const rUnifiedKey = norm(`r_${refString}`);
  if ((prefix === 'r1' || prefix === 'r2' || prefix === 'r') && audioManifest[rUnifiedKey]) {
    return resolveAudioUrl(audioManifest[rUnifiedKey]);
  }

  // 3. Khớp chính xác key không prefix
  if (rawKey && audioManifest[rawKey]) {
    return resolveAudioUrl(audioManifest[rawKey]);
  }

  // 4. Khớp tiền tố/chứa chuỗi (fuzzy matching)
  if (rawKey) {
    if (prefix) {
      const prefLower = norm(prefix);
      for (const [k, path] of Object.entries(audioManifest)) {
        if (k.startsWith(prefLower) && k.includes(rawKey)) {
          return resolveAudioUrl(path);
        }
      }
    }
    for (const [k, path] of Object.entries(audioManifest)) {
      if (k.startsWith(rawKey) || k.includes(rawKey)) {
        return resolveAudioUrl(path);
      }
    }
  }

  return null;
};

