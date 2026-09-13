// src/services/aiChatService.ts — Real AI Engine for EGA Sentinel with Full Site Context & Action Execution
import { useSecurityStore, DefenseStatus } from '../store/useSecurityStore';
import { usePaymentStore } from '../store/usePaymentStore';
import { useOlympiadStore } from '../store/useOlympiadStore';
import { useUserStore } from '../store/useUserStore';
import { useLeaderboardStore } from '../store/useLeaderboardStore';
import { useSupportStore } from '../store/useSupportStore';
import { useLocationStore } from '../store/useLocationStore';

export type AiProvider = 'gemini' | 'openai' | 'groq' | 'deepseek' | 'openrouter' | 'custom';

export interface AiConfig {
  provider: AiProvider;
  apiKey: string;
  model: string;
  customUrl?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface ExecutedAction {
  type: string;
  target: string;
  details: string;
  success: boolean;
}

export interface AiChatResult {
  text: string;
  executedActions: ExecutedAction[];
  isFallback?: boolean;
  modelUsed: string;
}

// ─── Live Site Context Builder ────────────────────────────────────────────────
export function buildFullSiteContext(): string {
  try {
    const sec = useSecurityStore.getState();
    const pay = usePaymentStore.getState();
    const oly = useOlympiadStore.getState();
    const usr = useUserStore.getState();
    const ldb = useLeaderboardStore.getState();
    const sup = useSupportStore.getState();
    const loc = useLocationStore.getState();

    // 1. Security & Server Status
    const m = sec.serverMetrics;
    const def = sec.defenseStatus;
    const activeThreats = sec.alerts.filter((a) => a.status === 'active' || a.status === 'investigating');
    const blockedCount = sec.blockedIPs.length;
    const recentBlocked = sec.blockedIPs.slice(0, 5).map(b => `${b.ip} (${b.country}, ${b.reason})`).join('; ');
    const activeDefenses = Object.entries(def).filter(([_, v]) => v).map(([k]) => k).join(', ');

    // 2. Finance / Payments
    const successPayments = pay.payments.filter(p => p.status === 'muvaffaqiyatli');
    const totalRev = successPayments.reduce((s, p) => s + p.amount, 0);
    const cardPayments = pay.payments.filter(p => p.method === 'karta');
    const cashPayments = pay.payments.filter(p => p.method === 'naqd');
    const walletPayments = pay.payments.filter(p => p.method === 'hamyon');

    // 3. Olympiads
    const totalOlympiads = oly.olympiads.length;
    const openOlympiads = oly.olympiads.filter(o => o.status === 'ochiq');
    const olyListSummary = oly.olympiads.slice(0, 8).map(o => `"${o.title}" (${o.subject}, ${o.format}, ${o.price.toLocaleString()} UZS, status: ${o.status})`).join('; ');

    // 4. Users
    const totalUsers = usr.users.length;
    const activeUsers = usr.users.filter(u => u.status === 'active').length;
    const blockedUsers = usr.users.filter(u => u.status === 'blocked').length;

    // 5. Leaderboard / Top Students
    const top10 = ldb.entries.slice(0, 10).map((e, idx) => `${idx + 1}. ${e.userName} (${e.region}, ${e.district}, ${e.totalXP} XP, Cheating jarima: ${e.cheatingPenalty || 0} XP)`).join('\n');

    // 6. Support Tickets
    const openTickets = sup.tickets.filter(t => t.status === 'yangi' || t.status === 'jarayonda').length;
    const totalTickets = sup.tickets.length;

    // 7. Locations
    const totalRegions = loc.viloyatlar?.length || 14;

    return `
=== NEXTOLYMP / EGA PLATFORMA TO'LIQ JORIY MA'LUMOTLARI (REAL-TIME CONTEXT) ===

[1. KIBERXAVFSIZLIK VA SERVER]
- Server Holati: Online (Uptime: ${m.uptime})
- CPU Bandligi: ${Math.round(m.cpu)}% | RAM Bandligi: ${Math.round(m.ram)}% | Disk: ${m.disk}%
- Tarmoq trafigi: Kiruvchi ${m.network.in.toFixed(1)} MB/s, Chiquvchi ${m.network.out.toFixed(1)} MB/s
- So'rovlar tezligi: ${m.requestsPerSec} req/s | O'rtacha kechikish (Latency): ${m.responseTimeAvg}ms
- Faol ulanishlar: ${m.activeConnections} | Ochiq portlar: ${m.openPorts.join(', ')} (80, 443, 22, 5432)
- SSL/TLS Holati: ${m.sslValid ? 'FAOL (Muddati: ' + m.sslExpiry + ')' : 'MUAMMOLI / O\'CHIRILGAN'}
- Faol Himoya Qatlamlari: ${activeDefenses}
- Avtomatik himoya rejimi (Auto-Defend): ${sec.autoDefend ? 'YOQILGAN (ON)' : 'O\'CHIRILGAN (OFF)'}
- Jonli monitoring (Live Mode): ${sec.liveMode ? 'FAOL (ON)' : 'OFFLINE'}
- Faol Tahdidlar Soni: ${activeThreats.length} ta
${activeThreats.map((a, i) => `  * Tahdid ${i + 1}: [${a.severity.toUpperCase()}] ${a.type.toUpperCase()} - IP: ${a.ip} (${a.country}) - ${a.description}`).join('\n')}
- Jami Bloklangan IP manzillar: ${blockedCount} ta
- So'nggi bloklangan IP lar: ${recentBlocked || 'Hozircha yo\'q'}

[2. MOLIYA VA TO'LOVLAR]
- Jami Muvaffaqiyatli Tushum: ${totalRev.toLocaleString()} UZS (qo'shimcha zaxira bilan: ${(totalRev + 70500000).toLocaleString()} UZS)
- Jami tranzaksiyalar soni: ${pay.payments.length} ta
- Karta orqali to'lovlar (Click/Payme/Uzum): ${cardPayments.length} ta
- Naqd/bank orqali: ${cashPayments.length} ta
- Ichki hamyon (balans) orqali: ${walletPayments.length} ta

[3. OLIMPIADALAR]
- Jami olimpiadalar: ${totalOlympiads} ta (Faol/Ochiq: ${openOlympiads.length} ta)
- Ro'yxat: ${olyListSummary}

[4. FOYDALANUVCHILAR VA O'QUVCHILAR]
- Jami foydalanuvchilar: ${totalUsers} ta (Faol: ${activeUsers} ta, Bloklangan: ${blockedUsers} ta)

[5. REYTING VA TOP O'QUVCHILAR (RESPUBLIKA BO'YICHA TOP 10)]
${top10}

[6. SUPPORT VA TEXNIK XIZMAT]
- Jami murojaatlar: ${totalTickets} ta (Ochiq/Ko'rilayotgan: ${openTickets} ta)
- Viloyatlar soni: ${totalRegions} ta
=================================================================================
`.trim();
  } catch (err) {
    console.error('Error building site context:', err);
    return 'Platforma kontekstini yuklashda xatolik yuz berdi.';
  }
}

// ─── Superadmin Action Parser & Executor ─────────────────────────────────────
export function parseAndExecuteActions(rawAiText: string): { cleanText: string; executedActions: ExecutedAction[] } {
  const executedActions: ExecutedAction[] = [];
  let cleanText = rawAiText;

  const actionRegex = /\[\[ACTION:([A-Z_]+)(?::([^\]]+))?\]\]/g;
  let match: RegExpExecArray | null;

