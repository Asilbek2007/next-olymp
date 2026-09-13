import React from 'react';
import { useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Trophy,
  Users,
  MapPin,
  CreditCard,
  Bell,
  HelpCircle,
  Package,
  Moon,
  Sun,
  User,
  PanelLeftClose,
  PanelLeftOpen
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useThemeStore } from '../../store/useThemeStore';
import { useTranslation } from 'react-i18next';
import { translateText } from '../../i18n/translator';
import { clsx } from 'clsx';

interface EgaNavbarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export const EgaNavbar: React.FC<EgaNavbarProps> = ({ isCollapsed, onToggleCollapse }) => {
  const { user } = useAuth();
  const location = useLocation();
  const path = location.pathname;
  const { theme, toggleTheme } = useThemeStore();
  const { i18n } = useTranslation();

  const isDark = theme === 'dark';
  const currentLang = (i18n.language || 'uz').toUpperCase() as 'UZ' | 'EN' | 'RU';

  const changeLanguage = (newLang: 'UZ' | 'EN' | 'RU') => {
    const langCode = newLang.toLowerCase();
    i18n.changeLanguage(langCode);
    try {
      localStorage.setItem('next_olymp_lang', langCode);
    } catch (e) {
      console.error('Failed to save language in localStorage', e);
    }
  };

  const getPageTitle = () => {
    if (path === '/ega' || path === '/ega/dashboard') {
      return { title: translateText('Boshqaruv paneli', currentLang.toLowerCase()), icon: LayoutDashboard };
    }
    if (path.startsWith('/ega/competitions')) {
      return { title: translateText('Olimpiadalar', currentLang.toLowerCase()), icon: Trophy };
    }
    if (path.startsWith('/ega/users')) {
      return { title: translateText('Foydalanuvchilar', currentLang.toLowerCase()), icon: Users };
    }
    if (path.startsWith('/ega/locations')) {
      return { title: translateText('Hududlar', currentLang.toLowerCase()), icon: MapPin };
    }
    if (path.startsWith('/ega/finance')) {
      return { title: translateText('To\'lovlar', currentLang.toLowerCase()), icon: CreditCard };
    }
    if (path.startsWith('/ega/notifications')) {
      return { title: translateText('Xabarnomalar', currentLang.toLowerCase()), icon: Bell };
    }
    if (path.startsWith('/ega/support')) {
      return { title: translateText('Yordam xizmati', currentLang.toLowerCase()), icon: HelpCircle };
    }
    if (path.startsWith('/ega/packages')) {
      return { title: translateText('Paketlar', currentLang.toLowerCase()), icon: Package };
    }
    return { title: translateText('Boshqaruv paneli', currentLang.toLowerCase()), icon: LayoutDashboard };
  };

  const pageInfo = getPageTitle();
  const PageIcon = pageInfo.icon;

  return (
    <header
      className={clsx(
        "sticky top-0 z-20 w-full px-6 py-3 flex items-center justify-between shadow-md font-sans transition-colors duration-300",
        isDark
          ? "bg-[#0D1832] border-b border-[#152542] text-slate-200"
          : "bg-white border-b border-slate-200 text-slate-800"
      )}
    >
      {/* Left Active Page Badge */}
      <div className="flex items-center gap-3">
        <div
          className={clsx(
            "inline-flex items-center gap-2.5 px-4 py-2 rounded-xl font-black text-xs uppercase tracking-wider shadow-xs border transition-colors",
            isDark
              ? "bg-[#142447] border-[#1E365E] text-amber-400"
              : "bg-amber-50 border-amber-200 text-amber-600"
          )}
        >
          <PageIcon className={clsx("w-4 h-4", isDark ? "text-amber-400" : "text-amber-600")} />
          <span>{pageInfo.title}</span>
        </div>
      </div>

      {/* Right Controls Bar (Sidebar Toggle, Dark/Light Mode, Lang Selector, Profile) */}
      <div className="flex items-center gap-3">
        {/* Sidebar Toggle Button (Primary collapse button next to theme) */}
        <button
          onClick={onToggleCollapse}
          className={clsx(
            "p-2 rounded-xl border transition-all cursor-pointer",
            isDark
              ? "bg-[#142447] hover:bg-[#1C325E] border-[#1E365E] text-slate-300 hover:text-white"
              : "bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700 hover:text-slate-900"
          )}
          title="Menyuni ko'rsatish / berkitish"
        >
          {isCollapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
        </button>

        {/* Dark / Light Toggle Switch */}
        <button
          onClick={toggleTheme}
          className={clsx(
            "p-2 rounded-xl border transition-all cursor-pointer flex items-center justify-center",
            isDark
              ? "bg-[#142447] hover:bg-[#1C325E] border-[#1E365E] text-amber-400 hover:text-amber-300"
              : "bg-slate-100 hover:bg-slate-200 border-slate-300 text-amber-600 hover:text-amber-700"
          )}
          title={isDark ? "Yorug' rejimga o'tish" : "Tungi rejimga o'tish"}
        >
          {isDark ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
        </button>

        {/* Language Selector (UZ | EN | RU) */}
        <div
          className={clsx(
            "inline-flex items-center p-1 rounded-xl border text-xs font-bold",
            isDark ? "bg-[#142447] border-[#1E365E] text-slate-400" : "bg-slate-100 border-slate-300 text-slate-600"
          )}
        >
          {(['UZ', 'EN', 'RU'] as const).map((l) => (
            <button
              key={l}
              onClick={() => changeLanguage(l)}
              className={clsx(
                "px-2.5 py-1 rounded-lg text-xs font-extrabold transition-all cursor-pointer",
                currentLang === l
                  ? isDark
                    ? "bg-amber-400 text-slate-950 shadow-xs"
                    : "bg-amber-500 text-white shadow-xs"
                  : isDark
                  ? "hover:text-white text-slate-400"
                  : "hover:text-slate-900 text-slate-600"
              )}
            >
              {l}
            </button>
          ))}
        </div>

        {/* Admin Profile Button */}
        <div
          className={clsx(
            "inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold",
            isDark ? "bg-[#142447] border-[#1E365E] text-slate-200" : "bg-slate-100 border-slate-300 text-slate-800"
          )}
        >
          <User className={clsx("w-4 h-4", isDark ? "text-amber-400" : "text-amber-600")} />
          <span>{user?.fullName || 'Admin'}</span>
        </div>
      </div>
    </header>
  );
};
