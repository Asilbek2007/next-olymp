import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Trophy,
  Users,
  MapPin,
  Package,
  CreditCard,
  Bell,
  HelpCircle,
  LogOut,
  ShieldCheck,
  ShieldAlert,
  Award,
  Video
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useThemeStore } from '../../store/useThemeStore';
import { useTranslation } from 'react-i18next';
import { translateText } from '../../i18n/translator';
import { clsx } from 'clsx';

interface EgaSidebarProps {
  isCollapsed: boolean;
}

export const EgaSidebar: React.FC<EgaSidebarProps> = ({ isCollapsed }) => {
  const location = useLocation();
  const { logout } = useAuth();
  const { theme } = useThemeStore();
  const { i18n } = useTranslation();
  const currentLang = i18n.language || 'uz';

  const isDark = theme === 'dark';

  const menuGroups = [
    {
      title: translateText('UMUMIY', currentLang),
      items: [
        { label: translateText('Boshqaruv paneli', currentLang), path: '/ega', icon: LayoutDashboard },
        { label: translateText('Olimpiadalar', currentLang), path: '/ega/competitions', icon: Trophy },
        { label: translateText('Jonli Proktoring', currentLang), path: '/ega/proctoring', icon: Video },
        { label: translateText('Reytinglar', currentLang), path: '/ega/leaderboard', icon: Award },
        { label: translateText('Foydalanuvchilar', currentLang), path: '/ega/users', icon: Users },
        { label: translateText('Hududlar', currentLang), path: '/ega/locations', icon: MapPin },
        { label: translateText('To\'lovlar', currentLang), path: '/ega/finance', icon: CreditCard },
        { label: translateText('Xabarnomalar', currentLang), path: '/ega/notifications', icon: Bell },
        { label: translateText('Yordam xizmati', currentLang), path: '/ega/support', icon: HelpCircle },
        { label: translateText('Paketlar', currentLang), path: '/ega/packages', icon: Package },
        { label: translateText('Kiberxavfsizlik', currentLang), path: '/ega/security', icon: ShieldAlert },
      ]
    }
  ];

  return (
    <aside
      className={clsx(
        "h-screen sticky top-0 shrink-0 flex flex-col justify-between transition-colors duration-300 z-30 shadow-xl overflow-x-hidden overflow-y-auto custom-scrollbar font-sans select-none",
        isCollapsed ? "w-20 p-3" : "w-64 p-4",
        isDark
          ? "bg-[#0D1832] border-r border-[#152542] text-slate-300"
          : "bg-white border-r border-slate-200 text-slate-700"
      )}
    >
      <div className="space-y-6">
        {/* Brand Logo Header (No floating arrow toggle here, toggle is in top navbar next to dark mode) */}
        <div
          className={clsx(
            "pb-3 border-b flex items-center",
            isCollapsed ? "justify-center" : "justify-between",
            isDark ? "border-[#1A2E56]" : "border-slate-200"
          )}
        >
          <Link to="/ega" className="flex items-center gap-3 overflow-hidden group">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 font-black flex items-center justify-center text-sm shadow-md shrink-0">
              <ShieldCheck className="w-5 h-5 text-slate-950" />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col overflow-hidden">
                <span className="text-sm font-extrabold tracking-wider text-amber-500 uppercase leading-none truncate">
                  KHISO ADMIN
                </span>
                <span className={clsx("text-[10px] font-bold tracking-widest uppercase mt-1 truncate", isDark ? "text-slate-400" : "text-slate-500")}>
                  Control System
                </span>
              </div>
            )}
          </Link>
        </div>

        {/* Grouped Navigation Links */}
        <div className="space-y-5">
          {menuGroups.map((group, idx) => (
            <div key={idx} className="space-y-1">
              {!isCollapsed && (
                <div className={clsx("px-3 text-[10px] uppercase font-black tracking-widest mb-1.5", isDark ? "text-slate-400" : "text-slate-400")}>
                  {group.title}
                </div>
              )}

              {group.items.map((item) => {
                const Icon = item.icon;
                const active = location.pathname === item.path || (item.path !== '/ega' && location.pathname.startsWith(item.path));

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    title={isCollapsed ? item.label : undefined}
                    className={clsx(
                      "flex items-center gap-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200",
                      isCollapsed ? "px-0 justify-center" : "px-3.5",
                      active
                        ? isDark
                          ? "bg-[#1B325E] text-amber-400 font-bold border-l-4 border-amber-400 shadow-md"
                          : "bg-amber-50 text-amber-600 font-bold border-l-4 border-amber-500 shadow-sm"
                        : isDark
                        ? "text-slate-300 hover:bg-[#152542] hover:text-white"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    )}
                  >
                    <Icon className={clsx("w-4 h-4 shrink-0", active ? (isDark ? "text-amber-400" : "text-amber-600") : (isDark ? "text-slate-400" : "text-slate-500"))} />
                    {!isCollapsed && <span className="truncate">{item.label}</span>}
                  </Link>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Logout Footer Button */}
      <div className={clsx("pt-4 border-t mt-auto", isDark ? "border-[#152542]" : "border-slate-200")}>
        <button
          onClick={logout}
          title={isCollapsed ? translateText('Chiqish', currentLang) : undefined}
          className={clsx(
            "w-full flex items-center justify-center gap-2 rounded-2xl border transition-all text-xs font-bold shadow-xs cursor-pointer",
            isCollapsed ? "py-2.5" : "px-4 py-2.5",
            isDark
              ? "border-[#1E365E] bg-[#11203E] text-amber-400 hover:bg-rose-950/60 hover:text-rose-300 hover:border-rose-800"
              : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200"
          )}
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {!isCollapsed && <span>{translateText('Chiqish', currentLang)}</span>}
        </button>
      </div>
    </aside>
  );
};
