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
  Sparkles,
  Globe,
  MapPin,
  Calendar,
  Clock,
  BookOpen,
  X,
  Bot,
  Grid,
  List
} from 'lucide-react';
import { OlympiadFullEditor } from '../../components/ega/OlympiadFullEditor';
import * as XLSX from 'xlsx';

export const EgaCompetitionsPage: React.FC = () => {
  const {
    olympiads,
    addOlympiad,
    updateOlympiad,
    deleteOlympiad,
    togglePinOlympiad,
    toggleOlympiadStatus,
    generateAiOlympiadDraft
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
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiPromptInput, setAiPromptInput] = useState('');
  const [editingOlympiad, setEditingOlympiad] = useState<OlympiadItem | null>(null);
  const [viewingOlympiad, setViewingOlympiad] = useState<OlympiadItem | null>(null);

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
  const totalCount = olympiads.length;
  const openCount = useMemo(() => olympiads.filter((o) => o.status === 'ochiq').length, [olympiads]);
  const closedCount = useMemo(() => olympiads.filter((o) => o.status === 'yopiq').length, [olympiads]);
  const totalRevenueSum = useMemo(() => olympiads.reduce((sum, o) => sum + o.totalRevenue, 0), [olympiads]);
  const totalPaidCountSum = useMemo(() => olympiads.reduce((sum, o) => sum + o.paidCount, 0), [olympiads]);

  // Filtered & Sorted List (Pinned on top)
  const filteredOlympiads = useMemo(() => {
    const list = olympiads.filter((o) => {
      const matchesSearch =
        o.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (o.location && o.location.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesFormat = formatFilter === 'all' || o.format === formatFilter;
      const matchesStatus = statusFilter === 'all' || o.status === statusFilter;

      return matchesSearch && matchesFormat && matchesStatus;
    });

    // Pinned first, then by ID
    return list.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return 0;
    });
  }, [olympiads, searchTerm, formatFilter, statusFilter]);

  // Format currency
  const formatUZS = (val: number) => {
    if (val === 0) return t('Bepul');
    return `${val.toLocaleString()} UZS`;
  };

  // Export to Excel
  const handleExportExcel = () => {
    const exportData = filteredOlympiads.map((o, idx) => ({
      '№': idx + 1,
      [t('ID')]: o.id,
      [t('Olimpiada Nomi')]: o.title,
      [t('Fan')]: t(o.subject),
      [t('Formati')]: o.format.toUpperCase(),
      [t('Narxi')]: o.price === 0 ? t('Bepul') : `${o.price} UZS`,
      [t('Holati')]: o.status === 'ochiq' ? t('Ochiq (Faol)') : t('Yopiq'),
      [t('Ro\'yxatdan o\'tganlar')]: o.registeredCount,
      [t('Topshirganlar')]: o.submittedCount,
      [t('To\'lov qilganlar')]: o.paidCount,
      [t('Jami tushum')]: `${o.totalRevenue} UZS`,
      [t('Boshlanish vaqti')]: o.startDate,
      [t('Tugash vaqti')]: o.endDate,
      [t('Manzil (Offline)')]: o.location || '-'
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'OLIMPIADALAR');
    XLSX.writeFile(workbook, 'Olimpiadalar_ruyhati.xlsx');
  };

  // Generate AI Draft
  const handleGenerateAiDraft = () => {
    if (!aiPromptInput.trim()) return;
    const draft = generateAiOlympiadDraft(aiPromptInput.trim());

    const created = addOlympiad({
      title: draft.title || 'Yangi AI Olimpiada',
      subject: draft.subject || 'Matematika',
      format: draft.format || 'online',
      image: draft.image || 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=600&q=80',
      price: draft.price || 35000,
      status: draft.status || 'ochiq',
      isPinned: false,
      startDate: draft.startDate || '2025-10-01 10:00',
      endDate: draft.endDate || '2025-10-01 18:00',
      registrationStartDate: '2025-09-15 09:00',
      registrationEndDate: '2025-09-30 23:59',
      description: draft.description || '',
      organizer: draft.organizer || 'NextOlymp Kengashi'
    });

    setIsAiModalOpen(false);
    setSelectedOlympiadForEdit(created);
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
              onClick={() => setIsAiModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-lg text-xs transition-all cursor-pointer shadow-sm"
              title="AI yordamida olimpiada yaratish"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>{t("✨ AI Olimpiada Yaratish")}</span>
            </button>

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
                        <div className="font-bold font-mono text-cyan-400 mt-0.5">{item.registeredCount.toLocaleString()} kishi</div>
                      </div>
                      <div>
                        <div className="text-[9px] text-slate-400 uppercase font-semibold">{t("Topshirganlar")}</div>
                        <div className="font-bold font-mono text-emerald-400 mt-0.5">{item.submittedCount.toLocaleString()} kishi</div>
                      </div>
                      <div>
                        <div className="text-[9px] text-slate-400 uppercase font-semibold">{t("To'laganlar")}</div>
                        <div className="font-bold font-mono text-purple-300 mt-0.5">{item.paidCount.toLocaleString()} kishi</div>
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
                        {item.startDate.split(' ')[0]}
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
                        <div className="text-[10px] text-slate-400 font-mono">{t(item.subject)} · {item.startDate}</div>
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className={clsx("px-2 py-0.5 rounded text-[10px] font-bold border uppercase", item.format === 'online' ? "bg-blue-500/20 text-blue-300 border-blue-500/40" : "bg-purple-500/20 text-purple-300 border-purple-500/40")}>
                          {item.format}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-amber-400 whitespace-nowrap">
                        {formatUZS(item.price)}
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-cyan-400 whitespace-nowrap">
                        {item.registeredCount.toLocaleString()} kishi
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-emerald-400 whitespace-nowrap">
                        {item.submittedCount.toLocaleString()} kishi
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-blue-400 whitespace-nowrap">
                        {item.paidCount.toLocaleString()} kishi
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

        {/* Modal 3: Olympiadni Ko'rish (Detail View Inside Olympiad) */}
        {viewingOlympiad && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <div
              className={clsx(
                "rounded-2xl max-w-xl w-full p-5 shadow-2xl space-y-4 border transition-colors max-h-[90vh] overflow-y-auto custom-scrollbar",
                isDark ? "bg-[#0D1832] border-[#1E3563]" : "bg-white border-slate-200"
              )}
            >
              <div className={clsx("flex items-center justify-between border-b pb-3", isDark ? "border-[#182A4D]" : "border-slate-200")}>
                <h3 className={clsx("text-sm font-bold flex items-center gap-2", isDark ? "text-white" : "text-slate-900")}>
                  <Eye className="w-4 h-4 text-amber-400" />
                  {viewingOlympiad.title} ({viewingOlympiad.id})
                </h3>
                <button onClick={() => setViewingOlympiad(null)} className="text-slate-400 hover:text-slate-600 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="relative h-44 rounded-xl overflow-hidden">
                  <img src={viewingOlympiad.image} alt={viewingOlympiad.title} className="w-full h-full object-cover" />
                  <div className="absolute top-3 left-3 flex gap-2">
                    <span className="px-2.5 py-1 rounded bg-black/70 backdrop-blur-md text-amber-300 font-bold text-xs">
                      {viewingOlympiad.format.toUpperCase()}
                    </span>
                    <span className="px-2.5 py-1 rounded bg-emerald-600 text-white font-bold text-xs">
                      {viewingOlympiad.status.toUpperCase()}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                  <div className="p-2.5 rounded-lg bg-blue-500/10 border border-blue-500/20">
                    <div className="text-[10px] text-slate-400">Ro'yxatdan o'tganlar</div>
                    <div className="font-bold text-blue-400 text-sm font-mono mt-0.5">{viewingOlympiad.registeredCount.toLocaleString()}</div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                    <div className="text-[10px] text-slate-400">Topshirganlar</div>
                    <div className="font-bold text-emerald-400 text-sm font-mono mt-0.5">{viewingOlympiad.submittedCount.toLocaleString()}</div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-purple-500/10 border border-purple-500/20">
                    <div className="text-[10px] text-slate-400">To'laganlar</div>
                    <div className="font-bold text-purple-300 text-sm font-mono mt-0.5">{viewingOlympiad.paidCount.toLocaleString()}</div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
                    <div className="text-[10px] text-slate-400">Jami Tushum</div>
                    <div className="font-bold text-amber-300 text-xs font-mono mt-1">{formatUZS(viewingOlympiad.totalRevenue)}</div>
                  </div>
                </div>

                <div className="space-y-2 text-xs leading-relaxed">
                  <div className="font-bold text-slate-300">Tavsif:</div>
                  <p className="p-3 rounded-lg bg-black/20 text-slate-200 border border-white/10">{viewingOlympiad.description}</p>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => setViewingOlympiad(null)}
                    className="px-4 py-1.5 bg-amber-500 text-slate-950 font-bold rounded-lg text-xs"
                  >
                    Yopish
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal 4: AI Generator Modal */}
        {isAiModalOpen && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <div
              className={clsx(
                "rounded-2xl max-w-md w-full p-5 shadow-2xl space-y-4 border transition-colors",
                isDark ? "bg-[#0D1832] border-[#1E3563]" : "bg-white border-slate-200"
              )}
            >
              <div className={clsx("flex items-center justify-between border-b pb-3", isDark ? "border-[#182A4D]" : "border-slate-200")}>
                <h3 className={clsx("text-sm font-bold flex items-center gap-2", isDark ? "text-white" : "text-slate-900")}>
                  <Bot className="w-5 h-5 text-indigo-400" />
                  <span>AI Olimpiada Generatori</span>
                </h3>
                <button onClick={() => setIsAiModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3">
                <p className="text-xs text-slate-300 leading-relaxed">
                  AI yordamida yangi olimpiada yaratish uchun buyruq bering (masalan: *"Buxoro viloyati uchun ingliz tili olimpiadasi yarat"*):
                </p>

                <textarea
                  rows={3}
                  placeholder="AI uchun buyruq yozing..."
                  value={aiPromptInput}
                  onChange={(e) => setAiPromptInput(e.target.value)}
                  className={clsx(
                    "w-full rounded-lg px-3 py-2 text-xs outline-none border resize-none",
                    isDark ? "bg-[#091024] border-[#1A2F57] text-white" : "bg-slate-50 border-slate-300 text-slate-900"
                  )}
                />

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={() => setIsAiModalOpen(false)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold border bg-slate-800 text-slate-300"
                  >
                    Bekor qilish
                  </button>
                  <button
                    onClick={handleGenerateAiDraft}
                    className="px-4 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-lg text-xs shadow-md"
                  >
                    AI Bilan Yaratish
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </EgaLayout>
  );
};
