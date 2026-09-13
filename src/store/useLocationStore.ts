import { create } from 'zustand';
import {
  ViloyatItem,
  TumanItem,
  MaktabItem,
  INITIAL_VILOYATLAR,
  INITIAL_TUMANLAR,
  INITIAL_MAKTABLAR
} from '../data/initialLocations';

interface LocationState {
  viloyatlar: ViloyatItem[];
  tumanlar: TumanItem[];
  maktablar: MaktabItem[];

  addViloyat: (viloyat: { nomi: string; kod: string }) => void;
  updateViloyat: (id: string, viloyat: { nomi: string; kod: string }) => void;
  deleteViloyat: (id: string) => void;

  addTuman: (tuman: { nomi: string; viloyatNomi: string; kod: string }) => void;
  updateTuman: (id: string, tuman: { nomi: string; viloyatNomi: string; kod: string }) => void;
  deleteTuman: (id: string) => void;

  addMaktab: (maktab: { nomi: string; turi: string; noyobKod: string; viloyatNomi: string; tumanNomi: string }) => void;
  updateMaktab: (id: string, maktab: { nomi: string; turi: string; noyobKod: string; viloyatNomi: string; tumanNomi: string }) => void;
  deleteMaktab: (id: string) => void;

  resetToDefaults: () => void;
}

const STORAGE_KEY = 'next_olymp_locations_v2';

const getInitialData = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.viloyatlar && parsed.tumanlar && parsed.maktablar) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to load locations from localStorage', e);
  }
  return {
    viloyatlar: INITIAL_VILOYATLAR,
    tumanlar: INITIAL_TUMANLAR,
    maktablar: INITIAL_MAKTABLAR
  };
};

const initial = getInitialData();

