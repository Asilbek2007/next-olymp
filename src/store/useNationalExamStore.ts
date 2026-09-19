import { create } from 'zustand';
import { NationalExamItem } from '../data/initialNationalExams';

interface NationalExamStore {
  exams: NationalExamItem[];
  fetchFromApi: () => Promise<void>;
  addExam: (item: Omit<NationalExamItem, 'id' | 'registeredCount' | 'submittedCount' | 'paidCount' | 'totalRevenue'>) => NationalExamItem;
  updateExam: (id: string, updated: Partial<NationalExamItem>) => void;
  deleteExam: (id: string) => void;
  togglePinExam: (id: string) => void;
  toggleExamStatus: (id: string) => void;
  resetExams: () => void;
}

// Background sync helpers
const syncExamToApi = async (exam: NationalExamItem) => {
  try {
    await fetch('/api/national-exams.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(exam)
    });
  } catch (e) {
    console.warn('National Exam API sync error:', e);
  }
};

const deleteExamFromApi = async (id: string) => {
  try {
    await fetch(`/api/national-exams.php?id=${encodeURIComponent(id)}`, {
      method: 'DELETE'
    });
  } catch (e) {
    console.warn('National Exam API delete error:', e);
  }
};

export const useNationalExamStore = create<NationalExamStore>((set, get) => ({
  exams: [],

  fetchFromApi: async () => {
    try {
      const res = await fetch('/api/national-exams.php');
      if (res.ok) {
        const json = await res.json();
        if (json.status === 'success' && Array.isArray(json.data)) {
          set({ exams: json.data });
        }
      }
    } catch (err) {
      console.warn('Could not fetch national exams from MySQL API:', err);
    }
  },

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

    // Save directly to MySQL
    syncExamToApi(exam);

    return exam;
  },

  updateExam: (id, updatedFields) => {
    const updated = get().exams.map((e) => (e.id === id ? { ...e, ...updatedFields } : e));
    set({ exams: updated });

    const target = updated.find((e) => e.id === id);
    if (target) {
      syncExamToApi(target);
    }
  },

  deleteExam: (id) => {
    const updated = get().exams.filter((e) => e.id !== id);
    set({ exams: updated });

    // Delete from MySQL
    deleteExamFromApi(id);
  },

  togglePinExam: (id) => {
    const updated = get().exams.map((e) => (e.id === id ? { ...e, isPinned: !e.isPinned } : e));
    set({ exams: updated });

    const target = updated.find((e) => e.id === id);
    if (target) {
      syncExamToApi(target);
    }
  },

  toggleExamStatus: (id) => {
    const updated = get().exams.map((e) =>
      e.id === id ? { ...e, status: (e.status === 'ochiq' ? 'yopiq' : 'ochiq') as 'ochiq' | 'yopiq' } : e
    );
    set({ exams: updated });

    const target = updated.find((e) => e.id === id);
    if (target) {
      syncExamToApi(target);
    }
  },

  resetExams: () => {
    set({ exams: [] });
  }
}));

// Auto-fetch on app load
if (typeof window !== 'undefined') {
  setTimeout(() => {
    useNationalExamStore.getState().fetchFromApi();
  }, 100);
}
