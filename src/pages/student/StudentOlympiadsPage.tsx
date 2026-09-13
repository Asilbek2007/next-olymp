import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Sidebar } from '../../components/common/Sidebar';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Trophy, Clock, Search, Filter, Sparkles, ArrowRight, HelpCircle } from 'lucide-react';
import { useOlympiadList } from '../../hooks/useOlympiad';
import { Subject, OlympiadStatus } from '../../types';

import { useOlympiadStore } from '../../store/useOlympiadStore';

export const StudentOlympiadsPage: React.FC = () => {
  const [selectedSubject, setSelectedSubject] = useState<Subject | 'all'>('all');
  const [selectedStatus, setSelectedStatus] = useState<OlympiadStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const { olympiads: storedOlympiads } = useOlympiadStore();
  const { data: queriedOlympiads, isLoading } = useOlympiadList({
    subject: selectedSubject,
    status: selectedStatus,
    search: searchQuery,
  });

  const olympiads = storedOlympiads.length > 0
    ? storedOlympiads
        .filter((o) => {
          const matchSubject = selectedSubject === 'all' || o.subject.toLowerCase().includes(selectedSubject);
          const matchStatus = selectedStatus === 'all' || (selectedStatus === 'active' ? o.status === 'ochiq' : o.status === 'yopiq');
          const matchQuery = !searchQuery || o.title.toLowerCase().includes(searchQuery.toLowerCase());
          return matchSubject && matchStatus && matchQuery;
        })
        .map((o) => ({
          id: o.id,
          title: o.title,
          subject: (o.subject.toLowerCase().includes('mat') ? 'math' : o.subject.toLowerCase().includes('fiz') ? 'physics' : o.subject.toLowerCase().includes('inf') ? 'informatics' : o.subject.toLowerCase().includes('kim') ? 'chemistry' : o.subject.toLowerCase().includes('bio') ? 'biology' : 'other') as Subject,
          description: o.description,
          startDate: o.startDate,
          endDate: o.endDate,
          status: (o.status === 'ochiq' ? 'active' : 'finished') as OlympiadStatus,
          durationMinutes: 90,
          totalQuestions: o.questions?.length || 30,
          maxScore: 100,
          rounds: [],
          eligibility: { grades: o.targetGrades || [5,6,7,8,9,10,11] },
          prizes: [],
          participantsCount: o.registeredCount || 0,
          organizer: o.organizer || 'NextOlymp'
        }))
    : queriedOlympiads;

  const subjectsList: { id: Subject | 'all'; name: string }[] = [
    { id: 'all', name: 'Barcha Fanlar' },
    { id: 'math', name: 'Matematika' },
    { id: 'physics', name: 'Fizika' },
    { id: 'informatics', name: 'Informatika' },
    { id: 'chemistry', name: 'Kimyo' },
    { id: 'biology', name: 'Biologiya' },
  ];

  return (
    <div className="flex bg-surface min-h-screen">
      <Sidebar />

      <main className="flex-1 w-full min-w-0 transition-all duration-300 p-6 md:p-8 space-y-8">
        {/* Header Hero */}
        <div className="relative overflow-hidden bg-gradient-to-r from-blue-950 via-slate-900 to-blue-900 text-white rounded-3xl p-8 shadow-xl border border-blue-800/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-400/15 border border-cyan-400/30 text-cyan-300 text-xs font-extrabold uppercase tracking-widest backdrop-blur-xs">
              <Trophy className="w-3.5 h-3.5 text-cyan-400" />
              <span>Kabinet Olimpiadalar Bo'limi</span>
            </div>
            <h1 className="text-3xl font-black tracking-tight text-white">Olimpiadalar va Musobaqalar</h1>
            <p className="text-sm text-blue-200 font-medium max-w-xl">
              Bilimingizni sinash uchun mavjud olimpiadalarga ro'yxatdan o'ting va jonli musobaqalarda qatnashing
            </p>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="bg-white border border-border rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-accent-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                placeholder="Olimpiada nomi yoki yo'nalishi bo'yicha izlash..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              />
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as OlympiadStatus | 'all')}
                className="w-full sm:w-44 p-2.5 text-sm border border-border rounded-xl bg-white font-semibold text-accent-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Barcha holatlar</option>
                <option value="active">🟢 Faol (Davom etayotgan)</option>
                <option value="upcoming">🟡 Kutilayotgan</option>
                <option value="finished">🔴 Yakunlangan</option>
              </select>
            </div>
          </div>

          {/* Subject Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {subjectsList.map((s) => (
              <button
                key={s.id}
                onClick={() => setSelectedSubject(s.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  selectedSubject === s.id
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-900/30'
                    : 'bg-surface hover:bg-blue-50 text-accent-700 border border-border'
                }`}
              >
                {s.name}
              </button>
            ))}
          </div>
        </div>

        {/* Olympiad List */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-48 bg-white border border-border rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : !olympiads || olympiads.length === 0 ? (
          <div className="p-12 text-center bg-white border border-border rounded-2xl space-y-3">
            <Trophy className="w-12 h-12 text-accent-300 mx-auto" />
            <h3 className="text-lg font-bold text-accent-900">Musobaqalar topilmadi</h3>
            <p className="text-xs text-accent-500">Qidiruv yoki filtr parametrlarini o'zgartirib ko'ring</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {olympiads.map((o) => (
              <Card key={o.id} className="p-6 space-y-5 bg-white border border-blue-100 shadow-xs hover:border-blue-500 hover:shadow-lg transition-all duration-300 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge subject={o.subject} />
                    <Badge status={o.status} />
                  </div>
                  <div>
                    <h3 className="font-bold text-xl text-slate-900 leading-snug">{o.title}</h3>
                    <p className="text-xs text-slate-600 line-clamp-2 mt-2 leading-relaxed">{o.description}</p>
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 font-medium">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-blue-600" />
                      <span>{o.durationMinutes} daqiqa</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <HelpCircle className="w-4 h-4 text-blue-600" />
                      <span>{o.totalQuestions} ta savol</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <div className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                      Maks. {o.maxScore} ball
                    </div>

                    <Link to={`/olympiads/${o.id}`}>
                      <Button
                        size="sm"
                        variant="primary"
                        rightIcon={<ArrowRight className="w-4 h-4" />}
                        className="bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-md shadow-blue-900/30"
                      >
                        Qatnashish
                      </Button>
                    </Link>
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
