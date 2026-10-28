/**
 * Hai nút liên hệ Zalo · Telegram, dùng ở bản đồ, ô cuối trang và chân trang.
 * `from` ghi vào GA4 để biết người ta bấm liên hệ từ đâu.
 */
import { MessageCircle, Send } from 'lucide-react';
import { CONTACT } from '../content/journey';
import { funnel } from '../lib/analytics';

const ICON = { zalo: MessageCircle, telegram: Send };
const STYLE = {
  zalo: 'bg-[#0068FF] text-white hover:bg-[#0055D0]',
  telegram: 'border border-[#3df2ff]/40 text-[#3df2ff] hover:bg-[#3df2ff]/10',
};

export default function ContactLinks({ from, className = '' }: { from: string; className?: string }) {
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
            className={`inline-flex items-center gap-2 whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors ${STYLE[c.id]}`}
          >
            <Icon className="h-4 w-4" />
            {c.label}
          </a>
        );
      })}
    </div>
  );
}
