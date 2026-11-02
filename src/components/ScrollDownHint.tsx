import { motion } from 'motion/react';
import { ChevronDown } from 'lucide-react';

interface ScrollDownHintProps {
  label?: string;
  sub?: string;
  className?: string;
}

/**
 * Chỉ dẫn lướt xuống sau mỗi chuyển cảnh / phân đoạn:
 * Mũi tên nhấp nháy chỉ xuống kèm chú thích ở giữa để người xem nhận biết và chủ động cuộn tiếp.
 * Bấm vào cũng tự động cuộn mượt xuống phân đoạn kế tiếp.
 */
export default function ScrollDownHint({
  label = 'Lướt xuống để xem tiếp',
  sub,
  className = '',
}: ScrollDownHintProps) {
  const handleScrollNext = () => {
    window.scrollBy({ top: window.innerHeight * 0.82, behavior: 'smooth' });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className={`mt-10 flex flex-col items-center justify-center text-center select-none ${className}`}
    >
      <button
        type="button"
        onClick={handleScrollNext}
        aria-label={label}
        className="group flex flex-col items-center gap-1.5 focus:outline-none cursor-pointer transition-transform duration-200 hover:scale-105"
      >
        <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-[#2BFFEA] drop-shadow-[0_0_8px_rgba(43,255,234,0.4)] group-hover:text-white transition-colors">
          {label}
        </span>
        {sub && (
          <span className="text-[10px] text-gray-400 group-hover:text-gray-200 transition-colors">
            {sub}
          </span>
        )}
        <div className="relative mt-0.5 flex h-7 w-7 items-center justify-center rounded-full border border-[#2BFFEA]/40 bg-[#061e30]/80 shadow-[0_0_14px_rgba(43,255,234,0.3)] transition-all group-hover:border-[#2BFFEA] group-hover:bg-[#0b2f4a] group-hover:shadow-[0_0_20px_rgba(43,255,234,0.6)]">
          <ChevronDown
            size={16}
            className="animate-bounce text-[#2BFFEA] drop-shadow-[0_0_6px_#2BFFEA]"
          />
        </div>
      </button>
    </motion.div>
  );
}

