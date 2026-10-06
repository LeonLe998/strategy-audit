import { useTheme } from '../context/ThemeContext';

export default function SoftBackdrop() {
  const { resolvedTheme } = useTheme();
  const light = resolvedTheme === 'light';

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden select-none">
      <div className={`absolute -left-48 -top-48 h-[32rem] w-[32rem] rounded-full blur-[120px] ${light ? 'bg-emerald-300/20' : 'bg-emerald-500/[0.07]'}`} />
      <div className={`absolute -right-56 top-[28rem] h-[34rem] w-[34rem] rounded-full blur-[140px] ${light ? 'bg-sky-300/15' : 'bg-violet-500/[0.045]'}`} />
      <div className={`absolute bottom-[-20rem] left-[28%] h-[32rem] w-[32rem] rounded-full blur-[140px] ${light ? 'bg-rose-200/15' : 'bg-cyan-500/[0.035]'}`} />
    </div>
  );
}
