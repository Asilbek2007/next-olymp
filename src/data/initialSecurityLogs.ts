// initialSecurityLogs.ts — Kiberxavfsizlik / Access Log initial data

export type LogLevel = 'info' | 'warning' | 'error' | 'critical';
export type LogSource = 'access' | 'action' | 'security' | 'ddos';

export interface AccessLog {
  id: string;
  timestamp: string;
  ip: string;
  country: string;
  countryCode: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'OPTIONS' | 'PATCH';
  path: string;
  statusCode: number;
  responseTimeMs: number;
  userAgent: string;
  userId?: string;
  userName?: string;
  bytesSent: number;
  referer?: string;
  level: LogLevel;
}

export interface ActionLog {
  id: string;
  timestamp: string;
  ip: string;
  userId: string;
  userName: string;
  role: 'admin' | 'student' | 'teacher';
  action: string;
  resource: string;
  detail: string;
  success: boolean;
  level: LogLevel;
}

export interface TrafficDataPoint {
  time: string;
  requests: number;
  bandwidth: number; // KB/s
  errors: number;
  blocked: number;
}

export interface SecurityAlert {
  id: string;
  timestamp: string;
  type: 'ddos' | 'brute_force' | 'sql_injection' | 'xss' | 'suspicious_scan' | 'rate_limit' | 'geo_block' | 'bot';
  severity: 'low' | 'medium' | 'high' | 'critical';
  ip: string;
  country: string;
  countryCode: string;
  description: string;
  requestCount: number;
  timeWindowSec: number;
  status: 'active' | 'blocked' | 'investigating' | 'resolved';
  aiAnalysis?: string;
}

export interface BlockedIP {
  ip: string;
  country: string;
  countryCode: string;
  reason: string;
  blockedAt: string;
  expiresAt?: string;
  requestCount: number;
  permanent: boolean;
}

