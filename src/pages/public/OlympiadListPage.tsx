import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, Filter } from 'lucide-react';
import { OlympiadCard } from '../../components/olympiad/OlympiadCard';
import { useOlympiadList } from '../../hooks/useOlympiad';
import { Subject, OlympiadStatus } from '../../types';

export const OlympiadListPage: React.FC = () => {
  const { t } = useTranslation();
  const [subject, setSubject] = useState<Subject | 'all'>('all');
  const [status, setStatus] = useState<OlympiadStatus | 'all'>('all');
  const [grade, setGrade] = useState<number | 'all'>('all');
  const [search, setSearch] = useState('');

  const { data: olympiads, isLoading } = useOlympiadList({
    subject,
    status,
    grade,
    search,
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Title */}
      <div className="space-y-2">
        <h1 className="text-3xl font-black text-accent-900 tracking-tight">{t('olympiads.title')}</h1>
        <p className="text-accent-600 text-sm">{t('olympiads.subtitle')}</p>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border border-border rounded-2xl p-4 shadow-xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-accent-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Musobaqa nomidan izlash..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {/* Subject Filter */}
          <select
            value={subject}
            onChange={(e) => setSubject(e.target.value as Subject | 'all')}
            className="w-full p-2 text-sm border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
          >
            <option value="all">{t('olympiads.allSubjects')}</option>
            <option value="math">Matematika</option>
            <option value="physics">Fizika</option>
            <option value="chemistry">Kimyo</option>
            <option value="biology">Biologiya</option>
            <option value="informatics">Informatika</option>
          </select>

          {/* Grade Filter */}
          <select
            value={grade}
            onChange={(e) => setGrade(e.target.value === 'all' ? 'all' : Number(e.target.value))}
            className="w-full p-2 text-sm border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
          >
            <option value="all">{t('olympiads.allGrades')}</option>
            {[5, 6, 7, 8, 9, 10, 11].map((g) => (
              <option key={g} value={g}>{g}-sinf</option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as OlympiadStatus | 'all')}
            className="w-full p-2 text-sm border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
          >
            <option value="all">{t('olympiads.allStatuses')}</option>
            <option value="active">{t('olympiads.active')}</option>
            <option value="upcoming">{t('olympiads.upcoming')}</option>
            <option value="finished">{t('olympiads.finished')}</option>
          </select>
        </div>
      </div>

      {/* Grid List */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-80 bg-surface rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : olympiads && olympiads.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {olympiads.map((o) => (
            <OlympiadCard key={o.id} olympiad={o} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white border border-border rounded-2xl space-y-3">
          <Filter className="w-10 h-10 text-accent-400 mx-auto" />
          <h3 className="text-lg font-bold text-accent-900">Ushbu filtr bo'yicha musobaqalar topilmadi</h3>
          <p className="text-xs text-accent-500">Filtr parametrlari yoki izlash so'rovini o'zgartirib ko'ring.</p>
        </div>
      )}
    </div>
  );
};
