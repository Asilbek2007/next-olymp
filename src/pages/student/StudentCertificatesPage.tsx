import React, { useEffect, useState } from 'react';
import { Sidebar } from '../../components/common/Sidebar';
import { CertificateCard } from '../../components/certificate/CertificateCard';
import { certificateService } from '../../services/certificateService';
import { Certificate } from '../../types';
import { useAuth } from '../../hooks/useAuth';

export const StudentCertificatesPage: React.FC = () => {
  const { user } = useAuth();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      certificateService.getUserCertificates(user.id).then((res) => {
        setCertificates(res);
        setIsLoading(false);
      });
    }
  }, [user]);

  return (
    <div className="flex bg-surface min-h-[calc(100vh-4rem)]">
      <Sidebar />

      <main className="flex-1 w-full min-w-0 transition-all duration-300 p-6 md:p-8 space-y-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-black text-accent-900">Sertifikatlarim</h1>
          <p className="text-xs text-accent-500">Next Olymp tomonidan taqdim etilgan rasmiy yutuq hujjatlari</p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-64 bg-white rounded-2xl animate-pulse" />
            <div className="h-64 bg-white rounded-2xl animate-pulse" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {certificates.map((cert) => (
              <CertificateCard key={cert.id} certificate={cert} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};
