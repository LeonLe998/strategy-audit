/**
 * Nút liên hệ (Zalo), dùng ở bản đồ, ô cuối trang, chân trang và trang Thành viên. Danh sách kênh ở CONTACT trong content/journey.ts.
 * `from` ghi vào GA4 để biết người ta bấm liên hệ từ đâu.
 */
import { MessageCircle, Send } from 'lucide-react';
import { CONTACT } from '../content/journey';
import { funnel } from '../lib/analytics';

const ICON = { zalo: MessageCircle, telegram: Send };
const STYLE = {
  zalo: 'bg-[linear-gradient(180deg,#3b8bff,#0068FF_60%,#0050c8)] text-white shadow-[0_0_20px_rgba(0,104,255,0.35),inset_0_1px_0_rgba(255,255,255,0.45)] hover:shadow-[0_0_30px_rgba(0,104,255,0.55),inset_0_1px_0_rgba(255,255,255,0.5)]',
  telegram: 'sa-glass-ghost text-[#3df2ff]',
};

export default function ContactLinks({ from, className = '', block = false }: { from: string; className?: string; block?: boolean }) {
  return (
    <div data-contact className={`flex flex-wrap gap-2 ${className}`}>
      {CONTACT.channels.map((c) => {
        const Icon = ICON[c.id];
        return (
          <a
            key={c.id}
            href={c.href}
            target="_blank"
            rel="noreferrer"
            onClick={() => funnel.contactClick(c.id, from)}
            className={`inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-[box-shadow,background,border-color] ${block ? 'flex-1 px-4 py-3.5 md:text-base' : 'px-4 py-2.5'} ${STYLE[c.id]}`}
          >
            <Icon className="h-4 w-4" />
            {c.label}
          </a>
        );
      })}
    </div>
  );
}
