export interface PaymentTransaction {
  id: string;
  userName: string;
  userPhone: string;
  userRole: 'student' | 'teacher';
  olympiadOrPackage: string;
  method: 'karta' | 'naqd' | 'hamyon' | 'paket';
  amount: number;
  status: 'muvaffaqiyatli' | 'kutilmoqda' | 'bekor_qilindi';
  date: string;
  transactionRef: string;
}

export const INITIAL_PAYMENTS: PaymentTransaction[] = [
  {
    id: 'TRX-99201',
    userName: 'Shoxrux Abdullayev',
    userPhone: '+998 90 123 45 67',
    userRole: 'student',
    olympiadOrPackage: 'Respublika Matematika Olimpiadasi',
    method: 'karta',
    amount: 35000,
    status: 'muvaffaqiyatli',
    date: '2025-09-08 14:10',
    transactionRef: 'CLICK-882194'
  },
  {
    id: 'TRX-99202',
    userName: 'Malika Ikromova',
    userPhone: '+998 94 987 65 43',
    userRole: 'teacher',
    olympiadOrPackage: 'VIP Obuna Paketi (1 yillik)',
    method: 'karta',
    amount: 199000,
    status: 'muvaffaqiyatli',
    date: '2025-09-08 11:45',
    transactionRef: 'PAYME-901238'
  },
  {
    id: 'TRX-99203',
    userName: 'Jasur Bekmurodov',
    userPhone: '+998 93 555 12 34',
    userRole: 'student',
    olympiadOrPackage: 'Ingliz Tili Olimpiadasi',
    method: 'hamyon',
    amount: 25000,
    status: 'muvaffaqiyatli',
    date: '2025-09-08 10:20',
    transactionRef: 'BALANS-44102'
  },
  {
    id: 'TRX-99204',
    userName: 'Gulnora Qosimova',
    userPhone: '+998 91 333 44 55',
    userRole: 'teacher',
    olympiadOrPackage: 'Ommaviy Maktab Boshlang\'ich Obunasi',
    method: 'naqd',
    amount: 450000,
    status: 'muvaffaqiyatli',
    date: '2025-09-07 16:00',
    transactionRef: 'CASH-00291'
  },
  {
    id: 'TRX-99205',
    userName: 'Bobur Mansurov',
    userPhone: '+998 99 111 22 33',
    userRole: 'student',
    olympiadOrPackage: 'Fizika va Astronomiya Olimpiadasi',
    method: 'paket',
    amount: 0,
    status: 'muvaffaqiyatli',
    date: '2025-09-07 14:12',
    transactionRef: 'PKG-VIP-FREE'
  },
  {
    id: 'TRX-99206',
    userName: 'Nigora Yoqubova',
    userPhone: '+998 97 777 88 99',
    userRole: 'student',
    olympiadOrPackage: 'Biologiya Saralash Testi',
    method: 'karta',
    amount: 30000,
    status: 'kutilmoqda',
    date: '2025-09-07 12:05',
    transactionRef: 'UZUM-77102'
  },
  {
    id: 'TRX-99207',
    userName: 'Sardor Karimov',
    userPhone: '+998 95 444 33 22',
    userRole: 'student',
    olympiadOrPackage: 'Kimyo Fanidan Sinov Testi',
    method: 'karta',
    amount: 25000,
    status: 'bekor_qilindi',
    date: '2025-09-06 18:30',
    transactionRef: 'CLICK-CANCEL-12'
  }
];
