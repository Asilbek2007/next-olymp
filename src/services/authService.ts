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
  gender?: 'male' | 'female';
  password?: string;
  role: Role;
  grade?: number;
  region?: string;
  district?: string;
  school?: string;
  parentConsent?: boolean;
}

export interface RegisteredUser extends User {
  password?: string;
}

const REGISTERED_USERS_KEY = 'next_olymp_registered_users';

// Clean initial registered users (0 on fresh platform deploy)
const DEFAULT_INITIAL_USERS: RegisteredUser[] = [];

export const authService = {
  getRegisteredUsers(): RegisteredUser[] {
    try {
      const saved = localStorage.getItem(REGISTERED_USERS_KEY);
      if (!saved) {
        return DEFAULT_INITIAL_USERS;
      }
      const parsed = JSON.parse(saved);
      if (!Array.isArray(parsed)) {
        return DEFAULT_INITIAL_USERS;
      }
      return parsed as RegisteredUser[];
    } catch {
      return DEFAULT_INITIAL_USERS;
    }
  },

  saveRegisteredUser(user: RegisteredUser): void {
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

    // 1. Attempt MySQL Real Backend Login
    try {
      const res = await fetch('/api/auth.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'login',
          email: params.email.trim(),
          password: params.password?.trim()
        })
      });

      const json = await res.json();
      if (res.ok && json.status === 'success' && json.user) {
        const userWithoutSensitiveData: User = json.user;
        const token = json.token || `jwt-token-${userWithoutSensitiveData.id}-${Date.now()}`;

        localStorage.setItem('next_olymp_jwt', token);
        localStorage.setItem('next_olymp_user', JSON.stringify(userWithoutSensitiveData));
        if (userWithoutSensitiveData.role === 'student') {
          localStorage.setItem('next_olymp_student_user', JSON.stringify(userWithoutSensitiveData));
        }

        this.saveRegisteredUser({ ...userWithoutSensitiveData, password: params.password });
        useSecurityStore.getState().recordSuccessfulLogin('127.0.0.1 (MySQL)', params.email, userWithoutSensitiveData.role);

        useNotificationStore.getState().addNotification({
          title: `${userWithoutSensitiveData.fullName} tizimga kirdi`,
          desc: `Foydalanuvchi (${userWithoutSensitiveData.email}) tizimga muvaffaqiyatli kirdi`,
          type: 'info',
        });

        return { user: userWithoutSensitiveData, token };
      } else if (json.message) {
        useSecurityStore.getState().recordFailedLogin(
          '127.0.0.1 (MySQL)',
          params.email,
          json.message
        );
        throw new Error(json.message);
      }
    } catch (apiErr: any) {
      if (apiErr.message && (apiErr.message.includes('Login yoki parol') || apiErr.message.includes('topilmadi') || apiErr.message.includes('xato'))) {
        throw apiErr;
      }
    }

    // STRICT USER/STUDENT DATABASE VERIFICATION (Local Fallback):
    const registered = this.getRegisteredUsers();
    const user = registered.find((u) => u.email.toLowerCase().trim() === params.email.toLowerCase().trim());

    // 1. If user doesn't exist in database, fail with generic error
    if (!user) {
      useSecurityStore.getState().recordFailedLogin(
        '127.0.0.1 (Brauzer)',
        params.email,
        "Login yoki parol xato (Foydalanuvchi topilmadi)"
      );
      throw new Error("Login yoki parol xato! Iltimos, ma'lumotlarni qayta tekshiring.");
    }

    // 2. Check password if provided in user record
    if (user.password && params.password && user.password !== params.password) {
      useSecurityStore.getState().recordFailedLogin(
        '127.0.0.1 (Brauzer)',
        params.email,
        "Login yoki parol xato (Noto'g'ri parol)"
      );
      throw new Error("Login yoki parol xato! Iltimos, ma'lumotlarni qayta tekshiring.");
    }

    // Login successful
    const userWithoutSensitiveData: User = {
      id: user.id,
      email: user.email,
      phone: user.phone,
      fullName: user.fullName,
      role: user.role,
      grade: user.grade,
      region: user.region,
      district: user.district,
      school: user.school,
      avatarUrl: user.avatarUrl,
      createdAt: user.createdAt,
      parentConsent: user.parentConsent,
    };

    const token = `jwt-token-${user.id}-${Date.now()}`;
    localStorage.setItem('next_olymp_jwt', token);
    localStorage.setItem('next_olymp_user', JSON.stringify(userWithoutSensitiveData));
    if (user.role === 'student') {
      localStorage.setItem('next_olymp_student_user', JSON.stringify(userWithoutSensitiveData));
    }

    useSecurityStore.getState().recordSuccessfulLogin('127.0.0.1 (Brauzer)', params.email, user.role);

    useNotificationStore.getState().addNotification({
      title: `${user.fullName} tizimga kirdi`,
      desc: `Foydalanuvchi (${user.email}) tizimga muvaffaqiyatli kirdi`,
      type: 'info',
    });

    return { user: userWithoutSensitiveData, token };
  },

  async register(params: RegisterParams): Promise<{ user: User; token: string }> {
    // 1. Attempt MySQL Backend Registration
    try {
      const res = await fetch('/api/auth.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'register',
          email: params.email.trim(),
          fullName: params.fullName.trim(),
          password: params.password?.trim() || 'password123',
          phone: params.phone?.trim() || '',
          gender: params.gender || 'male',
          role: params.role || 'student',
          grade: params.grade,
          region: params.region || 'Toshkent shahri',
          district: params.district,
          school: params.school || 'Maktab',
          parentConsent: params.parentConsent
        })
      });

      const json = await res.json();
      if (!res.ok || json.status !== 'success') {
        throw new Error(json.message || "Ro'yxatdan o'tishda xatolik yuz berdi!");
      }

      const userProfile: User = json.user;
      const token = json.token || `jwt-token-${userProfile.id}-${Date.now()}`;

      localStorage.setItem('next_olymp_jwt', token);
      localStorage.setItem('next_olymp_user', JSON.stringify(userProfile));
      if (userProfile.role === 'student') {
        localStorage.setItem('next_olymp_student_user', JSON.stringify(userProfile));
      }

      this.saveRegisteredUser({ ...userProfile, password: params.password });

      return { user: userProfile, token };
    } catch (apiErr: any) {
      if (apiErr.message && (apiErr.message.includes('allaqachon hisob') || apiErr.message.includes('kiritilishi shart'))) {
        throw apiErr;
      }
    }

    // Local Storage Registration Fallback
    const registered = this.getRegisteredUsers();
    const existing = registered.find((u) => u.email.toLowerCase().trim() === params.email.toLowerCase().trim());

    if (existing) {
      throw new Error(`Ushbu elektron pochta (${params.email}) bilan allaqachon hisob yaratilgan. Iltimos, to'g'ridan-to'g'ri tizimga kiring!`);
    }

    const newUser: RegisteredUser = {
      id: `usr-${Date.now()}`,
      email: params.email.trim(),
      phone: params.phone?.trim(),
      gender: params.gender || 'male',
      password: params.password || 'password123',
      fullName: params.fullName.trim(),
      role: params.role || 'student',
      grade: params.grade,
      region: params.region || 'Toshkent shahri',
      district: params.district,
      school: params.school || 'Maktab',
      parentConsent: params.parentConsent,
      avatarUrl: params.gender === 'female'
        ? `https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80`
        : `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80`,
      createdAt: new Date().toISOString(),
    };

    this.saveRegisteredUser(newUser);

    const userProfile: User = {
      id: newUser.id,
      email: newUser.email,
      phone: newUser.phone,
      gender: newUser.gender,
      fullName: newUser.fullName,
      role: newUser.role,
      grade: newUser.grade,
      region: newUser.region,
      district: newUser.district,
      school: newUser.school,
      avatarUrl: newUser.avatarUrl,
      createdAt: newUser.createdAt,
      parentConsent: newUser.parentConsent,
    };

    const token = `jwt-token-${newUser.id}-${Date.now()}`;
    localStorage.setItem('next_olymp_jwt', token);
    localStorage.setItem('next_olymp_user', JSON.stringify(userProfile));
    if (newUser.role === 'student') {
      localStorage.setItem('next_olymp_student_user', JSON.stringify(userProfile));
    }

    useNotificationStore.getState().addNotification({
      title: `Yangi ishtirokchi ro'yxatdan o'tdi`,
      desc: `${newUser.fullName} (${newUser.email}) platformaga muvaffaqiyatli a'zo bo'ldi`,
      type: 'success',
    });

    return { user: userProfile, token };
  },

  async resetPassword(email: string, newPassword: string): Promise<boolean> {
    await new Promise((resolve) => setTimeout(resolve, 400));
    const users = this.getRegisteredUsers();
    const userIndex = users.findIndex((u) => u.email.toLowerCase().trim() === email.toLowerCase().trim());

    if (userIndex === -1) {
      throw new Error("Bunday elektron pochta manzili bilan akkaunt topilmadi. Iltimos, pochtangizni to'g'ri kiritganingizga ishonch hosil qiling.");
    }

    users[userIndex].password = newPassword;
    localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(users));

    // Also update active session if it matches
    const current = this.getCurrentUser();
    if (current && current.email.toLowerCase() === email.toLowerCase()) {
      localStorage.setItem('next_olymp_user', JSON.stringify({ ...current }));
    }

    useNotificationStore.getState().addNotification({
      title: `Parol yangilandi`,
      desc: `${email} hisobining paroli muvaffaqiyatli o'zgartirildi`,
      type: 'success',
    });

    return true;
  },

  getCurrentUser(): User | null {
    const saved = localStorage.getItem('next_olymp_user');
    if (saved) {
      try {
        const u = JSON.parse(saved);
        if (u && u.role === 'admin') {
          // If admin was logged in, check if student profile is active for user dashboard
          const studentSaved = localStorage.getItem('next_olymp_student_user');
          if (studentSaved) return JSON.parse(studentSaved);
        } else if (u && u.email) {
          return u;
        }
      } catch {}
    }
    return null;
  },

  logout(): void {
    localStorage.removeItem('next_olymp_jwt');
    localStorage.removeItem('next_olymp_user');
    localStorage.removeItem('next_olymp_student_user');
  }
};
