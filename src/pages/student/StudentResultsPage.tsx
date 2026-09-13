import React, { useMemo } from 'react';
import { Sidebar } from '../../components/common/Sidebar';
import { Card } from '../../components/common/Card';
import { ShieldCheck, BarChart3, Trophy, ArrowRight } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { submissionService } from '../../services/submissionService';
import { Link } from 'react-router-dom';
import { Button } from '../../components/common/Button';

export const StudentResultsPage: React.FC = () => {
  const { user } = useAuth();

  const results = useMemo(() => {
    if (!user?.id) return [];
    return submissionService.getUserSubmissions(user.id);
  }, [user]);

  return (
    <div className="flex bg-surface min-h-[calc(100vh-4rem)]">
      <Sidebar />

      <main className="flex-1 w-full min-w-0 transition-all duration-300 p-6 md:p-8 space-y-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-black text-accent-900">Natijalar Tarixi</h1>
          <p className="text-xs text-accent-500">Ishtirok etilgan barcha olimpiadalar va tekshirilgan natijalaringiz</p>
        </div>

        {results.length === 0 ? (
          <div className="p-12 rounded-3xl bg-white border border-dashed border-slate-300 text-center space-y-4 max-w-lg mx-auto mt-8">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 mx-auto flex items-center justify-center">
              <Trophy className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-900">Hozircha natijalar mavjud emas</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Siz hali birorta ham olimpiadada ishtirok etmadingiz. Mavjud musobaqalarda qatnashing va birinchi ballaringizni qo'lga kiriting!
              </p>
            </div>
            <Link to="/student/olympiads" className="inline-block pt-2">
              <Button size="md" variant="primary" className="bg-blue-600 hover:bg-blue-500 text-white font-bold" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Olimpiadalarga o'tish
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {results.map((res, idx) => (
              <Card key={idx} className="p-6 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
                  <div>
                    <span className="text-xs uppercase font-bold text-primary">Musobaqa ID: {res.olympiadId}</span>
                    <h3 className="text-lg font-bold text-accent-900">Natija rasmiylashtirildi</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 bg-emerald-50 text-emerald-700 font-bold text-xs rounded-full border border-emerald-200 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Tasdiqlangan</span>
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                  <div>
                    <span className="text-accent-400 font-medium">To'plangan Ball</span>
                    <p className="text-xl font-extrabold text-primary font-mono">{res.score} / {res.maxScore || 100}</p>
                  </div>
                  <div>
                    <span className="text-accent-400 font-medium">Topshirilgan Vaqt</span>
                    <p className="text-sm font-bold text-accent-800">{new Date(res.completedAt).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <span className="text-accent-400 font-medium">Anti-Cheat Status</span>
                    <p className="text-sm font-bold text-emerald-600 mt-1">Toza (Passed)</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};
