// useSecurityStore.ts — Full Kiberxavfsizlik store with Real AI Engine, Multi-Provider API Keys, Server Metrics, Auto-Defense
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  AccessLog,
  ActionLog,
  TrafficDataPoint,
  SecurityAlert,
  BlockedIP,
  initialAccessLogs,
  initialActionLogs,
  initialTrafficData,
  initialSecurityAlerts,
  initialBlockedIPs,
} from '../data/initialSecurityLogs';
import { sendAiQuery, AiProvider, ExecutedAction } from '../services/aiChatService';

// ─── AI Chat ──────────────────────────────────────────────────────────────────
export interface AiChatMessage {
  id: string;
  timestamp: string;
  sender: 'user' | 'ai' | 'system';
  text: string;
  type?: 'command' | 'response' | 'alert' | 'info';
  executedActions?: ExecutedAction[];
  modelUsed?: string;
}

// ─── Server Metrics ───────────────────────────────────────────────────────────
export interface ServerMetrics {
  cpu: number;
  ram: number; // Usage percent (e.g. 41)
  disk: number; // Usage percent (e.g. 34)
  ramTotalMb: number; // 1024 MiB (Uzcloud instance)
  ramUsedMb: number; // e.g. 418 MiB
  ramFreeMb: number; // e.g. 606 MiB
  diskTotalGb: number; // 25 GB SSD
  diskUsedGb: number; // e.g. 8.4 GB
  diskFreeGb: number; // e.g. 16.6 GB
  network: { in: number; out: number };
  uptime: string;
  activeConnections: number;
  requestsPerSec: number;
  responseTimeAvg: number;
  sslValid: boolean;
  sslExpiry: string;
  openPorts: number[];
  processes: number;
  threatLevel: 'low' | 'medium' | 'high';
  rateLimitHits: number;
  failedLoginAttemptsCount: number;
}

// ─── Defense Status ───────────────────────────────────────────────────────────
export interface DefenseStatus {
  ddosProtection: boolean;
  rateLimit: boolean;
  rateLimitValue: number; // req per minute
  waf: boolean;
  sslTls: boolean;
  geoBlocking: boolean;
  botDetection: boolean;
  bruteForceProtection: boolean;
  twoFactor: boolean;
  ipWhitelist: boolean;
  captcha: boolean;
  intrusionDetection: boolean;
}

export interface SecurityAiSettings {
  provider: AiProvider;
  geminiApiKey: string;
  openaiApiKey: string;
  groqApiKey: string;
  deepseekApiKey: string;
  openrouterApiKey: string;
  customApiKey: string;
  customApiUrl: string;
  geminiModel: string;
  openaiModel: string;
  groqModel: string;
  deepseekModel: string;
  openrouterModel: string;
}

interface SecurityState {
  accessLogs: AccessLog[];
  actionLogs: ActionLog[];
  trafficData: TrafficDataPoint[];
  alerts: SecurityAlert[];
  blockedIPs: BlockedIP[];
  liveMode: boolean;
  serverMetrics: ServerMetrics;
  defenseStatus: DefenseStatus;
  aiChatMessages: AiChatMessage[];
  autoDefend: boolean;
  isAiLoading: boolean;

  // AI Configuration
  aiSettings: SecurityAiSettings;
  updateAiSettings: (partial: Partial<SecurityAiSettings>) => void;
  getActiveApiKey: () => string;
  getActiveModel: () => string;

  blockIP: (ip: string, country: string, countryCode: string, reason: string, permanent?: boolean) => void;
  unblockIP: (ip: string) => void;
  resolveAlert: (id: string) => void;
  updateAlertStatus: (id: string, status: SecurityAlert['status']) => void;
  setLiveMode: (v: boolean) => void;
  addAccessLog: (log: AccessLog) => void;
  clearLogs: () => void;
  generateAiAnalysis: (alert: SecurityAlert) => string;
  toggleDefense: (key: keyof DefenseStatus) => void;
  setAutoDefend: (v: boolean) => void;
  updateServerMetrics: (partial: Partial<ServerMetrics>) => void;
  addAiChatMessage: (msg: AiChatMessage) => void;
  clearAiChat: () => void;
  sendMessageToAi: (text: string) => Promise<void>;
  processAiCommand: (input: string) => string;
  recordFailedLogin: (ip: string, email: string, reason: string) => void;
  recordSuccessfulLogin: (ip: string, email: string, role: string) => void;
  recordRateLimitHit: (ip: string, path: string) => void;
}

