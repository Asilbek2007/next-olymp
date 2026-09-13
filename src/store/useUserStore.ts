import { create } from 'zustand';
import { UserItem, INITIAL_USERS } from '../data/initialUsers';

interface UserState {
  users: UserItem[];
  addUser: (user: Omit<UserItem, 'id' | 'createdAt' | 'participationCount'>) => void;
  updateUser: (id: string, user: Partial<Omit<UserItem, 'id' | 'createdAt'>>) => void;
  deleteUser: (id: string) => void;
  toggleUserStatus: (id: string) => void;
  resetToDefaults: () => void;
}

const STORAGE_KEY = 'next_olymp_users_v1';

const getInitialUsers = (): UserItem[] => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to read users from localStorage', e);
  }
  return INITIAL_USERS;
};

export const useUserStore = create<UserState>((set, get) => {
  const saveState = (users: UserItem[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
    } catch (e) {
      console.error('Failed to save users to localStorage', e);
    }
  };

  return {
    users: getInitialUsers(),

    addUser: (userData) => {
      const { users } = get();
      const newUser: UserItem = {
        ...userData,
        id: `USR-${1000 + users.length + 1}`,
        createdAt: new Date().toISOString().split('T')[0],
        participationCount: 0,
        status: userData.status || 'active'
      };
      const updated = [newUser, ...users];
      set({ users: updated });
      saveState(updated);
    },

    updateUser: (id, userData) => {
      const { users } = get();
      const updated = users.map((u) => (u.id === id ? { ...u, ...userData } : u));
      set({ users: updated });
      saveState(updated);
    },

    deleteUser: (id) => {
      const { users } = get();
      const updated = users.filter((u) => u.id !== id);
      set({ users: updated });
      saveState(updated);
    },

    toggleUserStatus: (id) => {
      const { users } = get();
      const updated = users.map((u) => {
        if (u.id === id) {
          return { ...u, status: u.status === 'active' ? ('blocked' as const) : ('active' as const) };
        }
        return u;
      });
      set({ users: updated });
      saveState(updated);
    },

    resetToDefaults: () => {
      set({ users: INITIAL_USERS });
      saveState(INITIAL_USERS);
    }
  };
});