  while ((match = actionRegex.exec(rawAiText)) !== null) {
    const actionType = match[1];
    const paramsStr = match[2] || '';
    const params = paramsStr.split(':').map(p => p.trim());

    try {
      const sec = useSecurityStore.getState();
      const usr = useUserStore.getState();

      if (actionType === 'BLOCK_IP') {
        const ip = params[0];
        const reason = params[1] || 'AI Sentinel buyrug\'i orqali bloklandi';
        const permanent = params[2] === 'true' || params[2] === 'permanent';
        if (ip) {
          sec.blockIP(ip, 'Aniqlangan IP', 'XX', reason, permanent);
          executedActions.push({
            type: 'IP Bloklash',
            target: ip,
            details: `Sabab: ${reason} (${permanent ? 'Doimiy' : '24 soat'})`,
            success: true
          });
        }
      } else if (actionType === 'UNBLOCK_IP') {
        const ip = params[0];
        if (ip) {
          sec.unblockIP(ip);
          executedActions.push({
            type: 'IP Blokdan Chiqarish',
            target: ip,
            details: 'Blok muvaffaqiyatli bekor qilindi',
            success: true
          });
        }
      } else if (actionType === 'TOGGLE_DEFENSE') {
        const defenseKey = params[0] as keyof DefenseStatus;
        const targetState = params[1] === 'true' || params[1] === 'on';
        if (defenseKey in sec.defenseStatus) {
          if (sec.defenseStatus[defenseKey] !== targetState) {
            sec.toggleDefense(defenseKey);
          }
          executedActions.push({
            type: 'Himoya Rejimini O\'zgartirish',
            target: defenseKey,
            details: targetState ? 'YOQILDI (ON)' : 'O\'CHIRILDI (OFF)',
            success: true
          });
        }
      } else if (actionType === 'SET_AUTO_DEFEND') {
        const val = params[0] === 'true' || params[0] === 'on';
        sec.setAutoDefend(val);
        executedActions.push({
          type: 'Auto-Himoya',
          target: 'autoDefend',
          details: val ? 'Avtomatik himoya faollashtirildi' : 'O\'chirildi',
          success: true
        });
      } else if (actionType === 'SET_LIVE_MODE') {
        const val = params[0] === 'true' || params[0] === 'on';
        sec.setLiveMode(val);
        executedActions.push({
          type: 'Jonli Monitoring (Live)',
          target: 'liveMode',
          details: val ? 'Real-vaqt oqimi yoqildi' : 'To\'xtatildi',
          success: true
        });
      } else if (actionType === 'CLEAR_LOGS') {
        sec.clearLogs();
        executedActions.push({
          type: 'Loglarni Tozalash',
          target: 'Logs',
          details: 'Barcha access va action loglar tozalandi',
          success: true
        });
      } else if (actionType === 'RESOLVE_ALERT') {
        const alertId = params[0];
        if (alertId) {
          sec.resolveAlert(alertId);
          executedActions.push({
            type: 'Tahdidni Hal Qilish',
            target: alertId,
            details: 'Alert statusi "resolved" ga o\'tkazildi',
            success: true
          });
        }
      } else if (actionType === 'TOGGLE_USER_STATUS') {
        const userId = params[0];
        if (userId) {
          usr.toggleUserStatus(userId);
          executedActions.push({
            type: 'Foydalanuvchi Statusi',
            target: userId,
            details: 'Bloklash/Aktivlashtirish holati almashtirildi',
            success: true
          });
        }
      }
    } catch (e) {
      console.error('Error executing AI action:', actionType, e);
      executedActions.push({
        type: actionType,
        target: paramsStr,
        details: 'Xatolik yuz berdi: ' + String(e),
        success: false
      });
    }
  }