const STORAGE_KEY = 'ega_security_v3';

const DEFAULT_METRICS: ServerMetrics = {
  cpu: 32,
  ram: 41,
  disk: 34,
  ramTotalMb: 1024,
  ramUsedMb: 418,
  ramFreeMb: 606,
  diskTotalGb: 25,
  diskUsedGb: 8.4,
  diskFreeGb: 16.6,
  network: { in: 14.5, out: 8.2 },
  uptime: '47 kun 14 soat 42 daqiqa',
  activeConnections: 142,
  requestsPerSec: 24,
  responseTimeAvg: 110,
  sslValid: true,
  sslExpiry: '2027-03-15',
  openPorts: [80, 443, 22, 5432],
  processes: 74,
  threatLevel: 'low',
  rateLimitHits: 2,
  failedLoginAttemptsCount: 1,
};

const DEFAULT_DEFENSE: DefenseStatus = {
  ddosProtection: true,
  rateLimit: true,
  rateLimitValue: 120,
  waf: true,
  sslTls: true,
  geoBlocking: false,
  botDetection: true,
  bruteForceProtection: true,
  twoFactor: false,
  ipWhitelist: false,
  captcha: true,
  intrusionDetection: true,
};

const DEFAULT_AI_SETTINGS: SecurityAiSettings = {
  provider: 'gemini',
  geminiApiKey: 'AIzaSyDnGEBpBXSZdorXGSM7poo1UDEn1xYV5tQ',
  openaiApiKey: '',
  groqApiKey: '',
  deepseekApiKey: '',
  openrouterApiKey: '',
  customApiKey: '',
  customApiUrl: '',
  geminiModel: 'gemini-3.7-flash',
  openaiModel: 'gpt-4o-mini',
  groqModel: 'llama-3.3-70b-versatile',
  deepseekModel: 'deepseek-chat',
  openrouterModel: 'google/gemini-2.0-flash-exp:free',
};

