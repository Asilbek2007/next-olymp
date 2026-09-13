import React from 'react';
import { Certificate } from '../../types';
import { Award, ShieldCheck, QrCode } from 'lucide-react';

interface CertificateCanvasProps {
  certificate: Certificate;
}

export const CertificateCanvas: React.FC<CertificateCanvasProps> = ({ certificate }) => {
  return (
    <div className="relative w-full aspect-[1.414/1] bg-gradient-to-br from-slate-900 via-accent-950 to-slate-900 text-white rounded-2xl p-8 sm:p-12 shadow-2xl border-4 border-amber-400/80 overflow-hidden flex flex-col justify-between select-none">
      {/* Background Decorative Gold Geometry & N-Peak SVG Watermark */}
      <div className="absolute inset-0 pointer-events-none opacity-5">
        <svg className="w-full h-full text-amber-300" viewBox="0 0 100 100" preserveAspectRatio="none">
          <path d="M0,0 L100,0 L100,100 L0,100 Z" fill="none" stroke="currentColor" strokeWidth="1" />
          <path d="M10 10 L90 10 L90 90 L10 90 Z" fill="none" stroke="currentColor" strokeWidth="0.5" />
          <path d="M20 20 L80 20 L80 80 L20 80 Z" fill="none" stroke="currentColor" strokeWidth="0.25" />
        </svg>
      </div>

      {/* Header Seal & Platform Title */}
      <div className="relative z-10 flex items-start justify-between border-b border-amber-400/30 pb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-400 via-amber-500 to-yellow-600 p-0.5 shadow-lg flex items-center justify-center">
            <svg className="w-7 h-7 text-slate-950" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="m3 20 7-14 4 7 4-5 3 12H3z" fill="currentColor" fillOpacity="0.3" />
              <path d="m3 20 7-14 4 7 4-5 3 12" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black tracking-widest text-amber-400 uppercase">
              NEXT OLYMP
            </h2>
            <p className="text-[10px] text-slate-300 tracking-wider uppercase font-semibold">
              NATIONAL ACADEMIC COMPETITION CERTIFICATE
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-amber-400/10 border border-amber-400/40 text-amber-300 px-3 py-1.5 rounded-xl text-xs font-mono font-bold">
          <ShieldCheck className="w-4 h-4 text-amber-400" />
          <span>VERIFIED ID: {certificate.verificationCode}</span>
        </div>
      </div>

      {/* Main Award Body */}
      <div className="relative z-10 my-auto text-center space-y-4 py-6">
        <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40 text-xs uppercase tracking-widest font-bold">
          <Award className="w-4 h-4 text-amber-400" />
          <span>{certificate.type === 'winner' ? 'G\'OLIBLIK DIPLOMI' : 'MUVAFFAQIYAT SERTIFIKATI'}</span>
        </div>

        <p className="text-xs sm:text-sm text-slate-300 font-medium italic">
          Ushbu rasmiy sertifikat tasdiqlaydi-ki:
        </p>

        <h1 className="text-2xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-amber-200 to-amber-400 tracking-tight">
          {certificate.userName}
        </h1>

        <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
          <span className="font-semibold text-white">{certificate.olympiadTitle}</span> o'tkazilgan olimpiadada yuqori akademik natija ko'rsatib, <span className="text-amber-400 font-bold">{certificate.rank}-o'rinni</span> egalladi hamda <span className="text-emerald-400 font-bold">{certificate.score} ball ({certificate.maxScore} dan)</span> to'pladi.
        </p>
      </div>

      {/* Footer Signatures and Verification Stamp */}
      <div className="relative z-10 pt-4 border-t border-amber-400/30 flex items-center justify-between text-xs text-slate-400">
        <div className="space-y-1 text-left">
          <p className="text-[10px] uppercase font-bold text-slate-500">Berilgan sana</p>
          <p className="font-semibold text-white font-mono">{new Date(certificate.issuedAt).toLocaleDateString('uz-UZ')}</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-white p-1 flex items-center justify-center text-slate-900 shadow-md">
            <QrCode className="w-10 h-10 text-slate-900" />
          </div>
          <div className="text-left hidden sm:block">
            <p className="text-[10px] text-amber-400 font-bold uppercase">Haqiqiylik kodi</p>
            <p className="font-mono text-xs text-white">{certificate.verificationCode}</p>
          </div>
        </div>

        <div className="space-y-1 text-right">
          <p className="text-[10px] uppercase font-bold text-slate-500">Hakamlar Hay'ati</p>
          <p className="font-semibold text-amber-400 italic">Next Olymp Academic Board</p>
        </div>
      </div>
    </div>
  );
};
