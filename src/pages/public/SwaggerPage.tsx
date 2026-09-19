import React from 'react';
import { ExternalLink, Database, Code2, ShieldCheck, CheckCircle2 } from 'lucide-react';

export const SwaggerPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Header */}
      <div className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-md px-6 py-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-600/20 text-indigo-400 rounded-xl border border-indigo-500/30">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-white tracking-tight">NextOlymp REST API Hujjatlari</h1>
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                MySQL Live
              </span>
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                Swagger 3.0
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Barcha so'rovlar to'g'ridan-to'g'ri UzCloud MySQL serveriga yuboriladi va saqlanadi
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="/api/docs/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-indigo-600/20 transition-all"
          >
            <span>To'liq ekranda ochish</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <a
            href="/api/users.php"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-xl border border-slate-700 transition-all"
          >
            <Code2 className="w-3.5 h-3.5 text-sky-400" />
            <span>/api/users.php (JSON)</span>
          </a>
        </div>
      </div>

      {/* Quick Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-6 bg-slate-900/30 border-b border-slate-800/80">
        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <div>
            <div className="text-xs font-semibold text-slate-300">GET /api/users.php</div>
            <div className="text-[11px] text-slate-400">Foydalanuvchilar bazasi (MySQL)</div>
          </div>
        </div>
        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-indigo-400 flex-shrink-0" />
          <div>
            <div className="text-xs font-semibold text-slate-300">GET/POST /api/olympiads.php</div>
            <div className="text-[11px] text-slate-400">Olimpiadalar va savollar CRUD</div>
          </div>
        </div>
        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-purple-400 flex-shrink-0" />
          <div>
            <div className="text-xs font-semibold text-slate-300">POST /api/submit.php</div>
            <div className="text-[11px] text-slate-400">Javoblarni topshirish va baholash</div>
          </div>
        </div>
        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center gap-3">
          <ShieldCheck className="w-5 h-5 text-amber-400 flex-shrink-0" />
          <div>
            <div className="text-xs font-semibold text-slate-300">POST /api/auth.php</div>
            <div className="text-[11px] text-slate-400">MySQL xavfsiz avtorizatsiya</div>
          </div>
        </div>
      </div>

      {/* Embedded Swagger UI Iframe */}
      <div className="flex-1 w-full relative min-h-[750px]">
        <iframe
          src="/api/docs/"
          title="Swagger UI"
          className="w-full h-full absolute inset-0 border-0"
        />
      </div>
    </div>
  );
};
