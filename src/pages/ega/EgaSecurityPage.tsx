import React, { useState, useMemo, useEffect, useRef } from 'react';
import { EgaLayout } from '../../components/ega/EgaLayout';
import { useSecurityStore, DefenseStatus } from '../../store/useSecurityStore';
import { SecurityAlert, AccessLog } from '../../data/initialSecurityLogs';
import { useThemeStore } from '../../store/useThemeStore';
import { buildFullSiteContext, AiProvider } from '../../services/aiChatService';
import { clsx } from 'clsx';
import {
  ShieldAlert, ShieldCheck, ShieldX, Activity, Globe, Search, Ban, Unlock, Eye, Bot,
  Sparkles, AlertTriangle, CheckCircle2, XCircle, Clock, Zap, BarChart2, List, Terminal,
  Wifi, WifiOff, X, Lock, Database, Cpu, Flame, Network, Radio, MonitorDot, CircleAlert,
  Send, MessageSquare, Power, ToggleLeft, ToggleRight, Server, HardDrive, MemoryStick,
  Gauge, ArrowDown, ArrowUp, RefreshCw, ChevronRight, Settings2, FileWarning, Fingerprint,
  KeyRound, ExternalLink, Check, Copy, Trash2, Sliders, Info, Shield, Layers, HelpCircle
} from 'lucide-react';
import { adminMonitoringService } from '../../services/adminMonitoringService';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const getFlagEmoji = (cc: string) => {
  if (!cc || cc.length !== 2) return '🌐';
  return cc.toUpperCase().split('').map((c) => String.fromCodePoint(0x1f1e6 + c.charCodeAt(0) - 65)).join('');
};

const statusBadge = (st: SecurityAlert['status']) => {
  switch (st) {
    case 'active': return 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse';
    case 'blocked': return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
    case 'investigating': return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
    case 'resolved': return 'bg-slate-500/20 text-slate-400 border-slate-500/40';
  }
};

const statusLabel = (st: SecurityAlert['status']) => {
  switch (st) {
    case 'active': return 'Faol';
    case 'blocked': return 'Bloklangan';
    case 'investigating': return 'Tekshirilmoqda';
    case 'resolved': return 'Hal etildi';
  }
};

const severityBadge = (sv: SecurityAlert['severity']) => {
  switch (sv) {
    case 'critical': return 'bg-rose-600/30 text-rose-300 border-rose-500/50';
    case 'high': return 'bg-orange-500/20 text-orange-300 border-orange-500/40';
    case 'medium': return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
    case 'low': return 'bg-blue-500/20 text-blue-300 border-blue-500/40';
  }
};

const severityLabel = (sv: SecurityAlert['severity']) => {
  switch (sv) {
    case 'critical': return 'Kritik';
    case 'high': return 'Yuqori';
    case 'medium': return "O'rta";
    case 'low': return 'Past';
  }
};

const alertTypeLabel = (type: SecurityAlert['type']) => {
  switch (type) {
    case 'ddos': return 'DDoS';
    case 'brute_force': return 'Brute Force';
    case 'sql_injection': return 'SQL Injection';
    case 'xss': return 'XSS';
    case 'suspicious_scan': return 'Vuln Scan';
    case 'rate_limit': return 'Rate Limit';
    case 'geo_block': return 'Geo Block';
    case 'bot': return 'Bot';
  }
};

const httpStatusColor = (code: number) => code < 300 ? 'text-emerald-400' : code < 400 ? 'text-blue-400' : code < 500 ? 'text-amber-400' : 'text-rose-400';

const methodColor = (m: string) => {
  switch (m) {
    case 'GET': return 'bg-blue-500/15 text-blue-300';
    case 'POST': return 'bg-emerald-500/15 text-emerald-300';
    case 'PUT': return 'bg-amber-500/15 text-amber-300';
    case 'DELETE': return 'bg-rose-500/15 text-rose-300';
    default: return 'bg-slate-500/15 text-slate-300';
  }
};

const logLevelDot = (level: string) => {
  switch (level) {
    case 'info': return 'bg-emerald-400';
    case 'warning': return 'bg-amber-400';
    case 'error': return 'bg-orange-500';
    case 'critical': return 'bg-rose-500 animate-pulse';
    default: return 'bg-slate-400';
  }
};

// ─── Gauge Component ──────────────────────────────────────────────────────────
const CircularGauge: React.FC<{ value: number; label: string; color: string; size?: number; isDark: boolean }> = ({ value, label, color, size = 56, isDark }) => {
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - Math.min(100, Math.max(0, value)) / 100);
  return (
    <div className="flex flex-col items-center gap-0.5">
      <div className="relative" style={{ width: size, height: size }}>
        <svg className="-rotate-90" width={size} height={size}>
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={isDark ? '#162748' : '#e2e8f0'} strokeWidth="5" />
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth="5" strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" className="transition-all duration-700" />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-[11px] font-black" style={{ color }}>{value}%</span>
        </div>
      </div>
      <span className="text-[9px] text-slate-400 font-semibold uppercase">{label}</span>
    </div>
  );
};

