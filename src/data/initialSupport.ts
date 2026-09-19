export interface TicketMessage {
  id: string;
  sender: 'user' | 'admin';
  senderName: string;
  text: string;
  timestamp: string;
  attachments?: { name: string; size: string; type: string }[];
}

export interface SupportTicket {
  id: string;
  userName: string;
  userRole: 'student' | 'teacher' | 'parent';
  userPhone: string;
  userEmail: string;
  subject: string;
  category: 'Olimpiada' | 'To\'lov' | 'Sertifikat' | 'Texnik muammo' | 'Boshqa';
  priority: 'yuqori' | 'orta' | 'past';
  status: 'yangi' | 'jarayonda' | 'hal_etildi' | 'yopildi';
  createdAt: string;
  updatedAt: string;
  messages: TicketMessage[];
}

// Production initial state: Empty list (populated when users submit support inquiries)
export const INITIAL_TICKETS: SupportTicket[] = [];
