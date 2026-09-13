import React from 'react';
import { Sidebar } from '../../components/common/Sidebar';
import { Card } from '../../components/common/Card';
import { Trophy, CheckCircle2, Clock, ShieldCheck } from 'lucide-react';

export const StudentResultsPage: React.FC = () => {
  const results = [
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
    <div className="flex bg-surface min-h-[calc(100vh-4rem)]">
      <Sidebar />

      <main className="flex-1 w-full min-w-0 transition-all duration-300 p-6 md:p-8 space-y-6">
        <h1 className="text-2xl font-black text-accent-900">Natijalar Tarixi</h1>

        <div className="space-y-4">
          {results.map((res) => (
            <Card key={res.id} className="p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
                <div>
                  <span className="text-xs uppercase font-bold text-primary">{res.subject} • {res.date}</span>
                  <h3 className="text-lg font-bold text-accent-900">{res.title}</h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-emerald-50 text-emerald-700 font-bold text-xs rounded-full border border-emerald-200 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>{res.status}</span>
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div>
                  <span className="text-accent-400 font-medium">To'plangan Ball</span>
                  <p className="text-xl font-extrabold text-primary font-mono">{res.score} / {res.maxScore}</p>
                </div>
                <div>
                  <span className="text-accent-400 font-medium">Egallangan O'rin</span>
                  <p className="text-xl font-extrabold text-amber-600">{res.rank}-o'rin</p>
                </div>
                <div>
                  <span className="text-accent-400 font-medium">Umumiy Ishtirokchilar</span>
                  <p className="text-xl font-extrabold text-accent-900">{res.total} ta</p>
                </div>
                <div>
                  <span className="text-accent-400 font-medium">Anti-Cheat Status</span>
                  <p className="text-sm font-bold text-emerald-600 mt-1">Toza (Clean)</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
};
