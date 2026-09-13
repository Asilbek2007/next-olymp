import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, ShieldCheck } from 'lucide-react';
import { Logo } from './Logo';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-gradient-to-r from-blue-950 via-slate-950 to-blue-950 text-slate-300 border-t border-blue-900/80 pt-12 pb-8 w-full mt-auto shadow-2xl font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Col 1: Brand with Crystal Mountain Logo */}
          <div className="space-y-4">
            <Logo size="md" lightText />
            <p className="text-xs text-blue-200/80 leading-relaxed font-medium">
              O'zbekiston va MDH davlatlari o'quvchilari uchun mo'ljallangan birinchi raqamli akademik olimpiada va musobaqalar platformasi.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Anti-Cheat va Server-side Verified</span>
            </div>
          </div>

          {/* Col 2: Navigation */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Platforma</h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link to="/olympiads" className="text-blue-200/80 hover:text-white transition-colors">Barcha musobaqalar</Link>
              </li>
              <li>
                <Link to="/leaderboard" className="text-blue-200/80 hover:text-white transition-colors">Milliy reyting</Link>
              </li>
              <li>
                <Link to="/verify/NO-2026-MATH-8921" className="text-blue-200/80 hover:text-white transition-colors">Sertifikatni tekshirish</Link>
              </li>
              <li>
                <Link to="/about" className="text-blue-200/80 hover:text-white transition-colors">Biz haqimizda</Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Fanlar */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Olimpiada Fanlari</h4>
            <ul className="space-y-2.5 text-xs text-blue-200/80">
              <li className="hover:text-white transition-colors cursor-pointer">Matematika va Algebra</li>
              <li className="hover:text-white transition-colors cursor-pointer">Informatika va Dasturlash (ICPC)</li>
              <li className="hover:text-white transition-colors cursor-pointer">Fizika va Mexanika</li>
              <li className="hover:text-white transition-colors cursor-pointer">Kimyo va Biologiya</li>
            </ul>
          </div>

          {/* Col 4: Contact */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Bog'lanish</h4>
            <ul className="space-y-3 text-xs text-blue-200/80">
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-cyan-400 shrink-0" />
                <span className="text-blue-100">support@nextolymp.uz</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-cyan-400 shrink-0" />
                <span className="text-blue-100">+998 99-174-99-33</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-cyan-400 shrink-0" />
                <span className="text-blue-100">Toshkent sh., Yunusobod t., Amir Temur ko'chasi, 108</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-blue-900/80 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-blue-300/70 gap-4 font-medium">
          <p>© {new Date().getFullYear()} Next Olymp Inc. Barcha huquqlar himoyalangan.</p>
          <div className="flex items-center gap-6 text-blue-200/80">
            <Link to="/terms" className="hover:text-white transition-colors">Foydalanish shartlari</Link>
            <Link to="/privacy" className="hover:text-white transition-colors">Maxfiylik siyosati</Link>
            <Link to="/rules" className="hover:text-white transition-colors">Nizom va qoidalar</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