// ─── Access Logs ──────────────────────────────────────────────────────────────
export const initialAccessLogs: AccessLog[] = [
  { id: 'AL-001', timestamp: '2026-09-08 21:18:42', ip: '91.213.8.55', country: "O'zbekiston", countryCode: 'UZ', method: 'POST', path: '/api/v1/auth/login', statusCode: 200, responseTimeMs: 142, userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/127', userId: 'U-1042', userName: 'Aziz Karimov', bytesSent: 1240, level: 'info' },
  { id: 'AL-002', timestamp: '2026-09-08 21:18:39', ip: '185.220.101.44', country: 'Germaniya', countryCode: 'DE', method: 'GET', path: '/api/v1/olympiads', statusCode: 200, responseTimeMs: 88, userAgent: 'curl/8.1.2', bytesSent: 8420, level: 'warning' },
  { id: 'AL-003', timestamp: '2026-09-08 21:18:35', ip: '45.148.10.121', country: 'Rossiya', countryCode: 'RU', method: 'POST', path: '/api/v1/auth/login', statusCode: 401, responseTimeMs: 203, userAgent: 'python-requests/2.31.0', bytesSent: 120, level: 'error' },
  { id: 'AL-004', timestamp: '2026-09-08 21:18:30', ip: '91.213.8.55', country: "O'zbekiston", countryCode: 'UZ', method: 'GET', path: '/api/v1/competitions/C-001/results', statusCode: 200, responseTimeMs: 310, userAgent: 'Mozilla/5.0 Chrome/127', userId: 'U-1042', userName: 'Aziz Karimov', bytesSent: 24500, level: 'info' },
  { id: 'AL-005', timestamp: '2026-09-08 21:18:22', ip: '103.21.244.0', country: 'Xitoy', countryCode: 'CN', method: 'GET', path: '/ega/login', statusCode: 404, responseTimeMs: 45, userAgent: 'Googlebot/2.1', bytesSent: 320, level: 'warning' },
  { id: 'AL-006', timestamp: '2026-09-08 21:18:15', ip: '195.182.55.80', country: "O'zbekiston", countryCode: 'UZ', method: 'POST', path: '/api/v1/payments/create', statusCode: 200, responseTimeMs: 1850, userAgent: 'Mozilla/5.0 Firefox/126', userId: 'U-2011', userName: 'Malika Yusupova', bytesSent: 890, level: 'info' },
  { id: 'AL-007', timestamp: '2026-09-08 21:18:08', ip: '89.187.171.15', country: 'Niderlandiya', countryCode: 'NL', method: 'GET', path: '/api/v1/admin/users', statusCode: 403, responseTimeMs: 15, userAgent: 'Nmap NSE', bytesSent: 68, level: 'critical' },
  { id: 'AL-008', timestamp: '2026-09-08 21:17:55', ip: '91.213.9.100', country: "O'zbekiston", countryCode: 'UZ', method: 'PUT', path: '/api/v1/competitions/C-003', statusCode: 200, responseTimeMs: 220, userAgent: 'Mozilla/5.0 Chrome/127', userId: 'U-ADM-001', userName: 'Admin EGA', bytesSent: 1100, level: 'info' },
  { id: 'AL-009', timestamp: '2026-09-08 21:17:42', ip: '45.148.10.121', country: 'Rossiya', countryCode: 'RU', method: 'POST', path: '/api/v1/auth/login', statusCode: 401, responseTimeMs: 198, userAgent: 'python-requests/2.31.0', bytesSent: 120, level: 'error' },
  { id: 'AL-010', timestamp: '2026-09-08 21:17:38', ip: '45.148.10.121', country: 'Rossiya', countryCode: 'RU', method: 'POST', path: '/api/v1/auth/login', statusCode: 401, responseTimeMs: 205, userAgent: 'python-requests/2.31.0', bytesSent: 120, level: 'error' },
  { id: 'AL-011', timestamp: '2026-09-08 21:17:21', ip: '195.182.55.82', country: "O'zbekiston", countryCode: 'UZ', method: 'GET', path: '/api/v1/leaderboard?scope=national', statusCode: 200, responseTimeMs: 95, userAgent: 'Mozilla/5.0 Chrome/127', userId: 'U-3055', userName: 'Bobur Toshmatov', bytesSent: 18200, level: 'info' },
  { id: 'AL-012', timestamp: '2026-09-08 21:17:05', ip: '196.18.0.1', country: 'Braziliya', countryCode: 'BR', method: 'GET', path: '/wp-admin/setup-config.php', statusCode: 404, responseTimeMs: 12, userAgent: 'Wget/1.21', bytesSent: 0, level: 'critical' },
  { id: 'AL-013', timestamp: '2026-09-08 21:16:48', ip: '91.213.8.60', country: "O'zbekiston", countryCode: 'UZ', method: 'POST', path: '/api/v1/contests/C-003/submit', statusCode: 200, responseTimeMs: 445, userAgent: 'Mozilla/5.0 Firefox/126', userId: 'U-5021', userName: 'Nilufar Saidova', bytesSent: 560, level: 'info' },
  { id: 'AL-014', timestamp: '2026-09-08 21:16:30', ip: '204.11.56.48', country: 'AQSH', countryCode: 'US', method: 'OPTIONS', path: '/api/v1/', statusCode: 200, responseTimeMs: 8, userAgent: 'Mozilla/5.0 Chrome/127', bytesSent: 180, level: 'info' },
  { id: 'AL-015', timestamp: '2026-09-08 21:16:12', ip: '45.148.10.121', country: 'Rossiya', countryCode: 'RU', method: 'POST', path: '/api/v1/auth/login', statusCode: 429, responseTimeMs: 5, userAgent: 'python-requests/2.31.0', bytesSent: 80, level: 'critical' },
  { id: 'AL-016', timestamp: '2026-09-08 21:15:55', ip: '91.213.8.77', country: "O'zbekiston", countryCode: 'UZ', method: 'GET', path: '/api/v1/olympiads/C-001', statusCode: 200, responseTimeMs: 67, userAgent: 'Mozilla/5.0 Chrome/127', userId: 'U-7744', userName: 'Jasur Eshmatov', bytesSent: 5400, level: 'info' },
  { id: 'AL-017', timestamp: '2026-09-08 21:15:33', ip: '77.83.220.11', country: 'Ukraina', countryCode: 'UA', method: 'GET', path: '/api/v1/../../../etc/passwd', statusCode: 400, responseTimeMs: 10, userAgent: 'curl/7.88', bytesSent: 0, level: 'critical' },
  { id: 'AL-018', timestamp: '2026-09-08 21:15:10', ip: '195.182.55.90', country: "O'zbekiston", countryCode: 'UZ', method: 'POST', path: '/api/v1/certificates/verify', statusCode: 200, responseTimeMs: 188, userAgent: 'Mozilla/5.0 Chrome/127', bytesSent: 840, level: 'info' },
  { id: 'AL-019', timestamp: '2026-09-08 21:14:50', ip: '5.188.86.172', country: 'Niderlandiya', countryCode: 'NL', method: 'GET', path: '/api/v1/users/list?limit=1000', statusCode: 403, responseTimeMs: 18, userAgent: 'Go-http-client/1.1', bytesSent: 0, level: 'critical' },
  { id: 'AL-020', timestamp: '2026-09-08 21:14:22', ip: '91.213.8.55', country: "O'zbekiston", countryCode: 'UZ', method: 'GET', path: '/api/v1/student/dashboard', statusCode: 200, responseTimeMs: 112, userAgent: 'Mozilla/5.0 Chrome/127', userId: 'U-1042', userName: 'Aziz Karimov', bytesSent: 12000, level: 'info' },
];

// ─── Action Logs ──────────────────────────────────────────────────────────────
export const initialActionLogs: ActionLog[] = [
  { id: 'ACT-001', timestamp: '2026-09-08 21:18:42', ip: '91.213.8.55', userId: 'U-ADM-001', userName: 'Admin EGA', role: 'admin', action: 'LOGIN', resource: 'auth', detail: "Admin panelga muvaffaqiyatli kirdi", success: true, level: 'info' },
  { id: 'ACT-002', timestamp: '2026-09-08 21:18:15', ip: '195.182.55.80', userId: 'U-2011', userName: 'Malika Yusupova', role: 'student', action: 'PAYMENT_CREATED', resource: 'payments', detail: "Click orqali VIP paket uchun 199,000 UZS to'lov yaratildi", success: true, level: 'info' },
  { id: 'ACT-003', timestamp: '2026-09-08 21:17:55', ip: '91.213.9.100', userId: 'U-ADM-001', userName: 'Admin EGA', role: 'admin', action: 'OLYMPIAD_UPDATED', resource: 'competitions/C-003', detail: "\"Matematika Respublika\" olimpiadasi yangilandi — narx o'zgartirildi", success: true, level: 'info' },
  { id: 'ACT-004', timestamp: '2026-09-08 21:16:48', ip: '91.213.8.60', userId: 'U-5021', userName: 'Nilufar Saidova', role: 'student', action: 'TEST_SUBMITTED', resource: 'contests/C-003', detail: "Test topshirildi: 42/60 ball, 58 daqiqa sarflandi", success: true, level: 'info' },
  { id: 'ACT-005', timestamp: '2026-09-08 21:16:12', ip: '45.148.10.121', userId: 'UNKNOWN', userName: 'Noma\'lum', role: 'student', action: 'LOGIN_FAILED', resource: 'auth', detail: "Noto'g'ri parol — 12-marta urinish. Hisobni bloklash boshlandi", success: false, level: 'critical' },
  { id: 'ACT-006', timestamp: '2026-09-08 21:15:33', ip: '77.83.220.11', userId: 'UNKNOWN', userName: 'Noma\'lum', role: 'student', action: 'PATH_TRAVERSAL_ATTEMPT', resource: 'api', detail: "Tizim fayllariga kirish urinishi aniqlandi: ../../../etc/passwd", success: false, level: 'critical' },
  { id: 'ACT-007', timestamp: '2026-09-08 21:14:50', ip: '5.188.86.172', userId: 'UNKNOWN', userName: 'Noma\'lum', role: 'student', action: 'UNAUTHORIZED_ACCESS', resource: 'users/list', detail: "Foydalanuvchilar ro'yxatiga ruxsatsiz kirish urinishi", success: false, level: 'critical' },
  { id: 'ACT-008', timestamp: '2026-09-08 21:13:20', ip: '91.213.8.77', userId: 'U-7744', userName: 'Jasur Eshmatov', role: 'student', action: 'OLYMPIAD_REGISTERED', resource: 'competitions/C-001', detail: "\"Fizika Olimpiadasi\" ga ro'yxatdan o'tdi — 85,000 UZS to'ladi", success: true, level: 'info' },
  { id: 'ACT-009', timestamp: '2026-09-08 21:12:05', ip: '91.213.9.100', userId: 'U-ADM-001', userName: 'Admin EGA', role: 'admin', action: 'USER_BLOCKED', resource: 'users/U-9988', detail: "Foydalanuvchi hisobi bloklandi — cheating aniqlandi (AI proctoring)", success: true, level: 'warning' },
  { id: 'ACT-010', timestamp: '2026-09-08 21:10:44', ip: '195.182.55.82', userId: 'U-3055', userName: 'Bobur Toshmatov', role: 'student', action: 'CERTIFICATE_DOWNLOADED', resource: 'certificates/CERT-5044', detail: "Sertifikat PDF formatda yuklab olindi", success: true, level: 'info' },
];

// ─── Traffic Data (last 12 time slots, 5-min intervals) ──────────────────────
export const initialTrafficData: TrafficDataPoint[] = [
  { time: '21:05', requests: 142, bandwidth: 380, errors: 3, blocked: 1 },
  { time: '21:10', requests: 188, bandwidth: 510, errors: 5, blocked: 2 },
  { time: '21:15', requests: 312, bandwidth: 840, errors: 18, blocked: 8 },
  { time: '21:16', requests: 890, bandwidth: 2200, errors: 42, blocked: 35 },   // DDoS spike
  { time: '21:17', requests: 1240, bandwidth: 3100, errors: 88, blocked: 120 }, // DDoS peak
  { time: '21:18', requests: 620, bandwidth: 1500, errors: 31, blocked: 48 },   // Mitigation
  { time: '21:19', requests: 280, bandwidth: 720, errors: 12, blocked: 15 },
  { time: '21:20', requests: 195, bandwidth: 490, errors: 4, blocked: 3 },
  { time: '21:21', requests: 165, bandwidth: 420, errors: 2, blocked: 1 },
  { time: '21:22', requests: 178, bandwidth: 440, errors: 3, blocked: 2 },
  { time: '21:23', requests: 192, bandwidth: 475, errors: 4, blocked: 1 },
  { time: '21:24', requests: 210, bandwidth: 530, errors: 5, blocked: 2 },
];

// ─── Security Alerts ──────────────────────────────────────────────────────────
export const initialSecurityAlerts: SecurityAlert[] = [
  {
    id: 'SEC-001',
    timestamp: '2026-09-08 21:16:45',
    type: 'ddos',
    severity: 'critical',
    ip: '185.220.101.0/24',
    country: 'Germaniya (TOR Exit Node)',
    countryCode: 'DE',
    description: "DDoS hujumi aniqlandi: 60 soniyada 1,240 ta so'rov yuborildi. Manbalar: 47 ta turli IP",
    requestCount: 1240,
    timeWindowSec: 60,
    status: 'blocked',
    aiAnalysis: "Bu klassik HTTP flood DDoS hujumi. TOR tarmog'i orqali amalga oshirilgan. Hujum /api/v1/auth/login endpointini nishonga olgan — maqsad autentifikatsiya serverini haddan tashqari yuklash. Tarqatilgan botnet (Mirai varianti ehtimoli yuqori). Tavsiya: Rate limiting kuchaytirish, CAPTCHA qo'shish, CDN orqali traffic filtrlash."
  },
  {
    id: 'SEC-002',
    timestamp: '2026-09-08 21:15:38',
    type: 'brute_force',
    severity: 'high',
    ip: '45.148.10.121',
    country: 'Rossiya',
    countryCode: 'RU',
    description: "Brute Force urinishi: 5 daqiqada login endpointiga 12 ta muvaffaqiyatsiz urinish",
    requestCount: 12,
    timeWindowSec: 300,
    status: 'blocked',
    aiAnalysis: "Avtomatlashtirilgan skript yordamida parolni taxmin qilish hujumi. IP 45.148.10.121 — bu IP manzil AbuseIPDB ma'lumotlar bazasida 847 marta qayd etilgan. Python requests kutubxonasi ishlatilgan. Hisob qulflash mexanizmi ishladi. Tavsiya: Ushbu IP ni doimiy bloklash va 2FA majburiy qilish."
  },
  {
    id: 'SEC-003',
    timestamp: '2026-09-08 21:15:33',
    type: 'sql_injection',
    severity: 'critical',
    ip: '77.83.220.11',
    country: 'Ukraina',
    countryCode: 'UA',
    description: "Path Traversal + SQLi urinishi: URL'da ../../../etc/passwd va ' OR 1=1-- fragmentlari aniqlandi",
    requestCount: 3,
    timeWindowSec: 10,
    status: 'blocked',
    aiAnalysis: "Murakkab kombinatsiyali hujum: birinchi navbatda LFI (Local File Inclusion) orqali tizim fayllariga kirish, keyin SQLi bilan ma'lumotlar bazasini o'qish urinishi. WAF (Web Application Firewall) ushbu so'rovlarni to'sib qoldi. Hujumchi ehtimoliy tajribali: payload encoding ishlatgan. Tavsiya: IP ni bloklash, WAF qoidalarini yangilash."
  },
  {
    id: 'SEC-004',
    timestamp: '2026-09-08 21:17:05',
    type: 'suspicious_scan',
    severity: 'medium',
    ip: '196.18.0.1',
    country: 'Braziliya',
    countryCode: 'BR',
    description: "Port/directory scan: WordPress admin panel va eski CMS yo'llari tekshirilmoqda",
    requestCount: 28,
    timeWindowSec: 120,
    status: 'investigating',
    aiAnalysis: "Avtomatlashtirilgan vulnerability scanner (ehtimol Nuclei yoki Nikto). WordPress, Joomla, Drupal kabi CMS tizimlarning standart yo'llari tekshirilmoqda. Sayt React/Vite asosida qilingan, shuning uchun bu manzillar topilmaydi — hujumchi noto'g'ri nishon tanlagan. Xavf darajasi: o'rta. Tavsiya: IP bloklash, 404 javoblarini normallashtirish."
  },
  {
    id: 'SEC-005',
    timestamp: '2026-09-08 21:18:08',
    type: 'suspicious_scan',
    severity: 'high',
    ip: '89.187.171.15',
    country: 'Niderlandiya',
    countryCode: 'NL',
    description: "Admin panel scan: /ega/login, /admin, /dashboard manzillariga Nmap orqali scan",
    requestCount: 15,
    timeWindowSec: 30,
    status: 'active',
    aiAnalysis: "Nmap NSE scripts yordamida admin interfeysi qidirilyapti. User-Agent aniq 'Nmap NSE' deb ko'rinmoqda — bu hujumchi o'z izini yashirmoqchi emas yoki yangi boshlovchi. Hozircha faqat public yo'llarga tegdi. Tavsiya: Darhol bloklash, /ega/ yo'lini IP whitelist bilan himoya qilish."
  },
];

// ─── Blocked IPs ──────────────────────────────────────────────────────────────
export const initialBlockedIPs: BlockedIP[] = [
  { ip: '45.148.10.121', country: 'Rossiya', countryCode: 'RU', reason: 'Brute Force — 12 muvaffaqiyatsiz login urinishi', blockedAt: '2026-09-08 21:16:12', expiresAt: '2026-09-09 21:16:12', requestCount: 12, permanent: false },
  { ip: '77.83.220.11', country: 'Ukraina', countryCode: 'UA', reason: 'Path Traversal + SQL Injection urinishi', blockedAt: '2026-09-08 21:15:33', requestCount: 3, permanent: true },
  { ip: '185.220.101.44', country: 'Germaniya', countryCode: 'DE', reason: 'DDoS botnet nodi', blockedAt: '2026-09-08 21:16:45', expiresAt: '2026-09-15 21:16:45', requestCount: 240, permanent: false },
  { ip: '5.188.86.172', country: 'Niderlandiya', countryCode: 'NL', reason: "Ruxsatsiz admin API kirish urinishi", blockedAt: '2026-09-08 21:14:50', requestCount: 8, permanent: true },
  { ip: '196.18.0.1', country: 'Braziliya', countryCode: 'BR', reason: 'WordPress vulnerability scanner', blockedAt: '2026-09-08 21:17:05', expiresAt: '2026-09-09 21:17:05', requestCount: 28, permanent: false },
];