export const useLocationStore = create<LocationState>((set, get) => {
  const saveState = (newState: { viloyatlar: ViloyatItem[]; tumanlar: TumanItem[]; maktablar: MaktabItem[] }) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
    } catch (e) {
      console.error('Failed to save locations to localStorage', e);
    }
  };

  return {
    viloyatlar: initial.viloyatlar,
    tumanlar: initial.tumanlar,
    maktablar: initial.maktablar,

    addViloyat: ({ nomi, kod }) => {
      const { viloyatlar, tumanlar, maktablar } = get();
      const newViloyat: ViloyatItem = {
        id: `v-${Date.now()}`,
        nomi: nomi.trim(),
        kod: kod.trim() || `${viloyatlar.length + 1}`,
        tumanlarSoni: 0,
        maktablarSoni: 0
      };
      const updatedViloyatlar = [newViloyat, ...viloyatlar];
      const newState = { viloyatlar: updatedViloyatlar, tumanlar, maktablar };
      set(newState);
      saveState(newState);
    },

    updateViloyat: (id, { nomi, kod }) => {
      const { viloyatlar, tumanlar, maktablar } = get();
      const oldViloyat = viloyatlar.find(v => v.id === id);
      const oldName = oldViloyat ? oldViloyat.nomi : '';

      const updatedViloyatlar = viloyatlar.map(v => {
        if (v.id === id) {
          return { ...v, nomi: nomi.trim(), kod: kod.trim() };
        }
        return v;
      });

      // Update references in tumanlar and maktablar if name changed
      const updatedTumanlar = tumanlar.map(t => {
        if (oldName && t.viloyatNomi.toLowerCase() === oldName.toLowerCase()) {
          return { ...t, viloyatNomi: nomi.trim() };
        }
        return t;
      });

      const updatedMaktablar = maktablar.map(m => {
        if (oldName && m.viloyatNomi.toLowerCase() === oldName.toLowerCase()) {
          return { ...m, viloyatNomi: nomi.trim() };
        }
        return m;
      });

      const newState = { viloyatlar: updatedViloyatlar, tumanlar: updatedTumanlar, maktablar: updatedMaktablar };
      set(newState);
      saveState(newState);
    },

    deleteViloyat: (id) => {
      const { viloyatlar, tumanlar, maktablar } = get();
      const updatedViloyatlar = viloyatlar.filter(v => v.id !== id);
      const newState = { viloyatlar: updatedViloyatlar, tumanlar, maktablar };
      set(newState);
      saveState(newState);
    },

    addTuman: ({ nomi, viloyatNomi, kod }) => {
      const { viloyatlar, tumanlar, maktablar } = get();
      const newTuman: TumanItem = {
        id: `t-${Date.now()}`,
        nomi: nomi.trim(),
        viloyatNomi: viloyatNomi.trim(),
        kod: kod.trim() || `${tumanlar.length + 100}`,
        maktablarSoni: 0
      };
      const updatedTumanlar = [newTuman, ...tumanlar];

      // Update viloyat tumanlar count
      const updatedViloyatlar = viloyatlar.map(v => {
        if (v.nomi.toLowerCase() === viloyatNomi.trim().toLowerCase()) {
          return { ...v, tumanlarSoni: v.tumanlarSoni + 1 };
        }
        return v;
      });

      const newState = { viloyatlar: updatedViloyatlar, tumanlar: updatedTumanlar, maktablar };
      set(newState);
      saveState(newState);
    },

    updateTuman: (id, { nomi, viloyatNomi, kod }) => {
      const { viloyatlar, tumanlar, maktablar } = get();
      const oldTuman = tumanlar.find(t => t.id === id);
      const oldName = oldTuman ? oldTuman.nomi : '';

      const updatedTumanlar = tumanlar.map(t => {
        if (t.id === id) {
          return { ...t, nomi: nomi.trim(), viloyatNomi: viloyatNomi.trim(), kod: kod.trim() };
        }
        return t;
      });

      // Update maktablar references
      const updatedMaktablar = maktablar.map(m => {
        if (oldName && m.tumanNomi.toLowerCase() === oldName.toLowerCase()) {
          return { ...m, tumanNomi: nomi.trim(), viloyatNomi: viloyatNomi.trim() };
        }
        return m;
      });

      const newState = { viloyatlar, tumanlar: updatedTumanlar, maktablar: updatedMaktablar };
      set(newState);
      saveState(newState);
    },

    deleteTuman: (id) => {
      const { viloyatlar, tumanlar, maktablar } = get();
      const updatedTumanlar = tumanlar.filter(t => t.id !== id);
      const newState = { viloyatlar, tumanlar: updatedTumanlar, maktablar };
      set(newState);
      saveState(newState);
    },

    addMaktab: ({ nomi, turi, noyobKod, viloyatNomi, tumanNomi }) => {
      const { viloyatlar, tumanlar, maktablar } = get();
      const newMaktab: MaktabItem = {
        id: `m-${Date.now()}`,
        nomi: nomi.trim(),
        turi: turi || 'public',
        noyobKod: noyobKod.trim() || `${Math.floor(10000 + Math.random() * 90000)}`,
        viloyatNomi: viloyatNomi.trim(),
        tumanNomi: tumanNomi.trim()
      };
      const updatedMaktablar = [newMaktab, ...maktablar];

      // Update counts
      const updatedViloyatlar = viloyatlar.map(v => {
        if (v.nomi.toLowerCase() === viloyatNomi.trim().toLowerCase()) {
          return { ...v, maktablarSoni: v.maktablarSoni + 1 };
        }
        return v;
      });

      const updatedTumanlar = tumanlar.map(t => {
        if (t.nomi.toLowerCase() === tumanNomi.trim().toLowerCase()) {
          return { ...t, maktablarSoni: t.maktablarSoni + 1 };
        }
        return t;
      });

      const newState = { viloyatlar: updatedViloyatlar, tumanlar: updatedTumanlar, maktablar: updatedMaktablar };
      set(newState);
      saveState(newState);
    },

    updateMaktab: (id, { nomi, turi, noyobKod, viloyatNomi, tumanNomi }) => {
      const { viloyatlar, tumanlar, maktablar } = get();
      const updatedMaktablar = maktablar.map(m => {
        if (m.id === id) {
          return {
            ...m,
            nomi: nomi.trim(),
            turi: turi || 'public',
            noyobKod: noyobKod.trim(),
            viloyatNomi: viloyatNomi.trim(),
            tumanNomi: tumanNomi.trim()
          };
        }
        return m;
      });

      const newState = { viloyatlar, tumanlar, maktablar: updatedMaktablar };
      set(newState);
      saveState(newState);
    },

    deleteMaktab: (id) => {
      const { viloyatlar, tumanlar, maktablar } = get();
      const updatedMaktablar = maktablar.filter(m => m.id !== id);
      const newState = { viloyatlar, tumanlar, maktablar: updatedMaktablar };
      set(newState);
      saveState(newState);
    },

    resetToDefaults: () => {
      const newState = {
        viloyatlar: INITIAL_VILOYATLAR,
        tumanlar: INITIAL_TUMANLAR,
        maktablar: INITIAL_MAKTABLAR
      };
      set(newState);
      saveState(newState);
    }
  };
});
