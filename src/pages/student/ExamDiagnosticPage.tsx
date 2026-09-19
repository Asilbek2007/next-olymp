import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useOlympiadDetail } from '../../hooks/useOlympiad';
import {
  ShieldCheck,
  Camera,
  Mic,
  Monitor,
  Maximize,
  Cpu,
  Eye,
  Volume2,
  CheckCircle2,
  XCircle,
  Loader2,
  AlertTriangle,
  ArrowRight,
  RotateCcw,
  Wifi,
  Zap,
  ScanFace,
  AudioLines,
} from 'lucide-react';

// ─── Types ──────────────────────────────────────────────────────────────────
type CheckStatus = 'pending' | 'loading' | 'success' | 'failed' | 'warning';

interface DiagnosticCheck {
  id: string;
  label: string;
  description: string;
  status: CheckStatus;
  detail: string;
  icon: React.ReactNode;
}

// ─── Utility: Status badge colors ───────────────────────────────────────────
const statusConfig: Record<CheckStatus, { bg: string; text: string; border: string; glow: string }> = {
  pending:  { bg: 'bg-slate-800/60', text: 'text-slate-400', border: 'border-slate-700', glow: '' },
  loading:  { bg: 'bg-blue-950/40', text: 'text-blue-400', border: 'border-blue-800', glow: 'shadow-[0_0_12px_rgba(59,130,246,0.15)]' },
  success:  { bg: 'bg-emerald-950/40', text: 'text-emerald-400', border: 'border-emerald-800', glow: 'shadow-[0_0_12px_rgba(16,185,129,0.15)]' },
  failed:   { bg: 'bg-rose-950/40', text: 'text-rose-400', border: 'border-rose-800', glow: 'shadow-[0_0_12px_rgba(244,63,94,0.15)]' },
  warning:  { bg: 'bg-amber-950/40', text: 'text-amber-400', border: 'border-amber-800', glow: 'shadow-[0_0_12px_rgba(251,191,36,0.15)]' },
};

const statusIcons: Record<CheckStatus, React.ReactNode> = {
  pending: <div className="w-5 h-5 rounded-full border-2 border-slate-600" />,
  loading: <Loader2 className="w-5 h-5 animate-spin text-blue-400" />,
  success: <CheckCircle2 className="w-5 h-5 text-emerald-400" />,
  failed:  <XCircle className="w-5 h-5 text-rose-400" />,
  warning: <AlertTriangle className="w-5 h-5 text-amber-400" />,
};

