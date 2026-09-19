import { Certificate } from '../types';
import { MOCK_CERTIFICATES } from './mockData';

export const certificateService = {
  async getUserCertificates(userId: string): Promise<Certificate[]> {
    await new Promise((resolve) => setTimeout(resolve, 100));
    try {
      const saved = localStorage.getItem(`user_certificates_${userId}`);
      if (saved) {
        return JSON.parse(saved);
      }
      const allCertsKey = 'next_olymp_all_issued_certificates';
      const stored = localStorage.getItem(allCertsKey);
      const all: Certificate[] = stored ? JSON.parse(stored) : MOCK_CERTIFICATES;
      // return user's certs or all fallback if mock
      const userCerts = all.filter(c => c.userId === userId);
      return userCerts.length > 0 ? userCerts : all.slice(0, 2);
    } catch {
      return MOCK_CERTIFICATES.slice(0, 2);
    }
  },

  async verifyCertificate(code: string): Promise<Certificate | null> {
    await new Promise((resolve) => setTimeout(resolve, 200));
    const cleanCode = code.trim().toUpperCase();
    try {
      const allCertsKey = 'next_olymp_all_issued_certificates';
      const stored = localStorage.getItem(allCertsKey);
      const all: Certificate[] = stored ? JSON.parse(stored) : MOCK_CERTIFICATES;
      return all.find((c) => c.verificationCode.toUpperCase() === cleanCode) || null;
    } catch {
      return MOCK_CERTIFICATES.find((c) => c.verificationCode.toUpperCase() === cleanCode) || null;
    }
  },

  async getAllCertificates(): Promise<Certificate[]> {
    try {
      const allCertsKey = 'next_olymp_all_issued_certificates';
      const stored = localStorage.getItem(allCertsKey);
      return stored ? JSON.parse(stored) : MOCK_CERTIFICATES;
    } catch {
      return MOCK_CERTIFICATES;
    }
  },

  saveCertificate(cert: Certificate): void {
    try {
      const allCertsKey = 'next_olymp_all_issued_certificates';
      const stored = localStorage.getItem(allCertsKey);
      const all: Certificate[] = stored ? JSON.parse(stored) : [...MOCK_CERTIFICATES];
      const index = all.findIndex(c => c.id === cert.id || c.verificationCode === cert.verificationCode);
      if (index >= 0) {
        all[index] = cert;
      } else {
        all.unshift(cert);
      }
      localStorage.setItem(allCertsKey, JSON.stringify(all));
    } catch (e) {
      console.error("Failed to save certificate:", e);
    }
  }
};

