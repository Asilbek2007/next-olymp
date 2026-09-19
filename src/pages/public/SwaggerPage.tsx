import React, { useState } from 'react';
import { Database, Play, CheckCircle2, Copy, Check, ExternalLink, Code2, RefreshCw } from 'lucide-react';

interface Endpoint {
  id: string;
  method: 'GET' | 'POST' | 'DELETE';
  path: string;
  category: string;
  title: string;
  description: string;
  defaultParams?: string;
  defaultBody?: string;
}

const ENDPOINTS: Endpoint[] = [
  {
    id: 'users_get',
    method: 'GET',
    path: '/api/users.php',
    category: 'Foydalanuvchilar (Users)',
    title: 'Barcha foydalanuvchilar ro\'yxatini olish',
    description: 'MySQL users jadvalidan barcha foydalanuvchilar ma\'lumotlarini JSON massiv holida qaytaradi.',
    defaultParams: '',
  },
  {
    id: 'users_post',
    method: 'POST',
    path: '/api/users.php',
    category: 'Foydalanuvchilar (Users)',
    title: 'Foydalanuvchi yaratish yoki ballini yangilash',
    description: 'Yangi foydalanuvchi ma\'lumotlarini yoki natijasini MySQL bazasiga saqlaydi.',
    defaultBody: JSON.stringify({
      fullName: 'Jasur Aliyev',
      email: 'jasur@nextolymp.uz',
      phone: '+998901234567',
      role: 'student',
      grade: 9,
      region: 'Toshkent shahri',
      district: 'Yunusobod',
      school: '72-maktab'
    }, null, 2)
  },
  {
    id: 'olympiads_get',
    method: 'GET',
    path: '/api/olympiads.php',
    category: 'Olimpiadalar (Olympiads)',
    title: 'Barcha olimpiadalar ro\'yxatini olish',
    description: 'MySQL olympiads va questions jadvallaridagi barcha musobaqalar va ularga biriktirilgan savollarni qaytaradi.',
    defaultParams: '',
  },
  {
    id: 'olympiads_post',
    method: 'POST',
    path: '/api/olympiads.php',
    category: 'Olimpiadalar (Olympiads)',
    title: 'Olimpiada yaratish yoki tahrirlash',
    description: 'Yangi olimpiada va uning barcha savollarini MySQL bazasiga yozadi.',
    defaultBody: JSON.stringify({
      id: 'OLY-101',
      title: 'Matematika Respublika Olimpiadasi',
      subject: 'math',
      durationMinutes: 60,
      maxScore: 100,
      isFree: true,
      questions: [
        {
          content: '2 + 2 = ?',
          options: ['3', '4', '5', '6'],
          correctAnswer: 'B',
          points: 4
        }
      ]
    }, null, 2)
  },
  {
    id: 'national_exams_get',
    method: 'GET',
    path: '/api/national-exams.php',
    category: 'Milliy Sertifikat (National Exams)',
    title: 'Milliy sertifikat imtihonlarini olish',
    description: 'MySQL national_exams jadvalidagi barcha rasmiy sertifikat imtihonlarini qaytaradi.',
    defaultParams: '',
  },
  {
    id: 'submit_post',
    method: 'POST',
    path: '/api/submit.php',
    category: 'Natijalar (Submissions)',
    title: 'Test natijalarini topshirish (Submit)',
    description: 'Foydalanuvchi ishlagan javoblarni, ballni va vaqtni MySQL submissions jadvaliga saqlaydi.',
    defaultBody: JSON.stringify({
      userId: 'usr_test_1',
      userName: 'Jasur Aliyev',
      olympiadId: 'OLY-101',
      olympiadTitle: 'Matematika Olimpiadasi',
      score: 88,
      maxScore: 100,
      timeSpentMinutes: 45,
      answers: { q1: 'B', q2: 'C' }
    }, null, 2)
  },
  {
    id: 'auth_login',
    method: 'POST',
    path: '/api/auth.php?action=login',
    category: 'Avtorizatsiya (Auth)',
    title: 'MySQL orqali kirish (Login)',
    description: 'Email va parol orqali MySQL users jadvalidan foydalanuvchini tekshiradi va JWT token qaytaradi.',
    defaultBody: JSON.stringify({
      email: 'user@nextolymp.uz',
      password: 'mypassword123'
    }, null, 2)
  }
];