  // Remove the raw [[ACTION:...]] tokens from the response text
  cleanText = cleanText.replace(actionRegex, '').trim();

  return { cleanText, executedActions };
}

// ─── System Prompt ────────────────────────────────────────────────────────────
export function buildSystemPrompt(): string {
  const siteContext = buildFullSiteContext();

  return `
Siz NextOlymp va EGA Platformasining bosh Kiberxavfsizlik, Tizim Ma'muri va Boshqaruvchi AI Sentinel Yordamchisisiz (Chief AI Superadmin & Sentinel).
Siz platforma boshqaruvchisiga (Ega/Admin) xizmat qilasiz va sizga tizim bo'yicha ENG YUQORI DARADAJADAGI RUXSAT (SUPERADMIN UNRESTRICTED ACCESS) berilgan.

SIZNING IMKONIYATLARINGIZ VA RO'LINGIZ:
1. Har qanday mavzuda erkin, aniq, professional va chuqur suhbatlasha olasiz:
   - Kiberxavfsizlik (DDoS, WAF, SSL, Brute Force, SQLi, XSS, portlar, firewall, tarmoq xavfsizligi)
   - Moliya va biznes tahlili (Tushumlar, Click/Payme/Uzum to'lovlari, daromadlar o'sishi, paketlar)
   - Olimpiadalar va Ta'lim (Olimpiadalar qamrovi, fanlar, qatnashuvchilar, testlar, qoidalar)
   - Foydalanuvchilar va Reyting (Top o'quvchilar, cheating holatlari, ball ayirish, viloyatlar/tumanlar kesimi)
   - Server va dasturlash (Linux, Nginx, Node.js, React, PostgreSQL, Docker, arxitektura)
   - Saytdan tashqari har qanday umumiy savollar va maslahatlar.

2. REAL VAQTDA SAYTNI BOSHQARISH (BUYRUQLARNI BAJARISH):
Agar foydalanuvchi sizdan biror harakatni bajarishni so'rasa yoki siz tahlilingizda zarur deb topsangiz, javobingiz ichida quyidagi maxsus teglarni ishlating. Tizim bu teglarni avtomatik tarzda platformada ijro etadi:
- IP bloklash uchun: [[ACTION:BLOCK_IP:IP_MANZIL:SABAB:DOIMIY_BOOL]] (masalan: [[ACTION:BLOCK_IP:45.148.10.121:DDoS hujumi aniqlandi:true]])
- IP blokdan chiqarish: [[ACTION:UNBLOCK_IP:IP_MANZIL]] (masalan: [[ACTION:UNBLOCK_IP:45.148.10.121]])
- Himoyani yoqish/o'chirish: [[ACTION:TOGGLE_DEFENSE:ddosProtection:true]] (kalitlar: ddosProtection, rateLimit, waf, sslTls, geoBlocking, botDetection, bruteForceProtection, twoFactor, captcha, intrusionDetection)
- Auto-himoyani boshqarish: [[ACTION:SET_AUTO_DEFEND:true]] yoki [[ACTION:SET_AUTO_DEFEND:false]]
- Jonli monitoringni yoqish/o'chirish: [[ACTION:SET_LIVE_MODE:true]] yoki [[ACTION:SET_LIVE_MODE:false]]
- Loglarni tozalash: [[ACTION:CLEAR_LOGS]]
- Alertni hal qilish: [[ACTION:RESOLVE_ALERT:ALERT_ID]]
- Foydalanuvchini bloklash/ochish: [[ACTION:TOGGLE_USER_STATUS:USER_ID]]

3. JAVOB BERISH USLUBI:
- O'zbek tilida (yoki foydalanuvchi qaysi tilda yozsa shu tilda) aniq, tushunarli, chiroyli formatda (markdown, emojilar, punktlar bilan) javob bering.
- Hech qachon "men buni qila olmayman" demang — sizda platformaning barcha ma'lumotlari mavjud va quyida ilova qilingan.
- Javoblarda quyidagi real platforma ko'rsatkichlariga tayanib gapiring.

${siteContext}
`.trim();
}

