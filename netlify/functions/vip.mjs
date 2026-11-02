/**
 * Cổng nội dung VIP — chạy trên Netlify Functions (và qua plugin dev trong vite.config.ts).
 *
 * GET /.netlify/functions/vip?action=verify            header x-passkey → { valid, role, expiry, expiresAt }
 * GET /.netlify/functions/vip?action=article&id=BRK001 header x-passkey (tuỳ chọn)
 *   → có passkey hợp lệ: bài đầy đủ · không có: chỉ phần "Tóm tắt 30 giây"
 *
 * Biến môi trường (Netlify → Site settings → Environment variables):
 *   GAS_URL         URL Web App của Google Apps Script
 *   GAS_SERVER_KEY  khoá bí mật trùng với Script Property SERVER_KEY bên Apps Script
 */
import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

const GAS_URL =
  process.env.GAS_URL ||
  'https://script.google.com/macros/s/AKfycbyH6xzJc9J4Dj8fKJi-Rp91tfeS0tZbLtjz0m26bON4kjLKFnMLjS8btAxo66CoPDCGbA/exec';
const GAS_SERVER_KEY = process.env.GAS_SERVER_KEY || '';
const ID_PATTERN = /^[A-Z]{2,6}\d{1,4}$/;
// Lưu đệm ngắn (15 giây) để khi Leon đổi Dropdown (active/inactive/expiry) trên Google Sheet thì Web cập nhật gần như tức thì
const VERIFY_TTL_MS = 15 * 1000;

// Cache trong một instance để không gọi Apps Script dồn dập khi mở nhiều bài liên tiếp
const verifyCache = new Map();

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  });

async function verifyPasskey(passkey) {
  const hit = verifyCache.get(passkey);
  if (hit && hit.until > Date.now()) return hit.result;

  let result = { valid: false, message: 'Không kết nối được máy chủ xác thực. Thử lại sau.' };
  try {
    const res = await fetch(`${GAS_URL}?action=verifyPasskey&passkey=${encodeURIComponent(passkey)}`);
    const data = await res.json();
    result = data.success && data.valid
      ? {
          valid: true,
          role: data.role || 'vip',
          expiry: data.expiry || 'lifetime',
          expiresAt: data.expiresAt || null,
        }
      : { valid: false, message: data.message || 'Passkey không hợp lệ hoặc đã bị thu hồi.' };
    verifyCache.set(passkey, { result, until: Date.now() + VERIFY_TTL_MS });
  } catch {
    // Lỗi mạng: KHÔNG mở khoá, không cache
  }
  return result;
}

function findPrivateDir() {
  const roots = [process.cwd(), process.env.LAMBDA_TASK_ROOT, '/var/task'].filter(Boolean);
  for (const root of roots) {
    const dir = join(root, 'private_data', 'vip_articles');
    if (existsSync(dir)) return dir;
  }
  return null;
}

// Bài Admin đã sửa trong Google Sheet được ưu tiên hơn file gốc
async function loadAdminOverride(id, passkey = '') {
  if (!GAS_SERVER_KEY && !passkey) return null;
  try {
    const authParam = GAS_SERVER_KEY
      ? `key=${encodeURIComponent(GAS_SERVER_KEY)}`
      : `passkey=${encodeURIComponent(passkey)}`;
    const res = await fetch(`${GAS_URL}?action=getArticle&id=${encodeURIComponent(id)}&${authParam}`);
    const data = await res.json();
    return data.success && data.articleContent ? data.articleContent : null;
  } catch {
    return null;
  }
}

async function loadArticle(id, original = false, passkey = '') {
  const override = original ? null : await loadAdminOverride(id, passkey);
  if (override) return override;
  const dir = findPrivateDir();
  if (!dir) return null;
  try {
    return await readFile(join(dir, `VIP_${id}.md`), 'utf8');
  } catch {
    return null;
  }
}

// Phần xem trước miễn phí: đến hết mục "Tóm tắt 30 giây"
function teaser(content) {
  const key = '## Tóm tắt 30 giây';
  const start = content.indexOf(key);
  if (start === -1) return content.substring(0, 500);
  const rest = content.substring(start + key.length);
  const next = rest.match(/\n##?\s+/);
  return next?.index !== undefined
    ? content.substring(0, start + key.length + next.index)
    : content.substring(0, start + 800);
}

export default async (req) => {
  if (req.method !== 'GET') return json({ error: 'method' }, 405);
  const url = new URL(req.url);
  const action = url.searchParams.get('action');
  const passkey = (req.headers.get('x-passkey') || '').trim();

  if (action === 'verify') {
    if (!passkey) return json({ valid: false, message: 'Chưa nhập passkey.' });
    return json(await verifyPasskey(passkey));
  }

  if (action === 'article') {
    const id = (url.searchParams.get('id') || '').toUpperCase();
    if (!ID_PATTERN.test(id)) return json({ error: 'id' }, 400);

    let auth = null;
    if (passkey) {
      auth = await verifyPasskey(passkey);
      if (!auth.valid) return json({ full: false, valid: false, message: auth.message }, 401);
    }

    // original=1: Admin khôi phục bài gốc, bỏ qua bản đã sửa trong Sheet
    const content = await loadArticle(id, Boolean(auth) && url.searchParams.get('original') === '1', auth ? passkey : '');
    if (!content) return json({ id, full: false, content: '' });
    return json({ id, full: Boolean(auth), role: auth?.role, content: auth ? content : teaser(content) });
  }

  return json({ error: 'action' }, 400);
};
