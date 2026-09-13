import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Sidebar } from '../../components/common/Sidebar';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Avatar } from '../../components/common/Avatar';
import { Trophy, Award, ArrowRight, CheckCircle2, Sparkles, Clock, BarChart3, Calendar, ShieldCheck } from 'lucide-react';
import { useOlympiadStore } from '../../store/useOlympiadStore';

export const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const { olympiads } = useOlympiadStore();

  if (!user) return null;

  // Filter active competitions
  const activeOlympiads = olympiads.filter((o) => o.status === 'ochiq');

  // Recent results mock data bound to student
  const recentResults = [
    {
      id: 'res-1',
      title: "Respublika Matematika Iqtidorlari II Bosqichi",
      date: "2026-09-03",
      score: 95,
      maxScore: 100,
      rank: 2,
      total: 3420,
      status: "Tasdiqlangan",
      subject: "Matematika"
    },
    {
      id: 'res-2',
      title: "Respublika Kimyogarlar Chempionati",
      date: "2026-08-28",
      score: 82,
      maxScore: 100,
      rank: 14,
      total: 2150,
      status: "Tasdiqlangan",
      subject: "Kimyo"
    }
  ];

  return (
    <div className="flex bg-surface min-h-screen">
      <Sidebar />

      <main className="flex-1 w-full min-w-0 transition-all duration-300 p-6 md:p-8 space-y-8">
        {/* Solid Neo-Blue Dark Welcome Hero Banner */}
        <div className="relative overflow-hidden bg-gradient-to-r from-blue-950 via-blue-900 to-slate-950 text-white rounded-3xl p-8 md:p-10 shadow-2xl border border-blue-800/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          {/* Subtle Ambient Glow */}
          <div className="absolute -top-16 -right-16 w-80 h-80 bg-cyan-500/20 blur-3xl rounded-full pointer-events-none" />

          <div className="flex items-center gap-6 relative z-10">
            <Avatar name={user.fullName} src={user.avatarUrl} size="xl" className="border-2 border-cyan-400/80 shadow-xl shrink-0" />

            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/15 border border-amber-400/35 text-amber-300 text-xs font-extrabold uppercase tracking-widest backdrop-blur-xs">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Xush kelibsiz, {user.fullName || 'O\'quvchi'}!</span>
              </div>
              
              <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight leading-tight">
                Shaxsiy Kabinet
              </h1>
              
              <p className="text-sm text-blue-200 font-medium">
                {user.school || 'Toshkent Prezident Maktabi'} • <span className="text-white font-bold">{user.grade || 9}-sinf</span> • {user.region || 'Toshkent shahri'}
              </p>
            </div>
          </div>

          <div className="relative z-10 shrink-0">
            <Link to="/student/olympiads">
              <Button size="lg" variant="primary" className="bg-blue-600 hover:bg-blue-500 text-white font-extrabold shadow-lg shadow-blue-950/60" rightIcon={<ArrowRight className="w-5 h-5" />}>
                Musobaqalarga kirish
              </Button>
            </Link>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <Link to="/student/olympiads">
            <Card className="p-6 flex items-center gap-4 bg-white border border-blue-100 shadow-xs hover:border-blue-500 hover:shadow-lg transition-all duration-300 group">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 group-hover:bg-blue-600 group-hover:text-white text-blue-600 border border-blue-200 flex items-center justify-center font-bold shrink-0 transition-colors">
                <Trophy className="w-6 h-6" />
              </div>
              <div>
                <div className="text-3xl font-black text-slate-900 font-mono">{activeOlympiads.length} ta</div>
                <div className="text-xs text-slate-600 font-bold uppercase tracking-wider mt-0.5">Olimpiadalar Bo'limi</div>
              </div>
            </Card>
          </Link>

          <Link to="/certificates">
            <Card className="p-6 flex items-center gap-4 bg-white border border-blue-100 shadow-xs hover:border-blue-500 hover:shadow-lg transition-all duration-300 group">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 group-hover:bg-amber-500 group-hover:text-white text-amber-600 border border-amber-200 flex items-center justify-center font-bold shrink-0 transition-colors">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <div className="text-3xl font-black text-slate-900 font-mono">2 ta</div>
                <div className="text-xs text-slate-600 font-bold uppercase tracking-wider mt-0.5">Sertifikatlar</div>
              </div>
            </Card>
          </Link>

          <Link to="/student/leaderboard">
            <Card className="p-6 flex items-center gap-4 bg-white border border-blue-100 shadow-xs hover:border-blue-500 hover:shadow-lg transition-all duration-300 group">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 group-hover:bg-emerald-600 group-hover:text-white text-emerald-600 border border-emerald-200 flex items-center justify-center font-bold shrink-0 transition-colors">
                <BarChart3 className="w-6 h-6" />
              </div>
              <div>
                <div className="text-3xl font-black text-emerald-600 font-mono">2,550 XP</div>
                <div className="text-xs text-slate-600 font-bold uppercase tracking-wider mt-0.5">Reyting Ballaringiz</div>
              </div>
            </Card>
          </Link>
        </div>

        {/* Active Registrations / Recommended Contests */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-black text-slate-900 tracking-tight">Davom etayotgan va Tavsiya etiladigan Musobaqalar</h3>
            <Link to="/student/olympiads" className="text-xs font-bold text-blue-600 hover:underline">
              Barchasini ko'rish →
            </Link>
          </div>

          {activeOlympiads.length === 0 ? (
            <div className="p-10 rounded-2xl bg-white border border-dashed border-slate-300 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 mx-auto flex items-center justify-center">
                <Trophy className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-slate-900">Hozircha faol olimpiada yo'q</h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Yaqin soatlarda yangi fan olimpiadalari boshlanadi. Musobaqalar taqvimi bilan tanishishingiz mumkin.
              </p>
              <Link to="/student/olympiads" className="inline-block pt-1">
                <Button size="sm" variant="primary" className="bg-blue-600 hover:bg-blue-500 text-white font-bold">
                  Olimpiadalar ro'yxatiga o'tish
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {activeOlympiads.map((o) => (
                <Card key={o.id} className="p-6 space-y-4 bg-white border border-blue-100 shadow-xs hover:border-blue-500 hover:shadow-lg transition-all duration-300 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                        {o.subject}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase">
                        {o.status}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-bold text-lg text-slate-900 leading-snug line-clamp-1">{o.title}</h4>
                      <p className="text-xs text-slate-600 line-clamp-2 mt-1.5 leading-relaxed">{o.description}</p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-slate-500 font-semibold">
                      <Clock className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span>{o.startDate}</span>
                    </div>
                    <Link to={`/olympiads/${o.id}`}>
                      <Button size="sm" variant="primary" className="bg-blue-600 hover:bg-blue-500 text-white font-bold">
                        Qatnashish
                      </Button>
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* So'nggi Ishtirok Etilgan Olimpiada Natijalari Vidjeti */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-black text-slate-900 tracking-tight">
              So'nggi Ishtirok Etilgan Olimpiada Natijalari
            </h3>
            <Link to="/results" className="text-xs font-bold text-blue-600 hover:underline">
              Barcha natijalarni ko'rish →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recentResults.map((res) => (
              <Card key={res.id} className="p-5 bg-white border border-slate-200 shadow-xs hover:border-blue-400 transition-all space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                  <div>
                    <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">{res.subject} • {res.date}</span>
                    <h4 className="font-bold text-sm text-slate-900 line-clamp-1">{res.title}</h4>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px] border border-emerald-200 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{res.status}</span>
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-2 bg-blue-50/50 rounded-xl border border-blue-100">
                    <span className="text-[10px] text-slate-500 font-medium">To'plangan Ball</span>
                    <p className="text-base font-black text-blue-600 font-mono">{res.score} / {res.maxScore}</p>
                  </div>
                  <div className="p-2 bg-amber-50/50 rounded-xl border border-amber-100">
                    <span className="text-[10px] text-slate-500 font-medium">Egallangan O'rin</span>
                    <p className="text-base font-black text-amber-600">{res.rank}-o'rin</p>
                  </div>
                  <div className="p-2 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-[10px] text-slate-500 font-medium">Anti-Cheat</span>
                    <p className="text-xs font-bold text-emerald-600 mt-1">Tasdiqlangan</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};