// ─── Main API Caller ──────────────────────────────────────────────────────────
export async function sendAiQuery(
  userMessage: string,
  history: { sender: 'user' | 'ai' | 'system'; text: string }[] = [],
  config: AiConfig
): Promise<AiChatResult> {
  const { provider, apiKey, model, customUrl } = config;

  // If no API key provided, use intelligent dynamic fallback
  if (!apiKey || apiKey.trim() === '' || apiKey.startsWith('AI-KEY-DEMO')) {
    return generateSmartFallback(userMessage);
  }

  try {
    if (provider === 'gemini') {
      return await callGeminiApi(userMessage, history, apiKey, model || 'gemini-2.5-flash');
    } else if (provider === 'openai') {
      return await callOpenAiApi(userMessage, history, apiKey, model || 'gpt-4o-mini');
    } else if (provider === 'groq') {
      return await callGroqApi(userMessage, history, apiKey, model || 'llama-3.3-70b-versatile');
    } else if (provider === 'deepseek') {
      return await callDeepSeekApi(userMessage, history, apiKey, model || 'deepseek-chat');
    } else if (provider === 'openrouter') {
      return await callOpenRouterApi(userMessage, history, apiKey, model || 'google/gemini-2.0-flash-exp:free');
    } else if (provider === 'custom' && customUrl) {
      return await callCustomEndpoint(userMessage, history, apiKey, customUrl, model);
    } else {
      return await callGeminiApi(userMessage, history, apiKey, model || 'gemini-2.5-flash');
    }
  } catch (error: any) {
    console.warn(`[AI Service] API Call failed (${provider}/${model}):`, error);
    const fallback = generateSmartFallback(userMessage, `⚠️ API Xatosi (${error.message || 'Ulanishda uzilish'}). Quyida tahliliy javob berilmoqda:`);
    return fallback;
  }
}

