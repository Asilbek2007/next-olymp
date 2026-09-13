import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Trophy,
  Award,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  ShieldCheck,
  Zap,
  CreditCard,
  HelpCircle,
  ChevronDown,
  Users,
  Clock,
  Star,
  Check
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { OlympiadCard } from '../../components/olympiad/OlympiadCard';
import { useOlympiadList } from '../../hooks/useOlympiad';
import { Logo } from '../../components/common/Logo';
import { useOlympiadStore } from '../../store/useOlympiadStore';
import { authService } from '../../services/authService';
import { useUserStore } from '../../store/useUserStore';

export const HomePage: React.FC = () => {
  const { t } = useTranslation();
  const { data: olympiads, isLoading } = useOlympiadList({ status: 'active' });
  const { olympiads: allStoreOlympiads } = useOlympiadStore();
  const { users } = useUserStore();
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Dynamic Real Statistics
  const registeredStudentsCount = React.useMemo(() => {
    const authUsers = authService.getRegisteredUsers();
    return Math.max(authUsers.length, users.filter((u) => u.role === 'student').length);
  }, [users]);

  const totalOlympiadsCount = allStoreOlympiads.length;

  const totalPrizeFundFormatted = React.useMemo(() => {
    const sum = allStoreOlympiads.reduce((acc, curr) => acc + (curr.totalRevenue || 0), 0);
    if (sum >= 1_000_000) {
      return `${(sum / 1_000_000).toFixed(0)}M+ UZS`;
    } else if (sum > 0) {
      return `${sum.toLocaleString()} UZS`;
    }
    return '0 UZS';
  }, [allStoreOlympiads]);

  const activeRegionsCount = React.useMemo(() => {
    const authUsers = authService.getRegisteredUsers();
    const regionSet = new Set<string>();
    authUsers.forEach((u) => u.region && regionSet.add(u.region));
    users.forEach((u) => u.region && regionSet.add(u.region));
    return regionSet.size > 0 ? `${regionSet.size} Viloyat` : '14 Viloyat';
  }, [users]);

  const subjects = [
    { name: 'Matematika va Algebra', icon: '∑', desc: 'Algebra, geometriya, kombinatorika va sonlar nazariyasi', color: 'bg-blue-600 text-white' },
    { name: 'Informatika va Dasturlash', icon: '</>', desc: 'C++, Python va Java tillarida ICPC formatdagi algoritmlar', color: 'bg-indigo-600 text-white' },
    { name: 'Fizika va Mexanika', icon: '⚛', desc: 'Mexanika, elektrodinamika, termodinamika va optika', color: 'bg-cyan-600 text-white' },
    { name: 'Kimyo va Biologiya', icon: '🧪', desc: 'Molekulyar biologiya, organika va stexiometriya', color: 'bg-purple-600 text-white' },
  ];

  const steps = [
    { step: '01', title: "Ro'yxatdan O'ting", desc: "Ismingiz, sinfingiz va hududingizni kiritib bepul akkaunt yarating." },
    { step: '02', title: "Musobaqani Tanlang", desc: "Matematika, Fizika yoki Dasturlash yo'nalishidagi olimpiadaga a'zo bo'ling." },
    { step: '03', title: "PayX Bilan To'lov Qiling", desc: "Payme, Click, Uzum Pay yoki Uzcard orqali 1 soniyada xavfsiz to'lov qiling." },
    { step: '04', title: "Sertifikat va Sovrin", desc: "Anti-cheat vaqtida test yechib, rasmiy verifikatsiyalangan sertifikat oling." },
  ];

  const faqs = [
    {
      q: "Next Olymp platformasida kimlar ishtirok eta oladi?",
      a: "O'zbekiston Respublikasi hamda MDH mamlakatlaridagi 5-11 sinf maktab o'quvchilari va akademik litsey talabalari qatnashishlari mumkin."
    },
    {
      q: "To'lovlar qanday amalga oshiriladi va PayX nima?",
      a: "Next Olymp rasmiy PayX merchant to'lov agregatori (https://payx.uz/docs) bilan integratsiya qilingan. Siz Payme, Click, Uzum Bank, Paynet hamda Uzcard/Humo kartalaringiz orqali 0% komissiya bilan to'lov qilishingiz mumkin."
    },
    {
      q: "Anti-Cheat va Proctoring tizimi qanday ishlaydi?",
      a: "Test topshirish jarayonida sahifadan chiqish (tab switching), brauzer konsolini ochish hamda nusxalash harakatlari avtomatik ravishda qayd etiladi va proctoring markaziga yuboriladi."
    },
    {
      q: "Sertifikatlarning haqiqiyligi qanday tekshiriladi?",
      a: "Har bir berilgan sertifikat unikal QR-kod hamda verifikatsiya kodiga ega. 'Sertifikatni tekshirish' bo'limida kodni kiritish orqali haqiqiyligini 100% tasdiqlash mumkin."
    }
  ];

  return (
    <div className="space-y-20 pb-20 bg-surface font-sans">
      {/* Hero Section - Glowing Crystal Mountain Theme */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#050B1E] via-[#0E1C42] to-[#0A132D] text-white pt-20 pb-28 border-b border-indigo-900/60 shadow-2xl">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-indigo-600/20 blur-[140px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-400/30 text-xs font-bold text-indigo-300 backdrop-blur-md">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>{t('hero.badge')}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-tight max-w-4xl mx-auto text-white">
            Akademik iste'dodingizni oshiring va cho'qqilarni zabt eting
          </h1>

          <p className="text-base sm:text-lg text-indigo-200/90 max-w-2xl mx-auto font-medium leading-relaxed">
            {t('hero.subtitle')}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link to="/olympiads">
              <Button size="lg" variant="primary" className="bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold shadow-lg shadow-indigo-600/30" rightIcon={<ArrowRight className="w-5 h-5" />}>
                {t('hero.ctaExplore') || "Musobaqalarga qo'shilish"}
              </Button>
            </Link>
            <Link
              to="/rules"
              className="px-6 py-3.5 text-base font-semibold rounded-lg border border-slate-700 hover:bg-slate-800 text-white transition-all duration-200 inline-flex items-center justify-center gap-2 backdrop-blur-sm shadow-sm"
            >
              <span>Olimpiadalar tartibi</span>
            </Link>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-12 max-w-5xl mx-auto">
            <div className="p-5 rounded-2xl bg-indigo-950/60 border border-indigo-800/80 text-left space-y-1 backdrop-blur-md">
              <div className="text-3xl font-black text-white font-mono">
                {registeredStudentsCount > 0 ? `${registeredStudentsCount.toLocaleString()}+` : '0'}
              </div>
              <div className="text-xs text-indigo-300 font-bold uppercase">{t('hero.statStudents')}</div>
            </div>
            <div className="p-5 rounded-2xl bg-indigo-950/60 border border-indigo-800/80 text-left space-y-1 backdrop-blur-md">
              <div className="text-3xl font-black text-cyan-400 font-mono">
                {totalOlympiadsCount > 0 ? `${totalOlympiadsCount}+` : '0'}
              </div>
              <div className="text-xs text-indigo-300 font-bold uppercase">{t('hero.statOlympiads')}</div>
            </div>
            <div className="p-5 rounded-2xl bg-indigo-950/60 border border-indigo-800/80 text-left space-y-1 backdrop-blur-md">
              <div className="text-3xl font-black text-amber-400 font-mono">{totalPrizeFundFormatted}</div>
              <div className="text-xs text-indigo-300 font-bold uppercase">{t('hero.statPrizes')}</div>
            </div>
            <div className="p-5 rounded-2xl bg-indigo-950/60 border border-indigo-800/80 text-left space-y-1 backdrop-blur-md">
              <div className="text-3xl font-black text-emerald-400 font-mono">{activeRegionsCount}</div>
              <div className="text-xs text-indigo-300 font-bold uppercase">{t('hero.statRegions')}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Active Olympiads Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex items-end justify-between border-b border-slate-200 pb-4">
          <div>
            <span className="text-xs uppercase font-extrabold text-indigo-600 tracking-wider">Jonli musobaqalar</span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Davom etayotgan Akademik Musobaqalar
            </h2>
          </div>
          <Link to="/olympiads" className="text-sm font-bold text-indigo-600 hover:underline flex items-center gap-1">
            Barchasini ko'rish <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => <div key={i} className="h-80 bg-white border border-slate-200 rounded-2xl animate-pulse" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {olympiads?.slice(0, 3).map((o) => (
              <OlympiadCard key={o.id} olympiad={o} />
            ))}
          </div>
        )}
      </section>

      {/* PayX Gateway Integration Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 text-white rounded-3xl p-8 sm:p-12 shadow-2xl border border-blue-900/80 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-4 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold border border-blue-400/30">
              <CreditCard className="w-4 h-4 text-cyan-400" />
              <span>Rasmiy PayX Gateway Integratsiyasi (https://payx.uz/docs)</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Xavfsiz va Instant To'lov Tizimlari
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed font-medium">
              Next Olymp barcha turdagi to'lov tizimlarini qo'llab-quvvatlaydi. PayX merchant agregatori orqali 0% komissiya bilan to'lov qiling.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 w-full md:w-auto shrink-0 font-bold text-xs">
            <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 text-white flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-xl bg-[#00CCCC] text-white flex items-center justify-center font-black text-xs">P</span>
              <span>Payme</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 text-white flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-xl bg-[#0070BA] text-white flex items-center justify-center font-black text-xs">C</span>
              <span>Click Pass</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 text-white flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-xl bg-[#7000FF] text-white flex items-center justify-center font-black text-xs">U</span>
              <span>Uzum Pay</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 text-white flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-xs">💳</span>
              <span>Uzcard/Humo</span>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works (4 Steps) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center space-y-2">
          <span className="text-xs uppercase font-extrabold text-indigo-600 tracking-wider">Bosqichma-bosqich</span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900">Musobaqada Qatnashish Qoidalari</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((st, idx) => (
            <div key={idx} className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4 relative overflow-hidden group hover:border-indigo-600 transition-all">
              <div className="text-4xl font-black text-slate-200 group-hover:text-indigo-600 transition-colors font-mono">
                {st.step}
              </div>
              <h3 className="font-bold text-lg text-slate-900">{st.title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{st.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Subject Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900">Musobaqa Yo'nalishlari</h2>
          <p className="text-slate-600 text-sm max-w-xl mx-auto">
            Xalqaro standartlar asosida tuzilgan akademik olimpiadalarda o'z bilimingizni sinab ko'ring.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {subjects.map((sub, idx) => (
            <div
              key={idx}
              className="p-6 rounded-2xl border border-slate-200 bg-white shadow-xs hover:border-indigo-500 hover:shadow-lg transition-all duration-300 space-y-4 group cursor-pointer"
            >
              <div className={`w-12 h-12 rounded-xl ${sub.color} font-mono text-xl font-bold flex items-center justify-center shadow-md group-hover:scale-105 transition-transform`}>
                {sub.icon}
              </div>
              <h3 className="font-bold text-lg text-slate-900 group-hover:text-indigo-600 transition-colors">
                {sub.name}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {sub.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-2">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 mx-auto flex items-center justify-center font-bold">
            <HelpCircle className="w-5 h-5" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900">Tez-tez Beriladigan Savollar</h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
              className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs cursor-pointer transition-all hover:border-indigo-300 space-y-2"
            >
              <div className="flex items-center justify-between font-bold text-sm text-slate-900">
                <span>{faq.q}</span>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${openFaq === idx ? 'rotate-180 text-indigo-600' : ''}`} />
              </div>
              {openFaq === idx && (
                <p className="text-xs text-slate-600 pt-2 border-t border-slate-100 leading-relaxed font-medium">
                  {faq.a}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-tr from-indigo-900 via-blue-900 to-indigo-950 text-white rounded-3xl p-8 sm:p-14 text-center space-y-6 shadow-2xl border border-indigo-800">
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight max-w-2xl mx-auto">
            Bugun A'zo Bo'ling va Akademik Marralarni Zabt Eting!
          </h2>
          <p className="text-sm text-indigo-200 max-w-xl mx-auto font-medium leading-relaxed">
            Respublika va xalqaro miqyosdagi akademik musobaqalar ishtirokchisiga aylaning.
          </p>
          <div className="pt-2">
            <Link to="/auth/register">
              <Button size="lg" className="bg-white text-indigo-950 font-black hover:bg-slate-100 px-8 py-3.5 shadow-xl">
                Ro'yxatdan O'tish
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