export const SwaggerPage: React.FC = () => {
  const [selectedEndpoint, setSelectedEndpoint] = useState<Endpoint>(ENDPOINTS[0]);
  const [queryParams, setQueryParams] = useState<string>('');
  const [requestBody, setRequestBody] = useState<string>(ENDPOINTS[0].defaultBody || '');
  const [loading, setLoading] = useState<boolean>(false);
  const [responseStatus, setResponseStatus] = useState<number | null>(null);
  const [responseData, setResponseData] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  const handleSelect = (ep: Endpoint) => {
    setSelectedEndpoint(ep);
    setQueryParams(ep.defaultParams || '');
    setRequestBody(ep.defaultBody || '');
    setResponseStatus(null);
    setResponseData(null);
  };

  const handleExecute = async () => {
    setLoading(true);
    setResponseStatus(null);
    setResponseData(null);

    try {
      const url = queryParams ? `${selectedEndpoint.path}?${queryParams}` : selectedEndpoint.path;
      const options: RequestInit = {
        method: selectedEndpoint.method,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      };

      if (selectedEndpoint.method !== 'GET' && requestBody.trim()) {
        options.body = requestBody;
      }

      const res = await fetch(url, options);
      setResponseStatus(res.status);
      const text = await res.text();

      try {
        const json = JSON.parse(text);
        setResponseData(JSON.stringify(json, null, 2));
      } catch {
        setResponseData(text);
      }
    } catch (err: any) {
      setResponseStatus(500);
      setResponseData(JSON.stringify({ error: err.message || 'Tarmoq xatosi' }, null, 2));
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (responseData) {
      navigator.clipboard.writeText(responseData);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getMethodBadge = (m: string) => {
    switch (m) {
      case 'GET':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'POST':
        return 'bg-sky-500/10 text-sky-400 border-sky-500/30';
      case 'DELETE':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      default:
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
    }
  };

  return (
    <div className="min-h-screen bg-[#070D1E] text-slate-100 flex flex-col font-sans">
      {/* Top Bar */}
      <header className="border-b border-slate-800/80 bg-[#0B1329] px-6 py-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-600/20 text-indigo-400 rounded-xl border border-indigo-500/30">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-white tracking-tight">NextOlymp REST API Explorer</h1>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                MySQL Live
              </span>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                OpenAPI 3.0
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Barcha so'rovlar to'g'ridan-to'g'ri UzCloud MySQL serveriga yuboriladi va saqlanadi
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <a
            href="/api/swagger.json"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-lg border border-slate-700/60 transition-all"
          >
            <Code2 className="w-3.5 h-3.5 text-amber-400" />
            <span>swagger.json</span>
          </a>
          <a
            href="/api/docs/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg shadow-sm transition-all"
          >
            <span>Klassik Swagger UI</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </header>

      {/* Main Two-Column Layout */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Endpoints Menu */}
        <div className="lg:col-span-4 space-y-2">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3 px-1">
            Mavjud Endpointlar ({ENDPOINTS.length})
          </div>

          <div className="space-y-2">
            {ENDPOINTS.map((ep) => {
              const isSelected = selectedEndpoint.id === ep.id;
              return (
                <button
                  key={ep.id}
                  onClick={() => handleSelect(ep)}
                  className={`w-full text-left p-3 rounded-xl border transition-all flex flex-col gap-1.5 ${
                    isSelected
                      ? 'bg-slate-800/90 border-indigo-500/50 shadow-md shadow-indigo-950/40'
                      : 'bg-slate-900/40 border-slate-800/60 hover:bg-slate-800/50 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider border ${getMethodBadge(
                        ep.method
                      )}`}
                    >
                      {ep.method}
                    </span>
                    <span className="text-xs font-mono text-slate-300 truncate">{ep.path}</span>
                  </div>
                  <div className="text-xs text-slate-200 font-medium">{ep.title}</div>
                  <div className="text-[11px] text-slate-400 truncate">{ep.category}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Interactive Tester & Response Viewer */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          {/* Active Endpoint Card */}
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
              <div className="flex items-center gap-2.5">
                <span
                  className={`px-2.5 py-1 rounded-md text-xs font-bold border ${getMethodBadge(
                    selectedEndpoint.method
                  )}`}
                >
                  {selectedEndpoint.method}
                </span>
                <span className="text-sm font-mono text-white font-semibold">{selectedEndpoint.path}</span>
              </div>
              <button
                onClick={handleExecute}
                disabled={loading}
                className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-semibold rounded-xl shadow-lg shadow-emerald-950/50 transition-all cursor-pointer"
              >
                {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                <span>{loading ? "Yuborilmoqda..." : "So'rovni bajarish (Execute)"}</span>
              </button>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-white">{selectedEndpoint.title}</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">{selectedEndpoint.description}</p>
            </div>

            {/* Request Body (For POST/PUT) */}
            {selectedEndpoint.method !== 'GET' && (
              <div className="space-y-1.5">
                <div className="text-xs font-semibold text-slate-300">Request Body (JSON):</div>
                <textarea
                  value={requestBody}
                  onChange={(e) => setRequestBody(e.target.value)}
                  rows={8}
                  className="w-full bg-[#050B1E] border border-slate-800 rounded-xl p-3 text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
            )}
          </div>

          {/* Response Viewer */}
          <div className="flex-1 min-h-[320px] rounded-2xl bg-slate-900/60 border border-slate-800 p-5 flex flex-col gap-3">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="text-xs font-semibold text-slate-300">Server Javobi (Response):</span>
                {responseStatus !== null && (
                  <span
                    className={`px-2 py-0.5 rounded text-[11px] font-bold border ${
                      responseStatus >= 200 && responseStatus < 300
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                        : 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                    }`}
                  >
                    {responseStatus} {responseStatus === 200 ? 'OK' : 'Response'}
                  </span>
                )}
              </div>

              {responseData && (
                <button
                  onClick={handleCopy}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-800 rounded-lg border border-slate-700/50 transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Nusxa olindi' : 'Nusxalash'}</span>
                </button>
              )}
            </div>

            <div className="flex-1 w-full bg-[#050B1E] rounded-xl border border-slate-800/80 p-4 font-mono text-xs overflow-auto max-h-[480px]">
              {responseData ? (
                <pre className="text-slate-200 whitespace-pre-wrap">{responseData}</pre>
              ) : (
                <div className="h-full min-h-[160px] flex flex-col items-center justify-center text-slate-500 text-xs">
                  <Play className="w-6 h-6 mb-2 stroke-1" />
                  <span>"So'rovni bajarish" tugmasini bosing — serverdan MySQL ma'lumotlari bu yerda chiqadi</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
