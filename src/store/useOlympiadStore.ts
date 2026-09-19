import { create } from 'zustand';
import { OlympiadItem } from '../data/initialOlympiads';
import { apiClient } from '../services/api';

interface OlympiadStore {
  olympiads: OlympiadItem[];
  loading: boolean;
  fetchFromApi: () => Promise<void>;
  addOlympiad: (item: Omit<OlympiadItem, 'id' | 'registeredCount' | 'submittedCount' | 'paidCount' | 'totalRevenue'>) => OlympiadItem;
  updateOlympiad: (id: string, updated: Partial<OlympiadItem>) => void;
  deleteOlympiad: (id: string) => void;
  togglePinOlympiad: (id: string) => void;
  toggleOlympiadStatus: (id: string) => void;
  resetOlympiads: () => void;
}

export const useOlympiadStore = create<OlympiadStore>((set, get) => ({
  olympiads: [],
  loading: false,

  fetchFromApi: async () => {
    set({ loading: true });
    try {
      const json = await apiClient.get('/olympiads.php');
      const data = Array.isArray(json) ? json : (json?.data || []);
      set({ olympiads: data, loading: false });
    } catch (err) {
      console.warn('Could not fetch olympiads from MySQL API:', err);
      set({ loading: false });
    }
  },

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
      totalRevenue: 0,
    };

    const updated = [olympiad, ...current];
    set({ olympiads: updated });

    // Save directly to MySQL via apiClient
    apiClient.post('/olympiads.php', olympiad).catch((e) => console.warn('API sync warning:', e));

    return olympiad;
  },

  updateOlympiad: (id, updatedFields) => {
    const updated = get().olympiads.map((o) => (o.id === id ? { ...o, ...updatedFields } : o));
    set({ olympiads: updated });

    const itemToSync = updated.find((o) => o.id === id);
    if (itemToSync) {
      apiClient.post('/olympiads.php', itemToSync).catch((e) => console.warn('API sync warning:', e));
    }
  },

  deleteOlympiad: (id) => {
    const updated = get().olympiads.filter((o) => o.id !== id);
    set({ olympiads: updated });

    // Delete from MySQL via apiClient
    apiClient.delete(`/olympiads.php?id=${encodeURIComponent(id)}`).catch((e) => console.warn('API delete warning:', e));
  },

  togglePinOlympiad: (id) => {
    const updated = get().olympiads.map((o) => (o.id === id ? { ...o, isPinned: !o.isPinned } : o));
    set({ olympiads: updated });

    const itemToSync = updated.find((o) => o.id === id);
    if (itemToSync) {
      apiClient.post('/olympiads.php', itemToSync).catch((e) => console.warn('API sync warning:', e));
    }
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

    const itemToSync = updated.find((o) => o.id === id);
    if (itemToSync) {
      apiClient.post('/olympiads.php', itemToSync).catch((e) => console.warn('API sync warning:', e));
    }
  },

  resetOlympiads: () => {
    set({ olympiads: [] });
  },
}));

// Auto-sync on app load
if (typeof window !== 'undefined') {
  setTimeout(() => {
    useOlympiadStore.getState().fetchFromApi();
  }, 100);
}