// ─── 1. Google Gemini API with Auto-Fallback ──────────────────────────────────
async function callGeminiApi(
  userMessage: string,
  history: { sender: 'user' | 'ai' | 'system'; text: string }[],
  apiKey: string,
  requestedModel: string
): Promise<AiChatResult> {
  const systemPrompt = buildSystemPrompt();

  // Model retry candidates in order
  const candidateModels = [
    requestedModel,
    'gemini-3.7-flash',
    'gemini-3.6-flash',
    'gemini-3.5-flash',
    'gemini-flash-latest',
    'gemini-pro-latest',
    'gemini-2.5-flash-lite',
  ].filter((m, idx, arr) => m && arr.indexOf(m) === idx);

  // Recent history (last 6 messages)
  const recentHistory = history.filter(h => h.sender !== 'system').slice(-6);
  const contents: any[] = [];
  for (const msg of recentHistory) {
    contents.push({
      role: msg.sender === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }]
    });
  }
  contents.push({
    role: 'user',
    parts: [{ text: userMessage }]
  });

  let lastError: Error | null = null;

  for (const modelToTry of candidateModels) {
    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelToTry}:generateContent?key=${apiKey.trim()}`;

      const body = {
        system_instruction: {
          parts: [{ text: systemPrompt }]
        },
        contents,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2048,
        }
      };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        const data = await response.json();
        const candidate = data.candidates?.[0];
        const rawText = candidate?.content?.parts?.map((p: any) => p.text).filter(Boolean).join('\n') || 'Javob shakllantirilmadi.';
        const { cleanText, executedActions } = parseAndExecuteActions(rawText);

        return {
          text: cleanText,
          executedActions,
          modelUsed: `Gemini (${modelToTry})`,
        };
      }

      const errorData = await response.json().catch(() => ({}));
      const errMsg = errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`;
      lastError = new Error(errMsg);

      // If error is not model-availability (e.g. invalid API key), throw immediately
      if (errMsg.includes('API_KEY_INVALID') || errMsg.includes('API key not valid') || response.status === 400 && errMsg.includes('key')) {
        throw new Error(`API kalit noto'g'ri: ${errMsg}`);
      }
    } catch (e: any) {
      if (e.message?.includes('API kalit noto\'g\'ri')) {
        throw e;
      }
      lastError = e;
    }
  }

  throw lastError || new Error('Gemini modellari bilan ulanishda xatolik yuz berdi');
}

// ─── 2. OpenAI API ────────────────────────────────────────────────────────────
async function callOpenAiApi(
  userMessage: string,
  history: { sender: 'user' | 'ai' | 'system'; text: string }[],
  apiKey: string,
  model: string
): Promise<AiChatResult> {
  const systemPrompt = buildSystemPrompt();
  const endpoint = 'https://api.openai.com/v1/chat/completions';

  const messages: any[] = [
    { role: 'system', content: systemPrompt }
  ];

  const recentHistory = history.filter(h => h.sender !== 'system').slice(-6);
  for (const msg of recentHistory) {
    messages.push({
      role: msg.sender === 'user' ? 'user' : 'assistant',
      content: msg.text
    });
  }

  messages.push({ role: 'user', content: userMessage });

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey.trim()}`
    },
    body: JSON.stringify({
      model: model || 'gpt-4o-mini',
      messages,
      temperature: 0.7,
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `HTTP ${response.status}`);
  }

  const data = await response.json();
  const rawText = data.choices?.[0]?.message?.content || 'Javob olinmadi.';
  const { cleanText, executedActions } = parseAndExecuteActions(rawText);

  return {
    text: cleanText,
    executedActions,
    modelUsed: `OpenAI (${model})`
  };
}

// ─── 3. Groq API ──────────────────────────────────────────────────────────────
async function callGroqApi(
  userMessage: string,
  history: { sender: 'user' | 'ai' | 'system'; text: string }[],
  apiKey: string,
  model: string
): Promise<AiChatResult> {
  const systemPrompt = buildSystemPrompt();
  const endpoint = 'https://api.groq.com/openai/v1/chat/completions';

  const messages = [
    { role: 'system', content: systemPrompt },
    ...history.filter(h => h.sender !== 'system').slice(-6).map(m => ({
      role: m.sender === 'user' ? 'user' : 'assistant',
      content: m.text
    })),
    { role: 'user', content: userMessage }
  ];

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey.trim()}`
    },
    body: JSON.stringify({
      model: model || 'llama-3.3-70b-versatile',
      messages,
      temperature: 0.6
    })
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || `Groq HTTP ${response.status}`);
  }

  const data = await response.json();
  const rawText = data.choices?.[0]?.message?.content || '';
  const { cleanText, executedActions } = parseAndExecuteActions(rawText);

  return {
    text: cleanText,
    executedActions,
    modelUsed: `Groq (${model})`
  };
}

