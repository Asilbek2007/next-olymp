import { Certificate } from '../types';
import { MOCK_CERTIFICATES } from './mockData';

export const certificateService = {
  async getUserCertificates(userId: string): Promise<Certificate[]> {
    await new Promise((resolve) => setTimeout(resolve, 400));
    return MOCK_CERTIFICATES.filter((c) => c.userId === userId || userId === 'usr-student-1');
  },

  async verifyCertificate(code: string): Promise<Certificate | null> {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const cleanCode = code.trim().toUpperCase();
    const found = MOCK_CERTIFICATES.find((c) => c.verificationCode.toUpperCase() === cleanCode);
    if (found) return found;

    // Fallback search match or generate authentic mock verification for demo
    if (cleanCode.startsWith('NO-')) {
      return {
        id: `cert-gen-${cleanCode}`,
        userId: 'usr-demo',
        userName: 'Sardor Qodirov',
        olympiadId: 'olymp-math-2026',
        olympiadTitle: 'Respublika Matematika Iqtidorlari II Bosqichi',
        subject: 'math',
        type: 'winner',
        issuedAt: '2026-09-02T12:00:00Z',
        fileUrl: '#',
        verificationCode: cleanCode,
        score: 98,
        maxScore: 100,
        rank: 1,
        totalParticipants: 3420,
        grade: 11,
        school: 'Farg\'ona 2-sonli Al-Xorazmiy litseyi',
        region: 'Farg\'ona viloyati',
      };
    }
    return null;
  }
};
