// src/services/examGuardService.ts — Complete Exam Security & Anti-Cheat Protection
import { useProctoringStore } from '../store/useProctoringStore';
import { useNotificationStore } from '../store/useNotificationStore';
import { useAuthStore } from '../store/useAuthStore';
import { useSecurityStore } from '../store/useSecurityStore';

export type ExamViolationType =
  | 'CLIPBOARD_ACTION'
  | 'CONTEXT_MENU'
  | 'DEVTOOLS_KEY'
  | 'DEVTOOLS_OPENED'
  | 'DEVTOOLS_DETECTED'
  | 'VIEW_SOURCE'
  | 'PRINT_ATTEMPT'
  | 'TAB_SWITCH'
  | 'WINDOW_BLUR'
  | 'EXIT_FULLSCREEN'
  | 'HEARTBEAT_TIMEOUT';

export interface ExamGuardOptions {
  maxViolations?: number;
  olympiadId?: string;
  olympiadTitle?: string;
  requireFullscreen?: boolean;
  heartbeatIntervalMs?: number;
  onViolation?: (type: ExamViolationType, data: { count: number; max: number; message: string }) => void;
  onDisqualify?: (reason: string) => void;
}

export class ExamGuard {
  public maxViolations: number;
  public violationCount: number;
  private olympiadId: string;
  private olympiadTitle: string;
  private requireFullscreen: boolean;
  private heartbeatIntervalMs: number;
  private onViolation: (type: ExamViolationType, data: { count: number; max: number; message: string }) => void;
  private onDisqualify: (reason: string) => void;

  private cleanupFns: Array<() => void> = [];
  private heartbeatTimer: any = null;
  private devtoolsInterval: any = null;
  private isDestroyed: boolean = false;

  constructor(options: ExamGuardOptions = {}) {
    this.maxViolations = options.maxViolations || 3;
    this.violationCount = 0;
    this.olympiadId = options.olympiadId || 'olymp-current';
    this.olympiadTitle = options.olympiadTitle || 'Onlayn Olimpiada';
    this.requireFullscreen = options.requireFullscreen ?? true;
    this.heartbeatIntervalMs = options.heartbeatIntervalMs || 6000;
    this.onViolation = options.onViolation || (() => {});
    this.onDisqualify = options.onDisqualify || (() => {});

    this.init();
  }

  private init() {
    this.preventCopyPaste();
    this.preventContextMenu();
    this.preventKeyboardShortcuts();
    this.trackTabAndFocus();
    this.detectDevTools();
    if (this.requireFullscreen) {
      this.enforceFullScreen();
    }
    this.startHeartbeat();
  }

  // ─── Qoidabuzarlikni qayd etish va xabar berish ──────────────────────────────
  public recordViolation(type: ExamViolationType, message: string) {
    if (this.isDestroyed) return;

    this.violationCount++;
    console.warn(`[Xavfsizlik Ogohlantirishi] ${type}: ${message} (${this.violationCount}/${this.maxViolations})`);

    // 1. Server / Platform loglariga yozish
    this.reportToServer(type, message);

    // 2. Callback
    this.onViolation(type, {
      count: this.violationCount,
      max: this.maxViolations,
      message,
    });

    // 3. Agar limitdan oshsa — diskvalifikatsiya
    if (this.violationCount >= this.maxViolations) {
      this.onDisqualify(`Qoidabuzarliklar soni ruxsat etilgan limitdan oshdi (${this.violationCount}/${this.maxViolations})`);
    }
  }

  // 1. Nusxa olish, qirqish, qo'yish va belgilashni taqiqlash
  private preventCopyPaste() {
    const block = (e: ClipboardEvent) => {
      e.preventDefault();
      this.recordViolation('CLIPBOARD_ACTION', 'Matndan nusxa olish, qirqish yoki joylash taqiqlangan!');
    };

    document.addEventListener('copy', block);
    document.addEventListener('cut', block);
    document.addEventListener('paste', block);

    // Matnni belgilashni (Selection) CSS orqali bloklash
    const prevSelect = document.body.style.userSelect;
    const prevWebkitSelect = (document.body.style as any).webkitUserSelect;
    document.body.style.userSelect = 'none';
    (document.body.style as any).webkitUserSelect = 'none';

    this.cleanupFns.push(() => {
      document.removeEventListener('copy', block);
      document.removeEventListener('cut', block);
      document.removeEventListener('paste', block);
      document.body.style.userSelect = prevSelect;
      (document.body.style as any).webkitUserSelect = prevWebkitSelect;
    });
  }

  // 2. O'ng tugma (Context Menu)ni o'chirish
  private preventContextMenu() {
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      this.recordViolation('CONTEXT_MENU', "Sichqonchaning o'ng tugmasi menyusi bloklangan!");
    };

