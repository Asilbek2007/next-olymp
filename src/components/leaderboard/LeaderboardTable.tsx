import React from 'react';
import { LeaderboardEntry } from '../../types';
import { Avatar } from '../common/Avatar';
import { Trophy, Medal, ShieldCheck, Clock, UserCheck } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

interface LeaderboardTableProps {
  entries: LeaderboardEntry[];
  isLoading?: boolean;
}

export const LeaderboardTable: React.FC<LeaderboardTableProps> = ({ entries, isLoading }) => {
  const { user } = useAuth();

  if (isLoading) {
    return (
      <div className="w-full space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-16 bg-surface animate-pulse rounded-xl" />
        ))}
      </div>
    );
  }

  if (!entries || entries.length === 0) {
    return (
      <div className="w-full text-center py-16 px-4 rounded-2xl border border-dashed border-border bg-white shadow-xs space-y-3">
        <div className="w-14 h-14 mx-auto rounded-full bg-amber-50 text-amber-500 flex items-center justify-center border border-amber-200">
          <Trophy className="w-7 h-7" />
        </div>
        <h3 className="text-lg font-bold text-accent-900">Hozircha ishtirokchilar mavjud emas</h3>
        <p className="text-sm text-accent-500 max-w-md mx-auto">
          Olimpiadalarda qatnashib natija ko'rsating va birinchilardan bo'lib umummilliy reyting jadvalidan joy oling!
        </p>
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto rounded-2xl border border-border bg-white shadow-xs">
      <table className="w-full text-left text-sm">
        <thead className="bg-surface text-accent-600 uppercase text-[11px] font-bold tracking-wider border-b border-border">
          <tr>
            <th className="px-6 py-4">O'rin</th>
            <th className="px-6 py-4">Ishtirokchi</th>
            <th className="px-6 py-4">Sinf</th>
            <th className="px-6 py-4">Viloyat va Maktab</th>
            <th className="px-6 py-4 text-right">Ball</th>
            <th className="px-6 py-4 text-right">Vaqt (Penalty)</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border text-accent-900">
          {entries.map((entry) => {
            const isTop1 = entry.rank === 1;
            const isTop2 = entry.rank === 2;
            const isTop3 = entry.rank === 3;
            
            const isCurrentUser = user && (
              entry.userId === user.id ||
              entry.userName.toLowerCase() === user.fullName.toLowerCase()
            );

            return (
              <tr
                key={entry.id}
                className={`transition-colors ${
                  isCurrentUser
                    ? 'bg-cyan-50/90 border-2 border-cyan-500 shadow-md font-bold'
                    : isTop1
                    ? 'bg-amber-50/40 hover:bg-amber-50/70'
                    : isTop2
                    ? 'bg-slate-50/60 hover:bg-slate-100/80'
                    : isTop3
                    ? 'bg-amber-900/5 hover:bg-amber-900/10'
                    : 'hover:bg-surface/80'
                }`}
              >
                {/* Rank */}
                <td className="px-6 py-4 font-bold text-base">
                  {isTop1 ? (
                    <div className="flex items-center gap-1.5 text-amber-500">
                      <Trophy className="w-5 h-5 fill-amber-400" />
                      <span>1</span>
                    </div>
                  ) : isTop2 ? (
                    <div className="flex items-center gap-1.5 text-slate-500">
                      <Medal className="w-5 h-5 fill-slate-300" />
                      <span>2</span>
                    </div>
                  ) : isTop3 ? (
                    <div className="flex items-center gap-1.5 text-amber-700">
                      <Medal className="w-5 h-5 fill-amber-700" />
                      <span>3</span>
                    </div>
                  ) : (
                    <span className="text-accent-500 pl-2">{entry.rank}</span>
                  )}
                </td>

                {/* User */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <Avatar name={entry.userName} src={entry.avatarUrl} size="md" />
                    <div>
                      <div className="font-bold text-accent-900 flex items-center gap-2">
                        <span>{entry.userName}</span>
                        {isCurrentUser && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-cyan-600 text-white text-[10px] font-black uppercase tracking-wider shadow-xs">
                            <UserCheck className="w-3 h-3 text-cyan-200" />
                            Siz
                          </span>
                        )}
                        {entry.status === 'verified' && (
                          <span title="Anti-Cheat Tasdiqlangan">
                            <ShieldCheck className="w-4 h-4 text-emerald-600" />
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </td>

                {/* Grade */}
                <td className="px-6 py-4 font-semibold text-accent-700">
                  {entry.grade}-sinf
                </td>

                {/* Region & School */}
                <td className="px-6 py-4">
                  <div className="flex flex-col text-xs">
                    <span className="font-bold text-accent-800">{entry.region}</span>
                    <span className="text-accent-500">{entry.school}</span>
                  </div>
                </td>

                {/* Score */}
                <td className="px-6 py-4 text-right">
                  <span className="inline-flex px-3 py-1 bg-primary-50 text-primary-700 font-extrabold text-sm rounded-lg border border-primary-200">
                    {entry.score} ball
                  </span>
                </td>

                {/* Penalty Time */}
                <td className="px-6 py-4 text-right font-mono text-xs text-accent-600">
                  <div className="flex items-center justify-end gap-1">
                    <Clock className="w-3.5 h-3.5 text-accent-400" />
                    <span>{Math.floor(entry.penaltyTime / 60)} daq</span>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
