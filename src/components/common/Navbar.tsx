import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LayoutDashboard, LogOut, Menu, X, Trophy, Award, Home, CheckCircle, Info } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { LanguageSwitcher } from './LanguageSwitcher';
import { Button } from './Button';
import { Avatar } from './Avatar';
import { Logo } from './Logo';

export const Navbar: React.FC = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const navLinks = [
    { to: '/', label: t('nav.home') || 'Bosh sahifa', icon: <Home className="w-4 h-4" /> },
    { to: '/olympiads', label: t('nav.olympiads') || 'Musobaqalar', icon: <Trophy className="w-4 h-4" /> },
    { to: '/leaderboard', label: t('nav.leaderboard') || 'Reyting', icon: <Award className="w-4 h-4" /> },
    { to: '/verify/NO-2026-MATH-8921', label: t('nav.verifyCertificate') || 'Sertifikatni tekshirish', icon: <CheckCircle className="w-4 h-4" /> },
    { to: '/about', label: t('nav.about') || 'Biz haqimizda', icon: <Info className="w-4 h-4" /> },
  ];

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-[#0a0e1a]/80 border-b border-slate-800/60 text-white transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Left: Crystal Mountain Logo */}
        <div className="shrink-0 flex items-center">
          <Logo size="md" lightText />
        </div>

        {/* Center: Desktop Navigation Links (Desktop lg breakpoint) */}
        <nav className="hidden lg:flex items-center gap-6 xl:gap-8 justify-center">
          {navLinks.map((link) => {
            const active = isActive(link.to);
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`text-sm font-semibold transition-all duration-200 py-1 ${
                  active
                    ? 'text-white font-extrabold border-b-2 border-indigo-400'
                    : 'text-slate-300 hover:text-white hover:scale-105'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right Section: Language Switcher, Auth Buttons (Desktop lg breakpoint) */}
        <div className="hidden lg:flex items-center gap-4">
          <LanguageSwitcher />

          {isAuthenticated && user ? (
            <div className="flex items-center gap-3">
              <Link
                to={user.role === 'admin' ? '/ega' : user.role === 'teacher' ? '/teacher/dashboard' : '/dashboard'}
              >
                <Button
                  size="sm"
                  variant="primary"
                  className="bg-indigo-600 hover:bg-indigo-500 border border-indigo-400/40 text-white font-bold shadow-md"
                  leftIcon={<LayoutDashboard className="w-4 h-4 text-indigo-200" />}
                >
                  {t('nav.dashboard') || 'Boshqaruv'}
                </Button>
              </Link>

              <div className="flex items-center gap-2 pl-3 border-l border-slate-800">
                <Link to="/profile" title={user.fullName}>
                  <Avatar name={user.fullName} src={user.avatarUrl} size="sm" />
                </Link>
                <button
                  onClick={logout}
                  title={t('nav.logout') || 'Chiqish'}
                  className="p-2 rounded-xl text-slate-300 hover:text-rose-400 hover:bg-rose-950/40 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              <Link to="/auth/login">
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-slate-300 hover:text-white hover:bg-slate-800/80 px-4 py-2 font-semibold"
                >
                  {t('nav.login') || 'Kirish'}
                </Button>
              </Link>
              <Link to="/auth/register">
                <Button
                  size="sm"
                  variant="primary"
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-md shadow-indigo-600/30 px-4 py-2"
                >
                  {t('nav.register') || "Ro'yxatdan o'tish"}
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Tablet & Mobile Menu Trigger (lg:hidden) */}
        <div className="lg:hidden flex items-center gap-2">
          <LanguageSwitcher />
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
            className="p-2 rounded-xl border border-slate-700 bg-slate-900/80 text-slate-200 hover:bg-slate-800 hover:text-white transition-all cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-5 h-5 text-amber-400" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Dropdown (lg:hidden) */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-x-0 top-16 bg-[#0a0e1a]/95 backdrop-blur-xl border-b border-slate-800/90 shadow-2xl p-5 space-y-4 animate-in slide-in-from-top duration-200 max-h-[calc(100vh-4rem)] overflow-y-auto z-50">
          <div className="space-y-1">
            {navLinks.map((link) => {
              const active = isActive(link.to);
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    active
                      ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 font-bold'
                      : 'text-slate-300 hover:bg-slate-850 hover:text-white'
                  }`}
                >
                  {link.icon}
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </div>

          {isAuthenticated && user && (
            <div className="pt-2 border-t border-slate-800/80 space-y-2">
              <Link
                to={user.role === 'admin' ? '/ega' : user.role === 'teacher' ? '/teacher/dashboard' : '/dashboard'}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-indigo-600/20 text-indigo-300 border border-indigo-500/40 text-sm font-bold"
              >
                <div className="flex items-center gap-2.5">
                  <LayoutDashboard className="w-4 h-4" />
                  <span>{t('nav.dashboard') || 'Boshqaruv Paneli'}</span>
                </div>
                <Avatar name={user.fullName} src={user.avatarUrl} size="sm" />
              </Link>
            </div>
          )}

          <div className="pt-3 border-t border-slate-800/80 space-y-2">
            {isAuthenticated ? (
              <Button
                size="sm"
                variant="danger"
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                }}
                className="w-full py-2.5 font-bold flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span>{t('nav.logout') || 'Chiqish'}</span>
              </Button>
            ) : (
              <div className="flex flex-col gap-2">
                <Link to="/auth/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full border-slate-700 bg-slate-900/60 text-slate-200 hover:bg-slate-800 hover:text-white py-2.5 font-semibold"
                  >
                    {t('nav.login') || 'Kirish'}
                  </Button>
                </Link>
                <Link to="/auth/register" onClick={() => setMobileMenuOpen(false)}>
                  <Button
                    size="sm"
                    variant="primary"
                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-2.5 font-bold shadow-lg shadow-indigo-600/30"
                  >
                    {t('nav.register') || "Ro'yxatdan o'tish"}
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
