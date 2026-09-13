import { Certificate } from '../types';

export const certificateService = {
  async getUserCertificates(userId: string): Promise<Certificate[]> {
    await new Promise((resolve) => setTimeout(resolve, 100));
    try {
      const saved = localStorage.getItem(`user_certificates_${userId}`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  },

  async verifyCertificate(code: string): Promise<Certificate | null> {
    await new Promise((resolve) => setTimeout(resolve, 200));
    const cleanCode = code.trim().toUpperCase();
    try {
      const allCertsKey = 'next_olymp_all_issued_certificates';
      const stored = localStorage.getItem(allCertsKey);
      const all: Certificate[] = stored ? JSON.parse(stored) : [];
      return all.find((c) => c.verificationCode.toUpperCase() === cleanCode) || null;
    } catch {
      return null;
    }
  }
};
