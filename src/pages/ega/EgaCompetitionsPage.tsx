import React, { useState, useMemo } from 'react';
import { EgaLayout } from '../../components/ega/EgaLayout';
import { useOlympiadStore } from '../../store/useOlympiadStore';
import { useThemeStore } from '../../store/useThemeStore';
import { useTranslation } from 'react-i18next';
import { translateText } from '../../i18n/translator';
import { OlympiadItem } from '../../data/initialOlympiads';
import { clsx } from 'clsx';
import {
  Trophy,
  CheckCircle2,
  XCircle,
  DollarSign,
  Users,
  Plus,
  Search,
  FileSpreadsheet,
  Pin,
  Pencil,
  Trash2,
  Eye,
  Globe,
  MapPin,
  Calendar,
  Clock,
  BookOpen,
  X,
  Grid,
  List
} from 'lucide-react';
import { OlympiadFullEditor } from '../../components/ega/OlympiadFullEditor';
import { submissionService } from '../../services/submissionService';
import * as XLSX from 'xlsx';

export const EgaCompetitionsPage: React.FC = () => {
  const {
    olympiads,
    addOlympiad,
    updateOlympiad,
    deleteOlympiad,
    togglePinOlympiad,
    toggleOlympiadStatus
  } = useOlympiadStore();

  const { theme } = useThemeStore();
  const { i18n } = useTranslation();

  const isDark = theme === 'dark';
  const currentLang = i18n.language || 'uz';
  const t = (text: string) => translateText(text, currentLang);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [formatFilter, setFormatFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Full Page Editor State
  const [selectedOlympiadForEdit, setSelectedOlympiadForEdit] = useState<OlympiadItem | null>(null);

  // Modals State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingOlympiad, setEditingOlympiad] = useState<OlympiadItem | null>(null);
  const [viewingOlympiad, setViewingOlympiad] = useState<OlympiadItem | null>(null);
  const [viewParticipantTab, setViewParticipantTab] = useState<'all' | 'completed' | 'in_progress' | 'registered'>('all');
  const [viewSearchTerm, setViewSearchTerm] = useState('');

  // Add Form State
  const [newTitle, setNewTitle] = useState('');
  const [newSubject, setNewSubject] = useState('Matematika');
  const [newFormat, setNewFormat] = useState<'online' | 'offline'>('online');
  const [newPrice, setNewPrice] = useState<number>(35000);
  const [newStatus, setNewStatus] = useState<'ochiq' | 'yopiq'>('ochiq');
  const [newStartDate, setNewStartDate] = useState('2025-09-20 10:00');
  const [newEndDate, setNewEndDate] = useState('2025-09-20 18:00');
  const [newImage, setNewImage] = useState('https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=600&q=80');
  const [newDescription, setNewDescription] = useState('');
  const [newLocation, setNewLocation] = useState('');

  // 5 Stat Calculations
  const totalCount = olympiads?.length || 0;
  const openCount = useMemo(() => (olympiads || []).filter((o) => (o?.status || 'ochiq') === 'ochiq').length, [olympiads]);
  const closedCount = useMemo(() => (olympiads || []).filter((o) => o?.status === 'yopiq').length, [olympiads]);
  const totalRevenueSum = useMemo(() => (olympiads || []).reduce((sum, o) => sum + (Number(o?.totalRevenue) || 0), 0), [olympiads]);
  const totalPaidCountSum = useMemo(() => (olympiads || []).reduce((sum, o) => sum + (Number(o?.paidCount) || 0), 0), [olympiads]);

  // Filtered & Sorted List (Pinned on top)
  const filteredOlympiads = useMemo(() => {
    const list = (olympiads || []).filter((o) => {
      if (!o) return false;
      const title = (o.title || '').toLowerCase();
      const subject = (o.subject || '').toLowerCase();
      const id = (o.id || '').toLowerCase();
      const location = (o.location || '').toLowerCase();
      const query = (searchTerm || '').toLowerCase();

      const matchesSearch =
        title.includes(query) ||
        subject.includes(query) ||
        id.includes(query) ||
        location.includes(query);

      const oFormat = o.format || 'online';
      const oStatus = o.status || 'ochiq';
      const matchesFormat = formatFilter === 'all' || oFormat === formatFilter;
      const matchesStatus = statusFilter === 'all' || oStatus === statusFilter;

      return matchesSearch && matchesFormat && matchesStatus;
    });

    // Pinned first, then by ID
    return list.sort((a, b) => {
      if (a?.isPinned && !b?.isPinned) return -1;
      if (!a?.isPinned && b?.isPinned) return 1;
      return 0;
    });
  }, [olympiads, searchTerm, formatFilter, statusFilter]);

  // Format currency
  const formatUZS = (val?: number) => {
    const num = Number(val || 0);
    if (!num || num === 0) return t('Bepul');
    return `${num.toLocaleString()} UZS`;
  };

  // Export to Excel
  const handleExportExcel = () => {
    const exportData = filteredOlympiads.map((o, idx) => ({
      '№': idx + 1,
      [t('ID')]: o.id || '',
      [t('Olimpiada Nomi')]: o.title || '',
      [t('Fan')]: t(o.subject || ''),
      [t('Formati')]: (o.format || 'online').toUpperCase(),
      [t('Narxi')]: !o.price || o.price === 0 ? t('Bepul') : `${o.price} UZS`,
      [t('Holati')]: (o.status || 'ochiq') === 'ochiq' ? t('Ochiq (Faol)') : t('Yopiq'),
      [t('Ro\'yxatdan o\'tganlar')]: o.registeredCount || 0,
      [t('Topshirganlar')]: o.submittedCount || 0,
      [t('To\'lov qilganlar')]: o.paidCount || 0,
      [t('Jami tushum')]: `${o.totalRevenue || 0} UZS`,
      [t('Boshlanish vaqti')]: o.startDate || '',
      [t('Tugash vaqti')]: o.endDate || '',
      [t('Manzil (Offline)')]: o.location || '-'
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'OLIMPIADALAR');
    XLSX.writeFile(workbook, 'Olimpiadalar_ruyhati.xlsx');
  };

  // Direct Full Page Create
  const handleCreateNewOlympiad = () => {
    const created = addOlympiad({
      title: 'Yangi Olimpiada',
      subject: 'Matematika',
      format: 'online',
      image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=600&q=80',
      price: 35000,
      status: 'ochiq',
      isPinned: false,
      startDate: '2025-10-01 10:00',
      endDate: '2025-10-01 18:00',
      registrationStartDate: '2025-09-15 09:00',
      registrationEndDate: '2025-09-30 23:59',
      description: 'Musobaqa haqida batafsil ma\'lumot...',
      organizer: 'NextOlymp Kengashi'
    });
    setSelectedOlympiadForEdit(created);
  };

  // Submit Edit
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOlympiad || !editingOlympiad.title.trim()) return;

    updateOlympiad(editingOlympiad.id, {
      title: editingOlympiad.title.trim(),
      subject: editingOlympiad.subject,
      format: editingOlympiad.format,
      price: Number(editingOlympiad.price) || 0,
      status: editingOlympiad.status,
      startDate: editingOlympiad.startDate,
      endDate: editingOlympiad.endDate,
      description: editingOlympiad.description,
      location: editingOlympiad.format === 'offline' ? editingOlympiad.location : undefined,
      image: editingOlympiad.image
    });

    setEditingOlympiad(null);
  };

  // Render Full-Page Editor View if active
  if (selectedOlympiadForEdit) {
    const activeItem = olympiads.find((o) => o.id === selectedOlympiadForEdit.id) || selectedOlympiadForEdit;
    return (
      <EgaLayout>
        <OlympiadFullEditor
          olympiad={activeItem}
          onBack={() => setSelectedOlympiadForEdit(null)}
        />
      </EgaLayout>
    );
  }

  return (
    <EgaLayout>
      <div className="space-y-4 font-sans text-xs">
        {/* Header Bar */}
        <div
          className={clsx(
            "flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border shadow-sm transition-colors",
            isDark ? "bg-[#0D1832] border-[#182A4D]" : "bg-white border-slate-200"
          )}
        >
          <div>
            <h1 className={clsx("text-base font-bold flex items-center gap-2", isDark ? "text-white" : "text-slate-900")}>
              <Trophy className="w-4 h-4 text-amber-400" />
              {t("Olimpiadalar Boshqaruvi")}
            </h1>
            <p className={clsx("text-[11px] mt-0.5", isDark ? "text-slate-400" : "text-slate-500")}>
              {t("Barcha onlayn va oflayn olimpiadalarni boshqarish, ishtirokchilar va tushumlarni ko'rish")}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportExcel}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs transition-all cursor-pointer shadow-sm"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>{t("Excel'da yuklab olish")}</span>
            </button>

            <button
              onClick={handleCreateNewOlympiad}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs transition-all shadow-sm cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{t("Olimpiada yaratish")}</span>
            </button>
          </div>
        </div>

        {/* 5 Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {/* Card 1: Jami Olimpiadalar */}
          <div
            className={clsx(
              "p-3.5 rounded-xl border shadow-xs transition-all flex items-center gap-3",
              isDark ? "bg-[#0D1832] border-[#182A4D]" : "bg-white border-slate-200"
            )}
          >
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400">{t("Jami Olimpiadalar")}</div>
              <div className="text-lg font-black text-white mt-0.5 font-mono">{totalCount} {t("ta")}</div>
            </div>
          </div>

          {/* Card 2: Ochiq (Faol) */}
          <div
            className={clsx(
              "p-3.5 rounded-xl border shadow-xs transition-all flex items-center gap-3",
              isDark ? "bg-[#0D1832] border-[#182A4D]" : "bg-white border-slate-200"
            )}
          >
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400">{t("Ochiq (Faol)")}</div>
              <div className="text-lg font-black text-emerald-400 mt-0.5 font-mono">{openCount} {t("ta ochiq")}</div>
            </div>
          </div>

          {/* Card 3: Yopiq */}
          <div
            className={clsx(
              "p-3.5 rounded-xl border shadow-xs transition-all flex items-center gap-3",
              isDark ? "bg-[#0D1832] border-[#182A4D]" : "bg-white border-slate-200"
            )}
          >
            <div className="w-10 h-10 rounded-lg bg-slate-500/10 border border-slate-500/20 flex items-center justify-center text-slate-400 shrink-0">
              <XCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400">{t("Yopiq (Tugagan)")}</div>
              <div className="text-lg font-black text-slate-400 mt-0.5 font-mono">{closedCount} {t("ta yopiq")}</div>
            </div>
          </div>

          {/* Card 4: Jami Tushum */}
          <div
            className={clsx(
              "p-3.5 rounded-xl border shadow-xs transition-all flex items-center gap-3",
              isDark ? "bg-[#0D1832] border-[#182A4D]" : "bg-white border-slate-200"
            )}
          >
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400">{t("Jami Tushum")}</div>
              <div className="text-sm font-black text-blue-300 mt-0.5 font-mono truncate">{totalRevenueSum.toLocaleString()} UZS</div>
            </div>
          </div>

          {/* Card 5: To'lov Qilganlar */}
          <div
            className={clsx(
              "p-3.5 rounded-xl border shadow-xs transition-all flex items-center gap-3",
              isDark ? "bg-[#0D1832] border-[#182A4D]" : "bg-white border-slate-200"
            )}
          >
            <div className="w-10 h-10 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400">{t("To'lov Qilganlar")}</div>
              <div className="text-lg font-black text-purple-300 mt-0.5 font-mono">{totalPaidCountSum.toLocaleString()} {t("kishi")}</div>
            </div>
          </div>
        </div>

        {/* Filter & Toolbar */}
        <div
          className={clsx(
            "flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-xl border transition-colors",
            isDark ? "bg-[#0D1832] border-[#182A4D]" : "bg-white border-slate-200"
          )}
        >
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            {/* Format Filter */}
            <select
              value={formatFilter}
              onChange={(e) => setFormatFilter(e.target.value)}
              className={clsx(
                "rounded-lg px-3 py-1.5 text-xs outline-none border font-semibold",
                isDark ? "bg-[#091024] border-[#1A2F57] text-white" : "bg-slate-50 border-slate-300 text-slate-900"
              )}
            >
              <option value="all">{t("Barcha formatlar (Online & Offline)")}</option>
              <option value="online">Online</option>
              <option value="offline">Offline</option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={clsx(
                "rounded-lg px-3 py-1.5 text-xs outline-none border font-semibold",
                isDark ? "bg-[#091024] border-[#1A2F57] text-white" : "bg-slate-50 border-slate-300 text-slate-900"
              )}
            >
              <option value="all">{t("Barcha holatlar")}</option>
              <option value="ochiq">{t("Ochiq (Faol)")}</option>
              <option value="yopiq">{t("Yopiq (Tugagan)")}</option>
            </select>
          </div>

          {/* Search & View Toggle */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder={t("Olimpiada nomi bo'yicha qidirish...")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={clsx(
                  "w-full rounded-lg pl-9 pr-3 py-1.5 text-xs outline-none transition-all border",
                  isDark
                    ? "bg-[#091024] border-[#1A2F57] focus:border-amber-400 text-white placeholder:text-slate-500"
                    : "bg-slate-50 border-slate-300 focus:border-amber-500 text-slate-900 placeholder:text-slate-400"
                )}
              />
            </div>

            {/* View Mode Grid/Table */}
            <div className={clsx("flex items-center p-1 rounded-lg border", isDark ? "bg-[#091024] border-[#162747]" : "bg-slate-100 border-slate-200")}>
              <button
                onClick={() => setViewMode('grid')}
                className={clsx(
                  "p-1 rounded cursor-pointer transition-all",
                  viewMode === 'grid' ? "bg-amber-500 text-slate-950" : "text-slate-400 hover:text-white"
                )}
                title="Karta ko'rinishi"
              >
                <Grid className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={clsx(
                  "p-1 rounded cursor-pointer transition-all",
                  viewMode === 'table' ? "bg-amber-500 text-slate-950" : "text-slate-400 hover:text-white"
                )}
                title="Jadval ko'rinishi"
              >
                <List className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* GRID VIEW: OLYMPIAD CARDS */}
        {viewMode === 'grid' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredOlympiads.length === 0 ? (
              <div className="col-span-full p-8 text-center text-slate-400">
                {t("Olimpiadalar topilmadi")}
              </div>
            ) : (
              filteredOlympiads.map((item) => (
                <div
                  key={item.id}
                  className={clsx(
                    "rounded-2xl border shadow-sm transition-all overflow-hidden flex flex-col justify-between group",
                    item.isPinned
                      ? isDark
                        ? "bg-[#0E1A38] border-amber-500/60 shadow-amber-500/5"
                        : "bg-amber-50/40 border-amber-400 shadow-amber-500/5"
                      : isDark
                      ? "bg-[#0D1832] border-[#182A4D] hover:border-[#223B6C]"
                      : "bg-white border-slate-200 hover:border-slate-300"
                  )}
                >
                  {/* Banner Image Header */}
                  <div className="relative h-36 w-full overflow-hidden bg-slate-900">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0D1832] via-transparent to-black/40" />

                    {/* Format & Status Badges */}
                    <div className="absolute top-3 left-3 flex items-center gap-1.5">
                      <span
                        className={clsx(
                          "px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider border shadow-xs flex items-center gap-1",
                          item.format === 'online'
                            ? "bg-blue-600/90 text-white border-blue-400"
                            : "bg-purple-600/90 text-white border-purple-400"
                        )}
                      >
                        {item.format === 'online' ? <Globe className="w-3 h-3" /> : <MapPin className="w-3 h-3" />}
                        {item.format}
                      </span>

                      <span
                        className={clsx(
                          "px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider border shadow-xs",
                          item.status === 'ochiq'
                            ? "bg-emerald-500/90 text-white border-emerald-400"
                            : "bg-rose-500/90 text-white border-rose-400"
                        )}
                      >
                        {item.status === 'ochiq' ? t("Ochiq") : t("Yopiq")}
                      </span>
                    </div>

                    {/* Pin Button */}
                    <button
                      onClick={() => togglePinOlympiad(item.id)}
                      className={clsx(
                        "absolute top-3 right-3 p-1.5 rounded-lg border backdrop-blur-md transition-all cursor-pointer",
                        item.isPinned
                          ? "bg-amber-500 text-slate-950 border-amber-400 shadow-md scale-110"
                          : "bg-black/50 text-slate-300 border-white/20 hover:text-amber-400"
                      )}
                      title={item.isPinned ? t("Qadab qo'yilgan") : t("Qadab qo'yish")}
                    >
                      <Pin className="w-3.5 h-3.5" />
                    </button>

                    {/* Subject Tag */}
                    <div className="absolute bottom-2 left-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/40 backdrop-blur-md">
                        {t(item.subject)}
                      </span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className={clsx("text-sm font-bold line-clamp-2", isDark ? "text-white" : "text-slate-900")}>
                        {item.title}
                      </h3>
                      <p className="text-[11px] text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                        {item.description}
                      </p>
                      {item.location && (
                        <div className="flex items-center gap-1 text-[10px] text-purple-300 mt-1 font-medium">
                          <MapPin className="w-3 h-3 text-purple-400 shrink-0" />
                          <span className="truncate">{item.location}</span>
                        </div>
                      )}
                    </div>

                    {/* 4 Metrics Box: Ro'yxatdan o'tganlar, Topshirganlar, To'laganlar, Tushum */}
                    <div className={clsx("p-2.5 rounded-xl border grid grid-cols-2 gap-2 text-[11px]", isDark ? "bg-[#091024] border-[#182A4D]" : "bg-slate-50 border-slate-200")}>
                      <div>
                        <div className="text-[9px] text-slate-400 uppercase font-semibold">{t("Ro'yxatdan o'tganlar")}</div>
                        <div className="font-bold font-mono text-cyan-400 mt-0.5">{(item.registeredCount || 0).toLocaleString()} kishi</div>
                      </div>
                      <div>
                        <div className="text-[9px] text-slate-400 uppercase font-semibold">{t("Topshirganlar")}</div>
                        <div className="font-bold font-mono text-emerald-400 mt-0.5">{(item.submittedCount || 0).toLocaleString()} kishi</div>
                      </div>
                      <div>
                        <div className="text-[9px] text-slate-400 uppercase font-semibold">{t("To'laganlar")}</div>
                        <div className="font-bold font-mono text-purple-300 mt-0.5">{(item.paidCount || 0).toLocaleString()} kishi</div>
                      </div>
                      <div>
                        <div className="text-[9px] text-slate-400 uppercase font-semibold">{t("Jami Tushum")}</div>
                        <div className="font-bold font-mono text-amber-400 text-xs mt-0.5 whitespace-nowrap inline-block">{formatUZS(item.totalRevenue)}</div>
                      </div>
                    </div>

                    {/* Actions Footer */}
                    <div className="flex items-center justify-between pt-2 border-t border-[#182A4D] gap-2">
                      <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-500" />
                        {item.startDate ? String(item.startDate).split(' ')[0] : '2025-10-01'}
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setViewingOlympiad(item)}
                          className="px-2 py-1 bg-slate-500/10 hover:bg-slate-500/20 text-slate-300 border border-slate-500/30 rounded text-[11px] font-semibold flex items-center gap-1 cursor-pointer transition-all"
                          title={t("Ko'rish")}
                        >
                          <Eye className="w-3 h-3 text-slate-400" />
                          <span>{t("Ko'rish")}</span>
                        </button>

                        <button
                          onClick={() => setSelectedOlympiadForEdit(item)}
                          className="px-2 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded text-[11px] font-semibold flex items-center gap-1 cursor-pointer transition-all"
                          title={t("Tahrirlash")}
                        >
                          <Pencil className="w-3 h-3 text-amber-400" />
                          <span>{t("Tahrirlash")}</span>
                        </button>

                        <button
                          onClick={() => deleteOlympiad(item.id)}
                          className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded text-[11px] font-semibold cursor-pointer transition-all"
                          title={t("O'chirish")}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* TABLE VIEW */}
        {viewMode === 'table' && (
          <div
            className={clsx(
              "rounded-xl border overflow-hidden shadow-sm transition-colors",
              isDark ? "bg-[#0D1832] border-[#182A4D]" : "bg-white border-slate-200"
            )}
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead
                  className={clsx(
                    "text-[11px] uppercase tracking-wider border-b font-semibold whitespace-nowrap",
                    isDark ? "bg-[#101E3C] text-slate-400 border-[#182A4D]" : "bg-slate-100 text-slate-600 border-slate-200"
                  )}
                >
                  <tr>
                    <th className="py-2.5 px-3 w-10 text-center">№</th>
                    <th className="py-2.5 px-3">{t("Olimpiada Nomi")}</th>
                    <th className="py-2.5 px-3">{t("Formati")}</th>
                    <th className="py-2.5 px-3">{t("Narxi")}</th>
                    <th className="py-2.5 px-3">{t("Ro'yxatdan o'tganlar")}</th>
                    <th className="py-2.5 px-3">{t("Topshirganlar")}</th>
                    <th className="py-2.5 px-3">{t("To'laganlar")}</th>
                    <th className="py-2.5 px-3">{t("Jami Tushum")}</th>
                    <th className="py-2.5 px-3">{t("Holati")}</th>
                    <th className="py-2.5 px-3 text-right">{t("Amallar")}</th>
                  </tr>
                </thead>
                <tbody className={clsx("divide-y", isDark ? "divide-[#152545]" : "divide-slate-200")}>
                  {filteredOlympiads.map((item, idx) => (
                    <tr key={item.id} className={clsx("transition-colors", isDark ? "hover:bg-[#132244]" : "hover:bg-slate-50")}>
                      <td className="py-3 px-3 text-center text-slate-400 text-[11px] font-mono whitespace-nowrap">
                        {idx + 1}
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <div className="flex items-center gap-2 font-bold text-white">
                          {item.isPinned && <Pin className="w-3 h-3 text-amber-400 shrink-0" />}
                          <span>{item.title}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">{t(item.subject || '')} · {item.startDate || '-'}</div>
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className={clsx("px-2 py-0.5 rounded text-[10px] font-bold border uppercase", item.format === 'online' ? "bg-blue-500/20 text-blue-300 border-blue-500/40" : "bg-purple-500/20 text-purple-300 border-purple-500/40")}>
                          {item.format || 'online'}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-amber-400 whitespace-nowrap">
                        {formatUZS(item.price)}
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-cyan-400 whitespace-nowrap">
                        {(item.registeredCount || 0).toLocaleString()} kishi
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-emerald-400 whitespace-nowrap">
                        {(item.submittedCount || 0).toLocaleString()} kishi
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-blue-400 whitespace-nowrap">
                        {(item.paidCount || 0).toLocaleString()} kishi
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-amber-300 whitespace-nowrap">
                        {formatUZS(item.totalRevenue)}
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className={clsx("px-2 py-0.5 rounded text-[10px] font-bold uppercase border", item.status === 'ochiq' ? "bg-emerald-950/70 text-emerald-400 border-emerald-800/60" : "bg-rose-950/70 text-rose-400 border-rose-800/60")}>
                          {item.status === 'ochiq' ? t("Ochiq") : t("Yopiq")}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button onClick={() => setViewingOlympiad(item)} className="px-2 py-1 bg-slate-500/10 text-slate-300 border border-slate-500/30 rounded text-[11px] font-semibold flex items-center gap-1">
                            <Eye className="w-3 h-3" /> <span>{t("Ko'rish")}</span>
                          </button>
                          <button onClick={() => setSelectedOlympiadForEdit(item)} className="px-2 py-1 bg-amber-500/10 text-amber-300 border border-amber-500/30 rounded text-[11px] font-semibold flex items-center gap-1">
                            <Pencil className="w-3 h-3 text-amber-400" /> <span>{t("Tahrirlash")}</span>
                          </button>
                          <button onClick={() => deleteOlympiad(item.id)} className="p-1.5 bg-rose-500/10 text-rose-400 border border-rose-500/30 rounded text-[11px]">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}



        {/* Modal 2: Olympiad Tahrirlash */}
        {editingOlympiad && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <div
              className={clsx(
                "rounded-2xl max-w-lg w-full p-5 shadow-2xl space-y-4 border transition-colors max-h-[90vh] overflow-y-auto custom-scrollbar",
                isDark ? "bg-[#0D1832] border-[#1E3563]" : "bg-white border-slate-200"
              )}
            >
              <div className={clsx("flex items-center justify-between border-b pb-3", isDark ? "border-[#182A4D]" : "border-slate-200")}>
                <h3 className={clsx("text-sm font-bold flex items-center gap-2", isDark ? "text-white" : "text-slate-900")}>
                  <Pencil className="w-4 h-4 text-blue-500" />
                  {t("Olimpiadani tahrirlash")} ({editingOlympiad.id})
                </h3>
                <button onClick={() => setEditingOlympiad(null)} className="text-slate-400 hover:text-slate-600 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleEditSubmit} className="space-y-3">
                <div>
                  <label className={clsx("block text-[11px] font-semibold mb-1", isDark ? "text-slate-300" : "text-slate-700")}>
                    {t("Olimpiada Nomi *")}
                  </label>
                  <input
                    type="text"
                    required
                    value={editingOlympiad.title}
                    onChange={(e) => setEditingOlympiad({ ...editingOlympiad, title: e.target.value })}
                    className={clsx(
                      "w-full rounded-lg px-3 py-2 text-xs outline-none border",
                      isDark ? "bg-[#091024] border-[#1A2F57] focus:border-amber-400 text-white" : "bg-slate-50 border-slate-300 focus:border-amber-500 text-slate-900"
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={clsx("block text-[11px] font-semibold mb-1", isDark ? "text-slate-300" : "text-slate-700")}>
                      {t("Formati *")}
                    </label>
                    <select
                      value={editingOlympiad.format}
                      onChange={(e) => setEditingOlympiad({ ...editingOlympiad, format: e.target.value as any })}
                      className={clsx(
                        "w-full rounded-lg px-3 py-2 text-xs outline-none border font-bold",
                        isDark ? "bg-[#091024] border-[#1A2F57] focus:border-amber-400 text-white" : "bg-slate-50 border-slate-300 focus:border-amber-500 text-slate-900"
                      )}
                    >
                      <option value="online">Online</option>
                      <option value="offline">Offline</option>
                    </select>
                  </div>

                  <div>
                    <label className={clsx("block text-[11px] font-semibold mb-1", isDark ? "text-slate-300" : "text-slate-700")}>
                      {t("Holati")}
                    </label>
                    <select
                      value={editingOlympiad.status}
                      onChange={(e) => setEditingOlympiad({ ...editingOlympiad, status: e.target.value as any })}
                      className={clsx(
                        "w-full rounded-lg px-3 py-2 text-xs outline-none border font-bold",
                        isDark ? "bg-[#091024] border-[#1A2F57] focus:border-amber-400 text-white" : "bg-slate-50 border-slate-300 focus:border-amber-500 text-slate-900"
                      )}
                    >
                      <option value="ochiq">{t("Ochiq (Faol)")}</option>
                      <option value="yopiq">{t("Yopiq")}</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={clsx("block text-[11px] font-semibold mb-1", isDark ? "text-slate-300" : "text-slate-700")}>
                      {t("Narxi (UZS)")}
                    </label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={editingOlympiad.price}
                      onChange={(e) => setEditingOlympiad({ ...editingOlympiad, price: Number(e.target.value) })}
                      className={clsx(
                        "w-full rounded-lg px-3 py-2 text-xs outline-none border font-mono",
                        isDark ? "bg-[#091024] border-[#1A2F57] focus:border-amber-400 text-white" : "bg-slate-50 border-slate-300 focus:border-amber-500 text-slate-900"
                      )}
                    />
                  </div>

                  <div>
                    <label className={clsx("block text-[11px] font-semibold mb-1", isDark ? "text-slate-300" : "text-slate-700")}>
                      {t("Fan")}
                    </label>
                    <input
                      type="text"
                      value={editingOlympiad.subject}
                      onChange={(e) => setEditingOlympiad({ ...editingOlympiad, subject: e.target.value })}
                      className={clsx(
                        "w-full rounded-lg px-3 py-2 text-xs outline-none border",
                        isDark ? "bg-[#091024] border-[#1A2F57] focus:border-amber-400 text-white" : "bg-slate-50 border-slate-300 focus:border-amber-500 text-slate-900"
                      )}
                    />
                  </div>
                </div>

                <div>
                  <label className={clsx("block text-[11px] font-semibold mb-1", isDark ? "text-slate-300" : "text-slate-700")}>
                    {t("Tavsif")}
                  </label>
                  <textarea
                    rows={3}
                    value={editingOlympiad.description}
                    onChange={(e) => setEditingOlympiad({ ...editingOlympiad, description: e.target.value })}
                    className={clsx(
                      "w-full rounded-lg px-3 py-2 text-xs outline-none border resize-none",
                      isDark ? "bg-[#091024] border-[#1A2F57] focus:border-amber-400 text-white" : "bg-slate-50 border-slate-300 focus:border-amber-500 text-slate-900"
                    )}
                  />
                </div>

                <div className={clsx("flex justify-end gap-2 pt-2 border-t", isDark ? "border-[#182A4D]" : "border-slate-200")}>
                  <button
                    type="button"
                    onClick={() => setEditingOlympiad(null)}
                    className={clsx(
                      "px-3 py-1.5 rounded-lg text-xs font-semibold border",
                      isDark ? "bg-[#162748] text-slate-300 border-[#1E365E]" : "bg-slate-100 text-slate-700 border-slate-300"
                    )}
                  >
                    {t("Bekor qilish")}
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs transition-all shadow-md"
                  >
                    {t("Saqlash")}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal 3: Olympiadni Ko'rish (Rich Participant Directory & Live Tracking) */}
        {viewingOlympiad && (() => {
          const allParticipants = submissionService.getOlympiadAllParticipants(viewingOlympiad.id);
          const completedCount = allParticipants.filter((p) => p.status === 'completed').length;
          const inProgressCount = allParticipants.filter((p) => p.status === 'in_progress').length;
          const registeredCount = allParticipants.filter((p) => p.status === 'registered').length;

          const filtered = allParticipants.filter((p) => {
            const matchesTab =
              viewParticipantTab === 'all' ||
              (viewParticipantTab === 'completed' && p.status === 'completed') ||
              (viewParticipantTab === 'in_progress' && p.status === 'in_progress') ||
              (viewParticipantTab === 'registered' && p.status === 'registered');

            const q = viewSearchTerm.toLowerCase();
            const matchesSearch =
              !q ||
              p.name.toLowerCase().includes(q) ||
              p.phone.includes(q) ||
              p.region.toLowerCase().includes(q) ||
              p.school.toLowerCase().includes(q);

            return matchesTab && matchesSearch;
          });

          const handleExportModalExcel = () => {
            const exportData = filtered.map((p, idx) => ({
              '№': idx + 1,
              'Ishtirokchi ID': p.id,
              'F.I.Sh.': p.name,
              'Telefon': p.phone,
              'Viloyat': p.region,
              'Maktab': p.school,
              'Sinf': `${p.grade}-sinf`,
              'Holati': p.status === 'completed' ? 'Topshirgan' : p.status === 'in_progress' ? 'Hozir yechmoqda' : 'Ro\'yxatdan o\'tgan',
              'To\'g\'ri javoblar': p.correctAnswers !== undefined ? `${p.correctAnswers} / ${p.totalQuestions || 30}` : '-',
              'Natija (%)': p.percentage !== undefined ? `${p.percentage}%` : '-',
              'To\'plagan ball': p.score !== undefined ? `${p.score} ball` : '-',
              'Topshirgan vaqti': p.submittedAt || p.registeredAt || '-',
              'Diplom / Sertifikat': p.certificateType || '-'
            }));

            const worksheet = XLSX.utils.json_to_sheet(exportData);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, 'ISHTIROKCHILAR');
            XLSX.writeFile(workbook, `${viewingOlympiad.id}_Ishtirokchilar_Ruyhati.xlsx`);
          };

          return (
            <div className="fixed inset-0 bg-black/75 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-5">
              <div
                className={clsx(
                  "rounded-2xl max-w-4xl w-full p-5 shadow-2xl space-y-4 border transition-colors max-h-[92vh] overflow-y-auto custom-scrollbar",
                  isDark ? "bg-[#0D1832] border-[#1E3563]" : "bg-white border-slate-200"
                )}
              >
                {/* Header */}
                <div className={clsx("flex items-center justify-between border-b pb-3", isDark ? "border-[#182A4D]" : "border-slate-200")}>
                  <div>
                    <h3 className={clsx("text-base font-bold flex items-center gap-2", isDark ? "text-white" : "text-slate-900")}>
                      <Eye className="w-4 h-4 text-amber-400" />
                      {viewingOlympiad.title} <span className="text-xs font-mono text-amber-400 font-semibold">({viewingOlympiad.id})</span>
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {t("Ishtirokchilar ro'yxati, real-time qatnashayotganlar va imtihon natijalari")}
                    </p>
                  </div>
                  <button
                    onClick={() => setViewingOlympiad(null)}
                    className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* 4 Summary Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-center">
                    <div className="text-[10px] text-slate-400 font-semibold uppercase">{t("Ro'yxatdan o'tganlar")}</div>
                    <div className="font-bold text-blue-400 text-lg font-mono mt-0.5">{allParticipants.length} <span className="text-[10px] text-slate-400">ta</span></div>
                  </div>
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center">
                    <div className="text-[10px] text-slate-400 font-semibold uppercase">{t("Topshirganlar")}</div>
                    <div className="font-bold text-emerald-400 text-lg font-mono mt-0.5">{completedCount} <span className="text-[10px] text-slate-400">ta</span></div>
                  </div>
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center">
                    <div className="text-[10px] text-slate-400 font-semibold uppercase">{t("Hozir Yechmoqda")}</div>
                    <div className="font-bold text-amber-400 text-lg font-mono mt-0.5 flex items-center justify-center gap-1">
                      {inProgressCount > 0 && <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />}
                      {inProgressCount} <span className="text-[10px] text-slate-400">ta</span>
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-center">
                    <div className="text-[10px] text-slate-400 font-semibold uppercase">{t("Jami Tushum")}</div>
                    <div className="font-bold text-purple-300 text-xs font-mono mt-1.5">{formatUZS(viewingOlympiad.totalRevenue)}</div>
                  </div>
                </div>

                {/* Filter Tabs & Search Bar */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                  <div className="flex items-center gap-1.5 p-1 rounded-xl bg-black/20 border border-white/5 w-full sm:w-auto overflow-x-auto">
                    <button
                      type="button"
                      onClick={() => setViewParticipantTab('all')}
                      className={clsx(
                        "px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap",
                        viewParticipantTab === 'all'
                          ? "bg-amber-500 text-slate-950 shadow-sm"
                          : "text-slate-400 hover:text-white"
                      )}
                    >
                      Barchasi ({allParticipants.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewParticipantTab('completed')}
                      className={clsx(
                        "px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap",
                        viewParticipantTab === 'completed'
                          ? "bg-emerald-500 text-slate-950 shadow-sm"
                          : "text-slate-400 hover:text-white"
                      )}
                    >
                      Topshirganlar ({completedCount})
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewParticipantTab('in_progress')}
                      className={clsx(
                        "px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap",
                        viewParticipantTab === 'in_progress'
                          ? "bg-amber-500 text-slate-950 shadow-sm"
                          : "text-slate-400 hover:text-white"
                      )}
                    >
                      Hozir Yechmoqda ({inProgressCount})
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewParticipantTab('registered')}
                      className={clsx(
                        "px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap",
                        viewParticipantTab === 'registered'
                          ? "bg-blue-500 text-slate-950 shadow-sm"
                          : "text-slate-400 hover:text-white"
                      )}
                    >
                      Kutayotganlar ({registeredCount})
                    </button>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <div className="relative w-full sm:w-60">
                      <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                      <input
                        type="text"
                        placeholder="F.I.Sh. yoki maktab bo'yicha..."
                        value={viewSearchTerm}
                        onChange={(e) => setViewSearchTerm(e.target.value)}
                        className={clsx(
                          "w-full rounded-xl pl-9 pr-3 py-1.5 text-xs outline-none border transition-colors",
                          isDark ? "bg-[#091024] border-[#1A2F57] text-white" : "bg-slate-50 border-slate-300 text-slate-900"
                        )}
                      />
                    </div>

                    <button
                      type="button"
                      onClick={handleExportModalExcel}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs shadow-xs transition-all cursor-pointer shrink-0"
                      title="Ishtirokchilar ro'yxatini Excel'da yuklash"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Excel</span>
                    </button>
                  </div>
                </div>

                {/* Participants Table */}
                <div className="rounded-xl border overflow-hidden border-[#182A4D]">
                  <div className="overflow-x-auto custom-scrollbar max-h-[360px]">
                    <table className="w-full text-left text-xs">
                      <thead
                        className={clsx(
                          "text-[11px] uppercase tracking-wider border-b font-semibold whitespace-nowrap sticky top-0 z-10",
                          isDark ? "bg-[#101E3C] text-slate-400 border-[#182A4D]" : "bg-slate-100 text-slate-600 border-slate-200"
                        )}
                      >
                        <tr>
                          <th className="py-2.5 px-3 w-10 text-center">№</th>
                          <th className="py-2.5 px-3">Ishtirokchi (F.I.Sh.)</th>
                          <th className="py-2.5 px-3">Hudud / Maktab</th>
                          <th className="py-2.5 px-3">Sinf</th>
                          <th className="py-2.5 px-3">Holati</th>
                          <th className="py-2.5 px-3">Natija (To'g'ri / Ball)</th>
                          <th className="py-2.5 px-3">Foiz</th>
                          <th className="py-2.5 px-3">Vaqti</th>
                          <th className="py-2.5 px-3 text-right">Diplom / Sertifikat</th>
                        </tr>
                      </thead>

                      <tbody className={clsx("divide-y", isDark ? "divide-[#152545]" : "divide-slate-200")}>
                        {filtered.length === 0 ? (
                          <tr>
                            <td colSpan={9} className="py-8 text-center text-slate-400">
                              {t("Ishtirokchilar topilmadi")}
                            </td>
                          </tr>
                        ) : (
                          filtered.map((p, idx) => (
                            <tr key={p.id} className={clsx("transition-colors", isDark ? "hover:bg-[#132244]" : "hover:bg-slate-50")}>
                              <td className="py-2.5 px-3 text-center text-slate-400 font-mono text-[11px]">
                                {idx + 1}
                              </td>

                              <td className="py-2.5 px-3 whitespace-nowrap">
                                <div className="font-bold text-white text-xs">{p.name}</div>
                                <div className="text-[10px] text-slate-400 font-mono">{p.phone} · {p.id}</div>
                              </td>

                              <td className="py-2.5 px-3 whitespace-nowrap">
                                <div className="font-semibold text-slate-300">{p.region}</div>
                                <div className="text-[10px] text-slate-400">{p.school}</div>
                              </td>

                              <td className="py-2.5 px-3 whitespace-nowrap">
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                                  {p.grade}-sinf
                                </span>
                              </td>

                              <td className="py-2.5 px-3 whitespace-nowrap">
                                <span
                                  className={clsx(
                                    "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border inline-flex items-center gap-1",
                                    p.status === 'completed'
                                      ? "bg-emerald-950/70 text-emerald-400 border-emerald-800/60"
                                      : p.status === 'in_progress'
                                      ? "bg-amber-950/70 text-amber-400 border-amber-800/60 animate-pulse"
                                      : "bg-blue-950/70 text-blue-400 border-blue-800/60"
                                  )}
                                >
                                  {p.status === 'completed' ? "🟢 Topshirgan" : p.status === 'in_progress' ? "🟡 Yechmoqda" : "🔵 Kutilmoqda"}
                                </span>
                              </td>

                              <td className="py-2.5 px-3 whitespace-nowrap font-mono font-bold">
                                {p.correctAnswers !== undefined ? (
                                  <span className="text-emerald-400">{p.correctAnswers} / {p.totalQuestions || 30} <span className="text-[10px] text-slate-400 font-normal">({p.score} ball)</span></span>
                                ) : (
                                  <span className="text-slate-500">-</span>
                                )}
                              </td>

                              <td className="py-2.5 px-3 whitespace-nowrap font-mono font-bold">
                                {p.percentage !== undefined ? (
                                  <span className={clsx(p.percentage >= 80 ? "text-emerald-400" : p.percentage >= 60 ? "text-amber-400" : "text-rose-400")}>
                                    {p.percentage}%
                                  </span>
                                ) : (
                                  <span className="text-slate-500">-</span>
                                )}
                              </td>

                              <td className="py-2.5 px-3 whitespace-nowrap font-mono text-[10px] text-slate-400">
                                {p.submittedAt || p.registeredAt || '-'}
                              </td>

                              <td className="py-2.5 px-3 whitespace-nowrap text-right">
                                {p.certificateType ? (
                                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40">
                                    {p.certificateType}
                                  </span>
                                ) : (
                                  <span className="text-slate-500 text-[10px]">-</span>
                                )}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className={clsx("flex items-center justify-between pt-2 border-t", isDark ? "border-[#182A4D]" : "border-slate-200")}>
                  <button
                    onClick={() => {
                      setSelectedOlympiadForEdit(viewingOlympiad);
                      setViewingOlympiad(null);
                    }}
                    className="px-3.5 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-bold rounded-xl text-xs transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    <span>To'liq tahrirlash & Anti-Cheat sozlash</span>
                  </button>

                  <button
                    onClick={() => setViewingOlympiad(null)}
                    className="px-4 py-1.5 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-xl text-xs transition-all cursor-pointer"
                  >
                    {t("Yopish")}
                  </button>
                </div>
              </div>
            </div>
          );
        })()}
      </div>
    </EgaLayout>
  );
};
