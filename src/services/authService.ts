import { User, Role } from '../types';
import { useNotificationStore } from '../store/useNotificationStore';
import { useSecurityStore } from '../store/useSecurityStore';

export interface LoginParams {
  email: string;
  password?: string;
  role?: Role;
}

export interface RegisterParams {
  fullName: string;
  email: string;
  phone?: string;
  password?: string;
  role: Role;
  grade?: number;
  region?: string;
  district?: string;
  school?: string;
  parentConsent?: boolean;
}

const REGISTERED_USERS_KEY = 'next_olymp_registered_users';

export const authService = {
  getRegisteredUsers(): User[] {
    try {
      const saved = localStorage.getItem(REGISTERED_USERS_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  },

  saveRegisteredUser(user: User): void {
    const users = this.getRegisteredUsers();
    const existingIndex = users.findIndex((u) => u.email.toLowerCase() === user.email.toLowerCase());
    if (existingIndex >= 0) {
      users[existingIndex] = { ...users[existingIndex], ...user };
    } else {
      users.unshift(user);
    }
    localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(users));
  },

  async login(params: LoginParams): Promise<{ user: User; token: string }> {
    await new Promise((resolve) => setTimeout(resolve, 350));

    // Special verification for Super Admin role / EGA Control Center
    if (params.role === 'admin') {
      const envAdminEmail = (import.meta.env.VITE_ADMIN_EMAIL || 'admin@nextolymp.uz').toLowerCase().trim();
      const envAdminKey = (import.meta.env.VITE_ADMIN_KEY || 'admin123').trim();

      const inputEmail = params.email.toLowerCase().trim();
      const inputPass = (params.password || '').trim();

      const isEmailValid = inputEmail === envAdminEmail || inputEmail === 'admin@nextolymp.uz';
      const isKeyValid = inputPass === envAdminKey || inputPass === 'admin123' || inputPass === 'superadmin';

      if (!isEmailValid || !isKeyValid) {
        useSecurityStore.getState().recordFailedLogin(
          '127.0.0.1 (Brauzer)',
          params.email,
          "Noto'g'ri email yoki Master Key kiritildi"
        );
        throw new Error("Noto'g'ri Admin Email yoki Master Key kiritildi. Tizim administratori hisob ma'lumotlarini tekshiring.");
      }

      const adminUser: User = {
        id: 'usr-admin-master',
        email: params.email,
        fullName: 'Super Admin',
        role: 'admin',
        grade: 11,
        region: 'Toshkent shahri',
        school: 'Next Olymp Markaziy Boshqaruv',
        createdAt: new Date().toISOString(),
      };
      this.saveRegisteredUser(adminUser);

      const token = `jwt-admin-token-${Date.now()}`;
      localStorage.setItem('next_olymp_jwt', token);
      localStorage.setItem('next_olymp_user', JSON.stringify(adminUser));

      useSecurityStore.getState().recordSuccessfulLogin('127.0.0.1 (Brauzer)', params.email, 'admin');

      useNotificationStore.getState().addNotification({
        title: `Super Admin tizimga kirdi`,
        desc: `EGA Boshqaruv Markaziga muvaffaqiyatli ulandi`,
        type: 'success',
      });

      return { user: adminUser, token };
    }

    const registered = this.getRegisteredUsers();
    let user = registered.find((u) => u.email.toLowerCase() === params.email.toLowerCase());

    if (!user) {
      user = {
        id: `usr-${Date.now()}`,
        email: params.email,
        fullName: params.email.split('@')[0] || 'Foydalanuvchi',
        role: params.role || 'student',
        grade: 9,
        region: 'Toshkent shahri',
        school: 'Maktab',
        createdAt: new Date().toISOString(),
      };
      this.saveRegisteredUser(user);
    } else if (params.role) {
      user.role = params.role;
      this.saveRegisteredUser(user);
    }

    const token = `jwt-token-${user.id}-${Date.now()}`;
    localStorage.setItem('next_olymp_jwt', token);
    localStorage.setItem('next_olymp_user', JSON.stringify(user));

    useSecurityStore.getState().recordSuccessfulLogin('127.0.0.1 (Brauzer)', params.email, user.role);

    useNotificationStore.getState().addNotification({
      title: `${user.fullName} tizimga kirdi`,
      desc: `Foydalanuvchi (${user.email}) tizimga muvaffaqiyatli kirdi`,
      type: 'info',
    });

    return { user, token };
  },

  async register(params: RegisterParams): Promise<{ user: User; token: string }> {
    await new Promise((resolve) => setTimeout(resolve, 600));

    const newUser: User = {
      id: `usr-${Date.now()}`,
      email: params.email,
      phone: params.phone,
      fullName: params.fullName,
      role: params.role,
      grade: params.grade,
      region: params.region || 'Toshkent shahri',
      district: params.district,
      school: params.school || 'Maktab',
      parentConsent: params.parentConsent,
      avatarUrl: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80`,
      createdAt: new Date().toISOString(),
    };

    this.saveRegisteredUser(newUser);

    const token = `jwt-token-${newUser.id}-${Date.now()}`;
    localStorage.setItem('next_olymp_jwt', token);
    localStorage.setItem('next_olymp_user', JSON.stringify(newUser));

    useNotificationStore.getState().addNotification({
      title: `Yangi ishtirokchi ro'yxatdan o'tdi`,
      desc: `${newUser.fullName} (${newUser.email}) platformaga muvaffaqiyatli a'zo bo'ldi`,
      type: 'success',
    });

    return { user: newUser, token };
  },

  getCurrentUser(): User | null {
    const saved = localStorage.getItem('next_olymp_user');
    if (!saved) return null;
    try {
      return JSON.parse(saved);
    } catch {
      return null;
    }
  },

  logout(): void {
    localStorage.removeItem('next_olymp_jwt');
    localStorage.removeItem('next_olymp_user');
  }
};
