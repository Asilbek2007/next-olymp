import { create } from 'zustand';
import { SupportTicket, TicketMessage, INITIAL_TICKETS } from '../data/initialSupport';

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

export const useSupportStore = create<SupportStore>((set, get) => ({
  tickets: INITIAL_TICKETS,
  selectedTicketId: null,

  setSelectedTicketId: (id) => set({ selectedTicketId: id }),

  addMessageToTicket: (ticketId, text, _sender = 'admin', attachments) => {
    const currentTickets = get().tickets;
    const now = new Date();
    const timestampStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
      now.getDate()
    ).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const newMessage: TicketMessage = {
      id: `msg-${Date.now()}`,
      sender: 'admin',
      senderName: 'EGA Support (Admin)',
      text,
      timestamp: timestampStr,
      attachments,
    };

    const updatedTickets = currentTickets.map((ticket) => {
      if (ticket.id === ticketId) {
        return {
          ...ticket,
          messages: [...ticket.messages, newMessage],
          status: 'jarayonda' as const,
          lastUpdated: timestampStr,
        };
      }
      return ticket;
    });

    set({ tickets: updatedTickets });
  },

  updateTicketStatus: (ticketId, status) => {
    const updatedTickets = get().tickets.map((t) => (t.id === ticketId ? { ...t, status } : t));
    set({ tickets: updatedTickets });
  },

  closeTicket: (ticketId) => {
    get().updateTicketStatus(ticketId, 'yopildi');
  },

  deleteTicket: (ticketId) => {
    const updated = get().tickets.filter((t) => t.id !== ticketId);
    set({
      tickets: updated,
      selectedTicketId: get().selectedTicketId === ticketId ? null : get().selectedTicketId,
    });
  },

  resetTickets: () => {
    set({ tickets: INITIAL_TICKETS, selectedTicketId: null });
  },
}));
