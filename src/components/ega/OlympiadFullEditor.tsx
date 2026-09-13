import React, { useState, useMemo } from 'react';
import { OlympiadItem } from '../../data/initialOlympiads';
import { useOlympiadStore } from '../../store/useOlympiadStore';
import { usePackageStore } from '../../store/usePackageStore';
import { useThemeStore } from '../../store/useThemeStore';
import { useTranslation } from 'react-i18next';
import { translateText } from '../../i18n/translator';
import { clsx } from 'clsx';
import {
  ArrowLeft,
  Save,
  CheckCircle2,
  Trophy,
  Globe,
  MapPin,
  Calendar,
  Clock,
  DollarSign,
  CreditCard,
  Wallet,
  Coins,
  Percent,
  Gift,
  Languages,
  GraduationCap,
  Sparkles,
  Info,
  CheckSquare,
  Square,
  Users,
  Eye,
  Upload,
  FileSpreadsheet,
  Search,
  Award,
  Download,
  Bot,
  X,
  AlertCircle,
  Check,
  HelpCircle,
  Sliders,
  EyeOff,
  Plus,
  Pencil,
  Trash2,
  Image as ImageIcon,
  FileText
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { Question, QuestionType } from '../../types';
import { MOCK_QUESTIONS } from '../../services/mockData';
import { parseDocxQuestions } from '../../utils/docxParser';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Button } from '../common/Button';

interface OlympiadFullEditorProps {
  olympiad: OlympiadItem;
  onBack: () => void;
}

const ALL_LANGUAGES = [
  "O'zbek tili",
  "Rus tili",
  "Ingliz tili",
  "Qoraqalpoq tili",
  "Tojik tili"
];

const ALL_GRADES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

// Mock Participant Results for this Olympiad
interface ParticipantResult {
  id: string;
  name: string;
  phone: string;
  region: string;
  school: string;
  grade: number;
  correctAnswers: number;
  totalQuestions: number;
  percentage: number;
  score: number;
  timeSpentMinutes: number;
  submittedAt: string;
  paymentType: 'Karta' | 'Hamyon' | 'Naqd' | 'VIP Paket (Bepul)';
  certificateType: 'I darajali Diplom' | 'II darajali Diplom' | 'III darajali Diplom' | 'Sertifikat';
  wrongQuestionsList?: { questionNum: number; topic: string; userAns: string; correctAns: string; aiExplanation: string }[];
}

const MOCK_PARTICIPANTS: ParticipantResult[] = [
  {
    id: 'STU-901',
    name: 'Alimov Sardorbek Botirovich',
    phone: '+998 90 123 45 67',
    region: 'Toshkent shahri',
    school: '1-sonli Aniq Fanlar Litseyi',
    grade: 10,
    correctAnswers: 29,
    totalQuestions: 30,
    percentage: 96.7,
    score: 96.7,
    timeSpentMinutes: 38,
    submittedAt: '2025-09-15 11:38',
    paymentType: 'VIP Paket (Bepul)',
    certificateType: 'I darajali Diplom',
    wrongQuestionsList: [
      {
        questionNum: 18,
        topic: 'Logarifmik tenglamalar va Aniqlanish Sohasi',
        userAns: 'B',
        correctAns: 'D',
        aiExplanation: 'O\'quvchi logarifm asosi va aniqlanish sohasida (x > 0) shartini unutib, nojo\'ya ildizni javobga kiritgan. Tavsiya: Logarifmik tenglamalarda aniqlanish sohasini tekshirish bo\'yicha 5 ta masala ishlash lozim.'
      }
    ]
  },
  {
    id: 'STU-902',
    name: 'Karimova Jamila Zokirovna',
    phone: '+998 91 234 56 78',
    region: 'Samarqand viloyati',
    school: '14-sonli Ixtisoslashtirilgan Maktab',
    grade: 10,
    correctAnswers: 28,
    totalQuestions: 30,
    percentage: 93.3,
    score: 93.3,
    timeSpentMinutes: 41,
    submittedAt: '2025-09-15 12:05',
    paymentType: 'Karta',
    certificateType: 'II darajali Diplom',
    wrongQuestionsList: [
      {
        questionNum: 12,
        topic: 'Trigonometrik Almashtirishlar',
        userAns: 'A',
        correctAns: 'C',
        aiExplanation: 'Sinus va kosinus yig\'indisini ko\'paytmaga o\'tkazish formulasida ishora xatosi qilingan. Tavsiya: Trigonometrik ayniyatlar burchak formulalarini takrorlash.'
      },
      {
        questionNum: 25,
        topic: 'Stereometriya: Prizma Hajmi',
        userAns: 'D',
        correctAns: 'B',
        aiExplanation: 'Prizma balandligini proyeksiyalashda burchak sinusini adashtirgan. Tavsiya: Fazoviy geometriyadan masalalar yechish.'
      }
    ]
  },
  {
    id: 'STU-903',
    name: 'Toshpulatov Jasur Alisherovich',
    phone: '+998 93 345 67 89',
    region: 'Buxoro viloyati',
    school: '5-sonli Gimnaziya',
    grade: 10,
    correctAnswers: 27,
    totalQuestions: 30,
    percentage: 90.0,
    score: 90.0,
    timeSpentMinutes: 45,
    submittedAt: '2025-09-15 11:15',
    paymentType: 'Hamyon',
    certificateType: 'III darajali Diplom',
    wrongQuestionsList: [
      {
        questionNum: 7,
        topic: 'Hosila va Funksiya Ekstremumlari',
        userAns: 'C',
        correctAns: 'A',
        aiExplanation: 'Statsionar nuqtada hosila ishorasi o\'zgarishini aniqlashda chalkashlik. Tavsiya: Funksiya hosilasini nollarga ajratish usulini ko\'zdan kechirish.'
      }
    ]
  },
  {
    id: 'STU-904',
    name: 'Sobirova Shahnoza Rustamovna',
    phone: '+998 94 456 78 90',
    region: 'Farg\'ona viloyati',
    school: '22-sonli Maktab',
    grade: 10,
    correctAnswers: 26,
    totalQuestions: 30,
    percentage: 86.7,
    score: 86.7,
    timeSpentMinutes: 48,
    submittedAt: '2025-09-15 13:20',
    paymentType: 'Karta',
    certificateType: 'Sertifikat'
  },
  {
    id: 'STU-905',
    name: 'Nazarov Bekzod Qodirovich',
    phone: '+998 97 567 89 01',
    region: 'Namangan viloyati',
    school: '8-sonli IDUM',
    grade: 10,
    correctAnswers: 25,
    totalQuestions: 30,
    percentage: 83.3,
    score: 83.3,
    timeSpentMinutes: 50,
    submittedAt: '2025-09-15 14:10',
    paymentType: 'Naqd',
    certificateType: 'Sertifikat'
  }
];

