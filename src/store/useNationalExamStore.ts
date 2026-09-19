import { create } from 'zustand';
import { NationalExamItem } from '../data/initialNationalExams';
import { apiClient } from '../services/api';

interface NationalExamStore {
  exams: NationalExamItem[];
  loading: boolean;
  fetchFromApi: () => Promise<void>;
  addExam: (item: Omit<NationalExamItem, 'id' | 'registeredCount' | 'submittedCount' | 'paidCount' | 'totalRevenue'>) => NationalExamItem;
  updateExam: (id: string, updated: Partial<NationalExamItem>) => void;
  deleteExam: (id: string) => void;
  togglePinExam: (id: string) => void;
  toggleExamStatus: (id: string) => void;
  resetExams: () => void;
}

export const useNationalExamStore = create<NationalExamStore>((set, get) => ({
  exams: [],
  loading: false,

  fetchFromApi: async () => {
    set({ loading: true });
    try {
      const json = await apiClient.get('/national-exams.php');
      const data = Array.isArray(json) ? json : (json?.data || []);
      set({ exams: data, loading: false });
    } catch (err) {
      console.warn('Could not fetch national exams from MySQL API:', err);
      set({ loading: false });
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
      totalQuestions: newItem.questions ? newItem.questions.length : 0,
    };

    const updated = [exam, ...current];
    set({ exams: updated });

    // Save directly to MySQL via apiClient
    apiClient.post('/national-exams.php', exam).catch((e) => console.warn('National Exam API sync error:', e));

    return exam;
  },

  updateExam: (id, updatedFields) => {
    const updated = get().exams.map((e) => (e.id === id ? { ...e, ...updatedFields } : e));
    set({ exams: updated });

    const target = updated.find((e) => e.id === id);
    if (target) {
      apiClient.post('/national-exams.php', target).catch((e) => console.warn('National Exam API sync error:', e));
    }
  },

  deleteExam: (id) => {
    const updated = get().exams.filter((e) => e.id !== id);
    set({ exams: updated });

    // Delete from MySQL via apiClient
    apiClient.delete(`/national-exams.php?id=${encodeURIComponent(id)}`).catch((e) =>
      console.warn('National Exam API delete error:', e)
    );
  },

  togglePinExam: (id) => {
    const updated = get().exams.map((e) => (e.id === id ? { ...e, isPinned: !e.isPinned } : e));
    set({ exams: updated });

    const target = updated.find((e) => e.id === id);
    if (target) {
      apiClient.post('/national-exams.php', target).catch((e) => console.warn('National Exam API sync error:', e));
    }
  },

  toggleExamStatus: (id) => {
    const updated = get().exams.map((e) =>
      e.id === id ? { ...e, status: (e.status === 'ochiq' ? 'yopiq' : 'ochiq') as 'ochiq' | 'yopiq' } : e
    );
    set({ exams: updated });

    const target = updated.find((e) => e.id === id);
    if (target) {
      apiClient.post('/national-exams.php', target).catch((e) => console.warn('National Exam API sync error:', e));
    }
  },

  resetExams: () => {
    set({ exams: [] });
  },
}));

// Auto-fetch on app load
if (typeof window !== 'undefined') {
  setTimeout(() => {
    useNationalExamStore.getState().fetchFromApi();
  }, 100);
}
