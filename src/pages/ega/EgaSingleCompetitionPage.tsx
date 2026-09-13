import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { EgaLayout } from '../../components/ega/EgaLayout';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import {
  ArrowLeft,
  Settings,
  HelpCircle,
  Trophy,
  FileSpreadsheet,
  FileText,
  Clock,
  ShieldCheck,
  DollarSign,
  Plus,
  Edit,
  Trash2,
  Download,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { useOlympiadDetail, useOlympiadQuestions } from '../../hooks/useOlympiad';
import { MOCK_QUESTIONS, MOCK_LEADERBOARD } from '../../services/mockData';
import { Question, QuestionType } from '../../types';
import confetti from 'canvas-confetti';

export const EgaSingleCompetitionPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: olympiad } = useOlympiadDetail(id || 'olymp-math-2026');

  // Active Tab (Only 3 clean tabs: Sozlamalar, Savollar Bazasi, Natijalar va Reyting)
  const [activeTab, setActiveTab] = useState<'settings' | 'questions' | 'results'>('settings');

  // Settings Tab State
  const [title, setTitle] = useState(olympiad?.title || 'Respublika Matematika Iqtidorlari II Bosqichi');
  const [subject, setSubject] = useState(olympiad?.subject || 'math');
  const [durationMinutes, setDurationMinutes] = useState(olympiad?.durationMinutes || 120);
  const [isPaid, setIsPaid] = useState(false);
  const [priceAmount, setPriceAmount] = useState('35,000 UZS');
  const [antiCheatLevel, setAntiCheatLevel] = useState('Strict AI Proctoring');

  // Questions Tab State
  const questionsList = MOCK_QUESTIONS[id || 'olymp-math-2026'] || MOCK_QUESTIONS['olymp-math-2026'] || [];
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [qType, setQType] = useState<QuestionType>('multiple_choice');
  const [qContent, setQContent] = useState('');
  const [qPoints, setQPoints] = useState(20);
  const [optA, setOptA] = useState('');
  const [optB, setOptB] = useState('');

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Musobaqa sozlamalari saqlandi!");
  };

  const handleAddQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    const newQ: Question = {
      id: `q-single-${Date.now()}`,
      olympiadId: id || 'olymp-math-2026',
      roundId: 'r1',
      type: qType,
      content: qContent,
      points: qPoints,
      order: questionsList.length + 1,
      options: qType === 'multiple_choice' ? [optA, optB].filter(Boolean) : undefined,
    };
    if (!MOCK_QUESTIONS[id || 'olymp-math-2026']) {
      MOCK_QUESTIONS[id || 'olymp-math-2026'] = [];
    }
    MOCK_QUESTIONS[id || 'olymp-math-2026'].push(newQ);
    setIsQuestionModalOpen(false);
    setQContent('');
    alert("Savol saqlandi!");
  };

  const handleExportExcel = () => {
    confetti({ particleCount: 60, spread: 50 });
    alert(`Excel protokoli (.xlsx) yuklab olindi! (${olympiad?.title || title})`);
  };

  const handleExportPdf = () => {
    confetti({ particleCount: 60, spread: 50 });
    alert(`Rasmiy PDF bayonnoma (.pdf) yuklab olindi! (${olympiad?.title || title})`);
  };

  return (
    <EgaLayout>
      {/* Top Header & Navigation Back */}
      <div className="space-y-4 font-sans">
        <Link to="/ega/competitions" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-blue-600 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Musobaqalar ro'yxatiga qaytish
        </Link>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 text-white p-6 rounded-3xl shadow-xl border border-slate-800">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge subject={olympiad?.subject || 'math'} />
              <Badge status={olympiad?.status || 'active'} />
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white">{olympiad?.title || title}</h1>
            <p className="text-xs text-slate-300">
              Id: <span className="font-mono text-cyan-400 font-bold">{olympiad?.id || id}</span> • Davomiyligi: {durationMinutes} daq • {questionsList.length} ta savol
            </p>
          </div>

          {/* Prominent Header Export Action Buttons */}
          <div className="flex items-center gap-2.5">
            <Button
              onClick={handleExportExcel}
              variant="outline"
              className="bg-emerald-950/60 text-emerald-300 border-emerald-800/80 hover:bg-emerald-900 hover:text-white text-xs font-bold shadow-md shadow-emerald-950/40"
              leftIcon={<FileSpreadsheet className="w-4 h-4 text-emerald-400" />}
            >
              Excel (.xlsx) Yuklab Olish
            </Button>
            <Button
              onClick={handleExportPdf}
              variant="outline"
              className="bg-rose-950/60 text-rose-300 border-rose-800/80 hover:bg-rose-900 hover:text-white text-xs font-bold shadow-md shadow-rose-950/40"
              leftIcon={<FileText className="w-4 h-4 text-rose-400" />}
            >
              PDF (.pdf) Yuklab Olish
            </Button>
          </div>
        </div>

        {/* 3 Clean Workspace Tabs (Export tab removed) */}
        <div className="flex items-center gap-2 border-b border-slate-200 pt-2">
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-2 px-5 py-3 font-bold text-xs border-b-2 transition-all ${
              activeTab === 'settings'
                ? 'border-blue-600 text-blue-600 bg-blue-50/50 rounded-t-xl'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Settings className="w-4 h-4" /> Sozlamalar (Settings)
          </button>

          <button
            onClick={() => setActiveTab('questions')}
            className={`flex items-center gap-2 px-5 py-3 font-bold text-xs border-b-2 transition-all ${
              activeTab === 'questions'
                ? 'border-blue-600 text-blue-600 bg-blue-50/50 rounded-t-xl'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <HelpCircle className="w-4 h-4" /> Savollar Bazasi ({questionsList.length})
          </button>

          <button
            onClick={() => setActiveTab('results')}
            className={`flex items-center gap-2 px-5 py-3 font-bold text-xs border-b-2 transition-all ${
              activeTab === 'results'
                ? 'border-blue-600 text-blue-600 bg-blue-50/50 rounded-t-xl'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Trophy className="w-4 h-4" /> Natijalar va Reyting
          </button>
        </div>
      </div>

      {/* TAB 1: SOZLAMALAR */}
      {activeTab === 'settings' && (
        <Card className="p-6 bg-white border border-slate-200 space-y-6">
          <form onSubmit={handleSaveSettings} className="space-y-6 max-w-3xl">
            <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
              Musobaqa Parametrlari va Sozlamalari
            </h3>

            <Input
              label="Musobaqa Sarlavhasi"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase text-slate-700">Fan yo'nalishi</label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value as any)}
                  className="w-full p-2.5 text-sm border border-slate-200 rounded-xl bg-white"
                >
                  <option value="math">Matematika</option>
                  <option value="physics">Fizika</option>
                  <option value="chemistry">Kimyo</option>
                  <option value="biology">Biologiya</option>
                  <option value="informatics">Informatika</option>
                </select>
              </div>

              <Input
                label="Vaqt Chegarasi (Daqiqada)"
                type="number"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                required
              />
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-slate-900">Ishtirok Narxi (Price/Free Toggle)</h4>
                  <p className="text-xs text-slate-500">Musobaqa bepul yoki pullik ekanligini belgilang</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isPaid}
                    onChange={(e) => setIsPaid(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              {isPaid && (
                <Input
                  label="Ishtirok To'lovi (UZS)"
                  value={priceAmount}
                  onChange={(e) => setPriceAmount(e.target.value)}
                />
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase text-slate-700">Anti-Cheat Qat'iylik Darajasi</label>
              <select
                value={antiCheatLevel}
                onChange={(e) => setAntiCheatLevel(e.target.value)}
                className="w-full p-2.5 text-sm border border-slate-200 rounded-xl bg-white font-semibold"
              >
                <option value="Strict AI Proctoring">Strict AI Proctoring (Kamera + Tab switch + Clipboard block)</option>
                <option value="Moderate">Moderate (Faqat Tab switch nazorati)</option>
                <option value="Basic">Basic (Standart timer)</option>
              </select>
            </div>

            <Button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-6">
              Sozlamalarni Saqlash
            </Button>
          </form>
        </Card>
      )}

      {/* TAB 2: SAVOLLAR BAZASI */}
      {activeTab === 'questions' && (
        <Card className="p-6 bg-white border border-slate-200 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Ushbu Musobaqaga Biriktirilgan Savollar</h3>
              <p className="text-xs text-slate-500">Jami {questionsList.length} ta savol kiritilgan</p>
            </div>
            <Button onClick={() => setIsQuestionModalOpen(true)} className="bg-blue-600 text-white font-bold" leftIcon={<Plus className="w-4 h-4" />}>
              Yangi Savol Qo'shish
            </Button>
          </div>

          <div className="space-y-3">
            {questionsList.map((q, idx) => (
              <div key={q.id} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs text-blue-600">#{idx + 1}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-blue-100 text-blue-800">
                      {q.type}
                    </span>
                    <span className="text-xs font-bold text-slate-700">{q.points} ball</span>
                  </div>
                  <p className="text-sm font-medium text-slate-900">{q.content}</p>
                </div>
                <div className="flex items-center gap-1">
                  <button className="p-1.5 text-slate-400 hover:text-blue-600"><Edit className="w-4 h-4" /></button>
                  <button className="p-1.5 text-slate-400 hover:text-rose-600"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* TAB 3: NATIJALAR VA REYTING */}
      {activeTab === 'results' && (
        <Card className="p-6 bg-white border border-slate-200 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-lg font-bold text-slate-900">Ishtirokchilar Natijalari va Audit Tizimi</h3>
            <span className="text-xs text-emerald-600 font-bold">100% Verified Anti-Cheat</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px] border-b border-slate-200">
                <tr>
                  <th className="p-3">O'rin</th>
                  <th className="p-3">Ishtirokchi</th>
                  <th className="p-3">Sinf va Viloyat</th>
                  <th className="p-3">Ball</th>
                  <th className="p-3">Sarf Vaqti</th>
                  <th className="p-3">Anti-Cheat Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {MOCK_LEADERBOARD.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="p-3 font-bold text-slate-900 font-mono">#{item.rank}</td>
                    <td className="p-3 font-bold text-slate-900">{item.userName}</td>
                    <td className="p-3">{item.grade}-sinf • {item.region}</td>
                    <td className="p-3 font-extrabold text-blue-600 font-mono text-sm">{item.score} ball</td>
                    <td className="p-3 font-mono">{Math.floor(item.penaltyTime / 60)} daq</td>
                    <td className="p-3 font-bold text-emerald-600 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{item.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Question Builder Modal */}
      <Modal isOpen={isQuestionModalOpen} onClose={() => setIsQuestionModalOpen(false)} title="Yangi Savol Qo'shish">
        <form onSubmit={handleAddQuestion} className="space-y-4">
          <Input label="Savol Sharti" value={qContent} onChange={(e) => setQContent(e.target.value)} required />
          <Input label="Ball" type="number" value={qPoints} onChange={(e) => setQPoints(Number(e.target.value))} required />
          <Button type="submit" className="w-full bg-blue-600 text-white font-bold">Saqlash</Button>
        </form>
      </Modal>
    </EgaLayout>
  );
};

