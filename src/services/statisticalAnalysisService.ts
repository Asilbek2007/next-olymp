// src/services/statisticalAnalysisService.ts — Statistical Cheating & AI Forensic Anomaly Detection Engine
import { useSecurityStore } from '../store/useSecurityStore';

export interface StudentSubmissionRecord {
  userId: string;
  studentName: string;
  school: string;
  district: string;
  region: string;
  ipAddress: string;
  totalScore: number;
  totalTimeSec: number;
  answers: Array<{
    questionId: string;
    questionText: string;
    points: number;
    userAnswer: string;
    isCorrect: boolean;
    timeSpentSec: number;
    timestamp: string;
  }>;
}

export interface StatisticalAnomalyResult {
  userId: string;
  studentName: string;
  anomalyScore: number; // 0..100
  riskLevel: 'past' | 'orta' | 'yuqori' | 'kritik';
  suspiciousReasons: string[];
  superhumanAnswersCount: number;
  collusionMatches: Array<{
    targetUserId: string;
    targetName: string;
    similarityPercent: number;
    identicalMistakesCount: number;
    relation: 'bir_maktab' | 'bir_tuman' | 'bir_ip' | 'umumiy';
  }>;
}

export interface AiForensicReport {
  overallVerdict: 'Toza (Halol)' | 'Shubhali (Qo\'shimcha Tekshiruv)' | 'Aniq Qoidabuzarlik (Cheat)';
  confidence: number;
  summary: string;
  detectedPatterns: string[];
  recommendation: string;
}

// ─── 1. Response Time Anomaly Calculator ──────────────────────────────────────
export class ResponseTimeAnalyzer {
  /**
   * Evaluates if a given question was solved in a "superhuman" or bot-like speed
   */
  public static evaluateQuestionTime(
    questionText: string,
    points: number,
    timeSpentSec: number
  ): { isSuperhuman: boolean; minExpectedSec: number; speedRatio: number } {
    const wordCount = questionText.split(/\s+/).length;
    // Reading speed: ~4 words/sec + 5-15s per mathematical reasoning step
    const minReadingTime = Math.max(2, wordCount / 4.5);
    const minThinkingTime = points >= 20 ? 12 : points >= 15 ? 8 : 4;
    const minExpectedSec = Math.round(minReadingTime + minThinkingTime);

    const isSuperhuman = timeSpentSec < Math.max(2, minExpectedSec * 0.25);
    const speedRatio = timeSpentSec > 0 ? Number((minExpectedSec / timeSpentSec).toFixed(1)) : 99;

    return {
      isSuperhuman,
      minExpectedSec,
      speedRatio,
    };
  }
}

// ─── 2. Clustered / Collusion Similarity Matcher ──────────────────────────────
export class CollusionClusterAnalyzer {
  /**
   * Compares two student submission records to detect identical mistake patterns & collusion
   */
  public static compareSubmissions(
    a: StudentSubmissionRecord,
    b: StudentSubmissionRecord
  ): {
    similarityPercent: number;
    identicalMistakesCount: number;
    identicalAnswersCount: number;
    isCollusionSuspicious: boolean;
  } {
    if (a.userId === b.userId) {
      return { similarityPercent: 100, identicalMistakesCount: 0, identicalAnswersCount: 0, isCollusionSuspicious: false };
    }

    let matchingAnswers = 0;
    let matchingMistakes = 0;
    const totalQuestions = Math.max(a.answers.length, b.answers.length, 1);

    const bMap = new Map(b.answers.map((ans) => [ans.questionId, ans]));

    for (const ansA of a.answers) {
      const ansB = bMap.get(ansA.questionId);
      if (!ansB) continue;

      if (ansA.userAnswer && ansA.userAnswer === ansB.userAnswer) {
        matchingAnswers++;
        if (!ansA.isCorrect && !ansB.isCorrect) {
          matchingMistakes++;
        }
      }
    }

    const similarityPercent = Math.round((matchingAnswers / totalQuestions) * 100);
    // Suspicious if:
    // 1. > 85% answer similarity AND > 2 identical incorrect answers (rare common mistakes)
    // 2. Or identical submission times from same IP/school
    const isCollusionSuspicious =
      (similarityPercent >= 85 && matchingMistakes >= 2) ||
      (a.ipAddress === b.ipAddress && similarityPercent >= 75);

    return {
      similarityPercent,
      identicalMistakesCount: matchingMistakes,
      identicalAnswersCount: matchingAnswers,
      isCollusionSuspicious,
    };
  }
}