// ─── MiniBar ──────────────────────────────────────────────────────────────────
const MiniBar: React.FC<{ data: { time: string; requests: number; errors: number; blocked: number }[]; isDark: boolean }> = ({ data, isDark }) => {
  const maxVal = Math.max(...data.map((d) => d.requests), 1);
  return (
    <div className="flex items-end gap-px h-12 w-full">
      {data.map((d, i) => {
        const h = (d.requests / maxVal) * 100;
        const spike = d.requests > 500;
        return (
          <div key={i} className="flex-1 group relative flex flex-col items-center">
            <div className={clsx('w-full rounded-t-sm transition-all', spike ? 'bg-rose-500 animate-pulse' : d.errors > 20 ? 'bg-amber-500' : 'bg-indigo-500/80')} style={{ height: `${h}%`, minHeight: 1 }} />
            <div className="absolute -top-7 left-1/2 -translate-x-1/2 hidden group-hover:block bg-black/90 text-[8px] text-white rounded px-1.5 py-0.5 whitespace-nowrap z-10 font-mono">
              {d.time}: {d.requests}req {d.errors > 0 && `${d.errors}err`}
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ─── Defense Toggle ───────────────────────────────────────────────────────────
const DefenseToggle: React.FC<{ label: string; active: boolean; onToggle: () => void; icon: React.ReactNode; isDark: boolean; danger?: boolean }> = ({ label, active, onToggle, icon, isDark, danger }) => (
  <button onClick={onToggle} className={clsx('flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer border w-full text-left', active ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' : danger ? 'bg-rose-500/10 border-rose-500/30 text-rose-400' : isDark ? 'bg-[#091024] border-[#162748] text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-500')}>
    <span className={clsx('shrink-0', active ? 'text-emerald-400' : danger ? 'text-rose-400' : 'text-slate-500')}>{icon}</span>
    <span className="flex-1 truncate">{label}</span>
    {active ? <ToggleRight className="w-4 h-4 text-emerald-400 shrink-0" /> : <ToggleLeft className="w-4 h-4 text-slate-500 shrink-0" />}
  </button>
);

// ─── TABS ─────────────────────────────────────────────────────────────────────
type Tab = 'monitor' | 'chat' | 'logs' | 'alerts' | 'blocked';

export const EgaSecurityPage: React.FC = () => {
  const store = useSecurityStore();
  const { theme } = useThemeStore();
  const isDark = theme === 'dark';

  const [activeTab, setActiveTab] = useState<Tab>('chat');
  const [searchAccess, setSearchAccess] = useState('');
  const [levelFilter, setLevelFilter] = useState<string>('all');
  const [logCategoryFilter, setLogCategoryFilter] = useState<'all' | 'failed_logins' | 'success_logins' | 'rate_limits'>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedAlert, setSelectedAlert] = useState<SecurityAlert | null>(null);
  const [aiAnalysisText, setAiAnalysisText] = useState('');
  const [isAiAnalyzing, setIsAiAnalyzing] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [liveLogStream, setLiveLogStream] = useState<string[]>([]);
  
  // Modals state
  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);
  const [blockModalIP, setBlockModalIP] = useState('');
  const [blockModalReason, setBlockModalReason] = useState('');
  const [blockModalPermanent, setBlockModalPermanent] = useState(false);

  const [isAiSettingsOpen, setIsAiSettingsOpen] = useState(false);
  const [isContextPreviewOpen, setIsContextPreviewOpen] = useState(false);
  const [showKeySecret, setShowKeySecret] = useState(false);
  const [testApiStatus, setTestApiStatus] = useState<{ testing: boolean; success?: boolean; message?: string } | null>(null);

  // Local AI form state
  const [selectedProvider, setSelectedProvider] = useState<AiProvider>(store.aiSettings.provider || 'gemini');
  const [tempApiKey, setTempApiKey] = useState(store.getActiveApiKey());
  const [tempModel, setTempModel] = useState(store.getActiveModel());
  const [tempCustomUrl, setTempCustomUrl] = useState(store.aiSettings.customApiUrl || '');

  const chatEndRef = useRef<HTMLDivElement>(null);
  const liveRef = useRef<HTMLDivElement>(null);
  const chatInputRef = useRef<HTMLInputElement>(null);

  // Sync with adminMonitoringService for realistic system stats
  useEffect(() => {
    let isMounted = true;
    const updateStats = async () => {
      try {
        const stats = await adminMonitoringService.getSystemStats();
        if (isMounted) {
          store.updateServerMetrics({
            ram: stats.ram.usagePercent,
            ramTotalMb: stats.ram.totalMb,
            ramUsedMb: stats.ram.usedMb,
            ramFreeMb: stats.ram.freeMb,
            disk: stats.disk.usagePercent,
            diskTotalGb: stats.disk.totalGb,
            diskUsedGb: stats.disk.usedGb,
            diskFreeGb: stats.disk.freeGb,
            cpu: stats.cpu.usagePercent,
            uptime: stats.uptime,
            activeConnections: stats.network.activeConnections,
            threatLevel: stats.threatLevel
          });
        }
      } catch (err) {
        console.error('Failed to sync system stats', err);
      }
    };

    updateStats();
    const interval = setInterval(updateStats, 10000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // Sync AI modal form when opened
  useEffect(() => {
    if (isAiSettingsOpen) {
      setSelectedProvider(store.aiSettings.provider);
      setTempApiKey(store.getActiveApiKey());
      setTempModel(store.getActiveModel());
      setTempCustomUrl(store.aiSettings.customApiUrl || '');
      setTestApiStatus(null);
    }
  }, [isAiSettingsOpen]);

  // When provider changes in modal, update default model
  const handleProviderChange = (p: AiProvider) => {
    setSelectedProvider(p);
    switch (p) {
      case 'gemini':
        setTempApiKey(store.aiSettings.geminiApiKey || '');
        setTempModel(store.aiSettings.geminiModel || 'gemini-3.7-flash');
        break;
      case 'openai':
        setTempApiKey(store.aiSettings.openaiApiKey || '');
        setTempModel(store.aiSettings.openaiModel || 'gpt-4o-mini');
        break;
      case 'groq':
        setTempApiKey(store.aiSettings.groqApiKey || '');
        setTempModel(store.aiSettings.groqModel || 'llama-3.3-70b-versatile');
        break;
      case 'deepseek':
        setTempApiKey(store.aiSettings.deepseekApiKey || '');
        setTempModel(store.aiSettings.deepseekModel || 'deepseek-chat');
        break;
      case 'openrouter':
        setTempApiKey(store.aiSettings.openrouterApiKey || '');
        setTempModel(store.aiSettings.openrouterModel || 'google/gemini-2.0-flash-exp:free');
        break;
      case 'custom':
        setTempApiKey(store.aiSettings.customApiKey || '');
        setTempModel('custom');
        break;
    }
  };

  const handleSaveAiSettings = () => {
    const updates: any = {
      provider: selectedProvider,
      customApiUrl: tempCustomUrl,
    };

    if (selectedProvider === 'gemini') {
      updates.geminiApiKey = tempApiKey.trim();
      updates.geminiModel = tempModel;
    } else if (selectedProvider === 'openai') {
      updates.openaiApiKey = tempApiKey.trim();
      updates.openaiModel = tempModel;
    } else if (selectedProvider === 'groq') {
      updates.groqApiKey = tempApiKey.trim();
      updates.groqModel = tempModel;
    } else if (selectedProvider === 'deepseek') {
      updates.deepseekApiKey = tempApiKey.trim();
      updates.deepseekModel = tempModel;
    } else if (selectedProvider === 'openrouter') {
      updates.openrouterApiKey = tempApiKey.trim();
      updates.openrouterModel = tempModel;
    } else if (selectedProvider === 'custom') {
      updates.customApiKey = tempApiKey.trim();
      updates.customApiUrl = tempCustomUrl.trim();
    }

    store.updateAiSettings(updates);
    setIsAiSettingsOpen(false);

    store.addAiChatMessage({
      id: `sys-key-updated-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      sender: 'system',
      text: `🔑 AI Sozlamalari yangilandi! Provayder: ${selectedProvider.toUpperCase()} (${tempModel}). Barcha sayt ma'lumotlari ushbu modelga ulandi.`,
      type: 'info'
    });
  };

  const handleTestApiConnection = async () => {
    if (!tempApiKey.trim()) {
      setTestApiStatus({ testing: false, success: false, message: 'Iltimos, API kalitni kiriting!' });
      return;
    }
    setTestApiStatus({ testing: true });

    try {
      if (selectedProvider === 'gemini') {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${tempModel || 'gemini-3.7-flash'}:generateContent?key=${tempApiKey.trim()}`;
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ role: 'user', parts: [{ text: 'Salom, test ulanish.' }] }] })
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error?.message || `HTTP ${res.status}`);
        }
        setTestApiStatus({ testing: false, success: true, message: '✅ Google Gemini API muvaffaqiyatli ulandi!' });
      } else if (selectedProvider === 'openai') {
        const res = await fetch('https://api.openai.com/v1/models', {
          headers: { 'Authorization': `Bearer ${tempApiKey.trim()}` }
        });
        if (!res.ok) throw new Error(`OpenAI HTTP ${res.status}`);
        setTestApiStatus({ testing: false, success: true, message: '✅ OpenAI API muvaffaqiyatli ulandi!' });
      } else if (selectedProvider === 'groq') {
        const res = await fetch('https://api.groq.com/openai/v1/models', {
          headers: { 'Authorization': `Bearer ${tempApiKey.trim()}` }
        });
        if (!res.ok) throw new Error(`Groq HTTP ${res.status}`);
        setTestApiStatus({ testing: false, success: true, message: '✅ Groq API muvaffaqiyatli ulandi!' });
      } else {
        setTestApiStatus({ testing: false, success: true, message: '✅ Kalit formati to\'g\'ri qabul qilindi!' });
      }
    } catch (err: any) {
      setTestApiStatus({ testing: false, success: false, message: `❌ Xatolik: ${err.message || 'Ulanib bo\'lmadi'}` });
    }
  };

  // Stats
  const criticalAlerts = useMemo(() => store.alerts.filter((a) => a.severity === 'critical' && a.status === 'active').length, [store.alerts]);
  const activeAlerts = useMemo(() => store.alerts.filter((a) => a.status === 'active' || a.status === 'investigating').length, [store.alerts]);
  const totalRequests = useMemo(() => store.trafficData.reduce((s, d) => s + d.requests, 0), [store.trafficData]);

  // Server metrics simulation
  useEffect(() => {
    const interval = setInterval(() => {
      store.updateServerMetrics({
        cpu: Math.max(15, Math.min(95, store.serverMetrics.cpu + (Math.random() * 10 - 5))),
        ram: Math.max(30, Math.min(95, store.serverMetrics.ram + (Math.random() * 6 - 3))),
        activeConnections: Math.max(50, Math.floor(store.serverMetrics.activeConnections + (Math.random() * 30 - 15))),
        requestsPerSec: Math.max(5, Math.floor(store.serverMetrics.requestsPerSec + (Math.random() * 16 - 8))),
        responseTimeAvg: Math.max(40, Math.floor(store.serverMetrics.responseTimeAvg + (Math.random() * 30 - 15))),
      });
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  // Live log simulation
  useEffect(() => {
    if (!store.liveMode) return;
    const paths = ['/api/v1/olympiads', '/api/v1/auth/login', '/api/v1/leaderboard', '/api/v1/payments', '/ega/competitions', '/api/v1/users', '/api/v1/contests/submit', '/api/v1/certificates/verify'];
    const ips = ['91.213.8.55', '195.182.55.80', '91.213.8.77', '195.182.55.82', '91.213.8.60', '10.0.0.1'];
    const interval = setInterval(() => {
      const ip = ips[Math.floor(Math.random() * ips.length)];
      const path = paths[Math.floor(Math.random() * paths.length)];
      const codes = [200, 200, 200, 200, 200, 200, 200, 301, 401, 403, 404, 429, 500];
      const code = codes[Math.floor(Math.random() * codes.length)];
      const ms = Math.floor(Math.random() * 400) + 15;
      const methods = ['GET', 'GET', 'GET', 'POST', 'PUT'];
      const method = methods[Math.floor(Math.random() * methods.length)];
      const line = `[${new Date().toLocaleTimeString('uz')}] ${ip} "${method} ${path}" ${code} ${ms}ms ${Math.floor(Math.random() * 20000)}B`;
      setLiveLogStream((prev) => [line, ...prev].slice(0, 80));
    }, 600);
    return () => clearInterval(interval);
  }, [store.liveMode]);

  // Auto-defense: simulate threat detection
  useEffect(() => {
    if (!store.autoDefend || !store.liveMode) return;
    const interval = setInterval(() => {
      const r = Math.random();
      if (r < 0.08) {
        const threatIPs = ['178.62.221.44', '116.203.45.12', '94.130.12.88', '51.15.74.200', '209.141.59.11'];
        const ip = threatIPs[Math.floor(Math.random() * threatIPs.length)];
        if (!store.blockedIPs.find(b => b.ip === ip)) {
          const types = ['Suspicious port scan', 'Rate limit exceeded', 'Bot traffic aniqlandi', 'Brute force urinishi'];
          const reason = types[Math.floor(Math.random() * types.length)];
          store.blockIP(ip, 'Noma\'lum', 'XX', `Auto-defend: ${reason}`, false);
          store.addAiChatMessage({
            id: `auto-${Date.now()}`,
            timestamp: new Date().toLocaleTimeString(),
            sender: 'ai',
            text: `🛡️ **AUTO-DEFEND**: Yangi tahdid aniqlandi va bloklandi!\n\n• **IP**: \`${ip}\`\n• **Sabab**: ${reason}\n• **Amal**: Vaqtinchalik bloklash (24 soat)\n• **Holat**: ✅ Tizim himoyalandi`,
            type: 'alert',
          });
        }
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [store.autoDefend, store.liveMode]);

  // Scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [store.aiChatMessages, store.isAiLoading]);

  const handleChatSend = async () => {
    const text = chatInput.trim();
    if (!text || store.isAiLoading) return;
    setChatInput('');
    await store.sendMessageToAi(text);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleChatSend();
    }
  };

  const handleAiAnalyze = (alert: SecurityAlert) => {
    setSelectedAlert(alert);
    setAiAnalysisText('');
    setIsAiAnalyzing(true);
    setTimeout(() => {
      const text = alert.aiAnalysis || store.generateAiAnalysis(alert);
      let i = 0;
      const iv = setInterval(() => {
        setAiAnalysisText(text.slice(0, i));
        i += 4;
        if (i >= text.length) {
          setAiAnalysisText(text);
          clearInterval(iv);
          setIsAiAnalyzing(false);
        }
      }, 15);
    }, 400);
  };

  const openBlockModal = (ip = '', reason = '') => {
    setBlockModalIP(ip);
    setBlockModalReason(reason);
    setBlockModalPermanent(false);
    setIsBlockModalOpen(true);
  };

  const filteredAccess = useMemo(() => store.accessLogs.filter((l) => {
    const match = l.ip.includes(searchAccess) || l.path.toLowerCase().includes(searchAccess.toLowerCase()) || (l.userName || '').toLowerCase().includes(searchAccess.toLowerCase()) || String(l.statusCode).includes(searchAccess);
    const lvl = levelFilter === 'all' || l.level === levelFilter;
    let cat = true;
    if (logCategoryFilter === 'failed_logins') {
      cat = l.statusCode === 401 || l.level === 'error' || l.path.includes('login');
    } else if (logCategoryFilter === 'success_logins') {
      cat = l.statusCode === 200 && l.path.includes('login');
    } else if (logCategoryFilter === 'rate_limits') {
      cat = l.statusCode === 429 || l.level === 'warning';
    }
    return match && lvl && cat;
  }), [store.accessLogs, searchAccess, levelFilter, logCategoryFilter]);

  const filteredAlerts = useMemo(() => store.alerts.filter((a) => statusFilter === 'all' || a.status === statusFilter), [store.alerts, statusFilter]);

  const m = store.serverMetrics;
  const def = store.defenseStatus;
  const cpuColor = m.cpu > 80 ? '#ef4444' : m.cpu > 60 ? '#f59e0b' : '#22c55e';
  const ramColor = m.ram > 85 ? '#ef4444' : m.ram > 70 ? '#f59e0b' : '#22c55e';
  const diskColor = m.disk > 80 ? '#ef4444' : '#22c55e';

  const hasApiKey = Boolean(store.getActiveApiKey()?.trim());

  const tabs: { id: Tab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'chat', label: 'AI Superadmin Chat', icon: <MessageSquare className="w-3.5 h-3.5" />, badge: store.isAiLoading ? 1 : undefined },
    { id: 'monitor', label: 'Monitoring', icon: <MonitorDot className="w-3.5 h-3.5" /> },
    { id: 'logs', label: 'Access Log', icon: <List className="w-3.5 h-3.5" />, badge: store.accessLogs.length },
    { id: 'alerts', label: 'Tahdidlar', icon: <ShieldAlert className="w-3.5 h-3.5" />, badge: activeAlerts || undefined },
    { id: 'blocked', label: 'Bloklangan IP lar', icon: <Ban className="w-3.5 h-3.5" />, badge: store.blockedIPs.length || undefined },
  ];

  return (
    <EgaLayout>
      <div className="space-y-3 font-sans text-xs">
        {/* ── HEADER ──────────────────────────────────────────────── */}
        <div className={clsx('flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border shadow-sm', isDark ? 'bg-[#0D1832] border-[#182A4D]' : 'bg-white border-slate-200')}>
          <div>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-rose-500 via-indigo-500 to-amber-400 flex items-center justify-center text-white shadow-md shadow-indigo-900/40">
                <ShieldAlert className="w-4 h-4" />
              </div>
              <h1 className={clsx('text-base font-bold flex items-center gap-2', isDark ? 'text-white' : 'text-slate-900')}>
                AI Kiberxavfsizlik & Boshqaruv Markazi
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-gradient-to-r from-amber-500/20 to-indigo-500/20 text-amber-300 border border-amber-500/30">
                  REAL AI CONNECTED
                </span>
              </h1>
            </div>
            <p className={clsx('text-[11px] mt-0.5', isDark ? 'text-slate-400' : 'text-slate-500')}>
              Butun sayt (Xavfsizlik, Moliya, Olimpiadalar, Foydalanuvchilar, Reyting) real vaqtda AI ga ulangan · Cheksiz buyruqlar
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* API Settings Button */}
            <button
              onClick={() => setIsAiSettingsOpen(true)}
              className={clsx(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border cursor-pointer shadow-sm',
                hasApiKey
                  ? isDark ? 'bg-indigo-600/30 border-indigo-500/50 text-indigo-200 hover:bg-indigo-600/40' : 'bg-indigo-50 border-indigo-300 text-indigo-700'
                  : 'bg-amber-500 hover:bg-amber-400 text-slate-950 border-amber-400 animate-pulse'
              )}
            >
              <KeyRound className="w-3.5 h-3.5" />
              {hasApiKey ? `API: ${store.aiSettings.provider.toUpperCase()}` : '🔑 API Kalitni Ulash'}
            </button>

            {/* Context preview */}
            <button
              onClick={() => setIsContextPreviewOpen(true)}
              title="AI ko'rayotgan to'liq ma'lumotlar"
              className={clsx('flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border cursor-pointer', isDark ? 'bg-[#112144] border-[#1E365E] text-slate-300 hover:bg-[#182F5E]' : 'bg-slate-100 border-slate-300 text-slate-700')}
            >
              <Layers className="w-3.5 h-3.5 text-blue-400" />
              Sayt Konteksti
            </button>

            {/* Auto Defend */}
            <button
              onClick={() => store.setAutoDefend(!store.autoDefend)}
              className={clsx('flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border cursor-pointer', store.autoDefend ? 'bg-emerald-600/90 border-emerald-500 text-white shadow-lg shadow-emerald-900/30' : 'bg-rose-600/20 border-rose-500/40 text-rose-300')}
            >
              {store.autoDefend ? <ShieldCheck className="w-3.5 h-3.5" /> : <ShieldX className="w-3.5 h-3.5" />}
              {store.autoDefend ? 'Auto-Himoya: ON' : 'Auto-Himoya: OFF'}
            </button>

            {/* Live Mode */}
            <button
              onClick={() => store.setLiveMode(!store.liveMode)}
              className={clsx('flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border cursor-pointer', store.liveMode ? 'bg-emerald-600/90 border-emerald-500 text-white' : isDark ? 'bg-[#112144] border-[#1E365E] text-slate-300' : 'bg-slate-100 border-slate-300 text-slate-600')}
            >
              {store.liveMode ? <Wifi className="w-3.5 h-3.5 animate-pulse" /> : <WifiOff className="w-3.5 h-3.5" />}
              {store.liveMode ? 'LIVE' : 'Offline'}
              {store.liveMode && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />}
            </button>
          </div>
        </div>

        {/* ── API KEY NOTIFICATION BANNER (if missing) ─────────────── */}
        {!hasApiKey && (
          <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-gradient-to-r from-amber-500/15 via-indigo-500/10 to-transparent border border-amber-500/40">
            <div className="flex items-center gap-2.5">
              <KeyRound className="w-5 h-5 text-amber-400 shrink-0 animate-bounce" />
              <div>
                <span className="text-amber-300 font-bold text-xs">Haqiqiy AI (Gemini / OpenAI) API kalitini ulang!</span>
                <p className="text-slate-400 text-[11px] mt-0.5">
                  Google Gemini (bepul), OpenAI yoki Groq API kalitini kiritib, AI bilan butun sayt bo'yicha cheksiz suhbatlashing va buyruqlar bering.
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsAiSettingsOpen(true)}
              className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-lg text-xs cursor-pointer shrink-0 shadow-md"
            >
              Kalitni Kiritish
            </button>
          </div>
        )}

        {/* ── CRITICAL BANNER ──────────────────────────────────────── */}
        {criticalAlerts > 0 && (
          <div className="flex items-center gap-3 p-3 rounded-xl bg-rose-600/20 border border-rose-500/50 animate-pulse">
            <Flame className="w-5 h-5 text-rose-400 shrink-0 animate-bounce" />
            <div className="flex-1">
              <span className="text-rose-300 font-black text-xs uppercase tracking-wider">⚠ {criticalAlerts} ta KRITIK xavf aniqlandi!</span>
              <p className="text-rose-400/80 text-[10px] mt-0.5">{store.autoDefend ? 'AI avtomatik himoya qilmoqda.' : 'Auto-himoyani yoqing!'}</p>
            </div>
            <button onClick={() => setActiveTab('alerts')} className="px-3 py-1.5 bg-rose-500 hover:bg-rose-400 text-white font-bold rounded-lg text-xs cursor-pointer shrink-0">Ko'rish</button>
          </div>
        )}

        {/* ── TABS ─────────────────────────────────────────────────── */}
        <div className={clsx('flex items-center gap-1 overflow-x-auto p-1 rounded-xl border', isDark ? 'bg-[#0A1526] border-[#182A4D]' : 'bg-slate-50 border-slate-200')}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={clsx(
                'flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold shrink-0 transition-all cursor-pointer whitespace-nowrap',
                activeTab === tab.id
                  ? isDark ? 'bg-[#1B3260] text-amber-400 font-bold shadow-md' : 'bg-white text-amber-600 font-bold shadow-sm'
                  : isDark ? 'text-slate-400 hover:text-white hover:bg-[#11203E]' : 'text-slate-500 hover:text-slate-900 hover:bg-white'
              )}
            >
              {tab.icon}<span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span className={clsx('px-1.5 py-0.5 rounded text-[9px] font-black', tab.id === 'alerts' && tab.badge > 0 ? 'bg-rose-500/30 text-rose-300' : tab.id === 'chat' ? 'bg-indigo-500/30 text-indigo-300 animate-pulse' : 'bg-slate-500/20 text-slate-400')}>
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ═══════════════════════════════════════════════════════════
            TAB: AI CHAT (PRIMARY SUPERADMIN COPILOT)
        ═══════════════════════════════════════════════════════════ */}
        {activeTab === 'chat' && (
          <div className={clsx('rounded-xl border overflow-hidden flex flex-col', isDark ? 'bg-[#0D1832] border-[#182A4D]' : 'bg-white border-slate-200')} style={{ height: 'calc(100vh - 280px)', minHeight: 520 }}>
            {/* Chat header */}
            <div className={clsx('px-4 py-3 border-b flex items-center justify-between gap-3', isDark ? 'border-[#182A4D] bg-[#091024]' : 'border-slate-200 bg-slate-50')}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-900/30">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className={clsx('text-xs font-bold', isDark ? 'text-white' : 'text-slate-900')}>AI Superadmin Sentinel Chat</h2>
                    <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-mono">
                      {store.getActiveModel()}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
                    To'liq sayt boshqaruvi · Real-vaqt ma'lumotlariga ulangan · Buyruq ijrosi
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-[10px]">
                <button
                  onClick={() => setIsContextPreviewOpen(true)}
                  className={clsx('px-2.5 py-1 rounded-lg font-bold border transition-all cursor-pointer flex items-center gap-1', isDark ? 'bg-[#112144] border-[#1E365E] text-slate-300 hover:bg-[#182F5E]' : 'bg-white border-slate-300 text-slate-700')}
                >
                  <Eye className="w-3 h-3 text-blue-400" />
                  Kontekst
                </button>
                <button
                  onClick={() => setIsAiSettingsOpen(true)}
                  className={clsx('px-2.5 py-1 rounded-lg font-bold border transition-all cursor-pointer flex items-center gap-1', isDark ? 'bg-[#112144] border-[#1E365E] text-slate-300 hover:bg-[#182F5E]' : 'bg-white border-slate-300 text-slate-700')}
                >
                  <Sliders className="w-3 h-3 text-amber-400" />
                  Sozlamalar
                </button>
                <button
                  onClick={() => store.clearAiChat()}
                  title="Chat tarixini tozalash"
                  className={clsx('p-1.5 rounded-lg border text-slate-400 hover:text-rose-400 transition-all cursor-pointer', isDark ? 'bg-[#112144] border-[#1E365E]' : 'bg-white border-slate-300')}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Chat messages list */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 custom-scrollbar">
              {store.aiChatMessages.map((msg) => {
                const isUser = msg.sender === 'user';
                const isSystem = msg.sender === 'system';

                return (
                  <div key={msg.id} className={clsx('flex flex-col', isUser ? 'items-end' : 'items-start')}>
                    <div className="flex items-center gap-1.5 mb-1 px-1">
                      <span className={clsx('text-[10px] font-black flex items-center gap-1', isUser ? 'text-amber-400' : isSystem ? 'text-slate-500' : 'text-indigo-400')}>
                        {isUser ? '👤 Siz (Admin)' : isSystem ? '⚙️ Tizim Xabari' : '🤖 AI Sentinel'}
                      </span>
                      {msg.modelUsed && !isUser && (
                        <span className="text-[9px] text-slate-500 font-mono">({msg.modelUsed})</span>
                      )}
                      <span className="text-[8px] text-slate-500 font-mono">{msg.timestamp}</span>
                    </div>

                    <div className={clsx(
                      'max-w-2xl rounded-2xl p-3.5 text-xs leading-relaxed shadow-sm border whitespace-pre-wrap',
                      isUser
                        ? isDark ? 'bg-amber-600/20 border-amber-500/40 text-amber-50 rounded-tr-none' : 'bg-amber-50 border-amber-200 text-amber-900 rounded-tr-none'
                        : isSystem
                        ? isDark ? 'bg-[#091024] border-[#182A4D] text-slate-400 rounded-tl-none font-mono text-[11px]' : 'bg-slate-50 border-slate-200 text-slate-600 rounded-tl-none font-mono text-[11px]'
                        : msg.type === 'alert'
                        ? isDark ? 'bg-rose-950/40 border-rose-500/40 text-rose-100 rounded-tl-none' : 'bg-rose-50 border-rose-200 text-rose-900 rounded-tl-none'
                        : isDark ? 'bg-[#081229] border-[#1E3B6E] text-slate-100 rounded-tl-none' : 'bg-indigo-50/50 border-indigo-200 text-slate-900 rounded-tl-none'
                    )}>
                      {msg.text}

                      {/* Executed actions badge list */}
                      {msg.executedActions && msg.executedActions.length > 0 && (
                        <div className="mt-2.5 pt-2.5 border-t border-indigo-500/20 space-y-1.5">
                          <span className="text-[10px] font-black text-emerald-400 flex items-center gap-1 uppercase tracking-wider">
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            AI tomonidan ijro etilgan amallar ({msg.executedActions.length}):
                          </span>
                          {msg.executedActions.map((act, idx) => (
                            <div key={idx} className={clsx('p-1.5 rounded text-[10px] flex items-center justify-between border', isDark ? 'bg-[#050B18] border-emerald-500/30 text-emerald-300' : 'bg-emerald-50 border-emerald-200 text-emerald-800')}>
                              <span className="font-bold">⚡ {act.type}: <code className="text-amber-300">{act.target}</code></span>
                              <span className="text-[9px] opacity-80">{act.details}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {store.isAiLoading && (
                <div className="flex items-start">
                  <div className={clsx('rounded-2xl rounded-tl-none p-3.5 text-xs border max-w-sm', isDark ? 'bg-[#081229] border-[#1E3B6E] text-indigo-300' : 'bg-indigo-50 border-indigo-200 text-indigo-800')}>
                    <div className="flex items-center gap-2">
                      <Cpu className="w-4 h-4 animate-spin text-indigo-400" />
                      <span className="animate-pulse font-semibold">AI Sentinel tahlil qilmoqda va javob tayyorlamoqda...</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Quick Topic Chips */}
            <div className={clsx('px-3 py-2 border-t flex items-center gap-1.5 overflow-x-auto custom-scrollbar', isDark ? 'border-[#182A4D] bg-[#060E20]' : 'border-slate-200 bg-slate-50')}>
              <span className="text-[10px] font-bold text-slate-500 shrink-0">💡 Tezkor savollar:</span>
              {[
                { label: '📊 Server holati', q: 'Server holati, CPU va RAM yuklamasini ko\'rsat' },
                { label: '🚨 Kimlar hujum qilyapti?', q: 'Saytga kimlar hujum qilyapti? Tahdidlar va hujumchilar tahlilini ber' },
                { label: '💰 Moliya statistikasi', q: 'Saytning umumiy moliya va to\'lovlar hisobotini tahlil qilib ber' },
                { label: '🏆 Olimpiadalar', q: 'Saytda nechta olimpiada bor va qaysi fanlar bo\'yicha ochiq?' },
                { label: '🥇 Top o\'quvchilar', q: 'Respublika bo\'yicha eng yuqori reytingdagi top o\'quvchilar kimlar?' },
                { label: '🛡️ DDoS himoyasini yoq', q: 'DDoS himoyasini va WAF ni yoq' },
                { label: '🔍 Xavfsizlik skaneri', q: 'Sayt xavfsizligini to\'liq tekshirib umumiy ball chiqar' },
              ].map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setChatInput(chip.q);
                    setTimeout(() => chatInputRef.current?.focus(), 50);
                  }}
                  className={clsx(
                    'px-2.5 py-1 rounded-lg text-[10px] font-semibold shrink-0 cursor-pointer transition-all border whitespace-nowrap',
                    isDark ? 'bg-[#0D1832] border-[#182A4D] text-slate-300 hover:text-amber-300 hover:border-amber-500/40' : 'bg-white border-slate-200 text-slate-600 hover:text-indigo-600'
                  )}
                >
                  {chip.label}
                </button>
              ))}
            </div>

            {/* Input Bar */}
            <div className={clsx('px-4 py-3 border-t', isDark ? 'border-[#182A4D] bg-[#091024]' : 'border-slate-200 bg-slate-50')}>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Terminal className="w-4 h-4 absolute left-3.5 top-3 text-indigo-400" />
                  <input
                    ref={chatInputRef}
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={store.isAiLoading}
                    placeholder="AI ga istalgan savol yoki buyruq yozing (masalan: 'Kimlar hujum qilyapti?', 'Moliya hisobotini ber', 'IP 45.148.10.121 ni blokla')..."
                    className={clsx(
                      'w-full rounded-xl pl-10 pr-4 py-2.5 text-xs outline-none border transition-all',
                      isDark
                        ? 'bg-[#050B18] border-[#1A2F57] focus:border-indigo-400 text-white placeholder:text-slate-500'
                        : 'bg-white border-slate-300 focus:border-indigo-500 text-slate-900 placeholder:text-slate-400'
                    )}
                  />
                </div>
                <button
                  onClick={handleChatSend}
                  disabled={!chatInput.trim() || store.isAiLoading}
                  className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-xl text-xs transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1.5 shadow-md shadow-indigo-900/30"
                >
                  {store.isAiLoading ? <Cpu className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  <span>Yuborish</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════
            TAB: MONITOR
        ═══════════════════════════════════════════════════════════ */}
        {activeTab === 'monitor' && (
          <div className="space-y-3">
            {/* Server Hardware & Uzcloud Specs Summary Header */}
            <div className={clsx('p-4 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm', isDark ? 'bg-[#0D1832] border-[#182A4D]' : 'bg-white border-slate-200')}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-md">
                  <Server className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className={clsx('text-xs font-black uppercase tracking-wide', isDark ? 'text-white' : 'text-slate-900')}>
                      Uzcloud Cloud Server · Toshkent DC
                    </h2>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                      Faol & Barqaror
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5 font-mono">
                    1 vCPU @ 2.40 GHz · 1024 MiB RAM DDR4 · 25 GB NVMe SSD · Linux x64
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap text-[11px]">
                {/* Threat Level Badge */}
                <div className={clsx('px-3 py-1.5 rounded-lg border font-bold flex items-center gap-1.5',
                  m.threatLevel === 'high'
                    ? 'bg-rose-500/20 border-rose-500/50 text-rose-300 animate-pulse'
                    : m.threatLevel === 'medium'
                    ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                    : 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                )}>
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>Xavf Darajasi: {m.threatLevel.toUpperCase()}</span>
                </div>

                {/* Rate limit status */}
                <div className={clsx('px-3 py-1.5 rounded-lg border font-bold flex items-center gap-1.5', isDark ? 'bg-[#091024] border-[#182A4D] text-slate-300' : 'bg-slate-100 border-slate-300 text-slate-700')}>
                  <Gauge className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Rate Limit: {m.rateLimitHits} ta cheklov</span>
                </div>
              </div>
            </div>

            {/* Detailed RAM & SSD Resource Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {/* RAM 1024 MiB Widget */}
              <div className={clsx('p-4 rounded-xl border space-y-3 shadow-sm', isDark ? 'bg-[#0D1832] border-[#182A4D]' : 'bg-white border-slate-200')}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MemoryStick className="w-4 h-4 text-cyan-400" />
                    <span className="font-bold text-xs">RAM Xotirasi (Uzcloud)</span>
                  </div>
                  <span className={clsx('font-black text-xs font-mono', m.ram > 80 ? 'text-rose-400' : 'text-cyan-300')}>
                    {m.ram}%
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-800/80 rounded-full h-2.5 overflow-hidden p-0.5 border border-slate-700/50">
                  <div
                    className={clsx(
                      'h-full rounded-full transition-all duration-700',
                      m.ram > 85 ? 'bg-gradient-to-r from-amber-500 to-rose-500' : 'bg-gradient-to-r from-cyan-500 to-blue-500'
                    )}
                    style={{ width: `${Math.min(100, Math.max(5, m.ram))}%` }}
                  />
                </div>

                <div className="grid grid-cols-3 gap-2 pt-1 text-[10px]">
                  <div className={clsx('p-2 rounded-lg text-center', isDark ? 'bg-[#091024]' : 'bg-slate-50')}>
                    <span className="text-slate-400 block text-[9px] uppercase">Jami RAM</span>
                    <span className="font-bold text-white font-mono">{m.ramTotalMb || 1024} MiB</span>
                  </div>
                  <div className={clsx('p-2 rounded-lg text-center', isDark ? 'bg-[#091024]' : 'bg-slate-50')}>
                    <span className="text-slate-400 block text-[9px] uppercase">Band RAM</span>
                    <span className="font-bold text-cyan-300 font-mono">{m.ramUsedMb || 418} MiB</span>
                  </div>
                  <div className={clsx('p-2 rounded-lg text-center', isDark ? 'bg-[#091024]' : 'bg-slate-50')}>
                    <span className="text-slate-400 block text-[9px] uppercase">Bo'sh Joy</span>
                    <span className="font-bold text-emerald-400 font-mono">{m.ramFreeMb || 606} MiB</span>
                  </div>
                </div>
              </div>

              {/* SSD Disk Widget */}
              <div className={clsx('p-4 rounded-xl border space-y-3 shadow-sm', isDark ? 'bg-[#0D1832] border-[#182A4D]' : 'bg-white border-slate-200')}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <HardDrive className="w-4 h-4 text-indigo-400" />
                    <span className="font-bold text-xs">SSD Disk Xotirasi</span>
                  </div>
                  <span className={clsx('font-black text-xs font-mono', m.disk > 85 ? 'text-rose-400' : 'text-indigo-300')}>
                    {m.disk}%
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-800/80 rounded-full h-2.5 overflow-hidden p-0.5 border border-slate-700/50">
                  <div
                    className="h-full rounded-full transition-all duration-700 bg-gradient-to-r from-indigo-500 to-purple-500"
                    style={{ width: `${Math.min(100, Math.max(5, m.disk))}%` }}
                  />
                </div>

                <div className="grid grid-cols-3 gap-2 pt-1 text-[10px]">
                  <div className={clsx('p-2 rounded-lg text-center', isDark ? 'bg-[#091024]' : 'bg-slate-50')}>
                    <span className="text-slate-400 block text-[9px] uppercase">Jami SSD</span>
                    <span className="font-bold text-white font-mono">{m.diskTotalGb || 25} GB</span>
                  </div>
                  <div className={clsx('p-2 rounded-lg text-center', isDark ? 'bg-[#091024]' : 'bg-slate-50')}>
                    <span className="text-slate-400 block text-[9px] uppercase">Band Disk</span>
                    <span className="font-bold text-indigo-300 font-mono">{m.diskUsedGb || 8.4} GB</span>
                  </div>
                  <div className={clsx('p-2 rounded-lg text-center', isDark ? 'bg-[#091024]' : 'bg-slate-50')}>
                    <span className="text-slate-400 block text-[9px] uppercase">Bo'sh Joy</span>
                    <span className="font-bold text-emerald-400 font-mono">{m.diskFreeGb || 16.6} GB</span>
                  </div>
                </div>
              </div>

              {/* DDoS & Threat Activity Widget */}
              <div className={clsx('p-4 rounded-xl border space-y-3 shadow-sm md:col-span-2 lg:col-span-1', isDark ? 'bg-[#0D1832] border-[#182A4D]' : 'bg-white border-slate-200')}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Flame className="w-4 h-4 text-amber-400" />
                    <span className="font-bold text-xs">DDoS & Shubhali Faollik</span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    WAF Faol
                  </span>
                </div>

                <div className="space-y-1.5 text-[11px]">
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="text-slate-400">Rate Limiting bloklari:</span>
                    <span className="font-mono font-bold text-amber-300">{m.rateLimitHits} ta so'rov</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="text-slate-400">Muvaffaqiyatsiz loginlar:</span>
                    <span className="font-mono font-bold text-rose-300">{m.failedLoginAttemptsCount} ta urinish</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="text-slate-400">Auto-Defense rejim:</span>
                    <span className="font-mono font-bold text-emerald-300">Avtomatik IP bloklash</span>
                  </div>
                </div>

                <div className="pt-1 flex items-center justify-between border-t border-slate-700/60 text-[10px] text-slate-400">
                  <span>SSL Sertifikati: TLS 1.3 Faol</span>
                  <span className="text-cyan-400 font-mono">Port 443 / HTTPS</span>
                </div>
              </div>
            </div>

            {/* Server Health Row */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
              {/* Server Gauges */}
              <div className={clsx('lg:col-span-4 p-3 rounded-xl border space-y-2', isDark ? 'bg-[#0D1832] border-[#182A4D]' : 'bg-white border-slate-200')}>
                <h2 className="text-[10px] uppercase font-black text-slate-400 flex items-center gap-1.5">
                  <Server className="w-3.5 h-3.5 text-blue-400" /> Server Holati
                  <span className="ml-auto flex items-center gap-1 text-emerald-400"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Online</span>
                </h2>
                <div className="flex items-center justify-around py-1">
                  <CircularGauge value={Math.round(m.cpu)} label="CPU" color={cpuColor} isDark={isDark} />
                  <CircularGauge value={Math.round(m.ram)} label="RAM" color={ramColor} isDark={isDark} />
                  <CircularGauge value={m.disk} label="Disk" color={diskColor} isDark={isDark} />
                </div>
                <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                  <div className={clsx('flex items-center gap-1.5 p-1.5 rounded', isDark ? 'bg-[#091024]' : 'bg-slate-50')}>
                    <ArrowDown className="w-3 h-3 text-emerald-400" />
                    <span className="text-slate-400">Kiruvchi:</span>
                    <span className="text-emerald-300 font-bold ml-auto">{m.network.in.toFixed(1)} MB/s</span>
                  </div>
                  <div className={clsx('flex items-center gap-1.5 p-1.5 rounded', isDark ? 'bg-[#091024]' : 'bg-slate-50')}>
                    <ArrowUp className="w-3 h-3 text-blue-400" />
                    <span className="text-slate-400">Chiquvchi:</span>
                    <span className="text-blue-300 font-bold ml-auto">{m.network.out.toFixed(1)} MB/s</span>
                  </div>
                  <div className={clsx('flex items-center gap-1.5 p-1.5 rounded', isDark ? 'bg-[#091024]' : 'bg-slate-50')}>
                    <Gauge className="w-3 h-3 text-amber-400" />
                    <span className="text-slate-400">Req/s:</span>
                    <span className="text-amber-300 font-bold ml-auto">{m.requestsPerSec}</span>
                  </div>
                  <div className={clsx('flex items-center gap-1.5 p-1.5 rounded', isDark ? 'bg-[#091024]' : 'bg-slate-50')}>
                    <Zap className="w-3 h-3 text-indigo-400" />
                    <span className="text-slate-400">Latency:</span>
                    <span className={clsx('font-bold ml-auto', m.responseTimeAvg > 300 ? 'text-amber-300' : 'text-emerald-300')}>{m.responseTimeAvg}ms</span>
                  </div>
                </div>
                <div className="flex items-center justify-between text-[9px] text-slate-500 pt-1 border-t border-[#162748]">
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {m.uptime}</span>
                  <span>{m.activeConnections} ulanish · {m.processes} jarayon</span>
                </div>
              </div>

              {/* Traffic Chart */}
              <div className={clsx('lg:col-span-5 p-3 rounded-xl border space-y-2', isDark ? 'bg-[#0D1832] border-[#182A4D]' : 'bg-white border-slate-200')}>
                <div className="flex items-center justify-between">
                  <h2 className="text-[10px] uppercase font-black text-slate-400 flex items-center gap-1.5">
                    <BarChart2 className="w-3.5 h-3.5 text-indigo-400" /> Trafik (5 daqiqalik)
                  </h2>
                  <div className="flex items-center gap-2 text-[9px] text-slate-500">
                    <span className="flex items-center gap-0.5"><span className="w-1.5 h-1.5 rounded-full bg-indigo-500 inline-block" />Normal</span>
                    <span className="flex items-center gap-0.5"><span className="w-1.5 h-1.5 rounded-full bg-rose-500 inline-block" />DDoS</span>
                  </div>
                </div>
                <MiniBar data={store.trafficData} isDark={isDark} />
                <div className="grid grid-cols-4 gap-1">
                  {[
                    { l: 'Jami', v: totalRequests.toLocaleString(), c: 'text-indigo-300' },
                    { l: 'Xatolar', v: String(store.trafficData.reduce((s, d) => s + d.errors, 0)), c: 'text-amber-300' },
                    { l: 'Bloklangan', v: String(store.trafficData.reduce((s, d) => s + d.blocked, 0)), c: 'text-rose-300' },
                    { l: 'Bandwidth', v: `${(store.trafficData.reduce((s, d) => s + d.bandwidth, 0) / 1024).toFixed(1)}MB`, c: 'text-blue-300' },
                  ].map((s, i) => (
                    <div key={i} className={clsx('p-1.5 rounded text-center', isDark ? 'bg-[#091024]' : 'bg-slate-50')}>
                      <div className={clsx('text-xs font-black', s.c)}>{s.v}</div>
                      <div className="text-[8px] text-slate-400 uppercase">{s.l}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Defense Status */}
              <div className={clsx('lg:col-span-3 p-3 rounded-xl border space-y-2', isDark ? 'bg-[#0D1832] border-[#182A4D]' : 'bg-white border-slate-200')}>
                <h2 className="text-[10px] uppercase font-black text-slate-400 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Himoya Qatlamlari
                </h2>
                <div className="space-y-1 max-h-[200px] overflow-y-auto custom-scrollbar pr-1">
                  <DefenseToggle label="DDoS Himoya" active={def.ddosProtection} onToggle={() => store.toggleDefense('ddosProtection')} icon={<Flame className="w-3 h-3" />} isDark={isDark} />
                  <DefenseToggle label="Rate Limiting" active={def.rateLimit} onToggle={() => store.toggleDefense('rateLimit')} icon={<Gauge className="w-3 h-3" />} isDark={isDark} />
                  <DefenseToggle label="WAF Firewall" active={def.waf} onToggle={() => store.toggleDefense('waf')} icon={<ShieldAlert className="w-3 h-3" />} isDark={isDark} />
                  <DefenseToggle label="SSL/TLS" active={def.sslTls} onToggle={() => store.toggleDefense('sslTls')} icon={<Lock className="w-3 h-3" />} isDark={isDark} danger={!def.sslTls} />
                  <DefenseToggle label="Bot Detection" active={def.botDetection} onToggle={() => store.toggleDefense('botDetection')} icon={<Bot className="w-3 h-3" />} isDark={isDark} />
                  <DefenseToggle label="Brute Force" active={def.bruteForceProtection} onToggle={() => store.toggleDefense('bruteForceProtection')} icon={<Lock className="w-3 h-3" />} isDark={isDark} />
                  <DefenseToggle label="CAPTCHA" active={def.captcha} onToggle={() => store.toggleDefense('captcha')} icon={<Fingerprint className="w-3 h-3" />} isDark={isDark} />
                  <DefenseToggle label="IDS" active={def.intrusionDetection} onToggle={() => store.toggleDefense('intrusionDetection')} icon={<Eye className="w-3 h-3" />} isDark={isDark} />
                  <DefenseToggle label="Geo-Blocking" active={def.geoBlocking} onToggle={() => store.toggleDefense('geoBlocking')} icon={<Globe className="w-3 h-3" />} isDark={isDark} />
                  <DefenseToggle label="2FA Majburiy" active={def.twoFactor} onToggle={() => store.toggleDefense('twoFactor')} icon={<Fingerprint className="w-3 h-3" />} isDark={isDark} />
                </div>
              </div>
            </div>

            {/* Live Terminal + Alerts side-by-side */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-3">
              {/* Live terminal */}
              <div className={clsx('lg:col-span-3 rounded-xl border overflow-hidden', isDark ? 'bg-[#050B18] border-[#182A4D]' : 'bg-slate-900 border-slate-700')}>
                <div className={clsx('px-3 py-2 border-b flex items-center justify-between', isDark ? 'border-[#182A4D] bg-[#030812]' : 'border-slate-700 bg-slate-800')}>
                  <span className="text-[10px] uppercase font-black text-emerald-400 flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5" /> Live Access Log
                    {store.liveMode && <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping" />}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] text-slate-500 font-mono">{liveLogStream.length} entries</span>
                    <button onClick={() => store.setLiveMode(!store.liveMode)} className={clsx('px-2 py-0.5 rounded text-[9px] font-bold cursor-pointer transition-all', store.liveMode ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30')}>
                      {store.liveMode ? 'Stop' : 'Start'}
                    </button>
                  </div>
                </div>
                <div ref={liveRef} className="h-40 overflow-y-auto font-mono text-[9px] p-2 space-y-px custom-scrollbar">
                  {store.liveMode ? (
                    liveLogStream.length > 0 ? liveLogStream.map((line, i) => {
                      const isErr = line.includes(' 4') || line.includes(' 5');
                      return <div key={i} className={clsx('px-1 py-px rounded', isErr ? 'text-rose-300 bg-rose-950/20' : 'text-emerald-300/90', i === 0 && 'bg-emerald-900/30 font-bold')}>{line}</div>;
                    }) : <div className="text-slate-500 text-center py-6">Kutilmoqda...</div>
                  ) : (
                    store.accessLogs.slice(0, 20).map((log, i) => (
                      <div key={i} className={clsx('px-1 py-px', log.statusCode >= 400 ? 'text-rose-300' : 'text-emerald-300/80')}>
                        <span className="text-slate-500">[{log.timestamp.split(' ')[1]}]</span> <span className="text-blue-300">{log.ip}</span>{' '}
                        <span className={log.statusCode >= 400 ? 'text-rose-400' : 'text-slate-300'}>"{log.method} {log.path}"</span>{' '}
                        <span className={httpStatusColor(log.statusCode)}>{log.statusCode}</span> <span className="text-slate-500">{log.responseTimeMs}ms</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Active threats mini */}
              <div className={clsx('lg:col-span-2 p-3 rounded-xl border space-y-2', isDark ? 'bg-[#0D1832] border-[#182A4D]' : 'bg-white border-slate-200')}>
                <h3 className="text-[10px] uppercase font-black text-slate-400 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" /> Faol Tahdidlar ({activeAlerts})
                </h3>
                <div className="space-y-1.5 max-h-[160px] overflow-y-auto custom-scrollbar">
                  {store.alerts.filter((a) => a.status === 'active' || a.status === 'investigating').map((a) => (
                    <div key={a.id} onClick={() => { setActiveTab('alerts'); handleAiAnalyze(a); }}
                      className={clsx('flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-all border', a.severity === 'critical' ? 'bg-rose-500/10 border-rose-500/20 hover:bg-rose-500/20' : 'bg-amber-500/5 border-amber-500/15 hover:bg-amber-500/15')}>
                      <span className={clsx('px-1 py-0.5 rounded text-[8px] font-black border uppercase', severityBadge(a.severity))}>{severityLabel(a.severity)}</span>
                      <span className={clsx('text-[10px] font-semibold truncate flex-1', isDark ? 'text-slate-200' : 'text-slate-700')}>{alertTypeLabel(a.type)}</span>
                      <span className="text-[9px] text-blue-400 font-mono shrink-0">{a.ip.slice(0, 15)}</span>
                    </div>
                  ))}
                  {activeAlerts === 0 && <div className="text-center py-4 text-emerald-400/60 text-[11px]"><ShieldCheck className="w-6 h-6 mx-auto mb-1" />Xavf yo'q</div>}
                </div>
                {/* SSL + Port info */}
                <div className="space-y-1 pt-1 border-t border-[#162748]">
                  <div className="flex items-center gap-2 text-[10px]">
                    <Lock className="w-3 h-3 text-emerald-400" />
                    <span className="text-slate-400">SSL/TLS:</span>
                    <span className={m.sslValid ? 'text-emerald-300' : 'text-rose-300'}>{m.sslValid ? '✅ TLS 1.3 Faol' : '❌ O\'chirilgan'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px]">
                    <Network className="w-3 h-3 text-blue-400" />
                    <span className="text-slate-400">Portlar:</span>
                    <span className="text-blue-300 font-mono">{m.openPorts.join(', ')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════
            TAB: ACCESS LOG
        ═══════════════════════════════════════════════════════════ */}
        {activeTab === 'logs' && (
          <div className={clsx('rounded-xl border overflow-hidden', isDark ? 'bg-[#0D1832] border-[#182A4D]' : 'bg-white border-slate-200')}>
            <div className={clsx('p-3 border-b flex flex-wrap items-center gap-2', isDark ? 'border-[#182A4D] bg-[#091024]' : 'border-slate-200 bg-slate-50')}>
              <div className="relative flex-1 min-w-48">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                <input type="text" placeholder="IP, yo'l, foydalanuvchi, status kodi..." value={searchAccess} onChange={(e) => setSearchAccess(e.target.value)}
                  className={clsx('w-full rounded-lg pl-8 pr-3 py-2 text-xs outline-none border', isDark ? 'bg-[#050B18] border-[#1A2F57] focus:border-amber-400 text-white placeholder:text-slate-500' : 'bg-white border-slate-300')} />
              </div>
              <div className="flex items-center gap-1 flex-wrap">
                <button
                  onClick={() => { setLogCategoryFilter('all'); setLevelFilter('all'); }}
                  className={clsx('px-2.5 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition-all', logCategoryFilter === 'all' && levelFilter === 'all' ? 'bg-amber-500 text-slate-950' : isDark ? 'bg-[#11203E] text-slate-300' : 'bg-slate-200 text-slate-700')}
                >
                  Barchasi
                </button>
                <button
                  onClick={() => setLogCategoryFilter('failed_logins')}
                  className={clsx('px-2.5 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition-all border', logCategoryFilter === 'failed_logins' ? 'bg-rose-500 text-white border-rose-400' : 'bg-rose-500/10 border-rose-500/30 text-rose-300 hover:bg-rose-500/20')}
                >
                  🔴 Login Xatolari ({store.serverMetrics.failedLoginAttemptsCount})
                </button>
                <button
                  onClick={() => setLogCategoryFilter('success_logins')}
                  className={clsx('px-2.5 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition-all border', logCategoryFilter === 'success_logins' ? 'bg-emerald-500 text-slate-950 border-emerald-400' : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20')}
                >
                  🟢 Muvaffaqiyatli Loginlar
                </button>
                <button
                  onClick={() => setLogCategoryFilter('rate_limits')}
                  className={clsx('px-2.5 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition-all border', logCategoryFilter === 'rate_limits' ? 'bg-cyan-500 text-slate-950 border-cyan-400' : 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/20')}
                >
                  ⚡ Rate Limits
                </button>
              </div>
              <span className="text-[10px] text-slate-400 font-mono ml-auto">{filteredAccess.length} ta</span>
            </div>
            <div className="overflow-x-auto max-h-[500px] overflow-y-auto custom-scrollbar">
              <table className="w-full text-[11px]">
                <thead className="sticky top-0 z-10">
                  <tr className={clsx('text-[10px] uppercase font-black tracking-wider', isDark ? 'bg-[#091024] text-slate-400' : 'bg-slate-50 text-slate-500')}>
                    <th className="px-3 py-2 text-left">Vaqt</th><th className="px-3 py-2 text-left">IP / Mamlakat</th><th className="px-3 py-2 text-left">Metod</th><th className="px-3 py-2 text-left">Yo'l</th><th className="px-3 py-2 text-center">Status</th><th className="px-3 py-2 text-center">Javob</th><th className="px-3 py-2 text-left">User</th><th className="px-3 py-2 text-center">Lvl</th><th className="px-3 py-2 text-center">⚡</th>
                  </tr>
                </thead>
                <tbody className={clsx('divide-y', isDark ? 'divide-[#162748]' : 'divide-slate-100')}>
                  {filteredAccess.map((log) => (
                    <tr key={log.id} className={clsx('transition-colors', isDark ? 'hover:bg-[#0A1329]' : 'hover:bg-slate-50', log.level === 'critical' && (isDark ? 'bg-rose-950/20' : 'bg-rose-50/50'))}>
                      <td className="px-3 py-2 font-mono text-[10px] text-slate-400 whitespace-nowrap">{log.timestamp.split(' ')[1]}</td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">{getFlagEmoji(log.countryCode)}<div><div className="font-mono text-[10px] font-bold text-blue-400">{log.ip}</div><div className="text-[9px] text-slate-500">{log.country}</div></div></div>
                      </td>
                      <td className="px-3 py-2"><span className={clsx('px-1.5 py-0.5 rounded text-[9px] font-black font-mono', methodColor(log.method))}>{log.method}</span></td>
                      <td className="px-3 py-2 max-w-[150px]"><span className={clsx('truncate block text-[10px] font-mono', isDark ? 'text-slate-200' : 'text-slate-700')} title={log.path}>{log.path}</span></td>
                      <td className="px-3 py-2 text-center"><span className={clsx('font-black font-mono', httpStatusColor(log.statusCode))}>{log.statusCode}</span></td>
                      <td className="px-3 py-2 text-center font-mono text-[10px]"><span className={log.responseTimeMs > 1000 ? 'text-amber-400' : 'text-slate-300'}>{log.responseTimeMs}ms</span></td>
                      <td className="px-3 py-2"><span className={clsx('text-[10px]', log.userName ? (isDark ? 'text-slate-200' : 'text-slate-700') : 'text-slate-500')}>{log.userName || 'Mehmon'}</span></td>
                      <td className="px-3 py-2 text-center"><span className={clsx('w-2 h-2 rounded-full inline-block', logLevelDot(log.level))} title={log.level} /></td>
                      <td className="px-3 py-2 text-center"><button onClick={() => openBlockModal(log.ip)} className="p-1 text-slate-500 hover:text-rose-400 cursor-pointer" title="Bloklash"><Ban className="w-3.5 h-3.5" /></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════
            TAB: ALERTS
        ═══════════════════════════════════════════════════════════ */}
        {activeTab === 'alerts' && (
          <div className="space-y-3">
            <div className="flex items-center gap-1 flex-wrap">
              {['all', 'active', 'investigating', 'blocked', 'resolved'].map((s) => (
                <button key={s} onClick={() => setStatusFilter(s)} className={clsx('px-3 py-1.5 rounded-lg text-xs font-bold uppercase cursor-pointer transition-all', statusFilter === s ? 'bg-amber-500 text-slate-950' : isDark ? 'bg-[#0D1832] border border-[#182A4D] text-slate-400' : 'bg-white border border-slate-200 text-slate-500')}>
                  {s === 'all' ? 'Barchasi' : s === 'active' ? 'Faol' : s === 'investigating' ? 'Tekshirilmoqda' : s === 'blocked' ? 'Bloklangan' : 'Hal etildi'}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-3">
              <div className="lg:col-span-3 space-y-2.5">
                {filteredAlerts.map((alert) => (
                  <div key={alert.id} onClick={() => handleAiAnalyze(alert)}
                    className={clsx('rounded-xl border p-3 space-y-2 cursor-pointer transition-all hover:shadow-lg', isDark ? 'bg-[#0D1832] border-[#182A4D] hover:border-indigo-500/40' : 'bg-white border-slate-200',
                      selectedAlert?.id === alert.id && (isDark ? 'border-indigo-500/70 shadow-lg shadow-indigo-900/20' : 'border-indigo-400'))}>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={clsx('text-xs font-black', isDark ? 'text-white' : 'text-slate-900')}>{alertTypeLabel(alert.type)}</span>
                        <span className={clsx('px-1.5 py-0.5 rounded text-[9px] font-black border uppercase', severityBadge(alert.severity))}>{severityLabel(alert.severity)}</span>
                        <span className={clsx('px-1.5 py-0.5 rounded text-[9px] font-bold border uppercase', statusBadge(alert.status))}>{statusLabel(alert.status)}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono shrink-0">{alert.timestamp.split(' ')[1]}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px]">
                      <span className="font-mono text-blue-400">{alert.ip}</span>
                      <span className="text-slate-500">{getFlagEmoji(alert.countryCode)} {alert.country}</span>
                    </div>
                    <p className={clsx('text-[11px] leading-relaxed line-clamp-2', isDark ? 'text-slate-300' : 'text-slate-600')}>{alert.description}</p>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className={clsx('px-2 py-0.5 rounded text-[9px] font-mono', isDark ? 'bg-[#091024]' : 'bg-slate-100')}>{alert.requestCount} req/{alert.timeWindowSec}s</span>
                      <button onClick={(e) => { e.stopPropagation(); handleAiAnalyze(alert); }} className="px-2 py-0.5 bg-indigo-600/80 text-white rounded text-[9px] font-bold cursor-pointer hover:bg-indigo-500"><Sparkles className="w-2.5 h-2.5 inline mr-0.5" />AI</button>
                      {alert.status !== 'blocked' && <button onClick={(e) => { e.stopPropagation(); openBlockModal(alert.ip); }} className="px-2 py-0.5 bg-rose-600/80 text-white rounded text-[9px] font-bold cursor-pointer hover:bg-rose-500">Block</button>}
                      {alert.status !== 'resolved' && <button onClick={(e) => { e.stopPropagation(); store.resolveAlert(alert.id); }} className={clsx('px-2 py-0.5 rounded text-[9px] font-bold cursor-pointer', isDark ? 'bg-[#162748] text-slate-300' : 'bg-slate-100 text-slate-600')}>✓ Hal</button>}
                    </div>
                  </div>
                ))}
                {filteredAlerts.length === 0 && <div className={clsx('text-center py-10 rounded-xl border', isDark ? 'border-[#182A4D] bg-[#0D1832]' : 'border-slate-200 bg-white')}><ShieldCheck className="w-8 h-8 mx-auto mb-2 text-emerald-400/40" /><p className="text-xs text-slate-500">Ogohlantirish topilmadi</p></div>}
              </div>
              {/* AI Analysis Panel */}
              <div className={clsx('lg:col-span-2 rounded-xl border sticky top-4 h-fit', isDark ? 'bg-[#0D1832] border-[#182A4D]' : 'bg-white border-slate-200')}>
                <div className={clsx('px-3 py-2.5 border-b flex items-center gap-2', isDark ? 'border-[#182A4D] bg-[#091024]' : 'border-slate-200 bg-slate-50')}>
                  <Bot className="w-4 h-4 text-indigo-400" />
                  <span className={clsx('text-xs font-bold', isDark ? 'text-white' : 'text-slate-900')}>AI Tahlil</span>
                  {isAiAnalyzing && <Sparkles className="w-3 h-3 text-indigo-400 animate-spin ml-auto" />}
                </div>
                <div className="p-3">
                  {selectedAlert ? (
                    <div className="space-y-2">
                      <div className={clsx('p-2 rounded-lg', isDark ? 'bg-[#091024]' : 'bg-slate-50')}>
                        <span className="text-xs font-bold text-indigo-400">{alertTypeLabel(selectedAlert.type)}</span>
                        <div className="text-[10px] text-blue-400 font-mono">{selectedAlert.ip}</div>
                      </div>
                      <div className={clsx('p-3 rounded-xl border min-h-[100px]', isDark ? 'bg-[#050A18] border-indigo-900/50' : 'bg-indigo-50 border-indigo-200')}>
                        <div className="text-[9px] font-bold text-indigo-400 mb-1 flex items-center gap-1"><Sparkles className="w-2.5 h-2.5" /> AI:</div>
                        {isAiAnalyzing && !aiAnalysisText ? (
                          <div className="flex items-center gap-1.5 text-indigo-300 text-[11px]"><Cpu className="w-3 h-3 animate-spin" />Tahlil...</div>
                        ) : (
                          <p className={clsx('text-[11px] leading-relaxed whitespace-pre-wrap', isDark ? 'text-indigo-100' : 'text-indigo-900')}>
                            {aiAnalysisText}{isAiAnalyzing && <span className="inline-block w-0.5 h-3 bg-indigo-400 ml-0.5 animate-pulse" />}
                          </p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-6"><Bot className="w-8 h-8 mx-auto text-indigo-400/30 mb-1" /><p className="text-[10px] text-slate-500">Tahlil uchun alert tanlang</p></div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════
            TAB: BLOCKED IPs
        ═══════════════════════════════════════════════════════════ */}
        {activeTab === 'blocked' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className={clsx('text-xs font-bold', isDark ? 'text-white' : 'text-slate-900')}>{store.blockedIPs.length} ta IP bloklangan</span>
              <button onClick={() => openBlockModal()} className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-600/90 hover:bg-rose-500 text-white font-bold rounded-lg text-xs cursor-pointer"><Ban className="w-3.5 h-3.5" />Yangi</button>
            </div>
            <div className={clsx('rounded-xl border overflow-hidden', isDark ? 'bg-[#0D1832] border-[#182A4D]' : 'bg-white border-slate-200')}>
              <table className="w-full text-[11px]">
                <thead>
                  <tr className={clsx('text-[10px] uppercase font-black', isDark ? 'bg-[#091024] text-slate-400' : 'bg-slate-50 text-slate-500')}>
                    <th className="px-3 py-2 text-left">IP / Mamlakat</th><th className="px-3 py-2 text-left">Sabab</th><th className="px-3 py-2 text-left">Vaqt</th><th className="px-3 py-2 text-center">Turi</th><th className="px-3 py-2 text-center">Amal</th>
                  </tr>
                </thead>
                <tbody className={clsx('divide-y', isDark ? 'divide-[#162748]' : 'divide-slate-100')}>
                  {store.blockedIPs.map((b) => (
                    <tr key={b.ip} className={clsx('transition-colors', isDark ? 'hover:bg-[#0A1329]' : 'hover:bg-slate-50')}>
                      <td className="px-3 py-2.5"><div className="flex items-center gap-1.5">{getFlagEmoji(b.countryCode)}<div><div className="font-mono font-black text-rose-400 text-[11px]">{b.ip}</div><div className="text-[9px] text-slate-400">{b.country}</div></div></div></td>
                      <td className="px-3 py-2.5 max-w-[200px]"><span className={clsx('text-[10px]', isDark ? 'text-slate-300' : 'text-slate-600')}>{b.reason}</span></td>
                      <td className="px-3 py-2.5 font-mono text-[10px] text-slate-400 whitespace-nowrap">{b.blockedAt}</td>
                      <td className="px-3 py-2.5 text-center"><span className={clsx('px-1.5 py-0.5 rounded text-[9px] font-bold border', b.permanent ? 'bg-rose-500/20 text-rose-300 border-rose-500/30' : 'bg-amber-500/20 text-amber-300 border-amber-500/30')}>{b.permanent ? 'Doimiy' : 'Vaqtinchalik'}</span></td>
                      <td className="px-3 py-2.5 text-center"><button onClick={() => store.unblockIP(b.ip)} className="px-2.5 py-1 bg-emerald-600/80 hover:bg-emerald-500 text-white rounded-lg text-[10px] font-bold cursor-pointer"><Unlock className="w-3 h-3 inline mr-0.5" />Ochish</button></td>
                    </tr>
                  ))}
                  {store.blockedIPs.length === 0 && <tr><td colSpan={5} className="text-center py-8 text-slate-500 text-xs"><ShieldCheck className="w-6 h-6 mx-auto mb-1 text-emerald-400/30" />Bo'sh</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* ── API KEY SETTINGS MODAL ────────────────────────────────────── */}
      {isAiSettingsOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className={clsx('rounded-2xl max-w-lg w-full p-5 shadow-2xl space-y-4 border', isDark ? 'bg-[#0D1832] border-[#1E3563]' : 'bg-white border-slate-200')}>
            <div className={clsx('flex items-center justify-between border-b pb-3', isDark ? 'border-[#182A4D]' : 'border-slate-200')}>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
                  <KeyRound className="w-4 h-4" />
                </div>
                <div>
                  <h3 className={clsx('text-sm font-bold', isDark ? 'text-white' : 'text-slate-900')}>AI Provayder & API Kalit Sozlamalari</h3>
                  <p className="text-[10px] text-slate-400">Gemini, OpenAI, Groq yoki DeepSeek kalitini ulang</p>
                </div>
              </div>
              <button onClick={() => setIsAiSettingsOpen(false)} className="text-slate-400 hover:text-slate-200 cursor-pointer"><X className="w-4 h-4" /></button>
            </div>

            <div className="space-y-3.5">
              {/* Provider Selection */}
              <div>
                <label className={clsx('block text-[11px] font-bold mb-1.5', isDark ? 'text-slate-300' : 'text-slate-700')}>AI Provayderini Tanlang:</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'gemini', label: 'Google Gemini', sub: 'Tavsiya (Tez & Bepul)', icon: '✨' },
                    { id: 'openai', label: 'OpenAI GPT-4o', sub: 'ChatGPT API', icon: '🟢' },
                    { id: 'groq', label: 'Groq Cloud', sub: 'Llama 3.3 (Ultra Fast)', icon: '⚡' },
                    { id: 'deepseek', label: 'DeepSeek', sub: 'DeepSeek V3 / R1', icon: '🐋' },
                    { id: 'openrouter', label: 'OpenRouter', sub: 'Multi-model Hub', icon: '🌐' },
                    { id: 'custom', label: 'Custom API', sub: 'O\'z Serveringiz', icon: '⚙️' },
                  ].map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handleProviderChange(p.id as AiProvider)}
                      className={clsx(
                        'p-2 rounded-xl text-left border transition-all cursor-pointer flex flex-col justify-between',
                        selectedProvider === p.id
                          ? 'bg-indigo-600/20 border-indigo-500 text-indigo-200 shadow-md'
                          : isDark ? 'bg-[#081024] border-[#162748] text-slate-400 hover:border-slate-600' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs">{p.icon}</span>
                        {selectedProvider === p.id && <Check className="w-3 h-3 text-indigo-400" />}
                      </div>
                      <div className="mt-1">
                        <div className="text-[11px] font-bold truncate">{p.label}</div>
                        <div className="text-[9px] opacity-70 truncate">{p.sub}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* API Key Input */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className={clsx('block text-[11px] font-bold', isDark ? 'text-slate-300' : 'text-slate-700')}>
                    {selectedProvider.toUpperCase()} API Kalit *
                  </label>
                  {selectedProvider === 'gemini' && (
                    <a
                      href="https://aistudio.google.com/app/apikey"
                      target="_blank"
                      rel="noreferrer"
                      className="text-[10px] text-amber-400 hover:underline flex items-center gap-0.5"
                    >
                      Bepul Gemini kalit olish <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  )}
                  {selectedProvider === 'openai' && (
                    <a
                      href="https://platform.openai.com/api-keys"
                      target="_blank"
                      rel="noreferrer"
                      className="text-[10px] text-emerald-400 hover:underline flex items-center gap-0.5"
                    >
                      OpenAI kalit olish <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  )}
                </div>
                <div className="relative">
                  <input
                    type={showKeySecret ? 'text' : 'password'}
                    value={tempApiKey}
                    onChange={(e) => setTempApiKey(e.target.value)}
                    placeholder={
                      selectedProvider === 'gemini' ? 'AIzaSy...' :
                      selectedProvider === 'openai' ? 'sk-proj-...' :
                      selectedProvider === 'groq' ? 'gsk_...' : 'API kalitni shu yerga kiriting...'
                    }
                    className={clsx(
                      'w-full rounded-xl pl-3 pr-10 py-2.5 text-xs outline-none border font-mono transition-all',
                      isDark ? 'bg-[#050B18] border-[#1A2F57] focus:border-indigo-400 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    )}
                  />
                  <button
                    type="button"
                    onClick={() => setShowKeySecret(!showKeySecret)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200 cursor-pointer"
                  >
                    {showKeySecret ? <Eye className="w-4 h-4 text-amber-400" /> : <Lock className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Model Choice */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className={clsx('block text-[11px] font-bold mb-1', isDark ? 'text-slate-300' : 'text-slate-700')}>Model Nomi:</label>
                  <select
                    value={tempModel}
                    onChange={(e) => setTempModel(e.target.value)}
                    className={clsx(
                      'w-full rounded-xl px-3 py-2 text-xs outline-none border font-mono',
                      isDark ? 'bg-[#050B18] border-[#1A2F57] text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    )}
                  >
                    {selectedProvider === 'gemini' && (
                      <>
                        <option value="gemini-3.7-flash">gemini-3.7-flash (Tavsiya - Eng Yangi & Tez)</option>
                        <option value="gemini-3.6-flash">gemini-3.6-flash (Ultra Tez)</option>
                        <option value="gemini-3.5-flash">gemini-3.5-flash (Standard Flash)</option>
                        <option value="gemini-flash-latest">gemini-flash-latest (Auto Latest)</option>
                        <option value="gemini-pro-latest">gemini-pro-latest (Pro Model)</option>
                      </>
                    )}
                    {selectedProvider === 'openai' && (
                      <>
                        <option value="gpt-4o-mini">gpt-4o-mini (Tez & Arzon)</option>
                        <option value="gpt-4o">gpt-4o (Kuchli Flagman)</option>
                        <option value="gpt-3.5-turbo">gpt-3.5-turbo</option>
                      </>
                    )}
                    {selectedProvider === 'groq' && (
                      <>
                        <option value="llama-3.3-70b-versatile">llama-3.3-70b-versatile</option>
                        <option value="mixtral-8x7b-32768">mixtral-8x7b-32768</option>
                      </>
                    )}
                    {selectedProvider === 'deepseek' && (
                      <>
                        <option value="deepseek-chat">deepseek-chat (V3)</option>
                        <option value="deepseek-reasoner">deepseek-reasoner (R1)</option>
                      </>
                    )}
                    {selectedProvider === 'openrouter' && (
                      <>
                        <option value="google/gemini-2.0-flash-exp:free">gemini-2.0-flash-exp:free</option>
                        <option value="meta-llama/llama-3.3-70b-instruct:free">llama-3.3-70b:free</option>
                        <option value="openai/gpt-4o-mini">openai/gpt-4o-mini</option>
                      </>
                    )}
                    {selectedProvider === 'custom' && (
                      <option value="custom">Maxsus Model</option>
                    )}
                  </select>
                </div>

                {selectedProvider === 'custom' ? (
                  <div>
                    <label className={clsx('block text-[11px] font-bold mb-1', isDark ? 'text-slate-300' : 'text-slate-700')}>Custom URL Endpoint:</label>
                    <input
                      type="text"
                      value={tempCustomUrl}
                      onChange={(e) => setTempCustomUrl(e.target.value)}
                      placeholder="https://api.myllm.com/v1/chat/completions"
                      className={clsx('w-full rounded-xl px-3 py-2 text-xs outline-none border font-mono', isDark ? 'bg-[#050B18] border-[#1A2F57] text-white' : 'bg-slate-50 border-slate-300')}
                    />
                  </div>
                ) : (
                  <div>
                    <label className={clsx('block text-[11px] font-bold mb-1', isDark ? 'text-slate-300' : 'text-slate-700')}>Ruxsat Darajasi:</label>
                    <div className={clsx('p-2 rounded-xl border text-[10px] flex items-center gap-1.5', isDark ? 'bg-[#050B18] border-emerald-500/30 text-emerald-300' : 'bg-emerald-50 border-emerald-200 text-emerald-800')}>
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span><strong>Superadmin:</strong> Cheksiz ruxsat & buyruq ijrosi</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Test status banner */}
              {testApiStatus && (
                <div className={clsx('p-2.5 rounded-xl text-xs border flex items-center gap-2', testApiStatus.success ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' : 'bg-rose-500/10 border-rose-500/30 text-rose-300')}>
                  {testApiStatus.testing ? <Cpu className="w-4 h-4 animate-spin text-indigo-400" /> : testApiStatus.success ? <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> : <XCircle className="w-4 h-4 text-rose-400 shrink-0" />}
                  <span className="font-semibold">{testApiStatus.testing ? 'Ulanish sinab ko\'rilmoqda...' : testApiStatus.message}</span>
                </div>
              )}
            </div>

            <div className={clsx('flex items-center justify-between pt-3 border-t', isDark ? 'border-[#182A4D]' : 'border-slate-200')}>
              <button
                type="button"
                onClick={handleTestApiConnection}
                disabled={testApiStatus?.testing}
                className={clsx('px-3.5 py-2 rounded-xl text-xs font-bold border cursor-pointer transition-all flex items-center gap-1.5', isDark ? 'bg-[#112144] border-[#1E365E] text-slate-300 hover:bg-[#182F5E]' : 'bg-slate-100 border-slate-300 text-slate-700')}
              >
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                Ulanishni Sinash
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsAiSettingsOpen(false)}
                  className={clsx('px-3.5 py-2 rounded-xl text-xs font-semibold cursor-pointer border', isDark ? 'bg-[#162748] text-slate-300 border-[#1E365E]' : 'bg-slate-100 text-slate-700 border-slate-300')}
                >
                  Bekor
                </button>
                <button
                  type="button"
                  onClick={handleSaveAiSettings}
                  className="px-5 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-xl text-xs cursor-pointer shadow-md shadow-indigo-900/30 flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" /> Saqlash & Faollashtirish
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── CONTEXT PREVIEW MODAL ────────────────────────────────────── */}
      {isContextPreviewOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className={clsx('rounded-2xl max-w-2xl w-full p-5 shadow-2xl space-y-4 border', isDark ? 'bg-[#0D1832] border-[#1E3563]' : 'bg-white border-slate-200')}>
            <div className={clsx('flex items-center justify-between border-b pb-3', isDark ? 'border-[#182A4D]' : 'border-slate-200')}>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <h3 className={clsx('text-sm font-bold', isDark ? 'text-white' : 'text-slate-900')}>AI ko'rayotgan Real-Vaqt Sayt Konteksti</h3>
                  <p className="text-[10px] text-slate-400">Har bir so'rovda AI modeliga yuboriladigan to'liq tizim holati</p>
                </div>
              </div>
              <button onClick={() => setIsContextPreviewOpen(false)} className="text-slate-400 hover:text-slate-200 cursor-pointer"><X className="w-4 h-4" /></button>
            </div>

            <div className={clsx('p-3 rounded-xl border max-h-[380px] overflow-y-auto font-mono text-[10px] leading-relaxed whitespace-pre-wrap custom-scrollbar', isDark ? 'bg-[#050A18] border-[#162748] text-emerald-300' : 'bg-slate-900 border-slate-700 text-emerald-400')}>
              {buildFullSiteContext()}
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-[10px] text-slate-500">Ushbu kontekst barcha do'konlar (Zustand stores) ma'lumotlarini o'z ichiga oladi.</span>
              <button
                onClick={() => setIsContextPreviewOpen(false)}
                className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg text-xs cursor-pointer"
              >
                Tushunarli
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Block IP Modal ──────────────────────────────────────────── */}
      {isBlockModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className={clsx('rounded-2xl max-w-md w-full p-5 shadow-2xl space-y-4 border', isDark ? 'bg-[#0D1832] border-[#1E3563]' : 'bg-white border-slate-200')}>
            <div className={clsx('flex items-center justify-between border-b pb-3', isDark ? 'border-[#182A4D]' : 'border-slate-200')}>
              <h3 className={clsx('text-sm font-bold flex items-center gap-2', isDark ? 'text-white' : 'text-slate-900')}><Ban className="w-4 h-4 text-rose-400" />IP Bloklash</h3>
              <button onClick={() => setIsBlockModalOpen(false)} className="text-slate-400 hover:text-slate-200 cursor-pointer"><X className="w-4 h-4" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className={clsx('block text-[11px] font-semibold mb-1', isDark ? 'text-slate-300' : 'text-slate-700')}>IP Manzil *</label>
                <input type="text" value={blockModalIP} onChange={(e) => setBlockModalIP(e.target.value)} placeholder="192.168.1.1"
                  className={clsx('w-full rounded-lg px-3 py-2 text-xs outline-none border font-mono', isDark ? 'bg-[#091024] border-[#1A2F57] focus:border-rose-400 text-white' : 'bg-slate-50 border-slate-300 text-slate-900')} />
              </div>
              <div>
                <label className={clsx('block text-[11px] font-semibold mb-1', isDark ? 'text-slate-300' : 'text-slate-700')}>Sabab *</label>
                <input type="text" value={blockModalReason} onChange={(e) => setBlockModalReason(e.target.value)} placeholder="Masalan: DDoS hujumi..."
                  className={clsx('w-full rounded-lg px-3 py-2 text-xs outline-none border', isDark ? 'bg-[#091024] border-[#1A2F57] focus:border-rose-400 text-white' : 'bg-slate-50 border-slate-300 text-slate-900')} />
              </div>
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <div className={clsx('relative w-8 h-4 rounded-full transition-all', blockModalPermanent ? 'bg-rose-500' : isDark ? 'bg-[#162748]' : 'bg-slate-300')} onClick={() => setBlockModalPermanent(!blockModalPermanent)}>
                  <div className={clsx('absolute top-0.5 w-3 h-3 rounded-full bg-white shadow transition-all', blockModalPermanent ? 'left-4' : 'left-0.5')} />
                </div>
                <span className={clsx('text-[11px] font-semibold', isDark ? 'text-slate-300' : 'text-slate-700')}>Doimiy bloklash</span>
              </label>
            </div>
            <div className={clsx('flex justify-end gap-2 pt-2 border-t', isDark ? 'border-[#182A4D]' : 'border-slate-200')}>
              <button onClick={() => setIsBlockModalOpen(false)} className={clsx('px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer border', isDark ? 'bg-[#162748] text-slate-300 border-[#1E365E]' : 'bg-slate-100 text-slate-700 border-slate-300')}>Bekor</button>
              <button onClick={() => { if (blockModalIP && blockModalReason.trim()) { store.blockIP(blockModalIP, 'Qo\'lda qo\'shilgan', 'XX', blockModalReason.trim(), blockModalPermanent); setIsBlockModalOpen(false); } }} disabled={!blockModalIP || !blockModalReason.trim()}
                className="px-4 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg text-xs cursor-pointer disabled:opacity-50 flex items-center gap-1.5"><Ban className="w-3.5 h-3.5" />Bloklash</button>
            </div>
          </div>
        </div>
      )}
    </EgaLayout>
  );
};
