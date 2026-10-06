import { BookOpen, ClipboardCheck, Home, Users } from 'lucide-react';

const destinations = [
  { id: 'home', href: '/', label: 'Trang chủ', icon: Home },
  { id: 'sauo', href: '/sauo', label: 'Sáu Ô', icon: ClipboardCheck },
  { id: 'viplibrary', href: '/vip', label: 'Thư viện', icon: BookOpen },
  { id: 'membership', href: '/membership', label: 'Thành viên', icon: Users },
];

export default function BottomNavigation({ activeTab }: { activeTab: string }) {
  return (
    <nav className="sa-bottom-nav" aria-label="Điều hướng chính">
      {destinations.map(({ id, href, label, icon: Icon }) => (
        <a key={id} href={href} aria-current={activeTab === id ? 'page' : undefined} className={activeTab === id ? 'is-active' : ''}>
          <Icon aria-hidden="true" size={18} strokeWidth={1.8} />
          <span>{label}</span>
        </a>
      ))}
    </nav>
  );
}
