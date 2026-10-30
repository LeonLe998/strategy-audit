/**
 * Trang báo gõ sai đường dẫn (Leon duyệt 30/10): trước đây đường dẫn lạ âm thầm đưa về bản đồ,
 * khách không biết mình gõ sai. Giờ báo rõ và cho hai lối đi tiếp.
 */
import { GlassCard } from './Glass';

export default function NotFound({ onGo }: { onGo: (tab: string) => void }) {
  return (
    <section className="mx-auto flex min-h-[60vh] max-w-xl items-center px-4">
      <GlassCard tilt={false} className="w-full p-8 text-center">
        <p className="font-mono text-xs font-semibold tracking-widest text-[#2BFFEA]">404</p>
        <h1 className="mt-2 text-2xl font-bold text-white">Không tìm thấy trang này.</h1>
        <p className="mt-2 text-sm text-gray-300">Có thể đường dẫn bị gõ sai.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button type="button" onClick={() => onGo('home')} className="sa-glass-btn rounded-xl px-5 py-3 text-sm font-bold">
            Về bản đồ
          </button>
          <button type="button" onClick={() => onGo('journey')} className="sa-glass-ghost rounded-xl px-5 py-3 text-sm font-semibold text-white">
            Bắt đầu ở đây
          </button>
        </div>
      </GlassCard>
    </section>
  );
}
