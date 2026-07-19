let text = "✠Tin Mừng Chúa Giê-su Ki-tô theo thánh Gio-an.      Ga 6,16-21";
let lowerText = text.toLowerCase();

let result = { gospel: { lead: '', title: '' } };

if (lowerText.match(/^(✠\s*)?(tin mừng chúa giê-su|cuộc thương khó|khởi đầu tin mừng)/i)) {
  const gospelMatch = text.match(/^(.*?theo thánh\s+[\p{L}\s-]+[.)]*)\s*\(?(.*?)\)?$/iu);
  if (gospelMatch) {
    result.gospel.lead = gospelMatch[1].trim();
    if (!result.gospel.title) {
      result.gospel.title = gospelMatch[2].replace(/[()]/g, '').trim();
    }
  } else {
    result.gospel.lead = text;
  }
}

console.log(result.gospel);
