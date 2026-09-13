import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Trophy,
  BarChart3,
  History,
  Award,
  User,
  Users,
  Home,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { Logo } from './Logo';
import { Avatar } from './Avatar';
import { clsx } from 'clsx';

export const Sidebar: React.FC = () => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);

  if (!user) return null;

  const role = user.role;

  const studentLinks = [
    { label: 'Boshqaruv (Dashboard)', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Olimpiadalar', path: '/student/olympiads', icon: Trophy },
    { label: 'Reyting', path: '/student/leaderboard', icon: BarChart3 },
    { label: 'Natijalar tarixi', path: '/results', icon: History },
    { label: 'Sertifikatlar', path: '/certificates', icon: Award },
    { label: 'Profil sozlamalari', path: '/profile', icon: User },
  ];

  const teacherLinks = [
    { label: 'O\'qituvchi Kabineti', path: '/teacher/dashboard', icon: LayoutDashboard },
    { label: 'O\'quvchilar va Musobaqalar', path: '/teacher/olympiads', icon: Users },
    { label: 'Olimpiadalar bo\'limi', path: '/student/olympiads', icon: Trophy },
    { label: 'Reyting', path: '/student/leaderboard', icon: BarChart3 },
    { label: 'Profil sozlamalari', path: '/profile', icon: User },
  ];

  const links = role === 'teacher' ? teacherLinks : studentLinks;

  return (
    <aside
      className={clsx(
        "sticky top-0 h-screen bg-gradient-to-b from-blue-950 via-slate-950 to-blue-950 border-r border-blue-900/60 text-white p-3 md:p-4 flex flex-col justify-between shrink-0 shadow-2xl transition-all duration-300 z-30 select-none overflow-x-hidden overflow-y-auto custom-scrollbar",
        isCollapsed ? "w-20" : "w-64"
      )}
    >
      <div className="space-y-4">
        {/* Brand Logo Header & Toggle Button */}
        <div
          className={clsx(
            "pb-3 border-b border-blue-900/50 flex items-center transition-all",
            isCollapsed ? "flex-col gap-2 justify-center text-center" : "justify-between"
          )}
        >
          <Link
            to="/"
            className={clsx(
              "flex items-center overflow-hidden hover:opacity-90 transition-opacity",
              isCollapsed ? "justify-center" : "gap-2"
            )}
            title="NextOlymp Asosiy Sahifa"
          >
            <Logo showText={!isCollapsed} lightText size={isCollapsed ? "sm" : "md"} />
          </Link>

          {/* Clean In-Header Toggle Button */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="w-7 h-7 rounded-xl bg-blue-600/80 hover:bg-blue-500 text-white border border-blue-400/40 shadow-md flex items-center justify-center transition-all hover:scale-105 cursor-pointer shrink-0"
            title={isCollapsed ? "Menyuni kengaytirish" : "Menyuni kichraytirish"}
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4 text-cyan-200" />
            ) : (
              <ChevronLeft className="w-4 h-4 text-cyan-200" />
            )}
          </button>
        </div>

        {/* User Profile Card */}
        <div
          className={clsx(
            "transition-all flex items-center shadow-xs backdrop-blur-xs",
            isCollapsed
              ? "justify-center py-2 bg-transparent border-0"
              : "py-2.5 px-3 bg-blue-900/30 rounded-2xl border border-blue-800/80 gap-3"
          )}
          title={isCollapsed ? `${user.fullName} (${role})` : undefined}
        >
          <Avatar
            name={user.fullName}
            src={user.avatarUrl}
            size={isCollapsed ? "md" : "md"}
            className="shrink-0 ring-2 ring-cyan-400/40"
          />

          {!isCollapsed && (
            <div className="flex flex-col overflow-hidden">
              <span className="text-xs font-bold text-white truncate">{user.fullName}</span>
              <span className="text-[10px] text-cyan-300 font-semibold uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-cyan-400" />
                {role === 'student' ? 'O\'quvchi' : role === 'teacher' ? 'O\'qituvchi' : 'Admin'} kabinet
              </span>
            </div>
          )}
        </div>

        {/* Sidebar Nav Links */}
        <nav className="space-y-1">
          {links.map((link) => {
            const Icon = link.icon;
            const active = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                title={isCollapsed ? link.label : undefined}
                className={clsx(
                  "flex items-center gap-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                  isCollapsed ? "px-0 justify-center" : "px-3.5",
                  active
                    ? "bg-blue-600 text-white font-bold border-l-4 border-cyan-400 shadow-md shadow-blue-950/60"
                    : "text-blue-200 hover:bg-blue-900/50 hover:text-white"
                )}
              >
                <Icon className={clsx("w-5 h-5 shrink-0", active ? "text-cyan-300" : "text-blue-400")} />
                {!isCollapsed && <span className="truncate">{link.label}</span>}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Navigation (Asosiy sayt & Logout) */}
      <div className="space-y-2 pt-4 border-t border-blue-900/60 mt-auto">
        <Link
          to="/"
          title={isCollapsed ? "Asosiy saytga qaytish" : undefined}
          className={clsx(
            "flex items-center gap-3 py-2.5 rounded-xl text-xs font-semibold text-cyan-300 hover:bg-blue-900/40 hover:text-cyan-200 transition-all",
            isCollapsed ? "px-0 justify-center" : "px-3.5"
          )}
        >
          <Home className="w-4 h-4 text-cyan-400 shrink-0" />
          {!isCollapsed && <span>Asosiy saytga qaytish</span>}
        </Link>

        <button
          onClick={logout}
          title={isCollapsed ? "Tizimdan chiqish" : undefined}
          className={clsx(
            "w-full flex items-center gap-3 py-2.5 rounded-xl text-xs font-semibold text-rose-300 hover:bg-rose-950/50 hover:text-rose-200 transition-all cursor-pointer",
            isCollapsed ? "px-0 justify-center" : "px-3.5"
          )}
        >
          <LogOut className="w-4 h-4 text-rose-400 shrink-0" />
          {!isCollapsed && <span>Tizimdan chiqish</span>}
        </button>
      </div>
    </aside>
  );
};
