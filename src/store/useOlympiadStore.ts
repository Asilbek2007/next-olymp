import { create } from 'zustand';
import { OlympiadItem, INITIAL_OLYMPIADS } from '../data/initialOlympiads';

const STORAGE_KEY = 'next_olymp_olympiads_v1';

interface OlympiadStore {
  olympiads: OlympiadItem[];
  addOlympiad: (item: Omit<OlympiadItem, 'id' | 'registeredCount' | 'submittedCount' | 'paidCount' | 'totalRevenue'>) => OlympiadItem;
  updateOlympiad: (id: string, updated: Partial<OlympiadItem>) => void;
  deleteOlympiad: (id: string) => void;
  togglePinOlympiad: (id: string) => void;
  toggleOlympiadStatus: (id: string) => void;
  generateAiOlympiadDraft: (promptCommand: string) => Partial<OlympiadItem>;
  resetOlympiads: () => void;
}

const loadOlympiadsFromStorage = (): OlympiadItem[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (error) {
    console.error('Error loading olympiads from localStorage:', error);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_OLYMPIADS));
  return INITIAL_OLYMPIADS;
};

export const useOlympiadStore = create<OlympiadStore>((set, get) => ({
  olympiads: loadOlympiadsFromStorage(),

  addOlympiad: (newItem) => {
    const current = get().olympiads;
    const nextIdNum = 100 + current.length + 1;
    const id = `OLY-${nextIdNum}`;

    const olympiad: OlympiadItem = {
      ...newItem,
      id,
      registeredCount: 0,
      submittedCount: 0,
      paidCount: 0,
      totalRevenue: 0
    };

    const updated = [olympiad, ...current];
    set({ olympiads: updated });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return olympiad;
  },

  updateOlympiad: (id, updatedFields) => {
    const updated = get().olympiads.map((o) => (o.id === id ? { ...o, ...updatedFields } : o));
    set({ olympiads: updated });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  },

  deleteOlympiad: (id) => {
    const updated = get().olympiads.filter((o) => o.id !== id);
    set({ olympiads: updated });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  },

  togglePinOlympiad: (id) => {
    const updated = get().olympiads.map((o) => (o.id === id ? { ...o, isPinned: !o.isPinned } : o));
    set({ olympiads: updated });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  },

  toggleOlympiadStatus: (id) => {
    const updated = get().olympiads.map((o) => {
      if (o.id === id) {
        const nextStatus: 'ochiq' | 'yopiq' = o.status === 'ochiq' ? 'yopiq' : 'ochiq';
        return { ...o, status: nextStatus };
      }
      return o;
    });

    set({ olympiads: updated });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  },

  generateAiOlympiadDraft: (promptCommand) => {
    const cmd = promptCommand.toLowerCase();
    let subject = 'Matematika';
    let format: 'online' | 'offline' = 'online';
    let price = 35000;

    if (cmd.includes('ingliz') || cmd.includes('english')) subject = 'Ingliz tili';
    else if (cmd.includes('fizika')) subject = 'Fizika';
    else if (cmd.includes('biologiya')) subject = 'Biologiya';
    else if (cmd.includes('informatika') || cmd.includes('it')) subject = 'Informatika';
    else if (cmd.includes('kimyo')) subject = 'Kimyo';

    if (cmd.includes('offline') || cmd.includes('oflayn') || cmd.includes('maktabda')) {
      format = 'offline';
      price = 45000;
    }

    const today = new Date().toISOString().split('T')[0];

    return {
      title: `Respublika ${subject} Bo'yicha AI Gen Olimpiadasi`,
      subject,
      format,
      price,
      status: 'ochiq',
      isPinned: false,
      startDate: `${today} 10:00`,
      endDate: `${today} 18:00`,
      image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=600&q=80',
      description: `AI yordamida avtomatik shakllantirilgan ${subject} fani bo'yicha Respublika akademik musobaqasi va sinov testi.`,
      organizer: 'NextOlymp AI Akademik System'
    };
  },

  resetOlympiads: () => {
    set({ olympiads: INITIAL_OLYMPIADS });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_OLYMPIADS));
  }
}));
