/**
 * Bộ quy tắc ngắt nhịp và dọn dẹp văn bản Phụng vụ (Liturgical Speech Ruleset)
 * Dành cho việc hiển thị và đọc TTS (Hoài My / Nam Minh Neural)
 */

export interface LiturgicalCleanOptions {
  commaSilenceMs?: number; // default 500
  semicolonSilenceMs?: number; // default 750
  sentenceSilenceMs?: number; // default 1050
  voiceName?: string; // default vi-VN-HoaiMyNeural
  minWordDistance?: number; // default 4 words between commas
}

/**
 * Lớp 1: Dọn dẹp văn bản gốc (Clean HTML, verse numbers, stray characters)
 */
export function cleanLiturgicalText(rawText: string): string {
  if (!rawText) return '';

  let text = rawText;

  // 1. Strip HTML tags
  text = text.replace(/<[^>]*>/g, '');

  // 2. Replace liturgical symbols & prefixes
  text = text.replace(/✠/g, '');
  text = text.replace(/\(Đ\.\)/gi, ' Đáp. ');
  text = text.replace(/Đ\./gi, 'Đáp: ');
  text = text.replace(/BĐ1:/gi, 'Bài đọc 1: ');
  text = text.replace(/BĐ2:/gi, 'Bài đọc 2: ');

  // 3. Remove bracketed verse numbers like [44], [46]
  text = text.replace(/\[\d{1,3}\]/g, '');

  // 4. Insert space after punctuation before digits (.21 -> . 21)
  text = text.replace(/([.?!;”"’])(\d{1,3}[a-zA-Z]?)/g, '$1 $2');

  // 5. Remove verse numbers & verse ranges
  text = text.replace(/(?:^|\s)\d{1,3}\s*-\s*\d{1,3}[a-zA-Z]?(?=\s|[A-ZÀ-Ỹ"“'‘(\[]|$)/g, ' ');
  text = text.replace(/:\s*\d+[a-zA-Z]?/g, ' : ');
  text = text.replace(/(?:^|\s|[^\w\s])\d{1,3}[a-zA-Z]?(?=[A-ZÀ-Ỹ"“'‘(\[]|\s|$)/g, ' ');

  // 6. Remove quotes & stray brackets that produce click sounds in TTS
  text = text.replace(/["“'’‘«»()\[\]\u201c\u201d\u2018\u2019]/g, '');

  // 7. Normalize spaces & dots
  text = text.replace(/\.{3,}/g, '.');
  text = text.replace(/\s+/g, ' ').trim();

  return text;
}

/**
 * Lớp 2 & 3: Ngắt cụm từ thông minh và bảo vệ chống ngắt vụn (Smart Clause Insertion & Anti-oversegmentation)
 */
export function applySmartLiturgicalPauses(text: string, minWordDistance = 4): string {
  if (!text) return '';

  const clean = cleanLiturgicalText(text);

  // Target connectors for liturgical reading
  const connectors = [
    'tức là', 'bởi vì', 'cho nên', 'nhờ đó', 'thì', 'để', 'rằng', 'nhưng', 'chứ', 'vì', 'còn'
  ];

  let result = clean;

  for (const conn of connectors) {
    const escaped = conn.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(?<![\\,\\.\\;\\:\\?!])\\s+(${escaped})\\s+`, 'gi');

    result = result.replace(regex, (match, p1, offset, fullStr) => {
      // Check word count since last punctuation mark
      const precedingText = fullStr.slice(0, offset);
      const lastPunct = Math.max(
        precedingText.lastIndexOf(','),
        precedingText.lastIndexOf('.'),
        precedingText.lastIndexOf(';'),
        precedingText.lastIndexOf(':'),
        precedingText.lastIndexOf('!')
      );

      const segment = lastPunct >= 0 ? precedingText.slice(lastPunct + 1) : precedingText;
      const wordCount = segment.trim().split(/\s+/).filter(Boolean).length;

      // Only insert comma if distance >= minWordDistance
      if (wordCount >= minWordDistance) {
        return `, ${p1} `;
      }
      return match;
    });
  }

  // Clean up duplicate commas or spaces
  result = result.replace(/\s*,\s*/g, ', ');
  result = result.replace(/,\s*,/g, ',');
  result = result.replace(/\s+/g, ' ').trim();

  return result;
}

/**
 * Lớp 4: Cấu hình SSML chuẩn Microsoft Neural Engine
 */
export function buildLiturgicalSSML(rawText: string, options: LiturgicalCleanOptions = {}): string {
  const {
    commaSilenceMs = 500,
    semicolonSilenceMs = 750,
    sentenceSilenceMs = 1050,
    voiceName = 'vi-VN-HoaiMyNeural',
    minWordDistance = 4,
  } = options;

  const processedText = applySmartLiturgicalPauses(rawText, minWordDistance);

  return `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="http://www.w3.org/2001/mstts" xml:lang="vi-VN">
    <voice name="${voiceName}">
        <mstts:silence type="Comma-exact" value="${commaSilenceMs}ms"/>
        <mstts:silence type="Semicolon-exact" value="${semicolonSilenceMs}ms"/>
        <mstts:silence type="Sentenceboundary-exact" value="${sentenceSilenceMs}ms"/>
        <mstts:silence type="Leading-exact" value="200ms"/>
        <mstts:silence type="Tailing-exact" value="300ms"/>
        ${processedText}
    </voice>
</speak>`;
}