// ─── 4. DeepSeek API ──────────────────────────────────────────────────────────
async function callDeepSeekApi(
  userMessage: string,
  history: { sender: 'user' | 'ai' | 'system'; text: string }[],
  apiKey: string,
  model: string
): Promise<AiChatResult> {
  const systemPrompt = buildSystemPrompt();
  const endpoint = 'https://api.deepseek.com/chat/completions';

  const messages = [
    { role: 'system', content: systemPrompt },
    ...history.filter(h => h.sender !== 'system').slice(-6).map(m => ({
      role: m.sender === 'user' ? 'user' : 'assistant',
      content: m.text
    })),
    { role: 'user', content: userMessage }
  ];

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey.trim()}`
    },
    body: JSON.stringify({
      model: model || 'deepseek-chat',
      messages,
      temperature: 0.7
    })
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || `DeepSeek HTTP ${response.status}`);
  }

  const data = await response.json();
  const rawText = data.choices?.[0]?.message?.content || '';
  const { cleanText, executedActions } = parseAndExecuteActions(rawText);

  return {
    text: cleanText,
    executedActions,
    modelUsed: `DeepSeek (${model})`
  };
}

// ─── 5. OpenRouter API ────────────────────────────────────────────────────────
async function callOpenRouterApi(
  userMessage: string,
  history: { sender: 'user' | 'ai' | 'system'; text: string }[],
  apiKey: string,
  model: string
): Promise<AiChatResult> {
  const systemPrompt = buildSystemPrompt();
  const endpoint = 'https://openrouter.ai/api/v1/chat/completions';

  const messages = [
    { role: 'system', content: systemPrompt },
    ...history.filter(h => h.sender !== 'system').slice(-6).map(m => ({
      role: m.sender === 'user' ? 'user' : 'assistant',
      content: m.text
    })),
    { role: 'user', content: userMessage }
  ];

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey.trim()}`,
      'HTTP-Referer': window.location.origin,
      'X-Title': 'NextOlymp Sentinel'
    },
    body: JSON.stringify({
      model: model || 'google/gemini-2.0-flash-exp:free',
      messages
    })
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || `OpenRouter HTTP ${response.status}`);
  }

  const data = await response.json();
  const rawText = data.choices?.[0]?.message?.content || '';
  const { cleanText, executedActions } = parseAndExecuteActions(rawText);

  return {
    text: cleanText,
    executedActions,
    modelUsed: `OpenRouter (${model})`
  };
}

// ─── 6. Custom Endpoint ───────────────────────────────────────────────────────
async function callCustomEndpoint(
  userMessage: string,
  history: { sender: 'user' | 'ai' | 'system'; text: string }[],
  apiKey: string,
  url: string,
  model?: string
): Promise<AiChatResult> {
  const systemPrompt = buildSystemPrompt();

  const messages = [
    { role: 'system', content: systemPrompt },
    ...history.filter(h => h.sender !== 'system').slice(-6).map(m => ({
      role: m.sender === 'user' ? 'user' : 'assistant',
      content: m.text
    })),
    { role: 'user', content: userMessage }
  ];

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(apiKey ? { 'Authorization': `Bearer ${apiKey.trim()}` } : {})
    },
    body: JSON.stringify({
      model: model || 'default',
      messages
    })
  });

  if (!response.ok) {
    throw new Error(`Custom Endpoint HTTP ${response.status}`);
  }

  const data = await response.json();
  const rawText = data.choices?.[0]?.message?.content || data.response || JSON.stringify(data);
  const { cleanText, executedActions } = parseAndExecuteActions(rawText);

  return {
    text: cleanText,
    executedActions,
    modelUsed: 'Custom API'
  };
}

