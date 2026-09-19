import { create } from 'zustand';
import { NationalExamItem, INITIAL_NATIONAL_EXAMS } from '../data/initialNationalExams';

const STORAGE_KEY = 'next_olymp_national_exams_v1';

interface NationalExamStore {
  exams: NationalExamItem[];
  addExam: (item: Omit<NationalExamItem, 'id' | 'registeredCount' | 'submittedCount' | 'paidCount' | 'totalRevenue'>) => NationalExamItem;
  updateExam: (id: string, updated: Partial<NationalExamItem>) => void;
  deleteExam: (id: string) => void;
  togglePinExam: (id: string) => void;
  toggleExamStatus: (id: string) => void;
  resetExams: () => void;
}

const loadExamsFromStorage = (): NationalExamItem[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored !== null) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (error) {
    console.error('Error loading national exams from localStorage:', error);
  }
  return INITIAL_NATIONAL_EXAMS;
};

export const useNationalExamStore = create<NationalExamStore>((set, get) => ({
  exams: loadExamsFromStorage(),

  addExam: (newItem) => {
    const current = get().exams;
    const nextIdNum = 100 + current.length + 1;
    const id = `NC-${nextIdNum}`;

    const exam: NationalExamItem = {
      ...newItem,
      id,
      questions: newItem.questions || [],
      registeredCount: 0,
      submittedCount: 0,
      paidCount: 0,
      totalRevenue: 0,
      calculationMethod: 'rasch',
      maxScore: newItem.maxScore || 75,
      aThreshold: newItem.aThreshold || 65,
      specType: newItem.specType || 'spec_1',
      durationMinutes: newItem.durationMinutes || 150,
      totalQuestions: newItem.questions ? newItem.questions.length : 0
    };

    const updated = [exam, ...current];
    set({ exams: updated });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return exam;
  },

  updateExam: (id, updatedFields) => {
    const updated = get().exams.map((e) => (e.id === id ? { ...e, ...updatedFields } : e));
    set({ exams: updated });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  },

  deleteExam: (id) => {
    const updated = get().exams.filter((e) => e.id !== id);
    set({ exams: updated });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  },

  togglePinExam: (id) => {
    const updated = get().exams.map((e) => (e.id === id ? { ...e, isPinned: !e.isPinned } : e));
    set({ exams: updated });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  },

  toggleExamStatus: (id) => {
    const updated = get().exams.map((e) =>
      e.id === id ? { ...e, status: (e.status === 'ochiq' ? 'yopiq' : 'ochiq') as 'ochiq' | 'yopiq' } : e
    );
    set({ exams: updated });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  },

  resetExams: () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_NATIONAL_EXAMS));
    set({ exams: INITIAL_NATIONAL_EXAMS });
  }
}));
