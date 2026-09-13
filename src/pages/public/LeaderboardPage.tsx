import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Trophy, Search, ShieldCheck, UserCheck, Sparkles } from 'lucide-react';
import { LeaderboardTable } from '../../components/leaderboard/LeaderboardTable';
import { useLeaderboard } from '../../hooks/useLeaderboard';
import { useAuth } from '../../hooks/useAuth';
import { Avatar } from '../../components/common/Avatar';

const UZBEKISTAN_REGIONS = [
  'Toshkent shahri',
  'Toshkent viloyati',
  'Andijon viloyati',
  'Buxoro viloyati',
  'Farg\'ona viloyati',
  'Jizzax viloyati',
  'Xorazm viloyati',
  'Namangan viloyati',
  'Navoiy viloyati',
  'Qashqadaryo viloyati',
  'Qoraqalpog\'iston Respublikasi',
  'Samarqand viloyati',
  'Sirdaryo viloyati',
  'Surxondaryo viloyati'
];

export const LeaderboardPage: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { data: entries, isLoading } = useLeaderboard();
  const [search, setSearch] = useState('');
  const [regionFilter, setRegionFilter] = useState('all');

  const filteredEntries = entries?.filter((e) => {
    const matchSearch = e.userName.toLowerCase().includes(search.toLowerCase()) || e.school.toLowerCase().includes(search.toLowerCase());
    const matchRegion = regionFilter === 'all' || e.region === regionFilter;
    return matchSearch && matchRegion;
  }) || [];

  const userEntry = entries?.find(
    (e) => user && (e.userId === user.id || e.userName.toLowerCase() === user.fullName.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold mb-2">
            <Trophy className="w-4 h-4 text-amber-500" />
            <span>Milliy Natijalar va Jonli Reyting</span>
          </div>
          <h1 className="text-3xl font-black text-accent-900 tracking-tight">{t('leaderboard.title')}</h1>
          <p className="text-accent-600 text-sm">{t('leaderboard.subtitle')}</p>
        </div>
      </div>

      {/* Current User Rank Highlight Card */}
      {user && (
        <div className="p-6 bg-gradient-to-r from-blue-950 via-slate-900 to-blue-900 text-white rounded-3xl shadow-xl border border-blue-700/60 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
          <div className="absolute -top-12 -right-12 w-64 h-64 bg-cyan-500/20 blur-3xl rounded-full pointer-events-none" />

          <div className="flex items-center gap-4 relative z-10">
            <Avatar name={user.fullName} src={user.avatarUrl} size="lg" className="border-2 border-cyan-400/80 shadow-md shrink-0" />
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold uppercase tracking-widest text-cyan-300 flex items-center gap-1">
                  <UserCheck className="w-3.5 h-3.5 text-cyan-400" />
                  Sizning O'rningiz
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 text-[10px] font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" /> Anti-Cheat Tasdiqlangan
                </span>
              </div>
              <h3 className="text-xl font-black text-white">{user.fullName}</h3>
              <p className="text-xs text-blue-200 font-medium">
                {user.school || 'Prezident Maktabi'} • {user.region || 'Toshkent shahri'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6 relative z-10 bg-blue-900/60 p-4 rounded-2xl border border-blue-700/60 backdrop-blur-xs shrink-0 w-full md:w-auto justify-around">
            <div className="text-center">
              <div className="text-2xl font-black text-amber-400 font-mono">
                #{userEntry ? userEntry.rank : 1}
              </div>
              <div className="text-[10px] text-blue-200 font-bold uppercase tracking-wider">Milliy O'rin</div>
            </div>
            <div className="w-px h-8 bg-blue-700/80" />
            <div className="text-center">
              <div className="text-2xl font-black text-cyan-300 font-mono">
                {userEntry ? userEntry.score : 100} ball
              </div>
              <div className="text-[10px] text-blue-200 font-bold uppercase tracking-wider">Umumiy Ball</div>
            </div>
          </div>
        </div>
      )}

      {/* Filter Bar */}
      <div className="bg-white border border-border rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-accent-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Ishtirokchi ismi yoki maktabidan izlash..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <select
          value={regionFilter}
          onChange={(e) => setRegionFilter(e.target.value)}
          className="w-full sm:w-64 p-2 text-sm border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white font-medium"
        >
          <option value="all">Barcha viloyatlar</option>
          {UZBEKISTAN_REGIONS.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <LeaderboardTable entries={filteredEntries} isLoading={isLoading} />
    </div>
  );
};

