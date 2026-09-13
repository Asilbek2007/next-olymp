import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ShieldCheck, Search, Award, CheckCircle2, AlertCircle } from 'lucide-react';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { CertificateCanvas } from '../../components/certificate/CertificateCanvas';
import { certificateService } from '../../services/certificateService';
import { Certificate } from '../../types';

export const VerifyCertificatePage: React.FC = () => {
  const { t } = useTranslation();
  const { code: routeCode } = useParams<{ code?: string }>();
  const [code, setCode] = useState(routeCode || '');
  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleVerify = async (searchCode: string) => {
    if (!searchCode.trim()) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await certificateService.verifyCertificate(searchCode);
      if (res) {
        setCertificate(res);
      } else {
        setCertificate(null);
        setError("Bunday verifikatsiya kodi bilan sertifikat topilmadi. Kodni qayta tekshiring.");
      }
    } catch {
      setError("Verifikatsiya so'rovida xatolik yuz berdi.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (routeCode) {
      handleVerify(routeCode);
    }
  }, [routeCode]);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      {/* Title */}
      <div className="text-center space-y-3">
        <div className="w-16 h-16 rounded-2xl bg-primary-50 text-primary-600 mx-auto flex items-center justify-center border border-primary-200 shadow-sm">
          <ShieldCheck className="w-10 h-10" />
        </div>
        <h1 className="text-3xl font-black text-accent-900 tracking-tight">{t('certificate.verifyTitle')}</h1>
        <p className="text-accent-600 text-sm max-w-md mx-auto">
          Next Olymp sertifikatlari ustidagi verifikatsiya kodini kiriting va rasmiy ma'lumotlarni tekshiring.
        </p>
      </div>

      {/* Input Search Form */}
      <div className="bg-white border border-border rounded-2xl p-6 shadow-xs max-w-xl mx-auto space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <Input
            placeholder={t('certificate.verifyInputPlaceholder')}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="font-mono uppercase font-bold"
          />
          <Button
            isLoading={isLoading}
            onClick={() => handleVerify(code)}
            leftIcon={<Search className="w-4 h-4" />}
            className="shrink-0"
          >
            {t('certificate.verifyButton')}
          </Button>
        </div>
      </div>

      {/* Verification Result */}
      {certificate && (
        <div className="space-y-6 animate-in fade-in">
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-800">
            <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
            <div>
              <h4 className="font-bold text-sm">{t('certificate.validCertificate')}</h4>
              <p className="text-xs">Ushbu hujjat Next Olymp serverlarida rasman ro'yxatga olingan va tasdiqlangan.</p>
            </div>
          </div>

          <CertificateCanvas certificate={certificate} />
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-rose-800 max-w-xl mx-auto">
          <AlertCircle className="w-6 h-6 text-rose-600 shrink-0" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}
    </div>
  );
};