export const useSecurityStore = create<SecurityState>()(
  persist(
    (set, get) => ({
      accessLogs: initialAccessLogs,
      actionLogs: initialActionLogs,
      trafficData: initialTrafficData,
      alerts: initialSecurityAlerts,
      blockedIPs: initialBlockedIPs,
      liveMode: false,
      serverMetrics: DEFAULT_METRICS,
      defenseStatus: DEFAULT_DEFENSE,
      autoDefend: true,
      isAiLoading: false,
      aiSettings: DEFAULT_AI_SETTINGS,

      aiChatMessages: [
        {
          id: 'sys-init',
          timestamp: new Date().toLocaleTimeString(),
          sender: 'system',
          text: '🛡️ AI Xavfsizlik va Boshqaruv Tizimi ishga tushdi. Saytning barcha modullari (Xavfsizlik, Moliya, Olimpiadalar, Foydalanuvchilar, Reyting) real vaqtda ulandi.',
          type: 'info',
        },
        {
          id: 'sys-ready',
          timestamp: new Date().toLocaleTimeString(),
          sender: 'ai',
          text: `Salom, Hurmatli Admin! Men sizning **AI Boshqaruv va Kiberxavfsizlik Sentinel** yordamchingizman.\n\nMen butun saytni (Server, Moliya, Olimpiadalar, Foydalanuvchilar, Reyting) to'liq ko'rib va nazorat qilib turaman. Menga istalgan savolni bering yoki buyruq bering:\n\n🛡️ **Xavfsizlik**: *"Server holati qanday?"*, *"Kimlar hujum qilyapti?"*, *"DDoS himoyasini yoq"*, *"IP 45.148.10.121 ni blokla"*\n💰 **Moliya**: *"Jami tushumlar qancha?"*, *"Click va Payme statistikasi qanday?"*\n🏆 **Olimpiadalar**: *"Nechta olimpiada ochiq?"*, *"Ishtirokchilar qancha?"*\n🥇 **Reyting**: *"Eng yuqori o'rindagi o'quvchilar kimlar?"*\n\n🔑 *Eslatma: Haqiqiy API kalitingizni (Gemini / OpenAI) sozlash uchun yuqoridagi **"API Sozlamalari"** tugmasidan foydalaning.*`,
          type: 'response',
        },
      ],

      updateAiSettings: (partial) => {
        set((s) => ({ aiSettings: { ...s.aiSettings, ...partial } }));
      },

      getActiveApiKey: () => {
        const s = get().aiSettings;
        switch (s.provider) {
          case 'gemini': return s.geminiApiKey;
          case 'openai': return s.openaiApiKey;
          case 'groq': return s.groqApiKey;
          case 'deepseek': return s.deepseekApiKey;
          case 'openrouter': return s.openrouterApiKey;
          case 'custom': return s.customApiKey;
          default: return s.geminiApiKey;
        }
      },

      getActiveModel: () => {
        const s = get().aiSettings;
        switch (s.provider) {
          case 'gemini': return s.geminiModel;
          case 'openai': return s.openaiModel;
          case 'groq': return s.groqModel;
          case 'deepseek': return s.deepseekModel;
          case 'openrouter': return s.openrouterModel;
          case 'custom': return 'custom';
          default: return s.geminiModel;
        }
      },

      blockIP: (ip, country, countryCode, reason, permanent = false) => {
        const now = new Date();
        const expires = permanent
          ? undefined
          : new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16).replace('T', ' ');
        const newBlock: BlockedIP = {
          ip, country, countryCode, reason,
          blockedAt: now.toISOString().slice(0, 16).replace('T', ' '),
          expiresAt: expires, requestCount: 1, permanent,
        };
        set((s) => ({
          blockedIPs: [newBlock, ...s.blockedIPs.filter((b) => b.ip !== ip)],
        }));
      },

      unblockIP: (ip) => {
        set((s) => ({ blockedIPs: s.blockedIPs.filter((b) => b.ip !== ip) }));
      },

      resolveAlert: (id) => {
        set((s) => ({ alerts: s.alerts.map((a) => (a.id === id ? { ...a, status: 'resolved' as const } : a)) }));
      },

      updateAlertStatus: (id, status) => {
        set((s) => ({ alerts: s.alerts.map((a) => (a.id === id ? { ...a, status } : a)) }));
      },

      setLiveMode: (v) => set({ liveMode: v }),

      addAccessLog: (log) => {
        set((s) => ({ accessLogs: [log, ...s.accessLogs].slice(0, 200) }));
      },

      clearLogs: () => set({ accessLogs: [], actionLogs: [] }),

      toggleDefense: (key) => {
        set((s) => ({
          defenseStatus: { ...s.defenseStatus, [key]: !s.defenseStatus[key] },
        }));
      },

      setAutoDefend: (v) => set({ autoDefend: v }),

      updateServerMetrics: (partial) => {
        set((s) => ({ serverMetrics: { ...s.serverMetrics, ...partial } }));
      },

      recordFailedLogin: (ip, email, reason) => {
        const now = new Date();
        const timeStr = now.toISOString().replace('T', ' ').slice(0, 19);
        const log: AccessLog = {
          id: `sec-fail-${Date.now()}`,
          timestamp: timeStr,
          ip: ip || '127.0.0.1',
          country: "O'zbekiston",
          countryCode: 'UZ',
          method: 'POST',
          path: '/api/admin/login',
          statusCode: 401,
          responseTimeMs: 38,
          userAgent: navigator.userAgent || 'Mozilla/5.0 Browser Client',
          userName: email,
          bytesSent: 256,
          level: 'error'
        };
        const alert: SecurityAlert = {
          id: `alt-${Date.now()}`,
          timestamp: timeStr,
          type: 'brute_force',
          severity: 'medium',
          status: 'active',
          ip: ip || '127.0.0.1',
          country: "O'zbekiston",
          countryCode: 'UZ',
          description: `Muvaffaqiyatsiz login urinishi (${email}): ${reason}`,
          requestCount: 1,
          timeWindowSec: 60,
        };
        set((s) => ({
          accessLogs: [log, ...s.accessLogs].slice(0, 250),
          alerts: [alert, ...s.alerts].slice(0, 50),
          serverMetrics: {
            ...s.serverMetrics,
            failedLoginAttemptsCount: s.serverMetrics.failedLoginAttemptsCount + 1,
            threatLevel: s.serverMetrics.failedLoginAttemptsCount + 1 > 3 ? 'high' : 'medium'
          }
        }));
      },

      recordSuccessfulLogin: (ip, email, role) => {
        const now = new Date();
        const timeStr = now.toISOString().replace('T', ' ').slice(0, 19);
        const log: AccessLog = {
          id: `sec-ok-${Date.now()}`,
          timestamp: timeStr,
          ip: ip || '127.0.0.1',
          country: "O'zbekiston",
          countryCode: 'UZ',
          method: 'POST',
          path: '/api/admin/login',
          statusCode: 200,
          responseTimeMs: 24,
          userAgent: navigator.userAgent || 'Mozilla/5.0 Browser Client',
          userName: email,
          bytesSent: 1024,
          level: 'info'
        };
        set((s) => ({
          accessLogs: [log, ...s.accessLogs].slice(0, 250)
        }));
      },

      recordRateLimitHit: (ip, path) => {
        const now = new Date();
        const timeStr = now.toISOString().replace('T', ' ').slice(0, 19);
        const log: AccessLog = {
          id: `sec-rate-${Date.now()}`,
          timestamp: timeStr,
          ip: ip || '127.0.0.1',
          country: "O'zbekiston",
          countryCode: 'UZ',
          method: 'GET',
          path: path || '/api/general',
          statusCode: 429,
          responseTimeMs: 12,
          userAgent: navigator.userAgent || 'Mozilla/5.0 Browser Client',
          bytesSent: 128,
          level: 'warning'
        };
        set((s) => ({
          accessLogs: [log, ...s.accessLogs].slice(0, 250),
          serverMetrics: {
            ...s.serverMetrics,
            rateLimitHits: s.serverMetrics.rateLimitHits + 1,
            threatLevel: s.serverMetrics.rateLimitHits + 1 > 5 ? 'high' : 'medium'
          }
        }));
      },

      addAiChatMessage: (msg) => {
        set((s) => ({ aiChatMessages: [...s.aiChatMessages, msg] }));
      },

      clearAiChat: () => {
        set({
          aiChatMessages: [
            {
              id: `sys-${Date.now()}`,
              timestamp: new Date().toLocaleTimeString(),
              sender: 'system',
              text: '🧹 Chat tarixi tozalandi. AI Sentinel yangi sessiyaga tayyor.',
              type: 'info',
            }
          ]
        });
      },

      sendMessageToAi: async (text: string) => {
        const state = get();
        const trimmed = text.trim();
        if (!trimmed) return;

        // 1. Add user message to chat immediately
        const userMsg: AiChatMessage = {
          id: `user-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString(),
          sender: 'user',
          text: trimmed,
          type: 'command',
        };

        set((s) => ({
          aiChatMessages: [...s.aiChatMessages, userMsg],
          isAiLoading: true,
        }));

        try {
          const provider = state.aiSettings.provider;
          const apiKey = state.getActiveApiKey();
          const model = state.getActiveModel();
          const customUrl = state.aiSettings.customApiUrl;

          const history = state.aiChatMessages.map((m) => ({
            sender: m.sender,
            text: m.text,
          }));

          const result = await sendAiQuery(trimmed, history, {
            provider,
            apiKey,
            model,
            customUrl,
          });

          const aiMsg: AiChatMessage = {
            id: `ai-${Date.now()}`,
            timestamp: new Date().toLocaleTimeString(),
            sender: 'ai',
            text: result.text,
            type: 'response',
            executedActions: result.executedActions,
            modelUsed: result.modelUsed,
          };

          set((s) => ({
            aiChatMessages: [...s.aiChatMessages, aiMsg],
            isAiLoading: false,
          }));
        } catch (error: any) {
          console.error('sendMessageToAi error:', error);
          const errMsg: AiChatMessage = {
            id: `ai-err-${Date.now()}`,
            timestamp: new Date().toLocaleTimeString(),
            sender: 'ai',
            text: `⚠️ Xatolik yuz berdi: ${error.message || 'Server javob bermadi'}. API kalitingizni tekshirib ko'ring.`,
            type: 'alert',
          };
          set((s) => ({
            aiChatMessages: [...s.aiChatMessages, errMsg],
            isAiLoading: false,
          }));
        }
      },

      generateAiAnalysis: (alert) => {
        const analyses: Record<string, string> = {
          ddos: `Bu DDoS hujumi klassik HTTP flood usulida amalga oshirilgan. ${alert.requestCount} ta so'rov ${alert.timeWindowSec} soniyada yuborilgan. Tavsiya: WAF rate limitni faollashtiring va IP ni doimiy bloklang.`,
          brute_force: `Brute force parol hujumi. Hujumchi ${alert.ip} dan avtomatlashtirilgan skript orqali parollarni sinab ko'rmoqda. Tavsiya: IP bloklash, 2FA majburiy qilish.`,
          sql_injection: `SQL Injection hujumi aniqlandi. WAF qoidalari orqali so'rov to'xtatildi, prepared statements tekshiring.`,
          suspicious_scan: `Vulnerability scanner aniqlandi. Darhol IP bloklash tavsiya etiladi.`,
          xss: `XSS urinishi. Content-Security-Policy header qo'shing.`,
          rate_limit: `Rate limit oshirilgan. CAPTCHA qo'shish tavsiya etiladi.`,
          bot: `Bot traffic aniqlandi. Bot detection yoqing.`,
          geo_block: `Yuqori xavfli hududdan kirish. Geo-blocking yoqing.`,
        };
        return analyses[alert.type] || 'AI tahlil amalga oshirilmoqda...';
      },

      processAiCommand: (input: string): string => {
        // Kept for backward compatibility
        const cmd = input.trim().toLowerCase();
        const state = get();

        if (cmd === 'status' || cmd === 'holat') {
          const m = state.serverMetrics;
          return `📊 SERVER HOLATI\n━━━━━━━━━━━━━━━━━━━━━━━━━━━\n• Uptime: ${m.uptime}\n• CPU: ${m.cpu}% ${m.cpu > 80 ? '⚠️ YUQORI!' : '✅'}\n• RAM: ${m.ram}% ${m.ram > 85 ? '⚠️ YUQORI!' : '✅'}\n• Disk: ${m.disk}% ✅\n• Tarmoq: ↓ ${m.network.in.toFixed(1)} MB/s | ↑ ${m.network.out.toFixed(1)} MB/s\n• Faol ulanishlar: ${m.activeConnections}\n• So'rovlar: ${m.requestsPerSec} req/s\n• O'rtacha javob: ${m.responseTimeAvg}ms\n• SSL/TLS: ${m.sslValid ? '✅ Faol' : '❌ O\'chirilgan'}`;
        }
        return `🤖 Buyruq qabul qilindi: "${input}". To'liq AI tahlil uchun yuborilmoqda...`;
      },
    }),
    {
      name: STORAGE_KEY,
      partialize: (s) => ({
        blockedIPs: s.blockedIPs,
        alerts: s.alerts,
        defenseStatus: s.defenseStatus,
        autoDefend: s.autoDefend,
        aiSettings: s.aiSettings,
        aiChatMessages: s.aiChatMessages.slice(-50), // Keep last 50 messages
      }),
    }
  )
);
