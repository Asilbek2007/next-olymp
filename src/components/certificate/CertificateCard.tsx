import React, { useState } from 'react';
import { Certificate } from '../../types';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import { CertificateCanvas } from './CertificateCanvas';
import { Award, Download, CheckCircle2, ExternalLink } from 'lucide-react';
import confetti from 'canvas-confetti';

interface CertificateCardProps {
  certificate: Certificate;
}

export const CertificateCard: React.FC<CertificateCardProps> = ({ certificate }) => {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const handleDownload = () => {
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.6 }
    });
    alert(`Sertifikat (PDF) yuklab olindi! Verifikatsiya kodi: ${certificate.verificationCode}`);
  };

  return (
    <>
      <Card hoverEffect className="p-6 space-y-4">
        <div className="flex items-start justify-between">
          <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center">
            <Award className="w-6 h-6" />
          </div>
          <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 font-bold text-xs rounded-full border border-emerald-200 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Tasdiqlangan</span>
          </span>
        </div>

        <div className="space-y-1">
          <span className="text-xs uppercase font-bold text-accent-400 tracking-wider">
            {certificate.subject} • {certificate.type === 'winner' ? 'G\'oliblik Diplomi' : 'Ishtirok Sertifikati'}
          </span>
          <h3 className="font-bold text-accent-900 text-base leading-snug line-clamp-2">
            {certificate.olympiadTitle}
          </h3>
        </div>

        <div className="pt-3 border-t border-border flex items-center justify-between text-xs text-accent-600">
          <div>
            <span className="text-accent-400">Natija: </span>
            <span className="font-bold text-primary">{certificate.score} ball</span> ({certificate.rank}-o'rin)
          </div>
          <div className="font-mono text-accent-500">{certificate.verificationCode}</div>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-2">
          <Button variant="outline" size="sm" onClick={() => setIsPreviewOpen(true)} leftIcon={<ExternalLink className="w-4 h-4" />}>
            Ko'rish
          </Button>
          <Button variant="primary" size="sm" onClick={handleDownload} leftIcon={<Download className="w-4 h-4" />}>
            PDF Yuklash
          </Button>
        </div>
      </Card>

      <Modal isOpen={isPreviewOpen} onClose={() => setIsPreviewOpen(false)} title="Sertifikat Ko'rinishi" size="xl">
        <div className="space-y-6 p-2">
          <CertificateCanvas certificate={certificate} />
          <div className="flex justify-between items-center pt-2">
            <span className="text-xs text-accent-500 font-mono">
              Verifikatsiya havola: /verify/{certificate.verificationCode}
            </span>
            <Button variant="primary" onClick={handleDownload} leftIcon={<Download className="w-4 h-4" />}>
              Yuqori aniqlikdagi PDF sifatida saqlash
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};