// ─── Component ──────────────────────────────────────────────────────────────
export const ExamDiagnosticPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: olympiad } = useOlympiadDetail(id || '');

  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number>(0);
  const faceAnimFrameRef = useRef<number>(0);
  const faceLandmarkerRef = useRef<any>(null);

  // State
  const [audioLevel, setAudioLevel] = useState(0);
  const [liveGuidance, setLiveGuidance] = useState({ text: 'Diagnostika boshlanmoqda...', color: 'text-slate-400' });
  const [overallProgress, setOverallProgress] = useState(0);
  const [networkLatency, setNetworkLatency] = useState<number | null>(null);

  const [checks, setChecks] = useState<DiagnosticCheck[]>([
    {
      id: 'model',
      label: 'AI Model (MediaPipe WASM)',
      description: 'Yuz aniqlash modeli brauzerga yuklanmoqda',
      status: 'pending',
      detail: 'Kutilmoqda...',
      icon: <Cpu className="w-5 h-5" />,
    },
    {
      id: 'hardware',
      label: 'Kamera va Mikrofon',
      description: 'Audio/video qurilmalar tekshirilmoqda',
      status: 'pending',
      detail: 'Kutilmoqda',
      icon: <Camera className="w-5 h-5" />,
    },
    {
      id: 'face',
      label: 'Yuzni aniqlash (Face Lock)',
      description: 'Kameraga to\'g\'ri qarab turing',
      status: 'pending',
      detail: 'Sinovdan o\'tmadi',
      icon: <ScanFace className="w-5 h-5" />,
    },
    {
      id: 'audio',
      label: 'Ovoz signali tekshiruvi',
      description: 'Biror so\'z ayting — mikrofon ishlashini tekshiramiz',
      status: 'pending',
      detail: 'Sinovdan o\'tmadi',
      icon: <AudioLines className="w-5 h-5" />,
    },
    {
      id: 'screens',
      label: 'Ikkinchi ekran nazorati',
      description: 'Faqat bitta displey ulanganligini tekshirish',
      status: 'pending',
      detail: 'Tekshirilmoqda',
      icon: <Monitor className="w-5 h-5" />,
    },
    {
      id: 'network',
      label: 'Tarmoq tezligi',
      description: 'Internet ulanish tezligi va barqarorligi',
      status: 'pending',
      detail: 'Tekshirilmoqda',
      icon: <Wifi className="w-5 h-5" />,
    },
    {
      id: 'fullscreen',
      label: 'To\'liq ekran rejimi (Fullscreen)',
      description: 'Imtihon faqat to\'liq ekranda ishlaydi',
      status: 'pending',
      detail: 'Kutilmoqda',
      icon: <Maximize className="w-5 h-5" />,
    },
  ]);

  // ─── Check updater ──────────────────────────────────────────────────────
  const updateCheck = useCallback((checkId: string, status: CheckStatus, detail: string) => {
    setChecks(prev => prev.map(c => c.id === checkId ? { ...c, status, detail } : c));
  }, []);

  // ─── Progress calculator ───────────────────────────────────────────────
  useEffect(() => {
    const passed = checks.filter(c => c.status === 'success').length;
    setOverallProgress(Math.round((passed / checks.length) * 100));
  }, [checks]);

  // ─── 1. AI Model Load ──────────────────────────────────────────────────
  const loadAIModel = useCallback(async () => {
    updateCheck('model', 'loading', 'WASM fayllar yuklanmoqda...');
    try {
      const startTime = performance.now();

      // Dynamic import from CDN
      const { FaceLandmarker, FilesetResolver } = await import(
        /* @vite-ignore */
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest'
      );

      const vision = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
      );

      const landmarker = await FaceLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath:
            'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
          delegate: 'GPU',
        },
        runningMode: 'VIDEO',
        numFaces: 2,
      });

      faceLandmarkerRef.current = landmarker;
      const elapsed = Math.round(performance.now() - startTime);
      updateCheck('model', 'success', `Tayyor (${elapsed}ms)`);
    } catch (error) {
      console.error('AI Model loading error:', error);
      updateCheck('model', 'failed', 'CDN bloklangan yoki tarmoq xatosi');
      setLiveGuidance({ text: 'Model yuklanmadi. VPN yoki tarmoq sozlamalarini tekshiring.', color: 'text-rose-400' });
    }
  }, [updateCheck]);

  // ─── 2. Hardware Init ──────────────────────────────────────────────────
  const initHardware = useCallback(async () => {
    updateCheck('hardware', 'loading', 'Ruxsat so\'ralmoqda...');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user' },
        audio: true,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      updateCheck('hardware', 'success', 'Ulandi');
      initAudioAnalysis(stream);
    } catch {
      updateCheck('hardware', 'failed', 'Ruxsat berilmadi');
      setLiveGuidance({ text: 'Iltimos, brauzerda kamera va mikrofonga ruxsat bering!', color: 'text-rose-400' });
    }
  }, [updateCheck]);

  // ─── 3. Audio Analysis ─────────────────────────────────────────────────
  const initAudioAnalysis = useCallback((stream: MediaStream) => {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    audioContextRef.current = ctx;
    const source = ctx.createMediaStreamSource(stream);
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 128;
    source.connect(analyser);
    analyserRef.current = analyser;

    const buffer = new Uint8Array(analyser.frequencyBinCount);
    let audioDetected = false;

    const checkAudio = () => {
      analyser.getByteFrequencyData(buffer);
      let sum = 0;
      for (const val of buffer) sum += val;
      const volume = sum / buffer.length;
      setAudioLevel(Math.min(100, volume * 2));

      if (volume > 25 && !audioDetected) {
        audioDetected = true;
        updateCheck('audio', 'success', 'Ovoz aniqlandi ✓');
      }

      animFrameRef.current = requestAnimationFrame(checkAudio);
    };
    checkAudio();
  }, [updateCheck]);

  // ─── 4. Face Detection Loop ────────────────────────────────────────────
  const runFaceDetection = useCallback(() => {
    if (!videoRef.current || !faceLandmarkerRef.current) return;

    let lastVideoTime = -1;
    let faceDetected = false;

    const predict = () => {
      const video = videoRef.current;
      if (!video || !faceLandmarkerRef.current) return;

      if (video.currentTime !== lastVideoTime && video.readyState >= 2) {
        lastVideoTime = video.currentTime;

        try {
          const results = faceLandmarkerRef.current.detectForVideo(video, performance.now());

          if (results?.faceLandmarks) {
            const count = results.faceLandmarks.length;

            if (count === 0) {
              setLiveGuidance({ text: '⚠ Kamerada yuz ko\'rinmayapti!', color: 'text-rose-400' });
            } else if (count > 1) {
              setLiveGuidance({ text: '⚠ Xonada begona odam aniqlandi!', color: 'text-rose-400' });
            } else {
              const landmarks = results.faceLandmarks[0];
              const nose = landmarks[1].x;
              const left = landmarks[234].x;
              const right = landmarks[454].x;
              const ratio = (nose - left) / (right - left);

              if (ratio < 0.32 || ratio > 0.68) {
                setLiveGuidance({ text: 'Iltimos, to\'g\'riga (kameraga) qarang!', color: 'text-amber-400' });
              } else {
                setLiveGuidance({ text: '✓ Ajoyib! Yuz pozitsiyasi to\'g\'ri.', color: 'text-emerald-400' });
                if (!faceDetected) {
                  faceDetected = true;
                  updateCheck('face', 'success', 'Muvaffaqiyatli ✓');
                }
              }
            }
          }
        } catch {
          // Ignore detection errors during warmup
        }
      }

      faceAnimFrameRef.current = requestAnimationFrame(predict);
    };
    predict();
  }, [updateCheck]);

  // ─── 5. Multi-Monitor Check ─────────────────────────────────────────────
  const checkMultiMonitor = useCallback(() => {
    if ((window.screen as any).isExtended) {
      updateCheck('screens', 'failed', '2-ekran aniqlandi!');
    } else {
      updateCheck('screens', 'success', 'Faqat 1 ta ekran ✓');
    }
  }, [updateCheck]);

  // ─── 6. Network Check ──────────────────────────────────────────────────
  const checkNetwork = useCallback(async () => {
    updateCheck('network', 'loading', 'Aloqa tekshirilmoqda...');
    try {
      const start = performance.now();
      // Fast lightweight ping to local server
      await fetch(window.location.origin + '/favicon.ico?_t=' + Date.now(), {
        method: 'HEAD',
        cache: 'no-store',
      }).catch(() => {});
      const latency = Math.max(18, Math.round(performance.now() - start));
      setNetworkLatency(latency);

      if (navigator.onLine) {
        if (latency < 300) {
          updateCheck('network', 'success', `Barqaror (${latency}ms) ✓`);
        } else if (latency < 1500) {
          updateCheck('network', 'success', `Yaxshi (${latency}ms) ✓`);
        } else {
          updateCheck('network', 'success', `Mobil internet (${latency}ms) ✓`);
        }
      } else {
        updateCheck('network', 'failed', 'Internet uzilgan (Oflayn)');
      }
    } catch {
      if (navigator.onLine) {
        updateCheck('network', 'success', 'Internet aloqasi faol ✓');
      } else {
        updateCheck('network', 'failed', 'Internet uzilgan');
      }
    }
  }, [updateCheck]);

  // ─── Master init sequence ──────────────────────────────────────────────
  useEffect(() => {
    const runDiagnostics = async () => {
      checkMultiMonitor();
      checkNetwork();
      await loadAIModel();
      await initHardware();
    };

    runDiagnostics();

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      cancelAnimationFrame(faceAnimFrameRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => {});
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Start face detection after both model and video are ready
  useEffect(() => {
    const modelCheck = checks.find(c => c.id === 'model');
    const hwCheck = checks.find(c => c.id === 'hardware');
    if (modelCheck?.status === 'success' && hwCheck?.status === 'success') {
      runFaceDetection();
    }
  }, [checks, runFaceDetection]);

  // ─── Ready evaluation ──────────────────────────────────────────────────
  const requiredChecks = ['model', 'hardware', 'face', 'audio', 'screens'];
  const allRequiredPassed = requiredChecks.every(
    cid => checks.find(c => c.id === cid)?.status === 'success'
  );

  const handleStartExam = async () => {
    try {
      updateCheck('fullscreen', 'loading', 'Faollashtirilmoqda...');
      await document.documentElement.requestFullscreen();
      updateCheck('fullscreen', 'success', 'Faol ✓');

      // Cleanup media before navigating
      cancelAnimationFrame(animFrameRef.current);
      cancelAnimationFrame(faceAnimFrameRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => {});
      }

      setTimeout(() => {
        navigate(`/olympiads/${id}/participate`);
      }, 800);
    } catch {
      updateCheck('fullscreen', 'failed', 'Ruxsat berilmadi');
    }
  };

  const handleRetry = () => {
    // Reset all checks and restart
    setChecks(prev => prev.map(c => ({ ...c, status: 'pending' as CheckStatus, detail: 'Kutilmoqda...' })));
    setAudioLevel(0);
    setLiveGuidance({ text: 'Diagnostika qayta boshlanmoqda...', color: 'text-slate-400' });
    cancelAnimationFrame(animFrameRef.current);
    cancelAnimationFrame(faceAnimFrameRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
    }

    setTimeout(async () => {
      checkMultiMonitor();
      checkNetwork();
      await loadAIModel();
      await initHardware();
    }, 300);
  };

  // ─── Render ────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#0a0e1a] text-white relative overflow-hidden">
      {/* Animated BG gradient orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-blue-600/5 blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full bg-violet-600/5 blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-emerald-600/3 blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-white/5 bg-white/[0.02] backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-tight">Tizimni Tekshirish</h1>
              <p className="text-[11px] text-slate-500 font-mono">Pre-flight Diagnostic • Sandbox Mode</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {networkLatency !== null && (
              <div className="flex items-center gap-1.5 text-xs font-mono text-slate-500">
                <Wifi className="w-3.5 h-3.5" />
                <span>{networkLatency}ms</span>
              </div>
            )}
            <div className="text-xs text-slate-500 font-mono">
              {olympiad?.title || 'Olimpiada'}
            </div>
          </div>
        </div>
      </header>

      {/* Overall Progress Bar */}
      <div className="relative z-10 h-1 bg-white/5">
        <div
          className="h-full bg-gradient-to-r from-blue-500 via-violet-500 to-emerald-500 transition-all duration-700 ease-out"
          style={{ width: `${overallProgress}%` }}
        />
      </div>

      {/* Main Content */}
      <main className="relative z-10 max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

          {/* ── Left: Camera & Live Feedback (3 cols) ── */}
          <div className="lg:col-span-3 space-y-5">
            {/* Video Feed Card */}
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm overflow-hidden">
              <div className="px-5 py-3 border-b border-white/[0.06] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-blue-400" />
                  <span className="text-sm font-semibold">Kamera va Xavfsizlik Monitoringi</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[11px] text-slate-500 font-mono">LIVE</span>
                </div>
              </div>

              <div className="relative aspect-video bg-black/50">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                  style={{ transform: 'scaleX(-1)' }}
                />
                <canvas ref={canvasRef} className="hidden" />

                {/* Face guide overlay */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-48 h-48 rounded-full border-2 border-dashed border-white/10" />
                </div>

                {/* Live status overlay */}
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                  <p className={`text-sm font-medium ${liveGuidance.color} transition-colors`}>
                    {liveGuidance.text}
                  </p>
                </div>

                {/* Face detection indicator */}
                {checks.find(c => c.id === 'face')?.status === 'success' && (
                  <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/20 backdrop-blur-sm border border-emerald-500/30">
                    <ScanFace className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-[11px] font-bold text-emerald-400">FACE LOCKED</span>
                  </div>
                )}
              </div>
            </div>

            {/* Audio Level Meter */}
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Volume2 className="w-4 h-4 text-violet-400" />
                  <span className="text-sm font-semibold">Mikrofon Signali</span>
                </div>
                <span className="text-[11px] text-slate-500 font-mono">
                  {checks.find(c => c.id === 'audio')?.status === 'success'
                    ? '✓ Tasdiqlandi'
                    : 'Biror so\'z ayting...'}
                </span>
              </div>

              {/* Spectrum-style meter */}
              <div className="flex items-end gap-[2px] h-10">
                {Array.from({ length: 40 }, (_, i) => {
                  const threshold = (i / 40) * 100;
                  const isActive = audioLevel > threshold;
                  const hue = isActive
                    ? threshold < 40
                      ? 'bg-emerald-500'
                      : threshold < 70
                      ? 'bg-amber-500'
                      : 'bg-rose-500'
                    : 'bg-slate-800';

                  return (
                    <div
                      key={i}
                      className={`flex-1 rounded-sm transition-all duration-75 ${hue}`}
                      style={{
                        height: isActive
                          ? `${Math.max(12, Math.random() * 100)}%`
                          : '12%',
                        opacity: isActive ? 1 : 0.3,
                      }}
                    />
                  );
                })}
              </div>

              {/* Linear bar */}
              <div className="mt-3 h-1.5 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 transition-all duration-100"
                  style={{ width: `${audioLevel}%` }}
                />
              </div>
            </div>

            {/* Tips */}
            <div className="rounded-2xl border border-blue-500/10 bg-blue-500/[0.03] p-4">
              <div className="flex items-start gap-3">
                <Zap className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-slate-400 space-y-1">
                  <p className="font-semibold text-slate-300">Sinov rejimi ko'rsatmalari:</p>
                  <ul className="space-y-0.5 list-disc list-inside">
                    <li>Kameraga to'g'ri qarang — yuz markazda bo'lishi kerak</li>
                    <li>Biror so'z ayting — mikrofon ishlayotganini tekshiramiz</li>
                    <li>Ikkinchi monitorni uzing (agar ulangan bo'lsa)</li>
                    <li>Barcha testlar muvaffaqiyatli o'tgach, tugma faollashadi</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* ── Right: Checklist Panel (2 cols) ── */}
          <div className="lg:col-span-2 space-y-5">
            {/* Status Checklist */}
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm overflow-hidden">
              <div className="px-5 py-3 border-b border-white/[0.06] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span className="text-sm font-semibold">Xavfsizlik Diagnostikasi</span>
                </div>
                <span className="text-[11px] font-mono text-slate-500">
                  {checks.filter(c => c.status === 'success').length}/{checks.length}
                </span>
              </div>

              <div className="divide-y divide-white/[0.04]">
                {checks.map((check, i) => {
                  const cfg = statusConfig[check.status];
                  return (
                    <div
                      key={check.id}
                      className={`px-5 py-3.5 flex items-center gap-3 transition-all duration-300 ${cfg.glow}`}
                      style={{ animationDelay: `${i * 100}ms` }}
                    >
                      {/* Icon */}
                      <div className={`w-9 h-9 rounded-xl ${cfg.bg} border ${cfg.border} flex items-center justify-center flex-shrink-0`}>
                        <span className={cfg.text}>{check.icon}</span>
                      </div>

                      {/* Label & description */}
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-semibold text-slate-200 truncate">{check.label}</p>
                        <p className="text-[11px] text-slate-500 truncate">{check.description}</p>
                      </div>

                      {/* Status badge */}
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        {statusIcons[check.status]}
                        <span className={`text-[11px] font-bold ${cfg.text} hidden xl:inline`}>
                          {check.detail}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Overall Progress Meter */}
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-slate-300">Umumiy tayyorgarlik</span>
                <span className="text-lg font-black font-mono text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
                  {overallProgress}%
                </span>
              </div>

              {/* Circular progress ring */}
              <div className="flex items-center justify-center py-3">
                <div className="relative w-28 h-28">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50" cy="50" r="42"
                      fill="none" stroke="currentColor"
                      className="text-slate-800"
                      strokeWidth="6"
                    />
                    <circle
                      cx="50" cy="50" r="42"
                      fill="none"
                      stroke="url(#progressGradient)"
                      strokeWidth="6"
                      strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 42}`}
                      strokeDashoffset={`${2 * Math.PI * 42 * (1 - overallProgress / 100)}`}
                      className="transition-all duration-700 ease-out"
                    />
                    <defs>
                      <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#3b82f6" />
                        <stop offset="50%" stopColor="#8b5cf6" />
                        <stop offset="100%" stopColor="#10b981" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-2xl font-black font-mono text-white">{overallProgress}%</div>
                      <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Tayyor</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                disabled={!allRequiredPassed}
                onClick={handleStartExam}
                className={`
                  w-full py-4 px-6 rounded-2xl font-bold text-sm flex items-center justify-center gap-2
                  transition-all duration-300 relative overflow-hidden group
                  ${allRequiredPassed
                    ? 'bg-gradient-to-r from-blue-600 via-violet-600 to-emerald-600 text-white shadow-xl shadow-blue-500/20 hover:shadow-blue-500/40 hover:scale-[1.02] active:scale-[0.98]'
                    : 'bg-slate-800/50 text-slate-600 cursor-not-allowed border border-slate-700/50'
                  }
                `}
              >
                {allRequiredPassed && (
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                )}
                {allRequiredPassed ? (
                  <>
                    <Maximize className="w-4.5 h-4.5" />
                    To'liq ekranga o'tish va Boshlash
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4.5 h-4.5" />
                    Barcha tekshiruvlardan o'ting
                  </>
                )}
              </button>

              <button
                onClick={handleRetry}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-medium text-slate-500 hover:text-slate-300 bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.06] transition-all flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Qayta tekshirish
              </button>
            </div>

            {/* Warning note */}
            {checks.some(c => c.status === 'failed') && (
              <div className="rounded-2xl border border-rose-500/20 bg-rose-500/[0.05] p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
                  <div className="text-xs text-slate-400 space-y-1">
                    <p className="font-semibold text-rose-300">Ba'zi testlar muvaffaqiyatsiz!</p>
                    <p>Iltimos, qizil bilan belgilangan elementlarni tekshiring va "Qayta tekshirish" tugmasini bosing.</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 bg-white/[0.02]">
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
          <span className="text-[11px] text-slate-600 font-mono">
            Next Olymp • Diagnostic v1.0
          </span>
          <span className="text-[11px] text-slate-600">
            Barcha tekshiruvlar brauzerda lokal ishlaydi • Ma'lumotlar serverga yuborilmaydi
          </span>
        </div>
      </footer>
    </div>
  );
};
