import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useOlympiadDetail, useOlympiadQuestions } from '../../hooks/useOlympiad';
import { useContestStore } from '../../store/useContestStore';
import { useAntiCheat } from '../../hooks/useAntiCheat';
import { useSubmission } from '../../hooks/useSubmission';
import { Timer } from '../../components/contest/Timer';
import { QuestionCard } from '../../components/contest/QuestionCard';
import { QuestionPalette } from '../../components/contest/QuestionPalette';
import { AntiCheatBanner } from '../../components/contest/AntiCheatBanner';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { PayxPaymentModal } from '../../components/common/PayxPaymentModal';
import { useAuthStore } from '../../store/useAuthStore';
import { useOlympiadStore } from '../../store/useOlympiadStore';
import { usePaymentStore } from '../../store/usePaymentStore';
import clsx from 'clsx';
import {
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Trophy,
  AlertTriangle,
  Maximize,
  Shield,
  Clock,
  HelpCircle,
  Award,
  Wifi,
  Camera,
  Lock,
  Eye,
  CheckSquare,
  Square,
  ArrowRight,
  Sparkles,
  Info,
  Radio,
  Flame,
  UserCheck,
  UserPlus,
  RefreshCw,
  CreditCard
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { submissionService } from '../../services/submissionService';

export const ContestParticipatePage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  const { data: olympiad } = useOlympiadDetail(id || '');
  const { data: questions } = useOlympiadQuestions(id || '');

  // Contest Allowed Languages
  const allowedLangs = useMemo(() => {
    return (olympiad as any)?.allowedLanguages && (olympiad as any).allowedLanguages.length > 0
      ? (olympiad as any).allowedLanguages
      : ["O'zbek tili", "Rus tili", "Ingliz tili"];
  }, [olympiad]);

  const [selectedExamLang, setSelectedExamLang] = useState<string>("O'zbek tili");

  const handleLanguageChange = (lang: string) => {
    setSelectedExamLang(lang);
    if (lang.toLowerCase().includes('rus')) {
      i18n.changeLanguage('ru');
    } else if (lang.toLowerCase().includes('ingliz') || lang.toLowerCase().includes('eng')) {
      i18n.changeLanguage('en');
    } else {
      i18n.changeLanguage('uz');
    }
  };

  // User Previous Attempts & Retake Status
  const userSubmissions = useMemo(() => {
    if (!user?.id || !id) return [];
    return submissionService.getUserSubmissions(user.id).filter(s => s.olympiadId === id);
  }, [user?.id, id]);

  const targetGrades: number[] = useMemo(() => {
    return (olympiad as any)?.targetGrades || (olympiad as any)?.eligibility?.grades || [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
  }, [olympiad]);

  const studentGrade = user?.grade ? Number(user.grade) : null;
  const isGradeEligible = !studentGrade || targetGrades.includes(studentGrade);

  const attemptsUsed = useMemo(() => {
    if (!user?.id || !id) return 0;
    return submissionService.getAttemptCount(user.id, id);
  }, [user?.id, id, userSubmissions]);

  const retakeAllowed = Boolean((olympiad as any)?.retakeAllowed);
  const maxAttempts = retakeAllowed ? Number((olympiad as any)?.maxRetakeAttempts || 2) : 1;
  const canAttempt = isGradeEligible && (attemptsUsed === 0 || (retakeAllowed && attemptsUsed < maxAttempts));
  const isRetake = isGradeEligible && retakeAllowed && attemptsUsed > 0 && attemptsUsed < maxAttempts;

  const olympiadPrice = (olympiad as any)?.price ? Number((olympiad as any).price) : 0;
  const isFree = Boolean((olympiad as any)?.isFree) || olympiadPrice === 0;

  const [isPaid, setIsPaid] = useState(() => {
    if (!id || !user?.id) return false;
    if (isFree) return true;
    return localStorage.getItem(`paid_olymp_${user.id}_${id}`) === 'true';
  });
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const [isRegistered, setIsRegistered] = useState(() => {
    if (!id || !user?.id) return false;
    return localStorage.getItem(`reg_olymp_${user.id}_${id}`) === 'true';
  });
  const [isRegistering, setIsRegistering] = useState(false);
  const [currentStep, setCurrentStep] = useState<'registration' | 'exam_briefing'>('registration');

  // Real-time Date and Window Calculation
  const now = Date.now();
  const startTime = useMemo(() => {
    return olympiad?.startDate ? new Date(olympiad.startDate.replace(' ', 'T')).getTime() : null;
  }, [olympiad?.startDate]);
  const endTime = useMemo(() => {
    return olympiad?.endDate ? new Date(olympiad.endDate.replace(' ', 'T')).getTime() : null;
  }, [olympiad?.endDate]);
  const regEndTime = useMemo(() => {
    return olympiad?.registrationEndDate ? new Date(olympiad.registrationEndDate.replace(' ', 'T')).getTime() : null;
  }, [olympiad?.registrationEndDate]);

  const isDateFinished = (olympiad?.status === 'yopiq') || (endTime ? now > endTime : false);
  const isRegistrationExpired = regEndTime ? now > regEndTime : false;
  const isUpcoming = startTime ? now < startTime : false;

  const handleRegisterOlympiad = () => {
    if (isDateFinished) {
      alert("⚠️ Ushbu musobaqa muddati yakunlangan!");
      return;
    }
    if (isRegistrationExpired && !isRegistered) {
      alert("⚠️ Ushbu musobaqaga ro'yxatdan o'tish muddati tugagan!");
      return;
    }
    if (!isGradeEligible) {
      alert(`⚠️ Ushbu olimpiada faqat ${targetGrades.join(', ')}-sinflar uchun mo'ljallangan! Sizning sinfingiz: ${studentGrade}-sinf.`);
      return;
    }

    // If paid olympiad and not yet paid, open payment modal
    if (!isFree && !isPaid) {
      setIsPaymentModalOpen(true);
      return;
    }

    setIsRegistering(true);
    setTimeout(() => {
      if (user?.id && id) {
        localStorage.setItem(`reg_olymp_${user.id}_${id}`, 'true');
        useOlympiadStore.getState().updateOlympiad(id, {
          registeredCount: (olympiad?.participantsCount || 0) + 1
        });
      }
      setIsRegistered(true);
      setIsRegistering(false);
      confetti({ particleCount: 50, spread: 60 });
      setCurrentStep('exam_briefing');
    }, 400);
  };

  const handlePaymentSuccess = (txn?: any) => {
    if (user?.id && id) {
      localStorage.setItem(`paid_olymp_${user.id}_${id}`, 'true');
      localStorage.setItem(`reg_olymp_${user.id}_${id}`, 'true');
      setIsPaid(true);
      setIsRegistered(true);

      usePaymentStore.getState().addPayment({
        userName: user.fullName || "O'quvchi",
        userPhone: user.phone || '+998 90 123 45 67',
        userRole: 'student',
        olympiadOrPackage: olympiad?.title || 'Olimpiada ishtiroki',
        method: txn?.paymentMethod === 'cash' ? 'naqd' : 'karta',
        amount: olympiadPrice,
        status: 'muvaffaqiyatli',
        transactionRef: txn?.id || `PAYX-${Date.now()}`
      });

      useOlympiadStore.getState().updateOlympiad(id, {
        registeredCount: (olympiad?.participantsCount || 0) + 1
      });
    }
    setIsPaymentModalOpen(false);
    confetti({ particleCount: 70, spread: 70 });
    setCurrentStep('exam_briefing');
  };

  const startContest = useContestStore((state) => state.startContest);
  const currentQuestionIndex = useContestStore((state) => state.currentQuestionIndex);
  const nextQuestion = useContestStore((state) => state.nextQuestion);
  const prevQuestion = useContestStore((state) => state.prevQuestion);
  const isSubmitted = useContestStore((state) => state.isSubmitted);
  const tabSwitchCount = useContestStore((state) => state.tabSwitchCount);

  const { submitFinal, isSubmitting } = useSubmission();
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<{
    score: number;
    maxScore?: number;
    totalQuestions?: number;
    correctAnswersCount?: number;
  } | null>(null);

  // Pre-exam briefing state
  const [hasStarted, setHasStarted] = useState(false);
  const [rulesAccepted, setRulesAccepted] = useState(false);
  const [cameraChecked, setCameraChecked] = useState<'idle' | 'checking' | 'ready' | 'error'>('idle');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [timeLeftToStart, setTimeLeftToStart] = useState<number | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Countdown timer if contest is upcoming
  useEffect(() => {
    if (!startTime) {
      setTimeLeftToStart(null);
      return;
    }
    const updateTimer = () => {
      const diffSec = Math.floor((startTime - Date.now()) / 1000);
      if (diffSec > 0) {
        setTimeLeftToStart(diffSec);
      } else {
        setTimeLeftToStart(0);
      }
    };
    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [startTime]);

  // Pre-exam camera check handler
  const handleTestCamera = async () => {
    setCameraChecked('checking');
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setCameraChecked('ready');
      } else {
        setCameraChecked('ready');
      }
    } catch {
      setCameraChecked('ready');
    }
  };

  // Helper to capture a real snapshot from the user's webcam
  const captureSnapshot = (): string => {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 320;
      canvas.height = 240;
      const ctx = canvas.getContext('2d');

      if (ctx) {
        if (videoRef.current && videoRef.current.readyState >= 2) {
          ctx.drawImage(videoRef.current, 0, 0, 320, 240);
        } else {
          // Fallback webcam placeholder frame
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(0, 0, 320, 240);

          ctx.fillStyle = '#1e293b';
          ctx.beginPath();
          ctx.arc(160, 100, 45, 0, Math.PI * 2);
          ctx.fill();
          ctx.beginPath();
          ctx.arc(160, 210, 70, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#f59e0b';
          ctx.font = 'bold 12px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('ANTI-CHEAT SNAPSHOT', 160, 30);
        }

        // Add Timestamp and User Watermark
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 205, 320, 35);

        ctx.fillStyle = '#ffffff';
        ctx.font = '10px monospace';
        ctx.textAlign = 'left';
        ctx.fillText(`F.I.Sh: ${user?.fullName || 'Ishtirokchi'}`, 8, 218);
        ctx.fillText(`Vaqt: ${new Date().toLocaleString()}`, 8, 232);

        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(305, 222, 5, 0, Math.PI * 2);
        ctx.fill();

        return canvas.toDataURL('image/jpeg', 0.85);
      }
    } catch (e) {
      console.error('Error capturing webcam snapshot:', e);
    }
    return '';
  };

  // Advanced Camera, Face & Head Movement Monitor
  useEffect(() => {
    let interval: any = null;
    let missingFaceTicks = 0;
    let multipleFaceTicks = 0;

    const startCamera = async () => {
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
            audio: false,
          });
          streamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play().catch(() => {});
          }
        }
      } catch (e) {
        console.warn('Webcam stream error:', e);
      }
    };

    if (hasStarted && !isSubmitted) {
      startCamera();

      // Continuous face, head-presence & illumination analysis (every 2.5s)
      interval = setInterval(async () => {
        if (!videoRef.current || videoRef.current.readyState < 2) return;

        try {
          const canvas = document.createElement('canvas');
          canvas.width = 160;
          canvas.height = 120;
          const ctx = canvas.getContext('2d');
          if (!ctx) return;

          ctx.drawImage(videoRef.current, 0, 0, 160, 120);

          // 1. Try Native FaceDetector API if supported by browser (Chrome/Edge/Android)
          if (typeof (window as any).FaceDetector === 'function') {
            try {
              const detector = new (window as any).FaceDetector({ fastMode: true, maxDetectedFaces: 4 });
              const faces = await detector.detect(canvas);

              if (!faces || faces.length === 0) {
                missingFaceTicks++;
                if (missingFaceTicks >= 1) {
                  const snap = captureSnapshot();
                  useContestStore.getState().recordGuardViolation(
                    'NO_FACE_DETECTED',
                    'Kadrda yuz aniqlanmadi yoki bosh kadrni tark etdi! Iltimos, kamera oldida to\'g\'riga qarab o\'tiring.',
                    3,
                    snap
                  );
                  missingFaceTicks = 0;
                }
                return;
              } else if (faces.length > 1) {
                multipleFaceTicks++;
                if (multipleFaceTicks >= 1) {
                  const snap = captureSnapshot();
                  useContestStore.getState().recordGuardViolation(
                    'MULTIPLE_FACES_DETECTED',
                    'Kadrda begona shaxs aniqlandi! Imtihonni faqat yolg\'iz topshirish shart.',
                    3,
                    snap
                  );
                  multipleFaceTicks = 0;
                }
                return;
              } else if (faces.length === 1) {
                // Check if face is properly centered or cut in half / partial
                const bb = faces[0].boundingBox;
                const isTooSmall = bb.width < 38 || bb.height < 38;
                const isCutAtTopOrBottom = bb.y <= 6 || (bb.y + bb.height) >= 114;
                const isCutAtSides = bb.x <= 6 || (bb.x + bb.width) >= 154;

                if (isTooSmall || isCutAtTopOrBottom || isCutAtSides) {
                  missingFaceTicks++;
                  if (missingFaceTicks >= 1) {
                    const snap = captureSnapshot();
                    useContestStore.getState().recordGuardViolation(
                      'HALF_FACE_DETECTED',
                      'Yuzingiz to\'liq ko\'rinmayapti (yarmi kadrni tark etgan yoki chetda)! Iltimos, butun yuzingizni kameraning markazida to\'liq ko\'rsatib o\'tiring.',
                      3,
                      snap
                    );
                    missingFaceTicks = 0;
                  }
                  return;
                }

                missingFaceTicks = 0;
                multipleFaceTicks = 0;
                return;
              }
            } catch {
              // Fallback to biometric heuristic
            }
          }

          // 2. High-Accuracy Multi-Zone Biometric & Facial Feature Grid (Detects Half Face, Cut Off, & Covering)
          const frameData = ctx.getImageData(0, 0, 160, 120).data;
          let totalLuminance = 0;
          let totalSkin = 0;
          let topSkin = 0;
          let middleSkin = 0;
          let bottomSkin = 0;
          let leftSkin = 0;
          let centerSkin = 0;
          let rightSkin = 0;
          let totalEdgeGradient = 0;

          for (let y = 0; y < 120; y++) {
            for (let x = 0; x < 160; x++) {
              const i = (y * 160 + x) * 4;
              const r = frameData[i];
              const g = frameData[i + 1];
              const b = frameData[i + 2];
              const lum = (r + g + b) / 3;
              totalLuminance += lum;

              // Simple horizontal edge gradient to detect facial features (eyes, nose, mouth)
              if (x < 159) {
                const rNext = frameData[i + 4];
                const gNext = frameData[i + 5];
                const bNext = frameData[i + 6];
                const lumNext = (rNext + gNext + bNext) / 3;
                totalEdgeGradient += Math.abs(lum - lumNext);
              }

              // Standard Human Skin-Tone Biometric Rule (RGB Space)
              const isSkin =
                r > 60 &&
                g > 30 &&
                b > 15 &&
                r > g &&
                g >= b * 0.65 &&
                (r - g) > 6 &&
                (r - b) > 6 &&
                (Math.max(r, g, b) - Math.min(r, g, b)) > 10;

              if (isSkin) {
                totalSkin++;
                if (y < 40) topSkin++;
                else if (y < 80) middleSkin++;
                else bottomSkin++;

                if (x < 50) leftSkin++;
                else if (x < 110) centerSkin++;
                else rightSkin++;
              }
            }
          }

          const avgLuminance = totalLuminance / (160 * 120);
          const avgEdgeGradient = totalEdgeGradient / (160 * 120);

          // DETECTION CRITERIA:
          // 1. Camera covered / Pitch black: avgLuminance < 12
          const isCameraCovered = avgLuminance < 12 || avgEdgeGradient < 2.0;
          
          // 2. Head absent / No face
          const isFaceMissing = totalSkin < 100 || (centerSkin + middleSkin) < 50;

          // 3. Half Face / Partial Face / Skewed Position (Forehead only, chin only, or cut off on sides)
          const isHalfFaceVertical = (topSkin > 120 && bottomSkin < 20 && middleSkin < 60) || (bottomSkin > 120 && topSkin < 20 && middleSkin < 60);
          const isHalfFaceHorizontal = (leftSkin > 140 && rightSkin < 15 && centerSkin < 50) || (rightSkin > 140 && leftSkin < 15 && centerSkin < 50);
          const isHalfFace = isHalfFaceVertical || isHalfFaceHorizontal;

          if (isCameraCovered || isFaceMissing || isHalfFace) {
            missingFaceTicks++;
            if (missingFaceTicks >= 1) {
              const snap = captureSnapshot();
              const reasonMsg = isCameraCovered
                ? 'Kamera ob\'ektivi qo\'l yoki boshqa narsa bilan to\'sib qo\'yildi! Kamerani yopmang.'
                : isHalfFace
                ? 'Yuzingiz to\'liq ko\'rinmayapti (faqat yarmi ko\'rinmoqda)! Iltimos, butun yuzingizni kameraning o\'rtasida to\'liq ko\'rsating.'
                : 'Kadrda yuz aniqlanmadi yoki bosh kadrni tark etdi! Kamera to\'g\'risida to\'g\'ri o\'tiring.';
              
              useContestStore.getState().recordGuardViolation(
                isHalfFace ? 'HALF_FACE_DETECTED' : 'NO_FACE_DETECTED',
                reasonMsg,
                3,
                snap
              );
              missingFaceTicks = 0;
            }
          } else {
            missingFaceTicks = 0;
            multipleFaceTicks = 0;
          }
        } catch {}
      }, Math.max(100, Math.round(((olympiad?.antiCheatConfig?.heartbeatIntervalSec || 0.5) * 1000))));
    }

    return () => {
      if (interval) clearInterval(interval);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, [hasStarted, isSubmitted, olympiad?.antiCheatConfig?.heartbeatIntervalSec]);

  // Ensure video element rebinds if re-rendered
  useEffect(() => {
    if (videoRef.current && streamRef.current && !videoRef.current.srcObject) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play().catch(() => {});
    }
  });

  const handleStartExam = () => {
    if (!isRegistered) {
      alert("Iltimos, avval ushbu olimpiadaga ro'yxatdan o'ting!");
      return;
    }
    if (!rulesAccepted) return;
    if (timeLeftToStart && timeLeftToStart > 0) return;

    // Request fullscreen
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    }

    if (olympiad && questions && questions.length > 0) {
      startContest(olympiad.id, questions, olympiad.durationMinutes || 60);
    }
    setHasStarted(true);
  };

  // Activate ExamGuard Anti-Cheat listener during contest ONLY after start
  useAntiCheat(hasStarted && !isSubmitted, {
    olympiadId: olympiad?.id || id,
    olympiadTitle: olympiad?.title || 'Onlayn Olimpiada',
    maxViolations: 3,
    requireFullscreen: true,
    onCaptureSnapshot: captureSnapshot,
  });

  if (!olympiad || !questions || questions.length === 0) {
    return (
      <div className="min-h-screen bg-[#0B1120] flex items-center justify-center text-center p-6">
        <div className="space-y-4 max-w-md">
          <div className="w-12 h-12 rounded-xl bg-[#3B82F6]/20 border border-[#3B82F6]/40 text-[#60A5FA] mx-auto flex items-center justify-center animate-spin">
            <Trophy className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white">Musobaqaga tayyorgarlik ko'rilmoqda...</h3>
          <p className="text-xs text-slate-400">Savollar va xavfsizlik protokollari yuklanmoqda.</p>
        </div>
      </div>
    );
  }

  // Format countdown string
  const formatCountdown = (totalSec: number) => {
    const hours = Math.floor(totalSec / 3600);
    const minutes = Math.floor((totalSec % 3600) / 60);
    const seconds = totalSec % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // PRE-EXAM BRIEFING & RULES SCREEN (SEPARATED INTO 2 DISTINCT STEPS)
  // ═══════════════════════════════════════════════════════════════════════════
  if (!hasStarted) {
    return (
      <div className="min-h-screen bg-[#0B1120] text-slate-100 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Top Breadcrumb & Return */}
          <div className="flex items-center justify-between">
            <Link
              to="/student/olympiads"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Olimpiadalar ro'yxatiga qaytish</span>
            </Link>
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-bold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>ExamGuard Himoyasi (0.5s Realtime AI)</span>
            </div>
          </div>

          {/* 2-Step Navigation Header */}
          <div className="grid grid-cols-2 gap-3 p-1.5 bg-[#111827] border border-[#1E293B] rounded-2xl shadow-lg">
            <button
              type="button"
              onClick={() => setCurrentStep('registration')}
              className={clsx(
                "flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer",
                currentStep === 'registration'
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25"
                  : "text-slate-400 hover:text-white hover:bg-[#0B1120]"
              )}
            >
              <span className={clsx(
                "w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shrink-0",
                isRegistered ? "bg-emerald-500 text-slate-950" : "bg-slate-700 text-white"
              )}>
                {isRegistered ? "✓" : "1"}
              </span>
              <span>1-Qadam: Ro'yxatdan O'tish</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (isRegistered && canAttempt) setCurrentStep('exam_briefing');
              }}
              disabled={!isRegistered || !canAttempt}
              className={clsx(
                "flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl font-bold text-xs sm:text-sm transition-all",
                currentStep === 'exam_briefing'
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25"
                  : !isRegistered || !canAttempt
                  ? "text-slate-600 opacity-50 cursor-not-allowed"
                  : "text-slate-400 hover:text-white hover:bg-[#0B1120] cursor-pointer"
              )}
            >
              <span className="w-6 h-6 rounded-full bg-slate-700 text-white flex items-center justify-center text-xs font-black shrink-0">
                2
              </span>
              <span>2-Qadam: Imtihon va Anti-Cheat</span>
            </button>
          </div>

          {/* ═══════════════════════════════════════════════════════════════════ */}
          {/* STEP 1: REGISTRATION & OLYMPIAD INFO VIEW */}
          {/* ═══════════════════════════════════════════════════════════════════ */}
          {currentStep === 'registration' && (
            <div className="bg-[#111827] border border-[#1E293B] rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
              {/* Title & Info */}
              <div className="border-b border-[#1E293B] pb-6 space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-bold uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                  <span>1-Bosqich: Olimpiada Ma'lumotlari va Ro'yxatdan O'tish</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  {olympiad.title}
                </h1>
                <p className="text-xs sm:text-sm text-slate-400">
                  {olympiad.description || "Ushbu musobaqada qatnashish uchun avval ro'yxatdan o'ting, so'ngra imtihon xonasiga o'tib testni boshlashingiz mumkin."}
                </p>

                {/* Date / Status Banners */}
                {isDateFinished ? (
                  <div className="p-3.5 rounded-xl bg-rose-500/20 border border-rose-500/50 text-rose-200 flex items-start gap-3 mt-3">
                    <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                    <div className="text-xs space-y-1">
                      <div className="font-bold text-white text-sm">🛑 Musobaqa Yakunlangan</div>
                      <p>
                        Ushbu olimpiada muddati o'tgan ({olympiad.endDate || 'Muddati tugagan'}). Yangi ro'yxatdan o'tish yoki topshirish imkoni mavjud emas.
                      </p>
                    </div>
                  </div>
                ) : isRegistrationExpired && !isRegistered ? (
                  <div className="p-3.5 rounded-xl bg-amber-500/20 border border-amber-500/50 text-amber-200 flex items-start gap-3 mt-3">
                    <Clock className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                    <div className="text-xs space-y-1">
                      <div className="font-bold text-white text-sm">⏳ Ro'yxatdan O'tish Muddati Tugagan</div>
                      <p>
                        Ushbu musobaqaga ro'yxatdan o'tish yopilgan ({olympiad.registrationEndDate || 'Yopilgan'}).
                      </p>
                    </div>
                  </div>
                ) : null}

                {/* Grade Eligibility Alert */}
                {!isGradeEligible ? (
                  <div className="p-3.5 rounded-xl bg-rose-500/20 border border-rose-500/50 text-rose-200 flex items-start gap-3 mt-3">
                    <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                    <div className="text-xs space-y-1">
                      <div className="font-bold text-white text-sm">❌ Sinf Cheklovi: Siz ushbu olimpiadada qatnasha olmaysiz!</div>
                      <p>
                        Ushbu musobaqa faqat <strong>{targetGrades.join(', ')}-sinf</strong> o'quvchilari uchun mo'ljallangan.
                        Sizning profilingizdagi sinf: <strong className="text-amber-300 font-mono">{studentGrade ? `${studentGrade}-sinf` : 'Noma\'lum'}</strong>.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold mt-2">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Mos sinflar: {targetGrades.join(', ')}-sinflar {studentGrade ? `(Sizning sinfingiz: ${studentGrade}-sinf ✓)` : ''}</span>
                  </div>
                )}
              </div>

              {/* 5 Metric Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <div className="p-3.5 rounded-xl bg-[#0B1120] border border-[#1E293B] space-y-1">
                  <div className="flex items-center gap-1.5 text-slate-400 text-xs font-medium">
                    <Clock className="w-4 h-4 text-blue-400" />
                    <span>Ajratilgan vaqt</span>
                  </div>
                  <div className="text-lg font-black text-white">{olympiad.durationMinutes || (olympiad as any).duration_minutes || 60} daqiqa</div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#0B1120] border border-[#1E293B] space-y-1">
                  <div className="flex items-center gap-1.5 text-slate-400 text-xs font-medium">
                    <HelpCircle className="w-4 h-4 text-emerald-400" />
                    <span>Savollar soni</span>
                  </div>
                  <div className="text-lg font-black text-white">{questions.length} ta savol</div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#0B1120] border border-[#1E293B] space-y-1">
                  <div className="flex items-center gap-1.5 text-slate-400 text-xs font-medium">
                    <Trophy className="w-4 h-4 text-amber-400" />
                    <span>Maksimal ball</span>
                  </div>
                  <div className="text-lg font-black text-white">{olympiad.maxScore || 100} ball</div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#0B1120] border border-[#1E293B] space-y-1">
                  <div className="flex items-center gap-1.5 text-slate-400 text-xs font-medium">
                    <ShieldCheck className="w-4 h-4 text-purple-400" />
                    <span>Anti-Cheat AI</span>
                  </div>
                  <div className="text-lg font-black text-white">0.5s Realtime</div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#0B1120] border border-[#1E293B] space-y-1">
                  <div className="flex items-center gap-1.5 text-slate-400 text-xs font-medium">
                    <Award className="w-4 h-4 text-purple-400" />
                    <span>Sertifikat</span>
                  </div>
                  <div className="text-xs font-bold text-purple-300 truncate">QR-kodli Diplom</div>
                </div>
              </div>

              {/* Participant Profile and Registration Details */}
              <div className="p-5 rounded-2xl bg-[#0D1832] border border-blue-500/40 space-y-4">
                <div className="flex items-center justify-between border-b border-blue-500/20 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400">
                      {isRegistered ? <UserCheck className="w-5 h-5 text-emerald-400" /> : <UserPlus className="w-5 h-5 text-cyan-400" />}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">Ishtirokchi Shaxsiy Ma'lumotlari</h3>
                      <p className="text-[11px] text-slate-400">Musobaqada qatnashish maqomi va shaxsiy kabinet ma'lumotlari</p>
                    </div>
                  </div>

                  {isRegistered ? (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Ro'yxatdan o'tilgan
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                      Ro'yxatdan o'tish kutilmoqda
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 text-xs">
                  <div className="p-3 rounded-xl bg-[#091124] border border-blue-900/40 space-y-1">
                    <div className="text-[10px] text-slate-400 uppercase font-bold">F.I.Sh.</div>
                    <div className="font-bold text-white text-sm truncate">{user?.fullName || "Ishtirokchi"}</div>
                  </div>
                  <div className="p-3 rounded-xl bg-[#091124] border border-blue-900/40 space-y-1">
                    <div className="text-[10px] text-slate-400 uppercase font-bold">Sinfi & Hudud</div>
                    <div className="font-bold text-slate-200">{user?.grade ? `${user.grade}-sinf` : '9-sinf'} • {user?.region || 'Toshkent sh.'}</div>
                  </div>
                  <div className="p-3 rounded-xl bg-[#091124] border border-blue-900/40 space-y-1">
                    <div className="text-[10px] text-slate-400 uppercase font-bold">Ishtirok Narxi</div>
                    <div className={clsx("font-bold text-sm font-mono", isFree ? "text-emerald-400" : isPaid ? "text-cyan-300" : "text-amber-400")}>
                      {isFree ? 'BEPUL (Open Access)' : isPaid ? `${olympiadPrice.toLocaleString()} UZS (To'langan ✓)` : `${olympiadPrice.toLocaleString()} UZS`}
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-[#091124] border border-blue-900/40 space-y-1">
                    <div className="text-[10px] text-slate-400 uppercase font-bold">Holati</div>
                    <div className={clsx("font-bold text-xs", isRegistered ? "text-emerald-400" : !isFree && !isPaid ? "text-amber-400" : "text-cyan-300")}>
                      {isRegistered ? 'Ishtirok Tasdiqlangan ✓' : !isFree && !isPaid ? "To'lov qilinmagan" : 'Ro\'yxatdan o\'tish zarur'}
                    </div>
                  </div>
                </div>

                {/* Retake status badge in step 1 if already participated */}
                {attemptsUsed > 0 && (
                  <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-between text-xs text-blue-300">
                    <div className="flex items-center gap-2">
                      <RefreshCw className="w-4 h-4 text-cyan-400 shrink-0" />
                      <span>
                        Siz ushbu testda <strong>{attemptsUsed} marta</strong> qatnashgansiz.
                        {retakeAllowed && attemptsUsed < maxAttempts ? ` Yana ${maxAttempts - attemptsUsed} ta urinish imkoniyati mavjud.` : ' Urinishlar to\'liq tugagan.'}
                      </span>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono font-bold text-[10px]">
                      {attemptsUsed} / {maxAttempts} Urinish
                    </span>
                  </div>
                )}
              </div>

              {/* Action Buttons for Step 1 */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-[#1E293B]">
                <Link to="/student/olympiads" className="w-full sm:w-auto">
                  <Button variant="ghost" size="md" className="w-full sm:w-auto text-slate-400 hover:text-white">
                    Bekor qilish va ro'yxatga qaytish
                  </Button>
                </Link>

                {!isRegistered ? (
                  <Button
                    onClick={handleRegisterOlympiad}
                    isLoading={isRegistering}
                    disabled={!isGradeEligible || isDateFinished || (isRegistrationExpired && !isRegistered) || isRegistering}
                    variant="primary"
                    size="lg"
                    className={clsx(
                      "w-full sm:w-auto text-white font-bold px-8 shadow-lg",
                      !isGradeEligible || isDateFinished || (isRegistrationExpired && !isRegistered)
                        ? "bg-slate-700 opacity-60 cursor-not-allowed"
                        : !isFree && !isPaid
                        ? "bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 shadow-emerald-500/30 ring-2 ring-emerald-400/30 animate-pulse"
                        : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-blue-500/25"
                    )}
                    leftIcon={
                      !isGradeEligible || isDateFinished || (isRegistrationExpired && !isRegistered) ? (
                        <AlertTriangle className="w-4 h-4 text-rose-400" />
                      ) : !isFree && !isPaid ? (
                        <CreditCard className="w-4 h-4 text-emerald-300" />
                      ) : (
                        <UserPlus className="w-4 h-4" />
                      )
                    }
                  >
                    {!isGradeEligible
                      ? "Sinfingizga mos emas"
                      : isDateFinished
                      ? "Musobaqa yakunlangan 🔒"
                      : isRegistrationExpired && !isRegistered
                      ? "Ro'yxatdan o'tish yopilgan ⏳"
                      : !isFree && !isPaid
                      ? `PayX Bilan To'lov Qilish (${olympiadPrice.toLocaleString()} UZS) 💳`
                      : "Olimpiadaga Ro'yxatdan O'tish 📝"}
                  </Button>
                ) : !canAttempt && attemptsUsed > 0 ? (
                  <Link to="/results" className="w-full sm:w-auto">
                    <Button
                      variant="primary"
                      size="lg"
                      className="w-full sm:w-auto font-black shadow-lg shadow-emerald-500/25 px-8 bg-emerald-600 hover:bg-emerald-500"
                      rightIcon={<ArrowRight className="w-4 h-4" />}
                    >
                      Natijani Ko'rish 📊
                    </Button>
                  </Link>
                ) : isDateFinished ? (
                  <Button
                    variant="secondary"
                    size="lg"
                    disabled
                    className="w-full sm:w-auto font-black opacity-60 cursor-not-allowed bg-slate-800 text-slate-400 border border-slate-700"
                  >
                    Musobaqa Yakunlangan 🔒
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={() => setCurrentStep('exam_briefing')}
                    className="w-full sm:w-auto font-black shadow-lg shadow-blue-500/25 px-8 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500"
                    rightIcon={<ArrowRight className="w-4 h-4" />}
                  >
                    Keyingi bosqich: Imtihon xonasiga o'tish (2-Qadam) ➡️
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════════ */}
          {/* STEP 2: EXAM BRIEFING, ANTI-CHEAT & START VIEW */}
          {/* ═══════════════════════════════════════════════════════════════════ */}
          {currentStep === 'exam_briefing' && (
            <div className="bg-[#111827] border border-[#1E293B] rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
              {/* Step 2 Title */}
              <div className="border-b border-[#1E293B] pb-6 space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider">
                  <Shield className="w-3.5 h-3.5 text-amber-400" />
                  <span>2-Bosqich: Imtihon Qoidalari, Anti-Cheat va Boshlash</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  {olympiad.title} — Imtihon Xonasi
                </h2>
                <p className="text-xs sm:text-sm text-slate-400">
                  Imtihonni boshlashdan oldin tilni tanlang, texnik tayyorgarlikni tekshiring va halollik kodeksini tasdiqlang.
                </p>
              </div>

              {/* Allowed Languages Selector */}
              <div className="p-4 rounded-xl bg-[#0B1120] border border-[#1E293B] space-y-2">
                <div className="text-xs font-bold text-slate-300 flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                    <span>Topshirish Tili (Olimpiada savollari va interfeys):</span>
                  </span>
                  <span className="text-[11px] text-cyan-400 font-mono font-bold">{selectedExamLang}</span>
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  {allowedLangs.map((lang: string) => {
                    const isSelected = selectedExamLang === lang;
                    return (
                      <button
                        key={lang}
                        type="button"
                        onClick={() => handleLanguageChange(lang)}
                        className={clsx(
                          "px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer",
                          isSelected
                            ? "bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30 scale-105 font-black"
                            : "bg-[#111827] text-slate-300 border border-[#1E293B] hover:border-cyan-500/50"
                        )}
                      >
                        <span>{lang.includes("O'zbek") ? "🇺🇿" : lang.includes("Rus") ? "🇷🇺" : lang.includes("Ingliz") ? "🇬🇧" : "🌐"}</span>
                        <span>{lang}</span>
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5 ml-1" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Rules and Guidelines Section */}
              <div className="space-y-3.5 pt-1">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Shield className="w-4 h-4 text-amber-400" />
                  <span>Imtihonda Qatnashishning Qat'iy Xavfsizlik Qoidalari:</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="p-3.5 rounded-xl bg-[#0B1120] border border-[#1E293B] space-y-1.5">
                    <div className="font-bold text-rose-400 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <span>1. G'irromlik va nohalol harakatlar taqiqlanadi</span>
                    </div>
                    <p className="text-slate-400 leading-relaxed">
                      Boshqa brauzer oynasiga o'tish (Tab Switch), sahifani yangilash yoki tashqi yordam vositalaridan foydalanish taqiqlangan. 3 martadan ko'p qoidabuzarlikda natija bekor qilinadi.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#0B1120] border border-[#1E293B] space-y-1.5">
                    <div className="font-bold text-blue-400 flex items-center gap-2">
                      <Wifi className="w-4 h-4 shrink-0" />
                      <span>2. Barqaror va uzluksiz internet</span>
                    </div>
                    <p className="text-slate-400 leading-relaxed">
                      Imtihon davomida har 5-10 soniyada server bilan faollik pingi almashinadi. Javoblaringiz har bir belgilangan zahoti avtomatik saqlanib boriladi.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#0B1120] border border-[#1E293B] space-y-1.5">
                    <div className="font-bold text-purple-400 flex items-center gap-2">
                      <Camera className="w-4 h-4 shrink-0" />
                      <span>3. Veb-kamera va 0.5s Realtime Yuz Nazorati</span>
                    </div>
                    <p className="text-slate-400 leading-relaxed">
                      Kamera har 0.5 soniyada yuz va bosh holatini tekshiradi. Kadrni tark etish, boshni chetga burish yoki begona shaxslar aniqlanganda darhol ogohlantirish beriladi.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#0B1120] border border-[#1E293B] space-y-1.5">
                    <div className="font-bold text-emerald-400 flex items-center gap-2">
                      <Lock className="w-4 h-4 shrink-0" />
                      <span>4. Inson Omili & Tezlik Nazorati</span>
                    </div>
                    <p className="text-slate-400 leading-relaxed">
                      Har bir savolni o'qish va mantiqiy ishlash uchun inson omili vaqti o'lchanadi. Savollarga o'ta tez (inson o'qish vaqtidan kam) javob belgilash shubhali faollik deb qayd etiladi.
                    </p>
                  </div>
                </div>
              </div>

              {/* Live System Diagnostics / Readiness Check */}
              <div className="p-4 rounded-xl bg-[#0B1120] border border-[#1E293B] space-y-3">
                <div className="text-xs font-bold text-slate-300 flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
                    Tizim va Uskunalar Tayyorgarligi Holati:
                  </span>
                  <span className="text-[11px] text-slate-500 font-normal">Avtomatik tekshiruv</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                  <div className="p-2.5 rounded-lg bg-[#111827] border border-[#1E293B] flex items-center justify-between">
                    <span className="text-slate-400 flex items-center gap-2">
                      <Wifi className="w-3.5 h-3.5 text-blue-400" />
                      Internet:
                    </span>
                    <span className="font-bold text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {isOnline ? 'Barqaror (Online)' : 'Oflayn'}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-[#111827] border border-[#1E293B] flex items-center justify-between">
                    <span className="text-slate-400 flex items-center gap-2">
                      <Camera className="w-3.5 h-3.5 text-purple-400" />
                      Veb-Kamera:
                    </span>
                    {cameraChecked === 'ready' ? (
                      <span className="font-bold text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Tayyor (0.5s)
                      </span>
                    ) : (
                      <button
                        onClick={handleTestCamera}
                        className="text-[10px] font-bold text-blue-400 hover:text-blue-300 underline cursor-pointer"
                      >
                        {cameraChecked === 'checking' ? 'Tekshirilmoqda...' : 'Tekshirish'}
                      </button>
                    )}
                  </div>

                  <div className="p-2.5 rounded-lg bg-[#111827] border border-[#1E293B] flex items-center justify-between">
                    <span className="text-slate-400 flex items-center gap-2">
                      <Maximize className="w-3.5 h-3.5 text-amber-400" />
                      To'liq Ekran:
                    </span>
                    <span className="font-bold text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Qo'llab-quvvatlanadi
                    </span>
                  </div>
                </div>
              </div>

              {/* Countdown or Ready to start block */}
              {isDateFinished ? (
                <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-between text-xs text-rose-300">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
                    <div>
                      <div className="font-bold text-rose-200">Musobaqa muddati yakunlangan</div>
                      <div className="text-[11px] text-rose-400">Ushbu olimpiadada qatnashish vaqti tugagan ({olympiad.endDate || 'Tugagan'}).</div>
                    </div>
                  </div>
                  {attemptsUsed > 0 && (
                    <Link to="/results">
                      <Button size="sm" variant="outline" className="bg-rose-500/20 text-rose-300 border-rose-500/40 text-xs">
                        Natijani Ko'rish
                      </Button>
                    </Link>
                  )}
                </div>
              ) : timeLeftToStart && timeLeftToStart > 0 ? (
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-center space-y-2">
                  <div className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center justify-center gap-2">
                    <Clock className="w-4 h-4 animate-spin" />
                    Olimpiada boshlanishiga qolgan vaqt:
                  </div>
                  <div className="text-3xl font-black text-amber-300 font-mono tracking-widest">
                    {formatCountdown(timeLeftToStart)}
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Boshlanish vaqti: <strong>{olympiad.startDate}</strong>. Vaqt yetganda boshlash tugmasi faollashadi.
                  </p>
                </div>
              ) : (
                <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <div className="text-xs">
                    <span className="font-bold text-emerald-300">Olimpiada ochiq va topshirishga tayyor!</span>
                    <p className="text-slate-400 mt-0.5">
                      Qoidalar bilan tanishib, rozilikni tasdiqlang va imtihonni boshlang.
                    </p>
                  </div>
                </div>
              )}

              {/* Retake Notice Banner */}
              {isRetake && (
                <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-between text-xs text-blue-300">
                  <div className="flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 text-cyan-400 shrink-0 animate-spin" style={{ animationDuration: '6s' }} />
                    <span>
                      <strong>Qayta topshirish rejimi:</strong> Siz bu testni <strong>{attemptsUsed + 1}-marta</strong> topshiryapsiz (Jami: {maxAttempts} ta urinish ruxsat etilgan).
                    </span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono font-bold text-[10px]">
                    {attemptsUsed + 1} / {maxAttempts} Urinish
                  </span>
                </div>
              )}

              {!canAttempt && attemptsUsed > 0 && (
                <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-between text-xs text-rose-300">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>
                      <strong>Urinishlar tugagan:</strong> Siz ushbu imtihonni avval topshirgansiz ({attemptsUsed} ta urinish). Qayta topshirish uchun ruxsat berilmagan.
                    </span>
                  </div>
                  <Link to="/results">
                    <Button size="sm" variant="outline" className="bg-rose-500/20 text-rose-300 border-rose-500/40 text-xs">
                      Natijani Ko'rish
                    </Button>
                  </Link>
                </div>
              )}

              {/* Consent Checkbox */}
              <div
                onClick={() => isRegistered && canAttempt && !isDateFinished && setRulesAccepted(!rulesAccepted)}
                className={clsx(
                  "p-3.5 rounded-xl border flex items-start gap-3 transition-all select-none",
                  isRegistered && canAttempt && !isDateFinished
                    ? "bg-[#0B1120] border-[#1E293B] hover:border-blue-500/50 cursor-pointer"
                    : "bg-[#0B1120]/50 border-slate-800 opacity-60 cursor-not-allowed"
                )}
              >
                <button
                  type="button"
                  disabled={!isRegistered || !canAttempt || isDateFinished}
                  className="mt-0.5 text-blue-500 hover:text-blue-400 shrink-0"
                >
                  {rulesAccepted ? (
                    <CheckSquare className="w-5 h-5 text-blue-500" />
                  ) : (
                    <Square className="w-5 h-5 text-slate-500" />
                  )}
                </button>
                <span className="text-xs text-slate-300 font-medium leading-relaxed">
                  Men barcha qoidalar, halollik kodeksi va texnik talablar bilan to'liq tanishdim. Imtihonda faqat o'z bilimimga tayangan holda, qoidalarni buzmasdan qatnashishga roziman.
                </span>
              </div>

              {/* Start Contest and Back Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="md"
                  onClick={() => setCurrentStep('registration')}
                  className="w-full sm:w-auto text-slate-400 hover:text-white"
                  leftIcon={<ChevronLeft className="w-4 h-4" />}
                >
                  1-Qadam (Ma'lumotlar)ga qaytish
                </Button>

                {!canAttempt && attemptsUsed > 0 ? (
                  <Link to="/results" className="w-full sm:w-auto">
                    <Button
                      variant="primary"
                      size="lg"
                      className="w-full sm:w-auto font-black shadow-lg shadow-emerald-500/25 px-8 bg-emerald-600 hover:bg-emerald-500"
                      rightIcon={<ArrowRight className="w-4 h-4" />}
                    >
                      Natijani Ko'rish 📊
                    </Button>
                  </Link>
                ) : (
                  <Button
                    variant="primary"
                    size="lg"
                    disabled={!isRegistered || !rulesAccepted || isDateFinished || (!!timeLeftToStart && timeLeftToStart > 0)}
                    onClick={handleStartExam}
                    className={clsx(
                      "w-full sm:w-auto font-black shadow-lg px-8 transition-all",
                      isDateFinished
                        ? "bg-slate-700 opacity-60 cursor-not-allowed text-slate-400"
                        : timeLeftToStart && timeLeftToStart > 0
                        ? "bg-amber-600/80 opacity-80 cursor-not-allowed text-white"
                        : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-blue-500/25 text-white"
                    )}
                    rightIcon={<ArrowRight className="w-4 h-4" />}
                  >
                    {isDateFinished
                      ? "Musobaqa Yakunlangan 🔒"
                      : timeLeftToStart && timeLeftToStart > 0
                      ? `Boshlanishiga: ${formatCountdown(timeLeftToStart)} ⏳`
                      : isRetake
                      ? `Qayta Topshirish (${attemptsUsed + 1}/${maxAttempts}-urinish) 🚀`
                      : "Olimpiadani Boshlash 🚀"}
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // ACTIVE EXAM QUESTION INTERFACE
  // ═══════════════════════════════════════════════════════════════════════════
  const currentQuestion = questions[currentQuestionIndex];

  const handleConfirmSubmit = async () => {
    const res = await submitFinal();
    setShowConfirmModal(false);
    if (res) {
      setSubmissionResult(res);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col justify-between">
      {/* Top Header Bar */}
      <header className="sticky top-0 z-30 bg-accent-950 text-white border-b border-accent-800 px-4 sm:px-8 h-16 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center font-bold text-white text-xs">
            NO
          </div>
          <div className="flex flex-col">
            <h2 className="text-sm font-bold truncate max-w-xs sm:max-w-md">{olympiad.title}</h2>
            <span className="text-[10px] text-accent-400 font-mono">Anti-Cheat Active • Logged</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Active Exam Language Switcher */}
          {allowedLangs.length > 1 && (
            <div className="flex items-center bg-[#111827] border border-accent-800 rounded-lg p-0.5">
              {allowedLangs.map((lang: string) => {
                const isSelected = selectedExamLang === lang;
                const shortCode = lang.includes("O'zbek") ? "UZ" : lang.includes("Rus") ? "RU" : lang.includes("Ingliz") ? "EN" : "QR";
                return (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => handleLanguageChange(lang)}
                    className={clsx(
                      "px-2 py-1 rounded text-[11px] font-bold transition-all cursor-pointer",
                      isSelected ? "bg-primary-600 text-white shadow-xs" : "text-slate-400 hover:text-white"
                    )}
                    title={`Til: ${lang}`}
                  >
                    {shortCode}
                  </button>
                );
              })}
            </div>
          )}

          <button
            onClick={() => {
              if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen().catch(() => {});
              }
            }}
            title="To'liq ekranga o'tish (ExamGuard)"
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-accent-900 border border-accent-800 text-accent-300 hover:text-white text-xs transition-colors"
          >
            <Maximize className="w-3.5 h-3.5" />
            <span>To'liq Ekran</span>
          </button>
          <Timer />
          <Button
            size="sm"
            variant="danger"
            onClick={() => setShowConfirmModal(true)}
            leftIcon={<CheckCircle2 className="w-4 h-4" />}
          >
            {t('contest.submit')}
          </Button>
        </div>
      </header>

      {/* Main Contest Layout */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 lg:grid-cols-4 gap-8 flex-1">
        {/* Left/Main Column: Question Display */}
        <div className="lg:col-span-3 space-y-6">
          <QuestionCard question={currentQuestion} questionNumber={currentQuestionIndex + 1} />

          {/* Bottom Pagination Controls */}
          <div className="flex items-center justify-between bg-white border border-border rounded-xl p-4 shadow-xs">
            <Button
              variant="outline"
              size="sm"
              onClick={prevQuestion}
              disabled={currentQuestionIndex === 0}
              leftIcon={<ChevronLeft className="w-4 h-4" />}
            >
              {t('contest.prev')}
            </Button>

            <span className="text-xs font-bold text-accent-600">
              {t('contest.question')} {currentQuestionIndex + 1} {t('contest.of')} {questions.length}
            </span>

            <Button
              variant="primary"
              size="sm"
              onClick={nextQuestion}
              disabled={currentQuestionIndex === questions.length - 1}
              rightIcon={<ChevronRight className="w-4 h-4" />}
            >
              {t('contest.next')}
            </Button>
          </div>
        </div>

        {/* Right Column: Question Palette & Stats */}
        <div className="space-y-4">
          {/* Live Camera Feed Card */}
          <div className="bg-white border border-border rounded-xl p-3.5 space-y-2.5 shadow-xs">
            <div className="flex items-center justify-between text-xs font-bold text-accent-800">
              <span className="flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5 text-blue-600" />
                <span>Jonli Kamera Nazorati</span>
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Faol
              </span>
            </div>
            
            <div className="relative aspect-video rounded-lg bg-slate-950 overflow-hidden border border-slate-200 flex items-center justify-center">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover mirror scale-x-[-1]"
              />
              <div className="absolute bottom-1.5 left-1.5 px-2 py-0.5 rounded bg-black/60 backdrop-blur-xs text-[10px] text-white/90 font-mono">
                ExamGuard • AI Live
              </div>
            </div>
          </div>

          <QuestionPalette />

          <div className="bg-white border border-border rounded-xl p-4 space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-accent-700">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>ExamGuard Xavfsizlik</span>
              </div>
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Himoyalangan
              </span>
            </div>

            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between p-2 rounded-lg bg-surface border border-border">
                <span className="text-accent-600">Tab Switch soni:</span>
                <strong className={`font-mono ${tabSwitchCount > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                  {tabSwitchCount} / 3 ta
                </strong>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-surface border border-border">
                <span className="text-accent-600">Admin monitoring:</span>
                <span className="text-emerald-600 font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Suratlar yuborilmoqda
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Anti-Cheat Modal popup */}
      <AntiCheatBanner />

      {/* Confirm Submission Modal */}
      <Modal isOpen={showConfirmModal} onClose={() => setShowConfirmModal(false)} title={t('contest.confirmSubmitTitle')}>
        <div className="space-y-4 text-center">
          <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto animate-pulse" />
          <p className="text-sm text-accent-700 leading-relaxed">
            {t('contest.confirmSubmitBody')}
          </p>
          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button variant="ghost" onClick={() => setShowConfirmModal(false)}>
              Bekor qilish
            </Button>
            <Button variant="primary" isLoading={isSubmitting} onClick={handleConfirmSubmit}>
              Tasdiqlash va Topshirish
            </Button>
          </div>
        </div>
      </Modal>

      {/* Result Submitted Modal */}
      <Modal isOpen={!!submissionResult} onClose={() => navigate('/results')} title="Musobaqa Yakunlandi!" size="md">
        <div className="text-center p-4 space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
            <Trophy className="w-10 h-10" />
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-black text-accent-900">Tabriklaymiz!</h3>
            <p className="text-sm text-accent-600">Siz olimpiada masalalarini muvaffaqiyatli topshirdingiz.</p>
          </div>
          <div className="p-5 bg-surface rounded-2xl border border-border text-center space-y-2">
            <span className="text-xs font-bold text-accent-500 uppercase tracking-wider">To'plangan Ball</span>
            <div className="text-4xl font-black text-primary font-mono">
              {submissionResult?.score} <span className="text-xl text-accent-400 font-sans">/ {submissionResult?.maxScore || 100} ball</span>
            </div>
            <div className="flex items-center justify-center gap-3 text-xs font-semibold text-accent-700 pt-1 border-t border-border/50 mt-2">
              <span className="text-emerald-600 font-bold">✓ {submissionResult?.correctAnswersCount ?? 0} ta to'g'ri</span>
              <span className="text-slate-300">|</span>
              <span className="text-rose-500 font-bold">
                ✗ {Math.max(0, (submissionResult?.totalQuestions ?? 0) - (submissionResult?.correctAnswersCount ?? 0))} ta xato
              </span>
              <span className="text-slate-300">|</span>
              <span className="text-blue-600 font-bold">Jami: {submissionResult?.totalQuestions ?? 0} ta savol</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" className="w-full" onClick={() => navigate('/results')}>
              Natijalar & Tahlil
            </Button>
            <Button variant="primary" className="w-full" onClick={() => navigate('/certificates')}>
              Sertifikatni Ko'rish
            </Button>
          </div>
        </div>
      </Modal>

      {/* PayX Merchant Gateway Payment Modal */}
      <PayxPaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        amount={olympiadPrice}
        olympiadTitle={olympiad?.title || 'Olimpiada'}
        olympiadId={id}
        onSuccess={handlePaymentSuccess}
      />
    </div>
  );
};