export const OlympiadFullEditor: React.FC<OlympiadFullEditorProps> = ({ olympiad, onBack }) => {
  const { updateOlympiad } = useOlympiadStore();
  const { packages } = usePackageStore();
  const { theme } = useThemeStore();
  const { i18n } = useTranslation();

  const isDark = theme === 'dark';
  const currentLang = i18n.language || 'uz';
  const t = (text: string) => translateText(text, currentLang);

  // Active Tab (5 Tabs)
  const [activeTab, setActiveTab] = useState<'main' | 'questions' | 'pricing' | 'schedule' | 'stats'>('main');
  const [savedSuccessMsg, setSavedSuccessMsg] = useState(false);

  // Form State initialized from olympiad object
  const [title, setTitle] = useState(olympiad.title);
  const [subject, setSubject] = useState(olympiad.subject);
  const [format, setFormat] = useState<'online' | 'offline'>(olympiad.format);
  const [status, setStatus] = useState<'ochiq' | 'yopiq'>(olympiad.status);
  const [location, setLocation] = useState(olympiad.location || '');
  const [organizer, setOrganizer] = useState(olympiad.organizer || 'NextOlymp Akademik Kengashi');
  const [image, setImage] = useState(olympiad.image);
  const [description, setDescription] = useState(olympiad.description);

  // Result Visibility & AI Analysis Settings
  const [showResultsToStudent, setShowResultsToStudent] = useState<boolean>(
    olympiad.showResultsToStudent !== false
  );
  const [aiAnalysisEnabled, setAiAnalysisEnabled] = useState<boolean>(
    olympiad.aiAnalysisEnabled !== false
  );
  const [resultsPublishDate, setResultsPublishDate] = useState<string>(
    olympiad.resultsPublishDate || '2025-09-16 10:00'
  );

  // Languages state
  const [allowedLanguages, setAllowedLanguages] = useState<string[]>(
    olympiad.allowedLanguages || ["O'zbek tili", "Rus tili", "Ingliz tili"]
  );

  // Target Grades state
  const [targetGrades, setTargetGrades] = useState<number[]>(
    olympiad.targetGrades || [5, 6, 7, 8, 9, 10, 11]
  );

  // Payment Methods state
  const [paymentMethods, setPaymentMethods] = useState<('naqd' | 'karta' | 'hamyon')[]>(
    olympiad.paymentMethods || ['karta', 'hamyon', 'naqd']
  );

  // Pricing State
  const [price, setPrice] = useState<number>(olympiad.price);
  const [isFreeForAll, setIsFreeForAll] = useState<boolean>(
    olympiad.isFreeForAll || olympiad.price === 0
  );
  const [separatePricesEnabled, setSeparatePricesEnabled] = useState<boolean>(
    olympiad.separatePricesEnabled || false
  );
  const [onlinePrice, setOnlinePrice] = useState<number>(olympiad.onlinePrice || olympiad.price);
  const [offlinePrice, setOfflinePrice] = useState<number>(olympiad.offlinePrice || olympiad.price + 15000);

  // Discount
  const [discountPercent, setDiscountPercent] = useState<number>(olympiad.discountPercent || 0);
  const [discountAmount, setDiscountAmount] = useState<number>(olympiad.discountAmount || 0);

  // Free Access Package
  const [freeForPackageId, setFreeForPackageId] = useState<string>(
    olympiad.freeForPackageId || 'PKG-003' // Default e.g. Pro or VIP
  );

  // Schedule Dates (5 Timestamps)
  const [registrationStartDate, setRegistrationStartDate] = useState<string>(
    olympiad.registrationStartDate || '2025-09-01 09:00'
  );
  const [registrationEndDate, setRegistrationEndDate] = useState<string>(
    olympiad.registrationEndDate || '2025-09-14 23:59'
  );
  const [startDate, setStartDate] = useState<string>(olympiad.startDate);
  const [endDate, setEndDate] = useState<string>(olympiad.endDate);

  // Date conversion helpers for datetime-local input
  const toDatetimeInput = (val?: string) => {
    if (!val) return '';
    return val.trim().replace(' ', 'T').slice(0, 16);
  };

  const fromDatetimeInput = (val: string) => {
    if (!val) return '';
    return val.replace('T', ' ');
  };

  // Date Validation Rule
  const dateValidationErrorMsg = useMemo(() => {
    if (!registrationEndDate || !startDate) return null;
    const rStart = registrationStartDate ? new Date(registrationStartDate.replace(' ', 'T')).getTime() : 0;
    const rEnd = new Date(registrationEndDate.replace(' ', 'T')).getTime();
    const st = new Date(startDate.replace(' ', 'T')).getTime();
    const end = endDate ? new Date(endDate.replace(' ', 'T')).getTime() : Infinity;

    if (rStart && rEnd && rEnd < rStart) {
      return "Ro'yxatdan o'tish yopilish vaqti boshlanish vaqtidan oldin bo'lishi mumkin emas!";
    }
    if (rEnd && st && rEnd > st) {
      return "Ro'yxatdan o'tish yopilish vaqti olimpiada boshlanish vaqtidan keyin bo'lishi mumkin emas! (Ro'yxatdan o'tish yopilishi <= Test boshlanishi)";
    }
    if (st && end && end <= st) {
      return "Testning tugash vaqti boshlanish vaqtidan keyin bo'lishi shart!";
    }
    return null;
  }, [registrationStartDate, registrationEndDate, startDate, endDate]);

  // Questions tab state
  const [questionsList, setQuestionsList] = useState<Question[]>(() => {
    const existing = MOCK_QUESTIONS[olympiad.id] || olympiad.questions;
    if (existing && existing.length > 0) return existing;
    return [
      {
        id: `q-${olympiad.id}-1`,
        olympiadId: olympiad.id,
        roundId: 'r1',
        type: 'multiple_choice',
        content: 'Agar 3x + 15 = 45 bo\'lsa, x ning qiymatini toping.',
        points: 10,
        order: 1,
        options: ['10', '12', '15', '20'],
        correctAnswer: 'A'
      },
      {
        id: `q-${olympiad.id}-2`,
        olympiadId: olympiad.id,
        roundId: 'r1',
        type: 'multiple_choice',
        content: 'Teng yonli uchburchakning asosidagi burchagi 50° bo\'lsa, uchi tepasidagi burchak necha gradus?',
        points: 15,
        order: 2,
        options: ['60°', '70°', '80°', '90°'],
        correctAnswer: 'C'
      }
    ];
  });

  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [qContent, setQContent] = useState('');
  const [qType, setQType] = useState<QuestionType>('multiple_choice');
  const [qPoints, setQPoints] = useState<number>(10);
  const [qImageUrl, setQImageUrl] = useState<string>('');
  const [qCorrectAnswer, setQCorrectAnswer] = useState<string>('A');

  // Dynamic Option text & images state
  const [optionsList, setOptionsList] = useState<{ text: string; img?: string }[]>([
    { text: 'Variant A', img: '' },
    { text: 'Variant B', img: '' },
    { text: 'Variant C', img: '' },
    { text: 'Variant D', img: '' }
  ]);

  const totalQuestionsScore = useMemo(() => {
    return questionsList.reduce((sum, q) => sum + (q.points || 0), 0);
  }, [questionsList]);

  const openAddQuestionModal = () => {
    setEditingQuestion(null);
    setQContent('');
    setQType('multiple_choice');
    setQPoints(10);
    setQImageUrl('');
    setQCorrectAnswer('A');
    setOptionsList([
      { text: 'Variant 1', img: '' },
      { text: 'Variant 2', img: '' },
      { text: 'Variant 3', img: '' },
      { text: 'Variant 4', img: '' }
    ]);
    setIsQuestionModalOpen(true);
  };

  const openEditQuestionModal = (q: Question) => {
    setEditingQuestion(q);
    setQContent(q.content);
    setQType(q.type);
    setQPoints(q.points || 10);
    setQImageUrl(q.imageUrl || '');
    setQCorrectAnswer(q.correctAnswer || (q.type === 'multiple_choice' ? 'A' : ''));
    if (q.options && q.options.length > 0) {
      setOptionsList(
        q.options.map((optText, idx) => ({
          text: optText,
          img: q.optionImages?.[idx] || ''
        }))
      );
    } else {
      setOptionsList([
        { text: '', img: '' },
        { text: '', img: '' }
      ]);
    }
    setIsQuestionModalOpen(true);
  };

  const handleQuestionImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      if (reader.result) setQImageUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleOptionTextChange = (index: number, val: string) => {
    setOptionsList((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], text: val };
      return copy;
    });
  };

  const handleOptionImageUpload = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      if (reader.result) {
        const res = reader.result as string;
        setOptionsList((prev) => {
          const copy = [...prev];
          copy[index] = { ...copy[index], img: res };
          return copy;
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveOptionImage = (index: number) => {
    setOptionsList((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], img: '' };
      return copy;
    });
  };

  const handleAddOption = () => {
    setOptionsList((prev) => [...prev, { text: '', img: '' }]);
  };

  const handleRemoveOption = (index: number) => {
    if (optionsList.length <= 1) return;
    setOptionsList((prev) => prev.filter((_, i) => i !== index));
    const removedLetter = String.fromCharCode(65 + index);
    if (qCorrectAnswer === removedLetter) {
      setQCorrectAnswer('A');
    }
  };

  const handleDocxImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const importedQuestions = await parseDocxQuestions(file, olympiad.id);
      if (importedQuestions.length === 0) {
        alert("⚠️ Fayldan savollar topilmadi. Shablon formatiga mosligini tekshiring!\nMasalan:\n1. Savol matni. [10 ball]\nA) Variant 1\nB) Variant 2*");
        return;
      }

      const updated = [...questionsList, ...importedQuestions];
      setQuestionsList(updated);
      MOCK_QUESTIONS[olympiad.id] = updated;

      alert(`✅ Muvaffaqiyatli: Word fayldan ${importedQuestions.length} ta savol ajratib olindi va qo'shildi!`);
    } catch (err) {
      console.error("Docx import error:", err);
      alert("❌ Faylni o'qishda xatolik yuz berdi. Iltimos, standart .docx fayl ekanligiga ishonch hosil qiling.");
    } finally {
      e.target.value = '';
    }
  };

  const handleSaveQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!qContent.trim()) return;

    const options = qType === 'multiple_choice'
      ? optionsList.map((o) => o.text.trim()).filter((o) => o !== '')
      : undefined;

    const optionImages = qType === 'multiple_choice'
      ? optionsList.map((o) => o.img || '')
      : undefined;

    const questionPayload: Partial<Question> = {
      content: qContent.trim(),
      type: qType,
      points: Number(qPoints) || 10,
      imageUrl: qImageUrl || undefined,
      options,
      optionImages,
      correctAnswer: qCorrectAnswer || undefined
    };

    if (editingQuestion) {
      const updated = questionsList.map((item) =>
        item.id === editingQuestion.id ? { ...item, ...questionPayload } : item
      );
      setQuestionsList(updated);
      MOCK_QUESTIONS[olympiad.id] = updated;
    } else {
      const newQ: Question = {
        id: `q-${Date.now()}`,
        olympiadId: olympiad.id,
        roundId: 'r1',
        type: qType,
        content: qContent.trim(),
        points: Number(qPoints) || 10,
        order: questionsList.length + 1,
        imageUrl: qImageUrl || undefined,
        options,
        optionImages,
        correctAnswer: qCorrectAnswer || undefined
      };
      const updated = [...questionsList, newQ];
      setQuestionsList(updated);
      MOCK_QUESTIONS[olympiad.id] = updated;
    }

    setIsQuestionModalOpen(false);
  };

  const handleDeleteQuestion = (qId: string) => {
    const updated = questionsList.filter((q) => q.id !== qId);
    setQuestionsList(updated);
    MOCK_QUESTIONS[olympiad.id] = updated;
  };

  // Participant Results Filter
  const [participantSearchTerm, setParticipantSearchTerm] = useState('');

  // Selected Student for AI Analysis Modal
  const [selectedStudentForAi, setSelectedStudentForAi] = useState<ParticipantResult | null>(null);

  // Handle Cover Image File Upload
  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      if (reader.result) {
        setImage(reader.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  // Toggle Language
  const toggleLanguage = (lang: string) => {
    if (allowedLanguages.includes(lang)) {
      if (allowedLanguages.length === 1) return; // keep at least 1
      setAllowedLanguages(allowedLanguages.filter((l) => l !== lang));
    } else {
      setAllowedLanguages([...allowedLanguages, lang]);
    }
  };

  // Toggle Grade
  const toggleGrade = (grade: number) => {
    if (targetGrades.includes(grade)) {
      if (targetGrades.length === 1) return;
      setTargetGrades(targetGrades.filter((g) => g !== grade));
    } else {
      setTargetGrades([...targetGrades, grade].sort((a, b) => a - b));
    }
  };

  // Preset Grade Selection
  const selectGradePreset = (preset: 'all' | 'primary' | 'middle' | 'high') => {
    if (preset === 'all') setTargetGrades(ALL_GRADES);
    else if (preset === 'primary') setTargetGrades([1, 2, 3, 4]);
    else if (preset === 'middle') setTargetGrades([5, 6, 7, 8, 9]);
    else if (preset === 'high') setTargetGrades([10, 11]);
  };

  // Toggle Payment Method
  const togglePaymentMethod = (method: 'naqd' | 'karta' | 'hamyon') => {
    if (paymentMethods.includes(method)) {
      if (paymentMethods.length === 1) return;
      setPaymentMethods(paymentMethods.filter((m) => m !== method));
    } else {
      setPaymentMethods([...paymentMethods, method]);
    }
  };

  // Calculate discounted final price preview
  const getCalculatedPrice = (base: number) => {
    let finalP = base;
    if (discountPercent > 0) {
      finalP = Math.max(0, base - (base * discountPercent) / 100);
    } else if (discountAmount > 0) {
      finalP = Math.max(0, base - discountAmount);
    }
    return finalP;
  };

  // Filtered Participants List
  const filteredParticipants = useMemo(() => {
    return MOCK_PARTICIPANTS.filter((p) => {
      const q = participantSearchTerm.toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        p.phone.includes(q) ||
        p.region.toLowerCase().includes(q) ||
        p.school.toLowerCase().includes(q) ||
        p.certificateType.toLowerCase().includes(q)
      );
    });
  }, [participantSearchTerm]);

  // Export Results to Excel
  const handleExportResultsExcel = () => {
    const exportData = filteredParticipants.map((p, idx) => ({
      'O\'rin': idx + 1,
      'Ishtirokchi ID': p.id,
      'F.I.Sh.': p.name,
      'Telefon': p.phone,
      'Viloyat / Shahar': p.region,
      'Maktab / Maskon': p.school,
      'Sinf': `${p.grade}-sinf`,
      'To\'g\'ri javoblar': `${p.correctAnswers} / ${p.totalQuestions}`,
      'Natija (%)': `${p.percentage}%`,
      'Sarflangan vaqt (daq)': `${p.timeSpentMinutes} min`,
      'Topshirgan vaqti': p.submittedAt,
      'To\'lov turi': p.paymentType,
      'Diplom / Sertifikat': p.certificateType
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'ISHTIROKCHILAR_NATIJALARI');
    XLSX.writeFile(workbook, `${olympiad.id}_Natijalar_Ruyhati.xlsx`);
  };

  // Save handler
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    if (dateValidationErrorMsg) {
      alert(`⚠️ Xatolik: ${dateValidationErrorMsg}`);
      return;
    }

    MOCK_QUESTIONS[olympiad.id] = questionsList;

    updateOlympiad(olympiad.id, {
      title,
      subject,
      format,
      status,
      location: format === 'offline' ? location : undefined,
      organizer,
      image,
      description,
      showResultsToStudent,
      resultsPublishDate,
      aiAnalysisEnabled,
      allowedLanguages,
      targetGrades,
      paymentMethods,
      isFreeForAll,
      separatePricesEnabled,
      price: isFreeForAll ? 0 : separatePricesEnabled ? (format === 'online' ? onlinePrice : offlinePrice) : price,
      onlinePrice,
      offlinePrice,
      discountPercent,
      discountAmount,
      freeForPackageId,
      registrationStartDate,
      registrationEndDate,
      startDate,
      endDate,
      questions: questionsList
    });

    setSavedSuccessMsg(true);
    setTimeout(() => setSavedSuccessMsg(false), 3000);
  };

  return (
    <div className="space-y-5 font-sans text-xs">
      {/* Header & Back Navigation */}
      <div
        className={clsx(
          "p-4 rounded-2xl border shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors",
          isDark ? "bg-[#0D1832] border-[#182A4D]" : "bg-white border-slate-200"
        )}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className={clsx(
              "p-2.5 rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 font-bold",
              isDark
                ? "bg-[#142347] border-[#1E3666] text-slate-200 hover:text-white hover:border-amber-400"
                : "bg-slate-100 border-slate-300 text-slate-700 hover:text-slate-900 hover:border-slate-400"
            )}
          >
            <ArrowLeft className="w-4 h-4 text-amber-400" />
            <span>{t("Ro'yxatga qaytish")}</span>
          </button>

          <div>
            <div className="flex items-center gap-2">
              <h1 className={clsx("text-base font-extrabold", isDark ? "text-white" : "text-slate-900")}>
                {title || olympiad.title}
              </h1>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                {olympiad.id}
              </span>
            </div>
            <p className={clsx("text-[11px] mt-0.5", isDark ? "text-slate-400" : "text-slate-500")}>
              {t("Olimpiada ma'lumotlari, tasnif, qamrov, sinflar, narxlar va AI natija sozlamalarini tahrirlash")}
            </p>
          </div>
        </div>

        {/* Top Right Action Controls */}
        <div className="flex items-center gap-2">
          {savedSuccessMsg && (
            <span className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 rounded-xl text-xs font-bold animate-pulse">
              <CheckCircle2 className="w-4 h-4" />
              <span>{t("O'zgarishlar saqlandi!")}</span>
            </span>
          )}

          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black rounded-xl text-xs shadow-md transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{t("Saqlash")}</span>
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div
        className={clsx(
          "flex items-center gap-2 p-1.5 rounded-xl border overflow-x-auto custom-scrollbar transition-colors",
          isDark ? "bg-[#091024] border-[#182A4D]" : "bg-slate-100 border-slate-200"
        )}
      >
        <button
          onClick={() => setActiveTab('main')}
          className={clsx(
            "flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-all text-xs cursor-pointer whitespace-nowrap",
            activeTab === 'main'
              ? "bg-amber-500 text-slate-950 shadow-sm"
              : isDark
              ? "text-slate-400 hover:text-white hover:bg-[#14244A]"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-200"
          )}
        >
          <Trophy className="w-4 h-4" />
          <span>{t("Asosiy Sozlamalar & Qamrov")}</span>
        </button>

        <button
          onClick={() => setActiveTab('questions')}
          className={clsx(
            "flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-all text-xs cursor-pointer whitespace-nowrap",
            activeTab === 'questions'
              ? "bg-amber-500 text-slate-950 shadow-sm"
              : isDark
              ? "text-slate-400 hover:text-white hover:bg-[#14244A]"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-200"
          )}
        >
          <HelpCircle className="w-4 h-4" />
          <span>{t("Savollar Bazasi & Ballar")} ({questionsList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('pricing')}
          className={clsx(
            "flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-all text-xs cursor-pointer whitespace-nowrap",
            activeTab === 'pricing'
              ? "bg-amber-500 text-slate-950 shadow-sm"
              : isDark
              ? "text-slate-400 hover:text-white hover:bg-[#14244A]"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-200"
          )}
        >
          <DollarSign className="w-4 h-4" />
          <span>{t("Narx, To'lov & Paket Imtiyozi")}</span>
        </button>

        <button
          onClick={() => setActiveTab('schedule')}
          className={clsx(
            "flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-all text-xs cursor-pointer whitespace-nowrap",
            activeTab === 'schedule'
              ? "bg-amber-500 text-slate-950 shadow-sm"
              : isDark
              ? "text-slate-400 hover:text-white hover:bg-[#14244A]"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-200"
          )}
        >
          <Calendar className="w-4 h-4" />
          <span>{t("Vaqt va AI Natija Sozlamalari")}</span>
        </button>

        <button
          onClick={() => setActiveTab('stats')}
          className={clsx(
            "flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-all text-xs cursor-pointer whitespace-nowrap",
            activeTab === 'stats'
              ? "bg-amber-500 text-slate-950 shadow-sm"
              : isDark
              ? "text-slate-400 hover:text-white hover:bg-[#14244A]"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-200"
          )}
        >
          <Users className="w-4 h-4" />
          <span>{t("Ishtirokchilar va AI Natijalar Tahlili")}</span>
        </button>
      </div>

      {/* TAB 1: ASOSIY SOZLAMALAR & QAMROV */}
      {activeTab === 'main' && (
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Left 2 Cols: Main Inputs */}
            <div
              className={clsx(
                "lg:col-span-2 p-5 rounded-2xl border space-y-4 transition-colors",
                isDark ? "bg-[#0D1832] border-[#182A4D]" : "bg-white border-slate-200"
              )}
            >
              <h2 className={clsx("text-sm font-bold flex items-center gap-2 border-b pb-2.5", isDark ? "text-white border-[#182A4D]" : "text-slate-900 border-slate-200")}>
                <Trophy className="w-4 h-4 text-amber-400" />
                <span>{t("Olimpiada Tasnifi va Nomi")}</span>
              </h2>

              {/* Title */}
              <div>
                <label className={clsx("block text-xs font-bold mb-1.5", isDark ? "text-slate-300" : "text-slate-700")}>
                  {t("Olimpiada Nomi *")}
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Masalan: Respublika Fizika Musobaqasi 2025"
                  className={clsx(
                    "w-full rounded-xl px-3.5 py-2.5 text-xs outline-none border font-semibold",
                    isDark ? "bg-[#091024] border-[#1A2F57] focus:border-amber-400 text-white" : "bg-slate-50 border-slate-300 focus:border-amber-500 text-slate-900"
                  )}
                />
              </div>

              {/* Format & Status & Subject */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className={clsx("block text-xs font-bold mb-1.5", isDark ? "text-slate-300" : "text-slate-700")}>
                    {t("Qatnashish Rejimi *")}
                  </label>
                  <select
                    value={format}
                    onChange={(e) => setFormat(e.target.value as any)}
                    className={clsx(
                      "w-full rounded-xl px-3 py-2.5 text-xs outline-none border font-bold",
                      format === 'online' ? "text-blue-400" : "text-purple-400",
                      isDark ? "bg-[#091024] border-[#1A2F57]" : "bg-slate-50 border-slate-300"
                    )}
                  >
                    <option value="online">🌐 Online (Masofaviy)</option>
                    <option value="offline">📍 Offline (Joyida / Bino)</option>
                  </select>
                </div>

                <div>
                  <label className={clsx("block text-xs font-bold mb-1.5", isDark ? "text-slate-300" : "text-slate-700")}>
                    {t("Fan *")}
                  </label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className={clsx(
                      "w-full rounded-xl px-3 py-2.5 text-xs outline-none border font-bold text-amber-300",
                      isDark ? "bg-[#091024] border-[#1A2F57]" : "bg-slate-50 border-slate-300 text-amber-600"
                    )}
                  >
                    <option value="Matematika">Matematika</option>
                    <option value="Ingliz tili">Ingliz tili</option>
                    <option value="Fizika">Fizika</option>
                    <option value="Biologiya">Biologiya</option>
                    <option value="Informatika">Informatika</option>
                    <option value="Kimyo">Kimyo</option>
                    <option value="Ona tili">Ona tili va Adabiyot</option>
                    <option value="Tarix">Tarix</option>
                    <option value="Geografiya">Geografiya</option>
                  </select>
                </div>

                <div>
                  <label className={clsx("block text-xs font-bold mb-1.5", isDark ? "text-slate-300" : "text-slate-700")}>
                    {t("Holati")}
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className={clsx(
                      "w-full rounded-xl px-3 py-2.5 text-xs outline-none border font-bold",
                      status === 'ochiq' ? "text-emerald-400" : "text-rose-400",
                      isDark ? "bg-[#091024] border-[#1A2F57]" : "bg-slate-50 border-slate-300"
                    )}
                  >
                    <option value="ochiq">🟢 Ochiq (Ro'yxatdan o'tish faol)</option>
                    <option value="yopiq">🔴 Yopiq (Tugagan / Yopilgan)</option>
                  </select>
                </div>
              </div>

              {/* Location (If Offline) */}
              {format === 'offline' && (
                <div className="p-3.5 rounded-xl bg-purple-500/10 border border-purple-500/30 space-y-1.5">
                  <label className="block text-xs font-bold text-purple-300 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-purple-400" />
                    <span>{t("Manzil va Joylashuv (Offline o'tkazilish joyi)")} *</span>
                  </label>
                  <input
                    type="text"
                    required={format === 'offline'}
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Masalan: Toshkent shahri, Yunusobod tumani, 1-sonli litsey binosi 3-qavat"
                    className={clsx(
                      "w-full rounded-lg px-3 py-2 text-xs outline-none border",
                      isDark ? "bg-[#091024] border-[#1A2F57] text-white" : "bg-white border-slate-300 text-slate-900"
                    )}
                  />
                </div>
              )}

              {/* Organizer & Banner Image Upload */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className={clsx("block text-xs font-bold mb-1.5", isDark ? "text-slate-300" : "text-slate-700")}>
                    {t("Tashkilotchi / Kengash")}
                  </label>
                  <input
                    type="text"
                    value={organizer}
                    onChange={(e) => setOrganizer(e.target.value)}
                    className={clsx(
                      "w-full rounded-xl px-3 py-2.5 text-xs outline-none border",
                      isDark ? "bg-[#091024] border-[#1A2F57] text-white" : "bg-slate-50 border-slate-300 text-slate-900"
                    )}
                  />
                </div>

                {/* Muqova Rasm URL & File Upload */}
                <div>
                  <label className={clsx("block text-xs font-bold mb-1.5", isDark ? "text-slate-300" : "text-slate-700")}>
                    {t("Muqova Rasm (Banner Image URL / Fayl Upload)")} *
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={image}
                      onChange={(e) => setImage(e.target.value)}
                      placeholder="Rasm URL havolasi..."
                      className={clsx(
                        "flex-1 rounded-xl px-3 py-2.5 text-xs outline-none border font-mono text-[11px]",
                        isDark ? "bg-[#091024] border-[#1A2F57] text-white" : "bg-slate-50 border-slate-300 text-slate-900"
                      )}
                    />
                    <label className="flex items-center gap-1.5 px-3 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs cursor-pointer shadow-xs whitespace-nowrap">
                      <Upload className="w-3.5 h-3.5 text-amber-300" />
                      <span>{t("Upload")}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageFileUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              </div>

              {/* QAMROV BO'LIMI 1: TILLAR BO'LIMI */}
              <div className="pt-3 border-t border-[#182A4D] space-y-2">
                <label className={clsx("block text-xs font-bold flex items-center gap-2", isDark ? "text-white" : "text-slate-900")}>
                  <Languages className="w-4 h-4 text-indigo-400" />
                  <span>{t("Tillar bo'limi (Mavjud bo'lgan javob tillari)")} *</span>
                </label>
                <p className="text-[11px] text-slate-400">
                  {t("Ishtirokchilar olimpiadani qaysi tillarda topshira olishlarini tanlang (galochka orqali):")}
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
                  {ALL_LANGUAGES.map((lang) => {
                    const isChecked = allowedLanguages.includes(lang);
                    return (
                      <button
                        type="button"
                        key={lang}
                        onClick={() => toggleLanguage(lang)}
                        className={clsx(
                          "flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer text-left",
                          isChecked
                            ? isDark
                              ? "bg-indigo-600/20 border-indigo-500/60 text-indigo-300 shadow-xs"
                              : "bg-indigo-50 border-indigo-400 text-indigo-700"
                            : isDark
                            ? "bg-[#091024] border-[#16284D] text-slate-400 hover:text-white"
                            : "bg-slate-50 border-slate-200 text-slate-600"
                        )}
                      >
                        {isChecked ? (
                          <CheckSquare className="w-4 h-4 text-indigo-400 shrink-0" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-500 shrink-0" />
                        )}
                        <span>{lang}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* QAMROV BO'LIMI 2: MAVJUD SINFLAR */}
              <div className="pt-3 border-t border-[#182A4D] space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <label className={clsx("block text-xs font-bold flex items-center gap-2", isDark ? "text-white" : "text-slate-900")}>
                      <GraduationCap className="w-4 h-4 text-amber-400" />
                      <span>{t("Mavjud Sinflar (Kimlar qatnasha oladi?)")} *</span>
                    </label>
                    <p className="text-[11px] text-slate-400">
                      {t("Ushbu olimpiadada qatnashishi mumkin bo'lgan sinflarni belgilang:")}
                    </p>
                  </div>

                  {/* Preset Buttons */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <button
                      type="button"
                      onClick={() => selectGradePreset('all')}
                      className="px-2 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-lg text-[10px] font-bold"
                    >
                      Barchasi (1-11)
                    </button>
                    <button
                      type="button"
                      onClick={() => selectGradePreset('primary')}
                      className="px-2 py-1 bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded-lg text-[10px] font-bold"
                    >
                      1-4 sinflar
                    </button>
                    <button
                      type="button"
                      onClick={() => selectGradePreset('middle')}
                      className="px-2 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-lg text-[10px] font-bold"
                    >
                      5-9 sinflar
                    </button>
                    <button
                      type="button"
                      onClick={() => selectGradePreset('high')}
                      className="px-2 py-1 bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-lg text-[10px] font-bold"
                    >
                      10-11 sinflar
                    </button>
                  </div>
                </div>

                {/* Grade Grid */}
                <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-11 gap-1.5 pt-1">
                  {ALL_GRADES.map((grade) => {
                    const isChecked = targetGrades.includes(grade);
                    return (
                      <button
                        type="button"
                        key={grade}
                        onClick={() => toggleGrade(grade)}
                        className={clsx(
                          "py-2 px-1.5 rounded-xl border text-center font-bold text-xs transition-all cursor-pointer flex flex-col items-center justify-center gap-1",
                          isChecked
                            ? isDark
                              ? "bg-amber-500 text-slate-950 border-amber-400 font-extrabold shadow-sm scale-105"
                              : "bg-amber-500 text-slate-950 border-amber-600 font-extrabold shadow-sm scale-105"
                            : isDark
                            ? "bg-[#091024] border-[#16284D] text-slate-400 hover:text-white"
                            : "bg-slate-50 border-slate-200 text-slate-600"
                        )}
                      >
                        <span>{grade}-{t("sinf")}</span>
                      </button>
                    );
                  })}
                </div>
                <div className="text-[11px] text-amber-300 font-semibold mt-1">
                  Tanlangan sinflar: {targetGrades.map((g) => `${g}-sinf`).join(', ')}
                </div>
              </div>
            </div>

            {/* Right 1 Col: Live Image Preview Card */}
            <div
              className={clsx(
                "p-5 rounded-2xl border space-y-4 transition-colors flex flex-col justify-between",
                isDark ? "bg-[#0D1832] border-[#182A4D]" : "bg-white border-slate-200"
              )}
            >
              <div className="space-y-3">
                <h3 className={clsx("text-xs font-extrabold uppercase tracking-wider text-slate-400 border-b pb-2", isDark ? "border-[#182A4D]" : "border-slate-200")}>
                  {t("Muqova Rasm va Karta Preview")}
                </h3>

                <div className="relative h-44 rounded-xl overflow-hidden bg-slate-900 border border-white/10 group">
                  <img src={image} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />
                  <div className="absolute top-2 left-2 flex gap-1">
                    <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase bg-blue-600 text-white">
                      {format}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase bg-emerald-600 text-white">
                      {status}
                    </span>
                  </div>
                  <div className="absolute bottom-2 left-2 right-2">
                    <div className="text-xs font-bold text-white line-clamp-1">{title || 'Olimpiada Nomi'}</div>
                    <div className="text-[10px] text-amber-300 font-semibold">{subject}</div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-black/20 border border-white/10 space-y-2 text-[11px]">
                  <div className="flex justify-between items-center text-slate-300">
                    <span>{t("Ruxsat etilgan tillar")}:</span>
                    <span className="font-bold text-indigo-300">{allowedLanguages.length} ta til</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-300">
                    <span>{t("Maqsadli sinflar")}:</span>
                    <span className="font-bold text-amber-300">{targetGrades.length} ta sinf</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-300">
                    <span>{t("Qatnashish Rejimi")}:</span>
                    <span className="font-bold uppercase text-blue-300">{format}</span>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black rounded-xl text-xs shadow-md"
              >
                {t("O'zgarishlarni saqlash")}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* TAB 2: SAVOLLAR BAZASI VA BALLAR */}
      {activeTab === 'questions' && (
        <div
          className={clsx(
            "p-5 rounded-2xl border space-y-4 transition-colors",
            isDark ? "bg-[#0D1832] border-[#182A4D]" : "bg-white border-slate-200"
          )}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3.5 border-slate-700/50">
            <div>
              <h2 className={clsx("text-base font-bold flex items-center gap-2", isDark ? "text-white" : "text-slate-900")}>
                <HelpCircle className="w-5 h-5 text-amber-400" />
                <span>{t("Ushbu Musobaqaga Biriktirilgan Savollar va Ballar")}</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Jami {questionsList.length} ta savol kiritilgan • Umumiy ball summasi: <span className="font-extrabold text-amber-400 font-mono">{totalQuestionsScore} ball</span>
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <label className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs shadow-md transition-all cursor-pointer whitespace-nowrap">
                <FileText className="w-4 h-4" />
                <span>📄 Word'dan import qilish (.docx)</span>
                <input
                  type="file"
                  accept=".docx"
                  onChange={handleDocxImport}
                  className="hidden"
                />
              </label>

              <button
                onClick={openAddQuestionModal}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl text-xs shadow-md transition-all cursor-pointer whitespace-nowrap"
              >
                <Plus className="w-4 h-4" />
                <span>{t("Yangi Savol Qo'shish")}</span>
              </button>
            </div>
          </div>

          {questionsList.length === 0 ? (
            <div className="p-8 text-center border border-dashed border-slate-700 rounded-2xl space-y-2">
              <HelpCircle className="w-8 h-8 text-slate-500 mx-auto" />
              <p className="text-xs text-slate-400">Hali birorta ham savol qo'shilmagan.</p>
              <button
                onClick={openAddQuestionModal}
                className="px-3 py-1.5 bg-blue-600 text-white font-bold rounded-lg text-xs cursor-pointer"
              >
                Savol Qo'shish
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {questionsList.map((q, idx) => (
                <div
                  key={q.id}
                  className={clsx(
                    "p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3",
                    isDark ? "bg-[#091024] border-[#182A4D] hover:border-amber-500/40" : "bg-slate-50 border-slate-200"
                  )}
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono font-black text-xs text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                        #{idx + 1}-savol
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-500/20 text-blue-300 border border-blue-500/40">
                        {q.type}
                      </span>
                      <span className="px-2.5 py-0.5 rounded text-[11px] font-black font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                        {q.points || 10} ball
                      </span>
                    </div>

                    <p className={clsx("text-xs font-semibold leading-relaxed", isDark ? "text-white" : "text-slate-900")}>
                      {q.content}
                    </p>

                    {/* Question Image Preview if present */}
                    {q.imageUrl && (
                      <div className="pt-1">
                        <img
                          src={q.imageUrl}
                          alt="Savol rasmi"
                          className="h-28 rounded-lg object-cover border border-slate-700 bg-slate-900"
                        />
                      </div>
                    )}

                    {/* Correct Answer Badge */}
                    {q.correctAnswer && (
                      <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-400">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>To'g'ri javob: <span className="font-mono underline">{q.correctAnswer}</span></span>
                      </div>
                    )}

                    {/* Multiple Choice Options List with Images & Correct Choice Highlight */}
                    {q.options && q.options.length > 0 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 pt-1.5">
                        {q.options.map((opt, oIdx) => {
                          const optionLetter = String.fromCharCode(65 + oIdx);
                          const isCorrect = q.correctAnswer === optionLetter || q.correctAnswer === opt;
                          const optImg = q.optionImages?.[oIdx];

                          return (
                            <div
                              key={oIdx}
                              className={clsx(
                                "p-2 rounded-lg text-[11px] border flex flex-col justify-between gap-1 transition-all",
                                isCorrect
                                  ? "bg-emerald-500/20 border-emerald-500/60 text-emerald-300 font-bold shadow-xs"
                                  : isDark
                                  ? "bg-[#0D1832] border-[#182A4D] text-slate-300"
                                  : "bg-white border-slate-300 text-slate-700"
                              )}
                            >
                              <div className="flex items-center justify-between gap-1">
                                <div className="truncate">
                                  <span className="font-black text-amber-400 mr-1">{optionLetter}:</span>
                                  <span>{opt}</span>
                                </div>
                                {isCorrect && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                              </div>

                              {optImg && (
                                <img
                                  src={optImg}
                                  alt={`Option ${optionLetter}`}
                                  className="h-16 w-full object-cover rounded border border-white/10"
                                />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => openEditQuestionModal(q)}
                      className="p-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer transition-all"
                      title="Tahrirlash"
                    >
                      <Pencil className="w-3.5 h-3.5 text-amber-400" />
                      <span>Tahrirlash</span>
                    </button>
                    <button
                      onClick={() => handleDeleteQuestion(q.id)}
                      className="p-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-lg text-xs cursor-pointer transition-all"
                      title="O'chirish"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: NARX, TO'LOV & PAKET IMTIYOZI */}
      {activeTab === 'pricing' && (
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Box 1: To'lov usullari (Galochka bilan) */}
            <div
              className={clsx(
                "p-5 rounded-2xl border space-y-4 transition-colors",
                isDark ? "bg-[#0D1832] border-[#182A4D]" : "bg-white border-slate-200"
              )}
            >
              <h2 className={clsx("text-sm font-bold flex items-center gap-2 border-b pb-2.5", isDark ? "text-white border-[#182A4D]" : "text-slate-900 border-slate-200")}>
                <CreditCard className="w-4 h-4 text-emerald-400" />
                <span>{t("To'lov Usullari (Galochka orqali belgilash)")} *</span>
              </h2>

              <p className="text-[11px] text-slate-400">
                {t("Ishtirokchilar ushbu olimpiada uchun qaysi usullarda to'lov qila olishlarini belgilang:")}
              </p>

              <div className="space-y-2.5">
                {/* Method 1: Karta */}
                <button
                  type="button"
                  onClick={() => togglePaymentMethod('karta')}
                  className={clsx(
                    "w-full flex items-center justify-between p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer",
                    paymentMethods.includes('karta')
                      ? isDark
                        ? "bg-blue-600/20 border-blue-500/60 text-blue-300"
                        : "bg-blue-50 border-blue-400 text-blue-800"
                      : isDark
                      ? "bg-[#091024] border-[#16284D] text-slate-400"
                      : "bg-slate-50 border-slate-200 text-slate-600"
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <CreditCard className="w-4 h-4 text-blue-400 shrink-0" />
                    <div>
                      <div>{t("Karta orqali to'lov (Uzcard, Humo, Visa, Payme, Click)")}</div>
                      <div className="text-[10px] text-slate-400 font-normal">{t("Avtomatik onlayn to'lov va darhol aktivlashish")}</div>
                    </div>
                  </div>
                  {paymentMethods.includes('karta') ? (
                    <CheckSquare className="w-5 h-5 text-blue-400 shrink-0" />
                  ) : (
                    <Square className="w-5 h-5 text-slate-500 shrink-0" />
                  )}
                </button>

                {/* Method 2: Hamyon */}
                <button
                  type="button"
                  onClick={() => togglePaymentMethod('hamyon')}
                  className={clsx(
                    "w-full flex items-center justify-between p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer",
                    paymentMethods.includes('hamyon')
                      ? isDark
                        ? "bg-purple-600/20 border-purple-500/60 text-purple-300"
                        : "bg-purple-50 border-purple-400 text-purple-800"
                      : isDark
                      ? "bg-[#091024] border-[#16284D] text-slate-400"
                      : "bg-slate-50 border-slate-200 text-slate-600"
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <Wallet className="w-4 h-4 text-purple-400 shrink-0" />
                    <div>
                      <div>{t("Hamyon (NextOlymp Shaxsiy Balansi)")}</div>
                      <div className="text-[10px] text-slate-400 font-normal">{t("Foydalanuvchining shaxsiy hamyonidagi mablag'dan yechish")}</div>
                    </div>
                  </div>
                  {paymentMethods.includes('hamyon') ? (
                    <CheckSquare className="w-5 h-5 text-purple-400 shrink-0" />
                  ) : (
                    <Square className="w-5 h-5 text-slate-500 shrink-0" />
                  )}
                </button>

                {/* Method 3: Naqd pul */}
                <button
                  type="button"
                  onClick={() => togglePaymentMethod('naqd')}
                  className={clsx(
                    "w-full flex items-center justify-between p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer",
                    paymentMethods.includes('naqd')
                      ? isDark
                        ? "bg-amber-600/20 border-amber-500/60 text-amber-300"
                        : "bg-amber-50 border-amber-400 text-amber-800"
                      : isDark
                      ? "bg-[#091024] border-[#16284D] text-slate-400"
                      : "bg-slate-50 border-slate-200 text-slate-600"
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <Coins className="w-4 h-4 text-amber-400 shrink-0" />
                    <div>
                      <div>{t("Naqd pul to'lovi (Joyida / Kassa orqali)")}</div>
                      <div className="text-[10px] text-slate-400 font-normal">{t("Oflayn bino kassisiga yoki maktabda topshirish")}</div>
                    </div>
                  </div>
                  {paymentMethods.includes('naqd') ? (
                    <CheckSquare className="w-5 h-5 text-amber-400 shrink-0" />
                  ) : (
                    <Square className="w-5 h-5 text-slate-500 shrink-0" />
                  )}
                </button>
              </div>

              {/* PAKET IMTIYOZI (FREE ACCESS FOR PACKAGE SUBSCRIBERS) */}
              <div className="pt-3 border-t border-[#182A4D] space-y-3">
                <label className={clsx("block text-xs font-bold flex items-center gap-2", isDark ? "text-white" : "text-slate-900")}>
                  <Gift className="w-4 h-4 text-emerald-400" />
                  <span>{t("Paket Egalari Uchun Bepul Qatnashish Imtiyozi")} *</span>
                </label>
                <p className="text-[11px] text-slate-400">
                  {t("Paketlar bo'limidagi qaysi paket obunachilariga ushbu olimpiadada bepul qatnashish imkoniyatini berasiz?")}
                </p>

                <select
                  value={freeForPackageId}
                  onChange={(e) => setFreeForPackageId(e.target.value)}
                  className={clsx(
                    "w-full rounded-xl px-3.5 py-2.5 text-xs outline-none border font-bold text-emerald-400",
                    isDark ? "bg-[#091024] border-[#1A2F57]" : "bg-slate-50 border-slate-300 text-emerald-700"
                  )}
                >
                  <option value="none">❌ Imtiyozsiz (Barcha ishtirokchilar to'lov qiladi)</option>
                  <option value="all">🌟 Barcha pullik paket egalari (Standard, Pro, VIP) uchun BEPUL</option>
                  {packages.map((pkg) => (
                    <option key={pkg.id} value={pkg.id}>
                      🎁 {pkg.nomi} ({pkg.narxi.toLocaleString()} UZS/oy) obunachilari uchun BEPUL
                    </option>
                  ))}
                </select>

                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-[11px] text-emerald-300 space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>Imtiyoz Holati:</span>
                  </div>
                  <div>
                    {freeForPackageId === 'none'
                      ? "Hech qaysi paket egalariga bepul berilmagan."
                      : freeForPackageId === 'all'
                      ? "Barcha Standard, Pro va VIP paket sotib olgan foydalanuvchilar to'lov qilmasdan qatnashadi."
                      : `Faqat ${packages.find((p) => p.id === freeForPackageId)?.nomi || freeForPackageId} paketi foydalanuvchilari uchun 100% BEPUL.`}
                  </div>
                </div>
              </div>
            </div>

            {/* Box 2: Narx va Chegirma Belgilash */}
            <div
              className={clsx(
                "p-5 rounded-2xl border space-y-4 transition-colors",
                isDark ? "bg-[#0D1832] border-[#182A4D]" : "bg-white border-slate-200"
              )}
            >
              <h2 className={clsx("text-sm font-bold flex items-center gap-2 border-b pb-2.5", isDark ? "text-white border-[#182A4D]" : "text-slate-900 border-slate-200")}>
                <DollarSign className="w-4 h-4 text-amber-400" />
                <span>{t("Narx va Chegirma Sozlamalari")}</span>
              </h2>

              {/* Hamma uchun BEPUL Toggle */}
              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                    <Gift className="w-4 h-4 text-emerald-300" />
                    <span>{t("🌟 Hamma Uchun BEPUL (0 UZS)")}</span>
                  </div>
                  <div className="text-[10px] text-slate-300 mt-0.5">
                    {t("Ushbu olimpiadada barcha ishtirokchilar to'lov qilmasdan 100% BEPUL qatnashadi")}
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={isFreeForAll}
                  onChange={(e) => {
                    setIsFreeForAll(e.target.checked);
                    if (e.target.checked) setPrice(0);
                  }}
                  className="w-5 h-5 accent-emerald-500 cursor-pointer"
                />
              </div>

              {/* Separate Price Toggle */}
              <div className="p-3 rounded-xl bg-black/20 border border-white/10 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-white">{t("Online va Offline narxni alohida belgilash")}</div>
                  <div className="text-[10px] text-slate-400">{t("Onlayn va oflayn qatnashish uchun har xil narx belgilash")}</div>
                </div>
                <input
                  type="checkbox"
                  checked={separatePricesEnabled}
                  onChange={(e) => setSeparatePricesEnabled(e.target.checked)}
                  className="w-4 h-4 accent-amber-500 cursor-pointer"
                />
              </div>

              {/* Price inputs */}
              {!separatePricesEnabled ? (
                <div>
                  <label className={clsx("block text-xs font-bold mb-1.5", isDark ? "text-slate-300" : "text-slate-700")}>
                    {t("Asosiy Ishtirok Narxi (UZS) *")}
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className={clsx(
                      "w-full rounded-xl px-3.5 py-2.5 text-xs outline-none border font-mono font-bold text-amber-400 text-sm",
                      isDark ? "bg-[#091024] border-[#1A2F57]" : "bg-slate-50 border-slate-300 text-amber-600"
                    )}
                  />
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={clsx("block text-xs font-bold mb-1.5 text-blue-300")}>
                      🌐 {t("Online Narxi (UZS) *")}
                    </label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={onlinePrice}
                      onChange={(e) => setOnlinePrice(Number(e.target.value))}
                      className={clsx(
                        "w-full rounded-xl px-3 py-2 text-xs outline-none border font-mono font-bold text-blue-400 text-sm",
                        isDark ? "bg-[#091024] border-[#1A2F57]" : "bg-slate-50 border-slate-300"
                      )}
                    />
                  </div>

                  <div>
                    <label className={clsx("block text-xs font-bold mb-1.5 text-purple-300")}>
                      📍 {t("Offline Narxi (UZS) *")}
                    </label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={offlinePrice}
                      onChange={(e) => setOfflinePrice(Number(e.target.value))}
                      className={clsx(
                        "w-full rounded-xl px-3 py-2 text-xs outline-none border font-mono font-bold text-purple-300 text-sm",
                        isDark ? "bg-[#091024] border-[#1A2F57]" : "bg-slate-50 border-slate-300"
                      )}
                    />
                  </div>
                </div>
              )}

              {/* CHEGIRMA SOZLAMALARI */}
              <div className="pt-3 border-t border-[#182A4D] space-y-3">
                <label className={clsx("block text-xs font-bold flex items-center gap-2", isDark ? "text-white" : "text-slate-900")}>
                  <Percent className="w-4 h-4 text-rose-400" />
                  <span>{t("Chegirma Qo'shish (Aksiya)")}</span>
                </label>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={clsx("block text-[11px] font-semibold mb-1", isDark ? "text-slate-300" : "text-slate-700")}>
                      {t("Chegirma Foizida (%)")}
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={discountPercent}
                      onChange={(e) => {
                        setDiscountPercent(Number(e.target.value));
                        setDiscountAmount(0);
                      }}
                      placeholder="Masalan: 15%"
                      className={clsx(
                        "w-full rounded-xl px-3 py-2 text-xs outline-none border font-mono font-bold text-rose-400",
                        isDark ? "bg-[#091024] border-[#1A2F57]" : "bg-slate-50 border-slate-300"
                      )}
                    />
                  </div>

                  <div>
                    <label className={clsx("block text-[11px] font-semibold mb-1", isDark ? "text-slate-300" : "text-slate-700")}>
                      {t("Yoki Chegirma Summasi (UZS)")}
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={discountAmount}
                      onChange={(e) => {
                        setDiscountAmount(Number(e.target.value));
                        setDiscountPercent(0);
                      }}
                      placeholder="Masalan: 5000"
                      className={clsx(
                        "w-full rounded-xl px-3 py-2 text-xs outline-none border font-mono font-bold text-rose-400",
                        isDark ? "bg-[#091024] border-[#1A2F57]" : "bg-slate-50 border-slate-300"
                      )}
                    />
                  </div>
                </div>

                {/* Final calculated price summary */}
                <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex justify-between items-center text-xs">
                  <div>
                    <div className="text-slate-400 font-semibold">{t("Yakuniy To'lov Summasi (Aksiya bilan)")}:</div>
                    <div className="text-[10px] text-slate-500">
                      {discountPercent > 0
                        ? `${discountPercent}% chegirma qo'llanildi`
                        : discountAmount > 0
                        ? `${discountAmount.toLocaleString()} UZS chegirma qo'llanildi`
                        : 'Chegirmasiz standart narx'}
                    </div>
                  </div>
                  <div className="text-base font-black font-mono text-amber-300">
                    {getCalculatedPrice(separatePricesEnabled ? (format === 'online' ? onlinePrice : offlinePrice) : price).toLocaleString()} UZS
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black rounded-xl text-xs shadow-md"
                >
                  {t("Narxlarni saqlash")}
                </button>
              </div>
            </div>
          </div>
        </form>
      )}

      {/* TAB 4: VAQT VA AI NATIJA SOZLAMALARI */}
      {activeTab === 'schedule' && (
        <form onSubmit={handleSave} className="space-y-4">
          <div
            className={clsx(
              "p-5 rounded-2xl border space-y-5 transition-colors",
              isDark ? "bg-[#0D1832] border-[#182A4D]" : "bg-white border-slate-200"
            )}
          >
            <h2 className={clsx("text-sm font-bold flex items-center gap-2 border-b pb-2.5", isDark ? "text-white border-[#182A4D]" : "text-slate-900 border-slate-200")}>
              <Clock className="w-4 h-4 text-blue-400" />
              <span>{t("Ro'yxatdan o'tish va Testni Boshlash/Tugash Vaqtlari (DateTime Picker)")}</span>
            </h2>

            {/* Validation Error Alert Banner */}
            {dateValidationErrorMsg && (
              <div className="p-3.5 rounded-xl bg-rose-500/20 border border-rose-500/50 text-rose-300 text-xs font-bold flex items-center gap-2 animate-bounce">
                <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
                <span>⚠️ {dateValidationErrorMsg}</span>
              </div>
            )}

            {/* 4 Distinct Timestamps Grid with datetime-local picker */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* 1. Registration Start */}
              <div className="p-3.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 space-y-1.5">
                <label className="block text-xs font-extrabold text-cyan-300 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                  <span>1. {t("Ro'yxatdan O'tish Boshlanishi")} *</span>
                </label>
                <input
                  type="datetime-local"
                  required
                  value={toDatetimeInput(registrationStartDate)}
                  onChange={(e) => setRegistrationStartDate(fromDatetimeInput(e.target.value))}
                  className={clsx(
                    "w-full rounded-lg px-3 py-2 text-xs outline-none border font-mono font-bold text-cyan-400 cursor-pointer",
                    isDark ? "bg-[#091024] border-[#1A2F57]" : "bg-white border-slate-300 text-slate-900"
                  )}
                />
                <p className="text-[10px] text-slate-400">{t("Foydalanuvchilar qabulining boshlanish sanasi va soati")}</p>
              </div>

              {/* 2. Registration End */}
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-1.5">
                <label className="block text-xs font-extrabold text-amber-300 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>2. {t("Ro'yxatdan O'tish Yopilishi")} *</span>
                </label>
                <input
                  type="datetime-local"
                  required
                  value={toDatetimeInput(registrationEndDate)}
                  onChange={(e) => setRegistrationEndDate(fromDatetimeInput(e.target.value))}
                  className={clsx(
                    "w-full rounded-lg px-3 py-2 text-xs outline-none border font-mono font-bold text-amber-400 cursor-pointer",
                    isDark ? "bg-[#091024] border-[#1A2F57]" : "bg-white border-slate-300 text-slate-900"
                  )}
                />
                <p className="text-[10px] text-slate-400">{t("Ro'yxatdan o'tish yopilishi (Test boshlanishidan keyin bo'la olmaydi)")}</p>
              </div>

              {/* 3. Test Start */}
              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 space-y-1.5">
                <label className="block text-xs font-extrabold text-emerald-300 flex items-center gap-1.5">
                  <Trophy className="w-3.5 h-3.5 text-emerald-400" />
                  <span>3. {t("Testni Boshlash Vaqti")} *</span>
                </label>
                <input
                  type="datetime-local"
                  required
                  value={toDatetimeInput(startDate)}
                  onChange={(e) => setStartDate(fromDatetimeInput(e.target.value))}
                  className={clsx(
                    "w-full rounded-lg px-3 py-2 text-xs outline-none border font-mono font-bold text-emerald-400 cursor-pointer",
                    isDark ? "bg-[#091024] border-[#1A2F57]" : "bg-white border-slate-300 text-slate-900"
                  )}
                />
                <p className="text-[10px] text-slate-400">{t("Olimpiada savollari va test sahifasi ochiladigan vaqt")}</p>
              </div>

              {/* 4. Test End */}
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 space-y-1.5">
                <label className="block text-xs font-extrabold text-rose-300 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-rose-400" />
                  <span>4. {t("Testni Tugash Vaqti")} *</span>
                </label>
                <input
                  type="datetime-local"
                  required
                  value={toDatetimeInput(endDate)}
                  onChange={(e) => setEndDate(fromDatetimeInput(e.target.value))}
                  className={clsx(
                    "w-full rounded-lg px-3 py-2 text-xs outline-none border font-mono font-bold text-rose-400 cursor-pointer",
                    isDark ? "bg-[#091024] border-[#1A2F57]" : "bg-white border-slate-300 text-slate-900"
                  )}
                />
                <p className="text-[10px] text-slate-400">{t("Olimpiada savollari yopilishi va javoblarni qabul qilish o'chishi")}</p>
              </div>
            </div>

            {/* NATIJALARNI E'LON QILISH VA AI NATIJA SOZLAMALARI */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-900/30 to-indigo-900/30 border border-indigo-500/40 space-y-4">
              <h3 className="text-xs font-extrabold text-indigo-300 flex items-center gap-2">
                <Bot className="w-4 h-4 text-amber-300" />
                <span>{t("AI va Test Natijasini E'lon Qilish Sozlamalari")}</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* Setting 1: Show/Hide Test Result */}
                <div className="p-3 rounded-xl bg-black/30 border border-white/10 flex items-start justify-between gap-3">
                  <div>
                    <div className="text-xs font-bold text-white flex items-center gap-1.5">
                      {showResultsToStudent ? <Eye className="w-3.5 h-3.5 text-emerald-400" /> : <EyeOff className="w-3.5 h-3.5 text-rose-400" />}
                      <span>{t("Natijani Darhol Ko'rsatish")}</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                      {showResultsToStudent
                        ? t("Test yakunlanishi bilan ball va reyting darhol o'quvchiga ko'rinadi.")
                        : t("Natijalar rasmiy e'lon sanasigacha yashiriladi.")}
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={showResultsToStudent}
                    onChange={(e) => setShowResultsToStudent(e.target.checked)}
                    className="w-5 h-5 accent-emerald-500 cursor-pointer shrink-0 mt-0.5"
                  />
                </div>

                {/* Setting 2: Result Announcement Date */}
                <div className="p-3 rounded-xl bg-black/30 border border-white/10 space-y-1.5">
                  <label className="block text-xs font-bold text-purple-300 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-purple-400" />
                    <span>{t("Natijalarni E'lon Qilish Sanasi")}</span>
                  </label>
                  <input
                    type="datetime-local"
                    value={toDatetimeInput(resultsPublishDate)}
                    onChange={(e) => setResultsPublishDate(fromDatetimeInput(e.target.value))}
                    className={clsx(
                      "w-full rounded-lg px-2.5 py-1.5 text-xs outline-none border font-mono font-bold text-purple-300 cursor-pointer",
                      isDark ? "bg-[#091024] border-[#1A2F57]" : "bg-white border-slate-300 text-slate-900"
                    )}
                  />
                  <p className="text-[10px] text-slate-400">{t("Reyting avtomatik yangilanib e'lon qilinadigan vaqt")}</p>
                </div>

                {/* Setting 3: AI Mistakes Analysis */}
                <div className="p-3 rounded-xl bg-black/30 border border-white/10 flex items-start justify-between gap-3">
                  <div>
                    <div className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                      <span>{t("AI Xatolar Tahlili Moduli")}</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                      {aiAnalysisEnabled
                        ? t("Sun'iy intellekt har bir xato savol bo'yicha kamchiliklarni ko'rsatib beradi.")
                        : t("AI tahlil o'chirilgan.")}
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={aiAnalysisEnabled}
                    onChange={(e) => setAiAnalysisEnabled(e.target.checked)}
                    className="w-5 h-5 accent-amber-500 cursor-pointer shrink-0 mt-0.5"
                  />
                </div>
              </div>
            </div>

            {/* Description & Rules */}
            <div>
              <label className={clsx("block text-xs font-bold mb-1.5", isDark ? "text-slate-300" : "text-slate-700")}>
                {t("Batafsil Tavsif va Olimpiada Qoidalari")}
              </label>
              <textarea
                rows={5}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Olimpiada qoidalari, baholash mezonlari va tartibi..."
                className={clsx(
                  "w-full rounded-xl px-3.5 py-2.5 text-xs outline-none border resize-none leading-relaxed",
                  isDark ? "bg-[#091024] border-[#1A2F57] text-white" : "bg-slate-50 border-slate-300 text-slate-900"
                )}
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={Boolean(dateValidationErrorMsg)}
                className={clsx(
                  "px-6 py-2.5 font-black rounded-xl text-xs shadow-md transition-all",
                  dateValidationErrorMsg
                    ? "bg-slate-700 text-slate-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 cursor-pointer"
                )}
              >
                {t("Vaqt va AI Sozlamalarini Saqlash")}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* TAB 4: ISHTIROKCHILAR VA NATIJALAR RO'YXATI (AI TAHLIL BILAN) */}
      {activeTab === 'stats' && (
        <div className="space-y-4">
          {/* Top 4 Summary Stat Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-center">
              <div className="text-[10px] text-slate-400 font-semibold uppercase">{t("Ro'yxatdan O'tganlar")}</div>
              <div className="text-xl font-black text-blue-400 font-mono mt-1">{olympiad.registeredCount.toLocaleString()} {t("kishi")}</div>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center">
              <div className="text-[10px] text-slate-400 font-semibold uppercase">{t("Topshirganlar")}</div>
              <div className="text-xl font-black text-emerald-400 font-mono mt-1">{olympiad.submittedCount.toLocaleString()} {t("kishi")}</div>
            </div>

            <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-center">
              <div className="text-[10px] text-slate-400 font-semibold uppercase">{t("To'lov Qilganlar")}</div>
              <div className="text-xl font-black text-purple-300 font-mono mt-1">{olympiad.paidCount.toLocaleString()} {t("kishi")}</div>
            </div>

            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-center">
              <div className="text-[10px] text-slate-400 font-semibold uppercase">{t("Jami Tushum")}</div>
              <div className="text-lg font-black text-amber-300 font-mono mt-1">{olympiad.totalRevenue.toLocaleString()} UZS</div>
            </div>
          </div>

          {/* Participants Table Container */}
          <div
            className={clsx(
              "p-5 rounded-2xl border space-y-4 transition-colors",
              isDark ? "bg-[#0D1832] border-[#182A4D]" : "bg-white border-slate-200"
            )}
          >
            {/* Header & Search / Excel Export Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-b pb-3">
              <div>
                <h2 className={clsx("text-sm font-bold flex items-center gap-2", isDark ? "text-white" : "text-slate-900")}>
                  <Award className="w-4 h-4 text-amber-400" />
                  <span>{t("Ishtirokchilar Natijalari va AI Xatolar Tahlili")}</span>
                </h2>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {t("Har bir o'quvchining to'g'ri javoblari, AI tahlili va kamchilik sabablarini ko'rish")}
                </p>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="relative w-full sm:w-64">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Ishtirokchi nomi bo'yicha..."
                    value={participantSearchTerm}
                    onChange={(e) => setParticipantSearchTerm(e.target.value)}
                    className={clsx(
                      "w-full rounded-xl pl-9 pr-3 py-1.5 text-xs outline-none border transition-all",
                      isDark ? "bg-[#091024] border-[#1A2F57] text-white" : "bg-slate-50 border-slate-300 text-slate-900"
                    )}
                  />
                </div>

                <button
                  onClick={handleExportResultsExcel}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs shadow-xs transition-all cursor-pointer whitespace-nowrap"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>{t("Excel'da yuklash")}</span>
                </button>
              </div>
            </div>

            {/* Results Table */}
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left text-xs">
                <thead
                  className={clsx(
                    "text-[11px] uppercase tracking-wider border-b font-semibold whitespace-nowrap",
                    isDark ? "bg-[#101E3C] text-slate-400 border-[#182A4D]" : "bg-slate-100 text-slate-600 border-slate-200"
                  )}
                >
                  <tr>
                    <th className="py-2.5 px-3 w-12 text-center">№</th>
                    <th className="py-2.5 px-3">{t("Ishtirokchi (F.I.Sh.)")}</th>
                    <th className="py-2.5 px-3">{t("Hudud / Maktab")}</th>
                    <th className="py-2.5 px-3">{t("Sinf")}</th>
                    <th className="py-2.5 px-3">{t("Nechta Topgan (To'g'ri / Jami)")}</th>
                    <th className="py-2.5 px-3">{t("Natija (%)")}</th>
                    <th className="py-2.5 px-3">{t("To'lov Maqomi")}</th>
                    <th className="py-2.5 px-3 text-right">{t("AI Natija va Xatolar Tahlili")}</th>
                  </tr>
                </thead>
                <tbody className={clsx("divide-y", isDark ? "divide-[#152545]" : "divide-slate-200")}>
                  {filteredParticipants.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-400">
                        {t("Ishtirokchilar topilmadi")}
                      </td>
                    </tr>
                  ) : (
                    filteredParticipants.map((p, idx) => (
                      <tr key={p.id} className={clsx("transition-colors", isDark ? "hover:bg-[#132244]" : "hover:bg-slate-50")}>
                        {/* Rank */}
                        <td className="py-3 px-3 text-center font-bold text-xs whitespace-nowrap">
                          {idx === 0 ? (
                            <span className="px-2 py-0.5 rounded bg-amber-500 text-slate-950 font-black">1 🥇</span>
                          ) : idx === 1 ? (
                            <span className="px-2 py-0.5 rounded bg-slate-300 text-slate-950 font-black">2 🥈</span>
                          ) : idx === 2 ? (
                            <span className="px-2 py-0.5 rounded bg-amber-700 text-white font-black">3 🥉</span>
                          ) : (
                            <span className="text-slate-400 font-mono">{idx + 1}</span>
                          )}
                        </td>

                        {/* Name & Phone */}
                        <td className="py-3 px-3 whitespace-nowrap">
                          <div className="font-bold text-white text-xs">{p.name}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{p.phone} · {p.id}</div>
                        </td>

                        {/* Region & School */}
                        <td className="py-3 px-3 whitespace-nowrap">
                          <div className="font-semibold text-slate-300">{p.region}</div>
                          <div className="text-[10px] text-slate-400">{p.school}</div>
                        </td>

                        {/* Grade */}
                        <td className="py-3 px-3 whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                            {p.grade}-sinf
                          </span>
                        </td>

                        {/* Correct Answers */}
                        <td className="py-3 px-3 whitespace-nowrap font-mono font-bold text-emerald-400 text-sm">
                          {p.correctAnswers} / {p.totalQuestions} <span className="text-[10px] text-slate-400 font-normal">ta to'g'ri</span>
                        </td>

                        {/* Percentage */}
                        <td className="py-3 px-3 whitespace-nowrap font-mono font-bold text-cyan-400 text-xs">
                          {p.percentage}%
                        </td>

                        {/* Payment Type */}
                        <td className="py-3 px-3 whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40">
                            {p.paymentType}
                          </span>
                        </td>

                        {/* Action: Open AI Mistake Analysis Modal */}
                        <td className="py-3 px-3 text-right whitespace-nowrap">
                          <button
                            onClick={() => setSelectedStudentForAi(p)}
                            className="px-3 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 ml-auto cursor-pointer shadow-xs transition-all"
                          >
                            <Bot className="w-3.5 h-3.5 text-amber-300" />
                            <span>{t("🤖 AI Xatolar Tahlili")}</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: AI STUDENT MISTAKE & WEAKNESS ANALYSIS */}
      {selectedStudentForAi && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div
            className={clsx(
              "rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 border transition-colors max-h-[90vh] overflow-y-auto custom-scrollbar",
              isDark ? "bg-[#0D1832] border-[#1E3563]" : "bg-white border-slate-200"
            )}
          >
            {/* Modal Header */}
            <div className={clsx("flex items-center justify-between border-b pb-3", isDark ? "border-[#182A4D]" : "border-slate-200")}>
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-indigo-400" />
                <h3 className={clsx("text-sm font-extrabold", isDark ? "text-white" : "text-slate-900")}>
                  {t("AI Test Natijasi va Xatolar Tahlili")} — {selectedStudentForAi.name}
                </h3>
              </div>
              <button
                onClick={() => setSelectedStudentForAi(null)}
                className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Visibility State Banner */}
            <div className={clsx(
              "p-3 rounded-xl border flex items-center justify-between text-xs font-bold",
              showResultsToStudent
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                : "bg-rose-500/10 border-rose-500/30 text-rose-400"
            )}>
              <div className="flex items-center gap-2">
                {showResultsToStudent ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                <span>
                  {showResultsToStudent
                    ? t("O'quvchi uchun ushbu natija va AI tahlil ko'rsatilmoqda (OCHIQ)")
                    : t("Natija yashirilgan! O'quvchi bu ma'lumotni hali ko'ra olmaydi (YASHIRILGAN)")}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowResultsToStudent(!showResultsToStudent)}
                className="px-2.5 py-1 bg-black/40 hover:bg-black/60 rounded-lg text-[10px] uppercase font-mono font-extrabold cursor-pointer transition-all"
              >
                {showResultsToStudent ? t("Yashirish") : t("Ko'rsatish")}
              </button>
            </div>

            {/* Student Stats Summary Bar */}
            <div className="grid grid-cols-3 gap-2.5 text-center font-mono">
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <div className="text-[10px] text-slate-400 font-sans">{t("To'g'ri Javoblar")}</div>
                <div className="text-base font-black text-emerald-400 mt-0.5">
                  {selectedStudentForAi.correctAnswers} / {selectedStudentForAi.totalQuestions}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
                <div className="text-[10px] text-slate-400 font-sans">{t("Natija Foizi")}</div>
                <div className="text-base font-black text-cyan-400 mt-0.5">
                  {selectedStudentForAi.percentage}%
                </div>
              </div>

              <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20">
                <div className="text-[10px] text-slate-400 font-sans">{t("Sarflangan Vaqt")}</div>
                <div className="text-base font-black text-purple-300 mt-0.5">
                  {selectedStudentForAi.timeSpentMinutes} min
                </div>
              </div>
            </div>

            {/* AI Mistake Breakdown Section */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-bold text-amber-300 flex items-center gap-1.5 uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>{t("✨ AI Sun'iy Intellektning Xatolar Tahlili va Kamchiliklar Sharhi")}</span>
              </h4>

              {/* Strengths & Weaknesses Summary Box */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-purple-900/40 to-indigo-900/40 border border-indigo-500/40 space-y-2 text-xs leading-relaxed">
                <div className="font-bold text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{t("Kuchli Tomonlari")}:</span>
                </div>
                <p className="text-slate-200">
                  O'quvchi {olympiad.subject} fani bo'yicha bazaviy nazariya va tezkor masalalar yechishda a'lo natija ko'rsatgan (96.7% aniqlik).
                </p>

                <div className="font-bold text-rose-400 flex items-center gap-1.5 pt-2">
                  <AlertCircle className="w-4 h-4" />
                  <span>{t("Kamchilik va Kuchsiz Tomonlari")}:</span>
                </div>
                <p className="text-slate-200">
                  Murakkab ko'p bosqichli mantiqiy va logarifmik almashtirish tenglamalarida e'tiborsizlik sababli 1 ta xatoga yo'l qo'yilgan.
                </p>
              </div>

              {/* Detailed Wrong Questions List with AI Explanation */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-300">{t("Xato qilingan savollar tahlili:")}</div>

                {(!selectedStudentForAi.wrongQuestionsList || selectedStudentForAi.wrongQuestionsList.length === 0) ? (
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>O'quvchi deyarli barcha savollarga to'g'ri javob bergan! Ishda jiddiy xatolar aniqlanmadi.</span>
                  </div>
                ) : (
                  selectedStudentForAi.wrongQuestionsList.map((item) => (
                    <div key={item.questionNum} className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 space-y-2 text-xs">
                      <div className="flex items-center justify-between font-bold text-rose-300">
                        <span>Savol №{item.questionNum}: {item.topic}</span>
                        <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 text-[10px] font-mono">
                          Xato (O'quvchi: {item.userAns} | To'g'ri: {item.correctAns})
                        </span>
                      </div>

                      <div className="p-2.5 rounded-lg bg-black/40 border border-white/10 text-slate-200 leading-relaxed font-sans">
                        <div className="text-amber-300 font-bold text-[11px] mb-1 flex items-center gap-1">
                          <Bot className="w-3.5 h-3.5" />
                          <span>AI Tushuntirishi va Tavsiyasi:</span>
                        </div>
                        {item.aiExplanation}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end pt-3 border-t border-white/10">
              <button
                onClick={() => setSelectedStudentForAi(null)}
                className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs shadow-md cursor-pointer"
              >
                {t("Yopish")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: YANGI SAVOL QO'SHISH YOKI TAHRIRLASH */}
      <Modal
        isOpen={isQuestionModalOpen}
        onClose={() => setIsQuestionModalOpen(false)}
        title={editingQuestion ? "Savolni Tahrirlash" : "Yangi Savol Qo'shish"}
        size="lg"
      >
        <form onSubmit={handleSaveQuestion} className="space-y-4 font-sans text-xs">
          {/* Savol Matni va Savol Rasmi Upload */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-800">
                Savol Sharti / Matni *
              </label>
              <label className="flex items-center gap-1.5 px-3 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-lg text-xs cursor-pointer border border-indigo-200 transition-all">
                <ImageIcon className="w-3.5 h-3.5 text-indigo-600" />
                <span>Savolga rasm biriktirish</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleQuestionImageUpload}
                  className="hidden"
                />
              </label>
            </div>

            <textarea
              required
              rows={3}
              value={qContent}
              onChange={(e) => setQContent(e.target.value)}
              placeholder="Masalan: Mantiqiy masalani yeching yoki rasmdagi holatni tahlil qiling..."
              className="w-full p-2.5 text-xs border border-slate-300 rounded-xl bg-white outline-none focus:border-blue-500 font-medium"
            />

            {/* Question Image Preview */}
            {qImageUrl && (
              <div className="relative inline-block border border-slate-200 rounded-xl p-1 bg-slate-50">
                <img src={qImageUrl} alt="Savol rasmi" className="h-28 object-cover rounded-lg" />
                <button
                  type="button"
                  onClick={() => setQImageUrl('')}
                  className="absolute top-2 right-2 p-1 bg-rose-600 text-white rounded-full hover:bg-rose-700 shadow-md cursor-pointer"
                  title="Rasmni o'chirish"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Savol Turi
              </label>
              <select
                value={qType}
                onChange={(e) => {
                  const newType = e.target.value as QuestionType;
                  setQType(newType);
                  if (newType === 'multiple_choice') setQCorrectAnswer('A');
                  else setQCorrectAnswer('');
                }}
                className="w-full p-2.5 text-xs border border-slate-300 rounded-xl bg-white font-bold text-slate-900"
              >
                <option value="multiple_choice">Ko'p variantli (Test - A, B, C, D)</option>
                <option value="open_text">Ochiq matnli javob</option>
                <option value="file_upload">Fayl/Rasm yuklash</option>
                <option value="code">Kod yozish (Informatika)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Har Bir Savol Uchun Ball (Points) *
              </label>
              <input
                type="number"
                required
                min={1}
                value={qPoints}
                onChange={(e) => setQPoints(Number(e.target.value))}
                className="w-full p-2.5 text-xs border border-slate-300 rounded-xl bg-white font-mono font-bold text-emerald-600"
              />
            </div>
          </div>

          {/* Ochiq matnli va boshqa turlar uchun etalon javob kiritish */}
          {qType !== 'multiple_choice' && (
            <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl space-y-1.5">
              <label className="block text-xs font-bold text-blue-900 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-blue-600" />
                <span>To'g'ri Javob Matni / Etalon Javob Kaliti *</span>
              </label>
              <input
                type="text"
                required
                value={qCorrectAnswer}
                onChange={(e) => setQCorrectAnswer(e.target.value)}
                placeholder="Masalan: 42 (O'quvchi kiritgan javob bilan solishtiriladi)"
                className="w-full p-2.5 text-xs border border-blue-300 rounded-xl bg-white font-bold text-blue-700 outline-none"
              />
            </div>
          )}

          {/* Ko'p variantli variantlar (dinamik), Rasmlar & To'g'ri variant belgilash */}
          {qType === 'multiple_choice' && (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <label className="block text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Variantlar ({optionsList.length} ta) va To'g'ri Javobni Belgilash</span>
                </label>
                <span className="text-[10px] text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded-full">
                  Tanlangan to'g'ri javob: <span className="font-mono">{qCorrectAnswer}</span>
                </span>
              </div>

              <div className="space-y-2.5">
                {optionsList.map((optItem, idx) => {
                  const optionLetter = String.fromCharCode(65 + idx);
                  const isSelectedCorrect = qCorrectAnswer === optionLetter || qCorrectAnswer === optItem.text;

                  return (
                    <div
                      key={idx}
                      className={clsx(
                        "p-2.5 rounded-xl border transition-all space-y-2",
                        isSelectedCorrect
                          ? "bg-emerald-50/80 border-emerald-400 shadow-xs"
                          : "bg-white border-slate-200"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        {/* Radio selection for correct answer */}
                        <label className="flex items-center gap-1.5 cursor-pointer shrink-0">
                          <input
                            type="radio"
                            name="correctOptionRadio"
                            checked={isSelectedCorrect}
                            onChange={() => setQCorrectAnswer(optionLetter)}
                            className="w-4 h-4 accent-emerald-600 cursor-pointer"
                          />
                          <span
                            className={clsx(
                              "font-black text-xs px-2 py-0.5 rounded font-mono",
                              isSelectedCorrect ? "bg-emerald-600 text-white" : "bg-slate-200 text-slate-700"
                            )}
                          >
                            {optionLetter}
                          </span>
                        </label>

                        {/* Option Text Input */}
                        <input
                          type="text"
                          required
                          value={optItem.text}
                          onChange={(e) => handleOptionTextChange(idx, e.target.value)}
                          placeholder={`${optionLetter} variant matni...`}
                          className="flex-1 p-2 text-xs border border-slate-300 rounded-lg outline-none focus:border-blue-500 font-medium"
                        />

                        {/* Image upload button icon on the right side */}
                        <label
                          className={clsx(
                            "p-2 rounded-lg border flex items-center gap-1 cursor-pointer transition-all shrink-0 text-xs font-bold",
                            optItem.img
                              ? "bg-blue-600 text-white border-blue-500"
                              : "bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300"
                          )}
                          title={`${optionLetter} variantiga rasm yuklash`}
                        >
                          <ImageIcon className="w-4 h-4" />
                          <span className="hidden sm:inline">{optItem.img ? 'Rasm' : 'Rasm'}</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleOptionImageUpload(idx, e)}
                            className="hidden"
                          />
                        </label>

                        {/* Delete option button */}
                        {optionsList.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveOption(idx)}
                            className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg border border-transparent hover:border-rose-200 cursor-pointer"
                            title="Variantni o'chirish"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      {/* Option Image Preview */}
                      {optItem.img && (
                        <div className="relative inline-block border border-slate-300 rounded-lg p-1 bg-slate-50 ml-7">
                          <img src={optItem.img} alt={`Variant ${optionLetter}`} className="h-16 object-cover rounded" />
                          <button
                            type="button"
                            onClick={() => handleRemoveOptionImage(idx)}
                            className="absolute -top-1.5 -right-1.5 p-0.5 bg-rose-600 text-white rounded-full hover:bg-rose-700 shadow-md cursor-pointer"
                            title="Variant rasmini o'chirish"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Button to add another option */}
              <button
                type="button"
                onClick={handleAddOption}
                className="w-full py-2 bg-white hover:bg-slate-100 border border-dashed border-slate-300 text-slate-700 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all"
              >
                <Plus className="w-4 h-4 text-blue-600" />
                <span>+ Variant qo'shish ({String.fromCharCode(65 + optionsList.length)})</span>
              </button>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
            <Button type="button" variant="ghost" onClick={() => setIsQuestionModalOpen(false)}>
              Bekor qilish
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-6">
              Saqlash
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