    document.addEventListener('contextmenu', handleContextMenu);
    this.cleanupFns.push(() => {
      document.removeEventListener('contextmenu', handleContextMenu);
    });
  }

  // 3. Shubhali klaviatura kombinatsiyalarini bloklash
  private preventKeyboardShortcuts() {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isCtrlOrCmd = e.ctrlKey || e.metaKey;

      // F12 (DevTools)
      if (e.key === 'F12') {
        e.preventDefault();
        e.stopPropagation();
        this.recordViolation('DEVTOOLS_KEY', 'F12 orqali konsol / DevTools ochish taqiqlangan!');
        return;
      }

      // Ctrl + Shift + I / J / C (DevTools ochish buyruqlari)
      if (isCtrlOrCmd && e.shiftKey && ['I', 'i', 'J', 'j', 'C', 'c'].includes(e.key)) {
        e.preventDefault();
        e.stopPropagation();
        this.recordViolation('DEVTOOLS_KEY', 'Dasturchi asboblarini (DevTools) ochish taqiqlangan!');
        return;
      }

      // Ctrl + U (Sayt manba kodini ko'rish)
      if (isCtrlOrCmd && (e.key === 'u' || e.key === 'U')) {
        e.preventDefault();
        e.stopPropagation();
        this.recordViolation('VIEW_SOURCE', 'Sahifa manba kodini ko\'rish taqiqlangan!');
        return;
      }

      // Ctrl + P (Chop etish orqali PDF qilish)
      if (isCtrlOrCmd && (e.key === 'p' || e.key === 'P')) {
        e.preventDefault();
        e.stopPropagation();
        this.recordViolation('PRINT_ATTEMPT', 'Sahifani chop etish yoki PDF qilish taqiqlangan!');
        return;
      }

      // Ctrl + S (Sahifani saqlab olish)
      if (isCtrlOrCmd && (e.key === 's' || e.key === 'S')) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }

      // PrintScreen / Screenshot key combo detection
      if (
        e.key === 'PrintScreen' ||
        e.keyCode === 44 ||
        (isCtrlOrCmd && e.shiftKey && ['S', 's', '3', '4', '5'].includes(e.key)) ||
        (e.metaKey && e.shiftKey)
      ) {
        e.preventDefault();
        e.stopPropagation();
        this.recordViolation('CLIPBOARD_ACTION', 'Ekranni rasmga olish (Screenshot / PrintScreen) qat\'iyan taqiqlangan!');
        return;
      }

      // Alt + Tab or Windows key attempt note
      if (e.altKey && e.key === 'Tab') {
        e.preventDefault();
        this.recordViolation('TAB_SWITCH', 'Oyna almashtirishga (Alt+Tab) urinish aniqlandi!');
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    window.addEventListener('keyup', (e) => {
      if (e.key === 'PrintScreen' || e.keyCode === 44) {
        this.recordViolation('CLIPBOARD_ACTION', 'Ekranni rasmga olish (Screenshot / PrintScreen) aniqlandi!');
      }
    }, true);

    this.cleanupFns.push(() => {
      window.removeEventListener('keydown', handleKeyDown, true);
    });
  }

  // 4. Tab almashtirish yoki boshqa dasturga o'tishni kuzatish (Focus & Visibility & Mobile Blur)
  private trackTabAndFocus() {
    const handleVisibility = () => {
      if (document.hidden) {
        this.recordViolation('TAB_SWITCH', "O'quvchi boshqa ilovaga/vkladkaga o'tdi yoki ekranni rasmga oldi!");
      }
    };

    const handleBlur = () => {
      this.recordViolation('WINDOW_BLUR', "Brauzer oynasidan chiqildi, bildirishnoma ochildi yoki ekran rasmga olindi (Window Blur)!");
    };

    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('blur', handleBlur);

    this.cleanupFns.push(() => {
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('blur', handleBlur);
    });
  }

  // 5. DevTools o'lchamlari va debugger orqali aniqlash
  private detectDevTools() {
    const threshold = 160;

    // Usul 1: Oyna o'lchamlari farqi (pastki yoki yon panel ochilganda)
    const checkResize = () => {
      const widthDiff = window.outerWidth - window.innerWidth > threshold;
      const heightDiff = window.outerHeight - window.innerHeight > threshold;

      if (widthDiff || heightDiff) {
        this.recordViolation('DEVTOOLS_OPENED', 'Ekranda dasturchi paneli (DevTools) ochilgani aniqlandi!');
      }
    };

    window.addEventListener('resize', checkResize);
    this.cleanupFns.push(() => {
      window.removeEventListener('resize', checkResize);
    });

    // Usul 2: Console profiling orqali debugger tekshiruvi
    this.devtoolsInterval = setInterval(() => {
      if (this.isDestroyed) return;
      try {
        const element = new Image();
        Object.defineProperty(element, 'id', {
          get: () => {
            this.recordViolation('DEVTOOLS_DETECTED', 'Konsol inspektori orqali element tekshiruvi aniqlandi!');
          },
        });
        console.log('%c', element);
        console.clear();
      } catch {
        // silent fail
      }
    }, 4500);
  }

  // 6. To'liq ekran (Fullscreen) rejimini talab qilish
  private enforceFullScreen() {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        this.recordViolation('EXIT_FULLSCREEN', "To'liq ekran rejimidan chiqildi (Fullscreen Exited)!");
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    this.cleanupFns.push(() => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    });
  }

  // 7. Backend Heartbeat Ping mexanizmi (Har 6 soniyada faollik tasdig'i)
  private startHeartbeat() {
    this.heartbeatTimer = setInterval(() => {
      if (this.isDestroyed) return;
      this.sendHeartbeat();
    }, this.heartbeatIntervalMs);
  }

  private sendHeartbeat() {
    const user = useAuthStore.getState().user;
    const secStore = useSecurityStore.getState();

    // Log active heartbeat to security monitor
    secStore.addAccessLog({
      id: `hb-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      ip: '127.0.0.1 (Client-Edge)',
      country: "O'zbekiston",
      countryCode: 'UZ',
      method: 'POST',
      path: `/api/proctoring/heartbeat/${this.olympiadId}`,
      statusCode: 200,
      responseTimeMs: 18,
      userAgent: navigator.userAgent.slice(0, 50),
      userId: user?.id,
      userName: user?.fullName,
      bytesSent: 128,
      level: 'info',
    });
  }

  // ─── Backend va Markaziy Proctoring Paneli bilan bog'lanish ───────────────────
  public reportToServer(type: ExamViolationType, message: string) {
    const user = useAuthStore.getState().user;
    const procStore = useProctoringStore.getState();
    const notifStore = useNotificationStore.getState();
    const secStore = useSecurityStore.getState();

    const userName = user?.fullName || 'Ishtirokchi';
    const userEmail = user?.email || 'student@nextolymp.uz';

    // 1. Proctoring Storega flag qo'shish (Admin paneli uchun)
    procStore.addFlag({
      user: userName,
      userEmail: userEmail,
      olympiad: this.olympiadTitle,
      category: type.includes('DEVTOOLS') ? 'Dasturchi Paneli' :
                type.includes('CLIPBOARD') ? 'Nusxa Olish' :
                type.includes('FULLSCREEN') ? 'Ekran Rejimi' : 'Oyna & Tab',
      type: type,
      detail: message,
      severity: this.violationCount >= 3 ? 'Kritik' : this.violationCount === 2 ? 'Yuqori' : 'O\'rta',
    });

    // 2. Proctoring Jonli Alert yaratish
    const mappedType =
      type === 'TAB_SWITCH' ? 'tab_switch' :
      type === 'WINDOW_BLUR' ? 'window_blur' :
      type === 'CLIPBOARD_ACTION' ? 'copy_paste' :
      type === 'EXIT_FULLSCREEN' ? 'fullscreen_exit' :
      type.includes('DEVTOOLS') ? 'devtools_open' : 'tab_switch';

    procStore.addLiveAlert({
      sessionId: `proc-exam-${user?.id || 'live'}`,
      userId: user?.id || 'USR-STUDENT',
      studentName: userName,
      olympiadTitle: this.olympiadTitle,
      type: mappedType,
      title: `ExamGuard: ${message}`,
      description: `O'quvchi tomonidan ${type} aniqlandi (${this.violationCount}/${this.maxViolations})`,
      severity: this.violationCount >= 3 ? 'kritik' : 'yuqori',
      status: 'yangi',
    });

    // 3. Foydalanuvchi tizim xabarnomasi
    notifStore.addNotification({
      title: `Xavfsizlik Ogohlantirishi (${this.violationCount}/${this.maxViolations})`,
      desc: message,
      type: 'warning',
    });

    // 4. CyberSecurity Store Access Log
    secStore.addAccessLog({
      id: `viol-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      ip: '127.0.0.1 (Edge-Device)',
      country: "O'zbekiston",
      countryCode: 'UZ',
      method: 'POST',
      path: `/api/proctoring/violation/${type.toLowerCase()}`,
      statusCode: 403,
      responseTimeMs: 32,
      userAgent: navigator.userAgent.slice(0, 50),
      userId: user?.id,
      userName: userName,
      bytesSent: 256,
      level: this.violationCount >= 3 ? 'critical' : 'warning',
    });
  }

  // Tozalash (Imtihon tugaganda yoki sahifadan chiqilganda)
  public destroy() {
    this.isDestroyed = true;
    if (this.heartbeatTimer) clearInterval(this.heartbeatTimer);
    if (this.devtoolsInterval) clearInterval(this.devtoolsInterval);
    this.cleanupFns.forEach((fn) => {
      try {
        fn();
      } catch (e) {
        console.warn('ExamGuard cleanup error:', e);
      }
    });
    this.cleanupFns = [];
  }
}