// ─── 3. Full Statistical Anomaly Inspector ────────────────────────────────────
export function analyzeStudentRecord(
  student: StudentSubmissionRecord,
  allStudents: StudentSubmissionRecord[]
): StatisticalAnomalyResult {
  const suspiciousReasons: string[] = [];
  let superhumanCount = 0;

  // 1. Check response times on each question
  for (const ans of student.answers) {
    const timeEval = ResponseTimeAnalyzer.evaluateQuestionTime(ans.questionText, ans.points, ans.timeSpentSec);
    if (timeEval.isSuperhuman && ans.isCorrect) {
      superhumanCount++;
      suspiciousReasons.push(
        `Savol (${ans.points} ball) atigi ${ans.timeSpentSec} soniyada to'g'ri yechildi (Kutilgan vaqt: ~${timeEval.minExpectedSec}s)`
      );
    }
  }

  // 2. Check collusion with all other students
  const collusionMatches: StatisticalAnomalyResult['collusionMatches'] = [];

  for (const other of allStudents) {
    if (other.userId === student.userId) continue;

    const comp = CollusionClusterAnalyzer.compareSubmissions(student, other);
    if (comp.isCollusionSuspicious) {
      let relation: 'bir_maktab' | 'bir_tuman' | 'bir_ip' | 'umumiy' = 'umumiy';
      if (student.ipAddress && student.ipAddress === other.ipAddress) {
        relation = 'bir_ip';
      } else if (student.school && student.school === other.school) {
        relation = 'bir_maktab';
      } else if (student.district && student.district === other.district) {
        relation = 'bir_tuman';
      }

      collusionMatches.push({
        targetUserId: other.userId,
        targetName: other.studentName,
        similarityPercent: comp.similarityPercent,
        identicalMistakesCount: comp.identicalMistakesCount,
        relation,
      });

      suspiciousReasons.push(
        `${other.studentName} bilan ${comp.similarityPercent}% bir xil javoblar va ${comp.identicalMistakesCount} ta bir xil xato javob aniqlandi (${relation.replace('_', ' ')})`
      );
    }
  }

  // Calculate composite Anomaly Score (0..100)
  let anomalyScore = 0;
  if (superhumanCount >= 3) anomalyScore += 45;
  else if (superhumanCount >= 1) anomalyScore += 25;

  if (collusionMatches.length >= 2) anomalyScore += 50;
  else if (collusionMatches.length === 1) anomalyScore += 35;

  anomalyScore = Math.min(98, anomalyScore);

  let riskLevel: 'past' | 'orta' | 'yuqori' | 'kritik' = 'past';
  if (anomalyScore >= 75) riskLevel = 'kritik';
  else if (anomalyScore >= 50) riskLevel = 'yuqori';
  else if (anomalyScore >= 25) riskLevel = 'orta';

  return {
    userId: student.userId,
    studentName: student.studentName,
    anomalyScore,
    riskLevel,
    suspiciousReasons,
    superhumanAnswersCount: superhumanCount,
    collusionMatches,
  };
}

