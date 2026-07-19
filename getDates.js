import { getLiturgyInfo } from './src/utils/liturgyCalendar.js';

const years = [2023, 2024, 2025];
const targets = ['feast_chua_thang_thien', 'feast_ba_ngoi', 'feast_cn_le_la', 'feast_hien_xuong'];

for (const y of years) {
  let found = {};
  for (let d = new Date(y, 1, 1); d <= new Date(y, 6, 31); d.setDate(d.getDate() + 1)) {
    const info = getLiturgyInfo(d);
    if (targets.includes(info.key)) {
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      found[info.key] = `${yyyy}-${mm}-${dd}`;
    }
  }
  console.log(`Year ${y}:`);
  console.log(found);
}
