import { NavLink } from 'react-router-dom';
import { Home, ClipboardList, BarChart3, Settings } from 'lucide-react';

const tabs = [
  { path: '/', label: '今日', icon: Home },
  { path: '/assessment', label: '评估', icon: ClipboardList },
  { path: '/progress', label: '进度', icon: BarChart3 },
  { path: '/settings', label: '设置', icon: Settings },
];

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex border-t border-gray-200 bg-white pb-safe">
      {tabs.map(({ path, label, icon: Icon }) => (
        <NavLink
          key={path}
          to={path}
          className={({ isActive }) =>
            `flex flex-1 flex-col items-center gap-0.5 py-2 text-xs transition-colors ${
              isActive ? 'text-blue-600' : 'text-gray-500'
            }`
          }
        >
          <Icon size={22} />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
