import React from 'react';
import { Question } from '../../types';
import { useSubmission } from '../../hooks/useSubmission';
import { Upload, CheckCircle2, Code2, FileText, CheckSquare } from 'lucide-react';
import { clsx } from 'clsx';
import { useTranslation } from 'react-i18next';

interface QuestionCardProps {
  question: Question;
  questionNumber: number;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({ question, questionNumber }) => {
  const { t } = useTranslation();
  const { answers, saveDraft } = useSubmission();
  const currentAnswer = answers[question.id] || (question.type === 'code' ? question.codeTemplate || '' : '');

  const handleSelectOption = (opt: string) => {
    saveDraft(question.id, opt);
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    saveDraft(question.id, e.target.value);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      saveDraft(question.id, `Yuklandi: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`);
    }
  };

  return (
    <div className="bg-white border border-border rounded-2xl p-6 shadow-xs space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div className="flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-primary-50 text-primary-700 font-bold flex items-center justify-center text-sm">
            #{questionNumber}
          </span>
          <span className="text-xs uppercase font-bold text-accent-500 tracking-wider">
            {question.type === 'multiple_choice' ? 'Variantli Test' : question.type === 'open_text' ? 'Ochiq Savol' : question.type === 'code' ? 'Algoritmik Kod' : 'Fayl Yuklash'}
          </span>
        </div>
        <span className="px-2.5 py-1 bg-amber-50 text-amber-700 font-bold text-xs rounded-full border border-amber-200">
          {question.points} {t('contest.points')}
        </span>
      </div>

      {/* Content / Problem Statement */}
      <div className="prose max-w-none text-accent-900 font-medium text-base leading-relaxed">
        <p className="whitespace-pre-line">{question.content}</p>
      </div>

      {/* Interactive Answer Input based on Question Type */}
      <div className="pt-4 border-t border-border">
        {question.type === 'multiple_choice' && question.options && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {question.options.map((option, idx) => {
              const selected = currentAnswer === option;
              const optionLetter = String.fromCharCode(65 + idx); // A, B, C, D

              return (
                <button
                  key={idx}
                  onClick={() => handleSelectOption(option)}
                  className={clsx(
                    "flex items-center justify-between p-4 rounded-xl border text-left font-medium text-sm transition-all",
                    selected
                      ? "border-primary-600 bg-primary-50/70 text-primary-950 ring-2 ring-primary-500/20 shadow-xs"
                      : "border-border bg-white text-accent-800 hover:border-accent-300 hover:bg-surface"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <span className={clsx(
                      "w-7 h-7 rounded-lg font-bold text-xs flex items-center justify-center border",
                      selected ? "bg-primary text-white border-primary" : "bg-surface border-border text-accent-600"
                    )}>
                      {optionLetter}
                    </span>
                    <span>{option}</span>
                  </div>
                  {selected && <CheckCircle2 className="w-5 h-5 text-primary-600 shrink-0" />}
                </button>
              );
            })}
          </div>
        )}

        {question.type === 'open_text' && (
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-accent-600">
              Javobingizni kiriting (Matn yoki matematik qiymat):
            </label>
            <textarea
              rows={3}
              value={typeof currentAnswer === 'string' ? currentAnswer : ''}
              onChange={handleTextChange}
              placeholder="Javobingizni shu yerga yozing..."
              className="w-full p-4 rounded-xl border border-border bg-white text-accent-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono"
            />
          </div>
        )}

        {question.type === 'code' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between bg-accent-900 text-accent-200 px-4 py-2 rounded-t-xl text-xs font-mono">
              <div className="flex items-center gap-2">
                <Code2 className="w-4 h-4 text-emerald-400" />
                <span>IDE Code Editor ({question.codeLanguage?.toUpperCase() || 'C++'})</span>
              </div>
              <span className="text-[10px] text-accent-400">Autosaved to server</span>
            </div>
            <textarea
              rows={12}
              value={typeof currentAnswer === 'string' ? currentAnswer : ''}
              onChange={handleTextChange}
              className="w-full p-4 rounded-b-xl border border-accent-800 bg-accent-950 text-emerald-400 font-mono text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-primary-500 selection:bg-primary-600 selection:text-white"
            />
          </div>
        )}

        {question.type === 'file_upload' && (
          <div className="border-2 border-dashed border-border hover:border-primary-400 rounded-2xl p-8 text-center bg-surface transition-colors flex flex-col items-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-primary-100 text-primary-600 flex items-center justify-center">
              <Upload className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-accent-900">{t('contest.uploadFile')}</p>
              <p className="text-xs text-accent-500">Maksimal hajmi: 25 MB (PDF, ZIP, PNG, JPG)</p>
            </div>
            <label className="cursor-pointer">
              <span className="inline-flex items-center px-4 py-2 rounded-lg bg-white border border-border text-xs font-bold text-accent-800 shadow-2xs hover:bg-accent-50">
                {t('contest.chooseFile')}
              </span>
              <input type="file" onChange={handleFileUpload} className="hidden" />
            </label>
            {typeof currentAnswer === 'string' && currentAnswer.startsWith('Yuklandi:') && (
              <div className="mt-2 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>{currentAnswer}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
