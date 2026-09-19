import { create } from 'zustand';
import { PackageItem, INITIAL_PACKAGES } from '../data/initialPackages';

interface PackageStore {
  packages: PackageItem[];
  addPackage: (pkg: Omit<PackageItem, 'id' | 'createdAt' | 'sotilganSoni' | 'jamiTushum'>) => void;
  updatePackage: (id: string, updated: Partial<PackageItem>) => void;
  deletePackage: (id: string) => void;
  togglePackageStatus: (id: string) => void;
  resetPackages: () => void;
}

export const usePackageStore = create<PackageStore>((set, get) => ({
  packages: INITIAL_PACKAGES,

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
      createdAt: today,
    };

    const updatedList = [packageItem, ...current];
    set({ packages: updatedList });
  },

  updatePackage: (id, updated) => {
    const updatedList = get().packages.map((p) => {
      if (p.id === id) {
        return { ...p, ...updated };
      }
      return p;
    });

    set({ packages: updatedList });
  },

  deletePackage: (id) => {
    const updatedList = get().packages.filter((p) => p.id !== id);
    set({ packages: updatedList });
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
  },

  resetPackages: () => {
    set({ packages: INITIAL_PACKAGES });
  },
}));