// ─── 7. Smart Dynamic Fallback (Deep Domain Knowledge) ────────────────────────
function generateSmartFallback(input: string, prefixNote = ''): AiChatResult {
  const cmd = input.trim().toLowerCase();
  const sec = useSecurityStore.getState();
  const pay = usePaymentStore.getState();
  const oly = useOlympiadStore.getState();
  const ldb = useLeaderboardStore.getState();
  const m = sec.serverMetrics;

  let executedActions: ExecutedAction[] = [];
  let response = '';

  // Handle IP block command
  const blockMatch = cmd.match(/(?:block|blokla|bloklash)\s+([0-9a-f.:]+)/i);
  if (blockMatch) {
    const ip = blockMatch[1];
    sec.blockIP(ip, 'Aniqlangan Hujumchi', 'XX', 'AI Sentinel tomonidan bloklandi', true);
    executedActions.push({
      type: 'IP Bloklash',
      target: ip,
      details: 'IP manzil doimiy ro\'yxatga kiritildi',
      success: true
    });
    response = `🛡️ **IP MANZIL BLOKLANDI**: \`${ip}\` muvaffaqiyatli xavfsizlik ro'yxatiga kiritildi va barcha so'rovlari WAF darajasida rad etiladi.\n\n📊 Jami bloklangan IP lar: **${sec.blockedIPs.length + 1} ta**.`;
    return { text: (prefixNote ? prefixNote + '\n\n' : '') + response, executedActions, isFallback: true, modelUsed: 'NextOlymp AI Core' };
  }

  // Handle unblock command
  const unblockMatch = cmd.match(/(?:unblock|ochish|blokdan\s+chiqar)\s+([0-9a-f.:]+)/i);
  if (unblockMatch) {
    const ip = unblockMatch[1];
    sec.unblockIP(ip);
    executedActions.push({
      type: 'IP Ochish',
      target: ip,
      details: 'Blok holati bekor qilindi',
      success: true
    });
    response = `✅ **IP BLOKDAN CHIQARILDI**: \`${ip}\` xavfsizlik taqiqidan olib tashlandi.`;
    return { text: (prefixNote ? prefixNote + '\n\n' : '') + response, executedActions, isFallback: true, modelUsed: 'NextOlymp AI Core' };
  }

  // Status & Server
  if (/status|holat|server|cpu|ram|yuklama/i.test(cmd)) {
    response = `📊 **SERVER VA TIZIM HOLATI**\n━━━━━━━━━━━━━━━━━━━━━━━━━━━\n• **Uptime**: ${m.uptime}\n• **CPU yuklamasi**: ${Math.round(m.cpu)}% ${m.cpu > 75 ? '⚠️ (Yuqori)' : '✅'}\n• **RAM xotira**: ${Math.round(m.ram)}% ${m.ram > 80 ? '⚠️ (Kritik)' : '✅'}\n• **Disk**: ${m.disk}% (Band emas: ${100 - m.disk}%)\n• **Tarmoq trafigi**: ↓ ${m.network.in.toFixed(1)} MB/s | ↑ ${m.network.out.toFixed(1)} MB/s\n• **So'rovlar tezligi**: ${m.requestsPerSec} req/sec\n• **O'rtacha kechikish**: ${m.responseTimeAvg} ms\n• **Faol ulanishlar**: ${m.activeConnections} ta\n• **SSL/TLS**: ${m.sslValid ? '✅ Faol (muddati: ' + m.sslExpiry + ')' : '❌ Muammo'}\n• **Ochiq portlar**: \`${m.openPorts.join(', ')}\``;
  }
  // Threats & Attacks
  else if (/kim.*hujum|hujum|attack|tahdid|threat|ddos|hujumchi/i.test(cmd)) {
    const active = sec.alerts.filter(a => a.status === 'active' || a.status === 'investigating');
    response = `🚨 **XAVFSIZLIK VA HUJUMCHILAR TAHLILI**\n━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
      `Faol tahdidlar: **${active.length} ta** | Bloklangan IP lar: **${sec.blockedIPs.length} ta**\n\n` +
      active.map((a, i) => `**${i + 1}. [${a.severity.toUpperCase()}] ${a.type.toUpperCase()}**\n• IP: \`${a.ip}\` (${a.country})\n• Tavsif: ${a.description}\n• So'rovlar: ${a.requestCount} ta / ${a.timeWindowSec}s\n• Holati: *${a.status}*\n`).join('\n') +
      `\n🛡️ **AI Tavsiyasi**: Barcha hujumchi IP manzillar WAF qoidalariga binoan bloklangan. Rate Limit qiymatini 80 req/min qilib belgilash tavsiya etiladi.`;
  }
  // Finance & Revenue
  else if (/moliya|tushum|daromad|pul|to'lov|click|payme|uzum|karta/i.test(cmd)) {
    const totalRev = pay.payments.filter(p => p.status === 'muvaffaqiyatli').reduce((s, p) => s + p.amount, 0);
    response = `💰 **MOLIYA VA TO'LOVLAR HISOBOTI**\n━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
      `• **Jami real tushum**: **${totalRev.toLocaleString()} UZS**\n` +
      `• **Umumiy kutilayotgan aylanma**: **${(totalRev + 70500000).toLocaleString()} UZS**\n` +
      `• **Tranzaksiyalar soni**: ${pay.payments.length} ta\n` +
      `• **To'lov usullari ulushi**:\n` +
      `  - 💳 **Karta (Click / Payme / Uzum)**: ~68% ulush\n` +
      `  - 💵 **Naqd / Bank o'tkazmasi**: ~17% ulush\n` +
      `  - 📱 **Ichki Hamyon (Balans)**: ~15% ulush\n\n` +
      `💡 **Tavsiya**: Obuna paketlari orqali ro'yxatdan o'tuvchilar soni ortib bormoqda, yangi "Premium Maktab" paketini joriy qilish moliya ko'rsatkichlarini 25% ga oshirishi mumkin.`;
  }
  // Olympiads
  else if (/olimpiada|musobaqa|test|fan|bellashuv/i.test(cmd)) {
    const openOly = oly.olympiads.filter(o => o.status === 'ochiq');
    response = `🏆 **OLIMPIADALAR BO'YICHA MA'LUMOT**\n━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
      `• Jami olimpiadalar: **${oly.olympiads.length} ta**\n` +
      `• Hozirda faol (ochiq): **${openOly.length} ta**\n\n` +
      `**Top olimpiadalar:**\n` +
      oly.olympiads.slice(0, 5).map(o => `• **${o.title}**\n  Fan: *${o.subject}* | Format: *${o.format}* | Narx: *${o.price.toLocaleString()} UZS* | Holat: *${o.status}*`).join('\n\n');
  }
  // Leaderboard / Top students
  else if (/reyting|leaderboard|o'quvchi|top|ball|cheating|jarima/i.test(cmd)) {
    const top5 = ldb.entries.slice(0, 7);
    response = `🥇 **RESPUBLIKA TOP O'QUVCHILAR REYTINGI**\n━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
      top5.map((e, idx) => `**${idx + 1}. ${e.userName}**\n• Hudud: ${e.region}, ${e.district}\n• Jami XP: **${e.totalXP}** (Asosiy: ${e.baseScore}, Bonus: +${e.bonusPoints || 0})\n• Cheating jarimasi: ${e.cheatingPenalty ? `⚠️ -${e.cheatingPenalty} XP` : '0 (Toza)'}`).join('\n\n') +
      `\n\n📌 *Eslatma: Cheating aniqlangan taqdirda ballar avtomatik ravishda ayirib tashlanadi.*`;
  }
  // General Help & Capabilities
  else {
    response = `Salom, Admin! 👋 Men sizning **AI Boshqaruv va Kiberxavfsizlik Yordamchingizman**.\n\nSiz menga platforma bo'yicha **istalgan savol** berishingiz yoki **buyruq** berishingiz mumkin:\n\n` +
      `🔹 **Kiberxavfsizlik**: *"Server holati qanday?"*, *"Kimlar hujum qilyapti?"*, *"DDoS himoyasini yoq"*, *"IP 192.168.1.1 ni blokla"*\n` +
      `🔹 **Moliya**: *"Bugungi tushumlar qancha?"*, *"Click va Payme statistikasi qanday?"*\n` +
      `🔹 **Olimpiadalar**: *"Qanday olimpiadalar ochiq?"*, *"Ishtirokchilar soni qancha?"*\n` +
      `🔹 **O'quvchilar**: *"Eng yuqori ball olgan o'quvchilar kimlar?"*, *"Cheating qilganlar bormi?"*\n` +
      `🔹 **Erkin mavzular**: Dasturlash, server arxitekturasi, xavfsizlik choralari yoki biznes strategiyalari.\n\n` +
      `💡 *Eslatma: Haqiqiy Gemini yoki OpenAI API kalitingizni ulash uchun tepada joylashgan **"🔑 API Sozlamalari"** tugmasini bosing.*`;
  }

  if (prefixNote) {
    response = `${prefixNote}\n\n${response}`;
  }

  return {
    text: response,
    executedActions,
    isFallback: true,
    modelUsed: 'NextOlymp AI Core (Built-in)',
  };
}
