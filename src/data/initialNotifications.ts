export interface NotificationLog {
  id: string;
  phone: string;
  userName: string;
  type: 'Bildirishnoma' | 'Parol' | 'Tasdiqlash' | 'Xavfsizlik ogohlantirishi' | 'Tranzaksiya' | 'Boshqa';
  message: string;
  region: string;
  status: 'Qabul qilindi' | 'Yuborilmadi' | 'Kutilmoqda';
  sentAt: string;
  smsCount: number;
}

export const INITIAL_NOTIFICATIONS: NotificationLog[] = [
  {
    id: 'SMS-72118',
    phone: '+998 90 123 45 67',
    userName: 'Shoxrux Abdullayev',
    type: 'Tasdiqlash',
    message: 'NextOlymp platformasiga kirish uchun tasdiqlash kodingiz: 894120. Hech kimga oshkor qilmang!',
    region: 'Toshkent shahri',
    status: 'Qabul qilindi',
    sentAt: '2025-09-08 15:42',
    smsCount: 1
  },
  {
    id: 'SMS-72117',
    phone: '+998 94 987 65 43',
    userName: 'Malika Ikromova',
    type: 'Bildirishnoma',
    message: "Hurmatli foydalanuvchi! Respublika Informatika Olimpiadasining 2-bosqichi 12-sentabr kuni soat 10:00 da boshlanadi.",
    region: 'Samarqand viloyati',
    status: 'Qabul qilindi',
    sentAt: '2025-09-08 14:15',
    smsCount: 1
  },
  {
    id: 'SMS-72116',
    phone: '+998 93 555 12 34',
    userName: 'Jasur Bekmurodov',
    type: 'Parol',
    message: 'Sizning yangi parolingiz: Nxt#9821a. Tizimga kirgach parolingizni oʻzgartiring.',
    region: 'Andijon viloyati',
    status: 'Qabul qilindi',
    sentAt: '2025-09-08 12:30',
    smsCount: 1
  },
  {
    id: 'SMS-72115',
    phone: '+998 91 333 44 55',
    userName: 'Gulnora Qosimova',
    type: 'Tranzaksiya',
    message: 'VIP paket uchun 199,000 UZS toʻlovingiz muvaffaqiyatli qabul qilindi. Rahmat!',
    region: 'Farg‘ona viloyati',
    status: 'Qabul qilindi',
    sentAt: '2025-09-08 10:05',
    smsCount: 1
  },
  {
    id: 'SMS-72114',
    phone: '+998 99 111 22 33',
    userName: 'Bobur Mansurov',
    type: 'Xavfsizlik ogohlantirishi',
    message: "Diqqat! Akkauntingizga yangi qurilmadan (Chrome Windows) kirish amalga oshirildi.",
    region: 'Buxoro viloyati',
    status: 'Yuborilmadi',
    sentAt: '2025-09-08 09:12',
    smsCount: 1
  },
  {
    id: 'SMS-72113',
    phone: '+998 97 777 88 99',
    userName: 'Nigora Yoqubova',
    type: 'Tasdiqlash',
    message: 'Roʻyxatdan oʻtishni yakunlash kodi: 104928.',
    region: 'Namangan viloyati',
    status: 'Qabul qilindi',
    sentAt: '2025-09-07 18:50',
    smsCount: 1
  },
  {
    id: 'SMS-72112',
    phone: '+998 95 444 33 22',
    userName: 'Sardor Karimov',
    type: 'Bildirishnoma',
    message: "Matematika bo'yicha bahorgi Olimpiada g'oliblari diplomi shaxsiy kabinetga yuklandi.",
    region: 'Toshkent viloyati',
    status: 'Qabul qilindi',
    sentAt: '2025-09-07 16:30',
    smsCount: 1
  }
];
