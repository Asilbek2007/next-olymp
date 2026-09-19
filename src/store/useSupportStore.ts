import { create } from 'zustand';
import { SupportTicket, TicketMessage, INITIAL_TICKETS } from '../data/initialSupport';

const STORAGE_KEY_TICKETS = 'next_olymp_support_v2';

interface SupportStore {
  tickets: SupportTicket[];
  selectedTicketId: string | null;
  
  setSelectedTicketId: (id: string | null) => void;
  
  addMessageToTicket: (
    ticketId: string,
    text: string,
    sender?: 'admin',
    attachments?: { name: string; size: string; type: string }[]
  ) => void;

  updateTicketStatus: (ticketId: string, status: SupportTicket['status']) => void;
  closeTicket: (ticketId: string) => void;
  deleteTicket: (ticketId: string) => void;
  resetTickets: () => void;
}

const loadTicketsFromStorage = (): SupportTicket[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_TICKETS);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (error) {
    console.error('Error loading support tickets from localStorage:', error);
  }
  return [];
};

export const useSupportStore = create<SupportStore>((set, get) => ({
  tickets: loadTicketsFromStorage(),
  selectedTicketId: null,

  setSelectedTicketId: (id) => set({ selectedTicketId: id }),

  addMessageToTicket: (ticketId, text, _sender = 'admin', attachments) => {
    const currentTickets = get().tickets;
    const now = new Date();
    const timestampStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const newMessage: TicketMessage = {
      id: `msg-${Date.now()}`,
      sender: 'admin',
      senderName: 'EGA Support (Admin)',
      text,
      timestamp: timestampStr,
      attachments
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

  resetTickets: () => {
    set({ tickets: INITIAL_TICKETS, selectedTicketId: INITIAL_TICKETS[0]?.id || null });
    localStorage.setItem(STORAGE_KEY_TICKETS, JSON.stringify(INITIAL_TICKETS));
  }
}));
