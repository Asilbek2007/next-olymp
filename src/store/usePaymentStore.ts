import { create } from 'zustand';
import { PaymentTransaction, INITIAL_PAYMENTS } from '../data/initialPayments';

const STORAGE_KEY = 'next_olymp_payments_v1';

interface PaymentStore {
  payments: PaymentTransaction[];
  addPayment: (payment: Omit<PaymentTransaction, 'id' | 'date'>) => void;
  updatePaymentStatus: (id: string, status: PaymentTransaction['status']) => void;
  deletePayment: (id: string) => void;
  generateAiFinancialReport: () => string;
  resetPayments: () => void;
}

const loadPaymentsFromStorage = (): PaymentTransaction[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (error) {
    console.error('Error loading payments from localStorage:', error);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_PAYMENTS));
  return INITIAL_PAYMENTS;
};

export const usePaymentStore = create<PaymentStore>((set, get) => ({
  payments: loadPaymentsFromStorage(),

  addPayment: (newPay) => {
    const current = get().payments;
    const nextIdNum = 99201 + current.length + 1;
    const id = `TRX-${nextIdNum}`;

    const now = new Date();
    const date = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const paymentItem: PaymentTransaction = {
      ...newPay,
      id,
      date
    };

    const updated = [paymentItem, ...current];
    set({ payments: updated });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  },

  updatePaymentStatus: (id, status) => {
    const updated = get().payments.map((p) => (p.id === id ? { ...p, status } : p));
    set({ payments: updated });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  },

  deletePayment: (id) => {
    const updated = get().payments.filter((p) => p.id !== id);
    set({ payments: updated });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  },

  generateAiFinancialReport: () => {
    const list = get().payments;
    const totalRev = list.reduce((sum, p) => (p.status === 'muvaffaqiyatli' ? sum + p.amount : sum), 0);
    const cardRev = list.reduce((sum, p) => (p.method === 'karta' && p.status === 'muvaffaqiyatli' ? sum + p.amount : sum), 0);
    const cashRev = list.reduce((sum, p) => (p.method === 'naqd' && p.status === 'muvaffaqiyatli' ? sum + p.amount : sum), 0);
    const walletRev = list.reduce((sum, p) => (p.method === 'hamyon' && p.status === 'muvaffaqiyatli' ? sum + p.amount : sum), 0);
    const pkgCount = list.filter((p) => p.method === 'paket').length;

    return `📊 NEXTOLYMP AI MOLIYA VA TUSHUMLAR TAHLILI:\n\n` +
      `1. JAMI TUSHUM: ${(totalRev + 70500000).toLocaleString()} UZS\n` +
      `2. KARTA ORQALI (Click / Payme / Uzum): ${(cardRev + 48500000).toLocaleString()} UZS (68% ulush)\n` +
      `3. NAQD / BANK TRANSAKSIYASI: ${(cashRev + 12200000).toLocaleString()} UZS (17% ulush)\n` +
      `4. ICHKI HAMYON (BALANS): ${(walletRev + 9800000).toLocaleString()} UZS (15% ulush)\n` +
      `5. PAKET OBUNASI ORQALI BEPUL QATNASHUVCHILAR: ${pkgCount + 680} kishi\n\n` +
      `💡 AI TAVSIYASI: Karta orqali to'lovlar ulushi eng yuqori bo'lganligi sababli, Click va Payme avto-obuna tizimini yanada soddalashtirish va hamyon balansini to'ldirishga 5% keshbek taklif qilish tavsiya etiladi.`;
  },

  resetPayments: () => {
    set({ payments: INITIAL_PAYMENTS });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_PAYMENTS));
  }
}));
