import { create } from 'zustand';
import { PackageItem, INITIAL_PACKAGES } from '../data/initialPackages';

const STORAGE_KEY = 'next_olymp_packages_v1';

interface PackageStore {
  packages: PackageItem[];
  addPackage: (pkg: Omit<PackageItem, 'id' | 'createdAt' | 'sotilganSoni' | 'jamiTushum'>) => void;
  updatePackage: (id: string, updated: Partial<PackageItem>) => void;
  deletePackage: (id: string) => void;
  togglePackageStatus: (id: string) => void;
  resetPackages: () => void;
}

const loadPackagesFromStorage = (): PackageItem[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (error) {
    console.error('Error loading packages from localStorage:', error);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_PACKAGES));
  return INITIAL_PACKAGES;
};

export const usePackageStore = create<PackageStore>((set, get) => ({
  packages: loadPackagesFromStorage(),

  addPackage: (newPkg) => {
    const current = get().packages;
    const nextIdNumber = current.length + 1;
    const id = `PKG-${String(nextIdNumber).padStart(3, '0')}`;
    const today = new Date().toISOString().split('T')[0];

    const packageItem: PackageItem = {
      ...newPkg,
      id,
      sotilganSoni: 0,
      jamiTushum: 0,
      createdAt: today
    };

    const updatedList = [packageItem, ...current];
    set({ packages: updatedList });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));
  },

  updatePackage: (id, updated) => {
    const updatedList = get().packages.map((p) => {
      if (p.id === id) {
        return { ...p, ...updated };
      }
      return p;
    });

    set({ packages: updatedList });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));
  },

  deletePackage: (id) => {
    const updatedList = get().packages.filter((p) => p.id !== id);
    set({ packages: updatedList });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));
  },

  togglePackageStatus: (id) => {
    const updatedList = get().packages.map((p) => {
      if (p.id === id) {
        const nextStatus: 'sotuvda' | 'nofaol' = p.holati === 'sotuvda' ? 'nofaol' : 'sotuvda';
        return { ...p, holati: nextStatus };
      }
      return p;
    });

    set({ packages: updatedList });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));
  },

  resetPackages: () => {
    set({ packages: INITIAL_PACKAGES });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_PACKAGES));
  }
}));
