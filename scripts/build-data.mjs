/**
 * Sinh dữ liệu thư viện CÔNG KHAI từ private_data/ → public/data/
 *
 * Luật kênh: không lộ R, profit factor, % lãi lỗ ra ngoài.
 * Chỉ giữ: tên, nhóm, verdict, số lệnh, tỉ lệ thắng, số năm dương, tiêu chí đạt/rớt.
 * Bài VIP (private_data/vip_articles) KHÔNG được chép ra public — chỉ phục vụ qua
 * netlify/functions/vip.mjs sau khi xác thực passkey.
 *
 * Chạy tự động trước `npm run dev` và `npm run build`.
 */
import { readFileSync, writeFileSync, mkdirSync, readdirSync, rmSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = join(ROOT, 'private_data', 'thuvien_data');
const OUT = join(ROOT, 'public', 'data', 'thuvien_data');

const pick = (obj, keys) =>
  Object.fromEntries(keys.filter((k) => obj?.[k] !== undefined).map((k) => [k, obj[k]]));

// Thay chuỗi R theo năm bằng dấu dương/âm của năm đó (không lộ con số R)
const yearSigns = (byYear) =>
  byYear ? Object.fromEntries(Object.entries(byYear).map(([y, v]) => [y, v > 0])) : undefined;

const sanitizePeriod = (p, extraKeys = []) =>
  p ? { ...pick(p, ['n', 'wr', 'years_pos', ...extraKeys]), nam_duong: yearSigns(p.by_year) } : undefined;

const INDEX_KEYS = [
  'id', 'ten', 'ho', 'tf', 'trang_thai', 'verdict', 'goc', 'ghi_chu', 'ly_do', 'tin_cay',
  'oos_n', 'oos_years', 'oos2_n', 'oos2_years', 'oos2_status',
];

function buildIndex() {
  const idx = JSON.parse(readFileSync(join(SRC, 'thu_vien_index.json'), 'utf8'));
  // Thứ tự xếp hạng tính từ EV ngoài mẫu nhưng chỉ xuất ra số thứ tự
  const ranked = [...idx.danh_sach].sort((a, b) => (b.oos_ev ?? -999) - (a.oos_ev ?? -999));
  const rank = new Map(ranked.map((s, i) => [s.id, i + 1]));
  return {
    ...pick(idx, ['cap_nhat', 'tong', 'da_chay', 'gop', 'chua', 'verdict_da_chay', 'ky_thi_2']),
    danh_sach: idx.danh_sach.map((s) => ({ ...pick(s, INDEX_KEYS), xep_hang: rank.get(s.id) })),
  };
}

function buildReport(r) {
  return {
    spec: pick(r.spec, ['id', 'ten', 'ho', 'nguon', 'mo_ta', 'tf']),
    verdict: r.verdict,
    tieu_chi: r.tieu_chi,
    IS: sanitizePeriod(r.IS),
    OOS: sanitizePeriod(r.OOS),
    OOS2: sanitizePeriod(r.OOS2, ['status', 'pham_vi', 'ghi_chu']),
  };
}

if (!existsSync(SRC)) {
  console.error(`[build-data] Thiếu ${SRC}`);
  process.exit(1);
}

rmSync(OUT, { recursive: true, force: true });
mkdirSync(join(OUT, 'reports_json'), { recursive: true });

const index = buildIndex();
writeFileSync(join(OUT, 'thu_vien_index.json'), JSON.stringify(index));

const reports = readdirSync(join(SRC, 'reports_json')).filter((f) => f.endsWith('.json'));
for (const f of reports) {
  const r = JSON.parse(readFileSync(join(SRC, 'reports_json', f), 'utf8'));
  writeFileSync(join(OUT, 'reports_json', f), JSON.stringify(buildReport(r)));
}

// Chặn lọt: không file public nào được chứa khoá R/PF
const leak = /"(ev|pf|oos_ev|oos2_ev|surplus|by_year|tham_so|robust)"\s*:/;
for (const f of readdirSync(join(OUT, 'reports_json'))) {
  if (leak.test(readFileSync(join(OUT, 'reports_json', f), 'utf8'))) throw new Error(`[build-data] Lọt R/PF trong ${f}`);
}
if (leak.test(readFileSync(join(OUT, 'thu_vien_index.json'), 'utf8'))) throw new Error('[build-data] Lọt R/PF trong index');

console.log(`[build-data] index ${index.danh_sach.length} mục · ${reports.length} report công khai (đã lọc R/PF)`);
