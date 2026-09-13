export interface TicketMessage {
  id: string;
  sender: 'user' | 'admin' | 'ai';
  senderName: string;
  text: string;
  timestamp: string;
  attachments?: { name: string; size: string; type: string }[];
  isAiGenerated?: boolean;
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

export const INITIAL_TICKETS: SupportTicket[] = [
  {
    id: 'TK-1001',
    userName: 'Shoxrux Abdullayev',
    userRole: 'student',
    userPhone: '+998 90 123 45 67',
    userEmail: 'shoxrux@example.com',
    subject: "Respublika Matematika Olimpiadasida javoblarim saqlanmadi",
    category: 'Texnik muammo',
    priority: 'yuqori',
    status: 'yangi',
    createdAt: '2025-09-08 09:30',
    updatedAt: '2025-09-08 09:30',
    messages: [
      {
        id: 'msg-1',
        sender: 'user',
        senderName: 'Shoxrux Abdullayev',
        text: "Assalomu alaykum! Bugun matematika olimpiadasida 25-savolgacha ishladim, lekin internet uzilib qolib, ba'zi javoblarim tizimda saqlanmay qoldi. Natijamni qayta ko'rib berishingizni so'rayman.",
        timestamp: '2025-09-08 09:30',
        attachments: [
          { name: 'skrinshot_xatolik.png', size: '1.2 MB', type: 'image' }
        ]
      }
    ]
  },
  {
    id: 'TK-1002',
    userName: 'Malika Ikromova',
    userRole: 'teacher',
    userPhone: '+998 94 987 65 43',
    userEmail: 'malika.teacher@example.com',
    subject: "Click orqali VIP paket uchun to'lov qildim, lekin hisobim faollashmadi",
    category: "To'lov",
    priority: 'yuqori',
    status: 'jarayonda',
    createdAt: '2025-09-07 14:15',
    updatedAt: '2025-09-07 16:20',
    messages: [
      {
        id: 'msg-1',
        sender: 'user',
        senderName: 'Malika Ikromova',
        text: "Salom! Kecha 199,000 UZS VIP paket uchun Click tizimi orqali to'lov qildim. Pul kartamdan yechildi, chek bor. Lekin shaxsiy kabinetimda hali ham Bepul tarifi turibdi. Yordam bering.",
        timestamp: '2025-09-07 14:15',
        attachments: [
          { name: 'click_receipt_99213.pdf', size: '450 KB', type: 'pdf' }
        ]
      },
      {
        id: 'msg-2',
        sender: 'admin',
        senderName: 'EGA Support (Admin)',
        text: "Assalomu alaykum Malika opa! To'lov transaksiyangiz bazamizda tekshirilmoqda. Moliya bo'limimiz tez orada paketni biriktirib beradi.",
        timestamp: '2025-09-07 16:20'
      }
    ]
  },
  {
    id: 'TK-1003',
    userName: 'Jasur Bekmurodov',
    userRole: 'student',
    userPhone: '+998 93 555 12 34',
    userEmail: 'jasurbek@gmail.com',
    subject: "Ingliz tili olimpiada sertifikatini PDF yuklay olmayapman",
    category: 'Sertifikat',
    priority: 'orta',
    status: 'hal_etildi',
    createdAt: '2025-09-06 11:00',
    updatedAt: '2025-09-06 12:45',
    messages: [
      {
        id: 'msg-1',
        sender: 'user',
        senderName: 'Jasur Bekmurodov',
        text: "Ingliz tili olimpiadasida 1-o'rinni oldim. Sertifikatim kabinetimda paydo bo'ldi, lekin 'PDF yuklash' tugmasini bossam xatolik beryapti.",
        timestamp: '2025-09-06 11:00'
      },
      {
        id: 'msg-2',
        sender: 'admin',
        senderName: 'EGA Support (Admin)',
        text: "Assalomu alaykum Jasur! Sertifikat PDF faylingiz vaqtincha serverda qayta ishlanayotgan edi. Hozir muammo bartaraf etildi, qayta urinib ko'rishingiz mumkin.",
        timestamp: '2025-09-06 12:45'
      }
    ]
  },
  {
    id: 'TK-1004',
    userName: 'Gulnora Qosimova',
    userRole: 'teacher',
    userPhone: '+998 91 333 44 55',
    userEmail: 'gulnora.school12@mail.ru',
    subject: "Maktabimiz o'quvchilari ro'yxatini birdaniga qo'shish imkoni bormi?",
    category: 'Olimpiada',
    priority: 'past',
    status: 'yangi',
    createdAt: '2025-09-08 08:10',
    updatedAt: '2025-09-08 08:10',
    messages: [
      {
        id: 'msg-1',
        sender: 'user',
        senderName: 'Gulnora Qosimova',
        text: "Assalomu alaykum! 12-maktabdan murojaat qilyapman. 45 nafar o'quvchimizni olimpiadaga birga ro'yxatdan o'tkazmoqchimiz. Buni Excel orqali ommaviy yuklash mumkinmi?",
        timestamp: '2025-09-08 08:10'
      }
    ]
  }
];
