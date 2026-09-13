import { create } from 'zustand';
import { SupportTicket, TicketMessage, INITIAL_TICKETS } from '../data/initialSupport';

const STORAGE_KEY_TICKETS = 'next_olymp_support_v1';
const STORAGE_KEY_AI_KEY = 'next_olymp_ai_api_key';

interface SupportStore {
  tickets: SupportTicket[];
  selectedTicketId: string | null;
  aiApiKey: string;
  
  setSelectedTicketId: (id: string | null) => void;
  setAiApiKey: (key: string) => void;
  
  addMessageToTicket: (
    ticketId: string,
    text: string,
    sender: 'admin' | 'ai',
    attachments?: { name: string; size: string; type: string }[]
  ) => void;

  updateTicketStatus: (ticketId: string, status: SupportTicket['status']) => void;
  closeTicket: (ticketId: string) => void;
  deleteTicket: (ticketId: string) => void;
  
  generateAiResponseDraft: (ticket: SupportTicket) => string;
  resetTickets: () => void;
}

const loadTicketsFromStorage = (): SupportTicket[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_TICKETS);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (error) {
    console.error('Error loading support tickets from localStorage:', error);
  }
  localStorage.setItem(STORAGE_KEY_TICKETS, JSON.stringify(INITIAL_TICKETS));
  return INITIAL_TICKETS;
};

const loadAiKeyFromStorage = (): string => {
  try {
    return localStorage.getItem(STORAGE_KEY_AI_KEY) || 'AI-KEY-DEMO-GEMINI-8921-X90213';
  } catch {
    return 'AI-KEY-DEMO-GEMINI-8921-X90213';
  }
};

export const useSupportStore = create<SupportStore>((set, get) => ({
  tickets: loadTicketsFromStorage(),
  selectedTicketId: INITIAL_TICKETS[0]?.id || null,
  aiApiKey: loadAiKeyFromStorage(),

  setSelectedTicketId: (id) => set({ selectedTicketId: id }),

  setAiApiKey: (key) => {
    set({ aiApiKey: key });
    localStorage.setItem(STORAGE_KEY_AI_KEY, key);
  },

  addMessageToTicket: (ticketId, text, sender, attachments) => {
    const currentTickets = get().tickets;
    const now = new Date();
    const timestampStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const newMessage: TicketMessage = {
      id: `msg-${Date.now()}`,
      sender,
      senderName: sender === 'admin' ? 'EGA Support (Admin)' : 'AI Assist (Avto-javob)',
      text,
      timestamp: timestampStr,
      attachments,
      isAiGenerated: sender === 'ai'
    };

    const updatedTickets = currentTickets.map((ticket) => {
      if (ticket.id === ticketId) {
        return {
          ...ticket,
          status: 'jarayonda' as const,
          updatedAt: timestampStr,
          messages: [...ticket.messages, newMessage]
        };
      }
      return ticket;
    });

    set({ tickets: updatedTickets });
    localStorage.setItem(STORAGE_KEY_TICKETS, JSON.stringify(updatedTickets));
  },

  updateTicketStatus: (ticketId, status) => {
    const currentTickets = get().tickets;
    const updatedTickets = currentTickets.map((t) => {
      if (t.id === ticketId) {
        return { ...t, status };
      }
      return t;
    });

    set({ tickets: updatedTickets });
    localStorage.setItem(STORAGE_KEY_TICKETS, JSON.stringify(updatedTickets));
  },

  closeTicket: (ticketId) => {
    get().updateTicketStatus(ticketId, 'yopildi');
  },

  deleteTicket: (ticketId) => {
    const updated = get().tickets.filter((t) => t.id !== ticketId);
    const nextSelected = get().selectedTicketId === ticketId ? (updated[0]?.id || null) : get().selectedTicketId;
    set({ tickets: updated, selectedTicketId: nextSelected });
    localStorage.setItem(STORAGE_KEY_TICKETS, JSON.stringify(updated));
  },

  generateAiResponseDraft: (ticket) => {
    const userMsg = ticket.messages[0]?.text || ticket.subject;

    if (ticket.category === "To'lov") {
      return `Assalomu alaykum, ${ticket.userName}! To'lovingiz bo'yicha yuborgan chekingiz qabul qilindi. Tranzaksiya holati moliya bo'limimiz tomonidan muvaffaqiyatli tekshirildi va profilingizga tegishli paket biriktirildi. Shaxsiy kabinetingizga qayta kirib tekshirishingiz mumkin. Savollaringiz bo'lsa javob berishga tayyormiz!`;
    }

    if (ticket.category === 'Texnik muammo') {
      return `Assalomu alaykum ${ticket.userName}! Yuzaga kelgan texnik uzilish va muammo bo'yicha uzr so'raymiz. Tizim jurnallari (loglar) o'rganib chiqildi. Javoblaringiz qayta tiklandi va olimpiadadagi ishtirokingiz holati yangilandi. Natijalar bo'limidan tekshirib olishingiz mumkin.`;
    }

    if (ticket.category === 'Sertifikat') {
      return `Assalomu alaykum, ${ticket.userName}! Sertifikat generatorida profilaktika ishlari yakunlandi. Endi shaxsiy kabinetingizdagi "Sertifikatlar" bo'limiga kirib, yuqori sifatli PDF formatdagi hujjatingizni bemalol yuklab olishingiz mumkin. Tabriklaymiz!`;
    }

    return `Assalomu alaykum ${ticket.userName}! Yuborgan murojaatingiz uchun tashakkur. Murojaatingiz bo'yicha tegishli mutaxassislarimiz ma'lumotlarni o'rganib chiqishdi. Ko'rsatilgan masalalar bo'yicha barcha imkoniyatlar faollashtirildi va muammo bartaraf etildi. Platformamizdan foydalanishda davom eting!`;
  },

  resetTickets: () => {
    set({ tickets: INITIAL_TICKETS, selectedTicketId: INITIAL_TICKETS[0]?.id || null });
    localStorage.setItem(STORAGE_KEY_TICKETS, JSON.stringify(INITIAL_TICKETS));
  }
}));
