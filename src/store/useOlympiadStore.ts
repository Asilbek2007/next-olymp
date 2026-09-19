import { create } from 'zustand';
import { OlympiadItem, INITIAL_OLYMPIADS } from '../data/initialOlympiads';

const STORAGE_KEY = 'next_olymp_olympiads_v2';

interface OlympiadStore {
  olympiads: OlympiadItem[];
  addOlympiad: (item: Omit<OlympiadItem, 'id' | 'registeredCount' | 'submittedCount' | 'paidCount' | 'totalRevenue'>) => OlympiadItem;
  updateOlympiad: (id: string, updated: Partial<OlympiadItem>) => void;
  deleteOlympiad: (id: string) => void;
  togglePinOlympiad: (id: string) => void;
  toggleOlympiadStatus: (id: string) => void;
  resetOlympiads: () => void;
}

const loadOlympiadsFromStorage = (): OlympiadItem[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored !== null) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (error) {
    console.error('Error loading olympiads from localStorage:', error);
  }
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
      questions: newItem.questions || [],
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

  resetOlympiads: () => {
    set({ olympiads: INITIAL_OLYMPIADS });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_OLYMPIADS));
  }
}));
