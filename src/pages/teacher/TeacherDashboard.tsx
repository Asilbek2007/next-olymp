import React from 'react';
import { Sidebar } from '../../components/common/Sidebar';
import { Card } from '../../components/common/Card';
import { Users, Trophy, Award, TrendingUp } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export const TeacherDashboard: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="flex bg-surface min-h-[calc(100vh-4rem)]">
      <Sidebar />

      <main className="flex-1 w-full min-w-0 transition-all duration-300 p-6 md:p-8 space-y-8">
        <div>
          <h1 className="text-2xl font-black text-accent-900">O'qituvchi Kabineti</h1>
          <p className="text-xs text-accent-500">{user?.school || 'Samarqand 1-sonli IDUUM'} • Biriktirilgan o'quvchilar nazorati</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <Card className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-accent-900">48 ta</div>
              <div className="text-xs text-accent-500 font-semibold">Biriktirilgan o'quvchilar</div>
            </div>
          </Card>

          <Card className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-emerald-600">89.4%</div>
              <div className="text-xs text-accent-500 font-semibold">O'rtacha o'zlashtirish ko'rsatkichi</div>
            </div>
          </Card>

          <Card className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-amber-600">12 ta</div>
              <div className="text-xs text-accent-500 font-semibold">Sovrindor o'quvchilar</div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
};
