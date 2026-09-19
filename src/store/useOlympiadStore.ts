import { create } from 'zustand';
import { OlympiadItem } from '../data/initialOlympiads';

interface OlympiadStore {
  olympiads: OlympiadItem[];
  fetchFromApi: () => Promise<void>;
  addOlympiad: (item: Omit<OlympiadItem, 'id' | 'registeredCount' | 'submittedCount' | 'paidCount' | 'totalRevenue'>) => OlympiadItem;
  updateOlympiad: (id: string, updated: Partial<OlympiadItem>) => void;
  deleteOlympiad: (id: string) => void;
  togglePinOlympiad: (id: string) => void;
  toggleOlympiadStatus: (id: string) => void;
  resetOlympiads: () => void;
}

// Helper to push to MySQL API in background
const syncOlympiadToApi = async (item: OlympiadItem) => {
  try {
    await fetch('/api/olympiads.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item),
    });
  } catch (e) {
    console.warn('API sync warning:', e);
  }
};

const deleteOlympiadFromApi = async (id: string) => {
  try {
    await fetch(`/api/olympiads.php?id=${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
  } catch (e) {
    console.warn('API delete warning:', e);
  }
};

export const useOlympiadStore = create<OlympiadStore>((set, get) => ({
  olympiads: [],

  fetchFromApi: async () => {
    try {
      const res = await fetch('/api/olympiads.php');
      if (res.ok) {
        const json = await res.json();
        if (json.status === 'success' && Array.isArray(json.data)) {
          set({ olympiads: json.data });
        }
      }
    } catch (err) {
      console.warn('Could not fetch from MySQL API:', err);
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
      totalRevenue: 0
    };

    const updated = [olympiad, ...current];
    set({ olympiads: updated });

    // Save directly to MySQL
    syncOlympiadToApi(olympiad);

    return olympiad;
  },

  updateOlympiad: (id, updatedFields) => {
    const updated = get().olympiads.map((o) => (o.id === id ? { ...o, ...updatedFields } : o));
    set({ olympiads: updated });

    const itemToSync = updated.find((o) => o.id === id);
    if (itemToSync) {
      syncOlympiadToApi(itemToSync);
    }
  },

  deleteOlympiad: (id) => {
    const updated = get().olympiads.filter((o) => o.id !== id);
    set({ olympiads: updated });

    // Delete from MySQL
    deleteOlympiadFromApi(id);
  },

  togglePinOlympiad: (id) => {
    const updated = get().olympiads.map((o) => (o.id === id ? { ...o, isPinned: !o.isPinned } : o));
    set({ olympiads: updated });

    const itemToSync = updated.find((o) => o.id === id);
    if (itemToSync) {
      syncOlympiadToApi(itemToSync);
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
      syncOlympiadToApi(itemToSync);
    }
  },

  resetOlympiads: () => {
    set({ olympiads: [] });
  }
}));

// Auto-sync on app load
if (typeof window !== 'undefined') {
  setTimeout(() => {
    useOlympiadStore.getState().fetchFromApi();
  }, 100);
}