// ─── 4. AI Post-Exam Forensic Investigator (Gemini 3.7) ───────────────────────
export async function generateAiForensicReport(
  student: StudentSubmissionRecord,
  anomaly: StatisticalAnomalyResult
): Promise<AiForensicReport> {
  const secStore = useSecurityStore.getState();
  const apiKey = secStore.getActiveApiKey();

  const fallbackReport: AiForensicReport = {
    overallVerdict: anomaly.anomalyScore >= 60 ? 'Aniq Qoidabuzarlik (Cheat)' : anomaly.anomalyScore >= 30 ? 'Shubhali (Qo\'shimcha Tekshiruv)' : 'Toza (Halol)',
    confidence: anomaly.anomalyScore >= 60 ? 94 : 88,
    summary: anomaly.suspiciousReasons.length > 0
      ? `Statistik anomaliya tahlili: ${anomaly.suspiciousReasons.join('. ')}`
      : "O'quvchining javob berish tezligi va boshqa ishtirokchilar bilan natijalar taqqoslanishi me'yoriy chegarada.",
    detectedPatterns: [
      `Jami ball: ${student.totalScore} XP`,
      `Tezkor javoblar: ${anomaly.superhumanAnswersCount} ta savolda o'ta yuqori tezlik`,
      `Klasterli mosliklar: ${anomaly.collusionMatches.length} ta o'quvchi bilan shubhali bog'liqlik`,
    ],
    recommendation: anomaly.anomalyScore >= 60
      ? "Natijani qayta tekshirish uchun komissiyaga yuborish yoki video yozuvlarni chuqur ko'rib chiqish tavsiya etiladi."
      : "Natija qonuniy deb topildi.",
  };

  if (!apiKey || apiKey.startsWith('AI-KEY-DEMO')) {
    return fallbackReport;
  }

  try {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.7-flash:generateContent?key=${apiKey.trim()}`;
    const prompt = `Siz onlayn akademik olimpiada va musobaqalar bo'yicha Sud-Ekspertiza (Forensic AI) ekspertisiz.
Quyidagi o'quvchi imtihon statistikasi bo'yicha tahlil bering:
O'quvchi: ${student.studentName} (${student.school}, ${student.district})
Jami Ball: ${student.totalScore}
Statistik anomaliya ko'rsatkichi: ${anomaly.anomalyScore}/100
Shubhali omillar: ${JSON.stringify(anomaly.suspiciousReasons)}
Klasterli mosliklar: ${JSON.stringify(anomaly.collusionMatches)}

Faqat va faqat quyidagi toza JSON formatida javob bering (boshqa matn qo'shmang):
{
  "overallVerdict": "Toza (Halol)" | "Shubhali (Qo'shimcha Tekshiruv)" | "Aniq Qoidabuzarlik (Cheat)",
  "confidence": number,
  "summary": string,
  "detectedPatterns": string[],
  "recommendation": string
}`;

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.2, maxOutputTokens: 500 },
      }),
    });

    if (res.ok) {
      const data = await res.json();
      const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      const match = rawText.match(/\{[\s\S]*\}/);
      if (match) {
        const parsed = JSON.parse(match[0]);
        return {
          overallVerdict: parsed.overallVerdict || fallbackReport.overallVerdict,
          confidence: Number(parsed.confidence) || 90,
          summary: String(parsed.summary || fallbackReport.summary),
          detectedPatterns: Array.isArray(parsed.detectedPatterns) ? parsed.detectedPatterns : fallbackReport.detectedPatterns,
          recommendation: String(parsed.recommendation || fallbackReport.recommendation),
        };
      }
    }
  } catch (err) {
    console.warn('[Forensic AI] Gemini error:', err);
  }

  return fallbackReport;
}

// ─── Initial Demo Datasets for Forensic Lab ───────────────────────────────────
export const DEMO_SUBMISSION_RECORDS: StudentSubmissionRecord[] = [
  {
    userId: 'usr-collude-1',
    studentName: 'Sardorbek Rahimov',
    school: 'Prezident Maktabi',
    district: 'Yunusobod tumani',
    region: 'Toshkent shahri',
    ipAddress: '195.158.3.10',
    totalScore: 100,
    totalTimeSec: 184, // Suspiciously fast for 5 math questions (3 mins)
    answers: [
      { questionId: 'q-1', questionText: "Agar f(x) = 3x^2 - 4x + 5 bo'lsa, f'(2) hosilaning qiymatini toping.", points: 10, userAnswer: '8', isCorrect: true, timeSpentSec: 2.1, timestamp: '10:05:02' },
      { questionId: 'q-2', questionText: "Uchburchakning tomonlari 5 sm, 12 sm va 13 sm. Uchburchak yuzini toping.", points: 15, userAnswer: '30', isCorrect: true, timeSpentSec: 3.4, timestamp: '10:05:15' },
      { questionId: 'q-3', questionText: "Noma'lum x tenglamani yeching: 2^(x+1) + 2^x = 48.", points: 20, userAnswer: '4', isCorrect: true, timeSpentSec: 4.2, timestamp: '10:05:32' },
      { questionId: 'q-4', questionText: "Tub sonlar yig'indisi algoritmi.", points: 25, userAnswer: '#include <iostream>...', isCorrect: true, timeSpentSec: 12.0, timestamp: '10:06:20' },
      { questionId: 'q-5', questionText: "Geometrik isbot chizmasi.", points: 30, userAnswer: 'isbot.pdf', isCorrect: true, timeSpentSec: 25.0, timestamp: '10:07:05' },
    ],
  },
  {
    userId: 'usr-collude-2',
    studentName: 'Javohir Zokirov',
    school: 'Prezident Maktabi',
    district: 'Yunusobod tumani',
    region: 'Toshkent shahri',
    ipAddress: '195.158.3.10', // Identical IP & school
    totalScore: 85,
    totalTimeSec: 210,
    answers: [
      { questionId: 'q-1', questionText: "Agar f(x) = 3x^2 - 4x + 5 bo'lsa, f'(2) hosilaning qiymatini toping.", points: 10, userAnswer: '8', isCorrect: true, timeSpentSec: 2.3, timestamp: '10:05:06' },
      { questionId: 'q-2', questionText: "Uchburchakning tomonlari 5 sm, 12 sm va 13 sm. Uchburchak yuzini toping.", points: 15, userAnswer: '30', isCorrect: true, timeSpentSec: 3.1, timestamp: '10:05:18' },
      { questionId: 'q-3', questionText: "Noma'lum x tenglamani yeching: 2^(x+1) + 2^x = 48.", points: 20, userAnswer: '6', isCorrect: false, timeSpentSec: 5.0, timestamp: '10:05:39' }, // Identical mistake
      { questionId: 'q-4', questionText: "Tub sonlar yig'indisi algoritmi.", points: 25, userAnswer: '#include <iostream>...', isCorrect: true, timeSpentSec: 14.0, timestamp: '10:06:28' },
      { questionId: 'q-5', questionText: "Geometrik isbot chizmasi.", points: 30, userAnswer: 'isbot.pdf', isCorrect: true, timeSpentSec: 30.0, timestamp: '10:07:20' },
    ],
  },
  {
    userId: 'usr-honest-1',
    studentName: 'Madinabonu Karimova',
    school: '5-sonli ixtisoslashtirilgan maktab',
    district: 'Chilonzor tumani',
    region: 'Toshkent shahri',
    ipAddress: '213.230.82.44',
    totalScore: 95,
    totalTimeSec: 2450, // Normal natural 40 mins
    answers: [
      { questionId: 'q-1', questionText: "Agar f(x) = 3x^2 - 4x + 5 bo'lsa, f'(2) hosilaning qiymatini toping.", points: 10, userAnswer: '8', isCorrect: true, timeSpentSec: 45.0, timestamp: '10:12:30' },
      { questionId: 'q-2', questionText: "Uchburchakning tomonlari 5 sm, 12 sm va 13 sm. Uchburchak yuzini toping.", points: 15, userAnswer: '30', isCorrect: true, timeSpentSec: 92.0, timestamp: '10:18:45' },
      { questionId: 'q-3', questionText: "Noma'lum x tenglamani yeching: 2^(x+1) + 2^x = 48.", points: 20, userAnswer: '4', isCorrect: true, timeSpentSec: 180.0, timestamp: '10:28:10' },
      { questionId: 'q-4', questionText: "Tub sonlar yig'indisi algoritmi.", points: 25, userAnswer: '#include <iostream>...', isCorrect: true, timeSpentSec: 420.0, timestamp: '10:39:50' },
      { questionId: 'q-5', questionText: "Geometrik isbot chizmasi.", points: 30, userAnswer: 'yechim_varaq.jpg', isCorrect: true, timeSpentSec: 600.0, timestamp: '10:52:15' },
    ],
  },
];
