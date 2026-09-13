import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { User, Mail, Lock, Phone, Building, MapPin, GraduationCap, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { useAuth } from '../../hooks/useAuth';
import { Role } from '../../types';
import { clsx } from 'clsx';

const UZBEKISTAN_DISTRICTS: Record<string, string[]> = {
  'Toshkent shahri': [
    'Yunusobod tumani',
    'Chilonzor tumani',
    'Mirzo Ulug‘bek tumani',
    'Yakkasaroy tumani',
    'Shayxontohur tumani',
    'Olmazor tumani',
    'Mirobod tumani',
    'Sergeli tumani',
    'Uchtepa tumani',
    'Bektemir tumani',
    'Yangihayot tumani',
    'Yashnobod tumani',
  ],
  'Toshkent viloyati': [
    'Chirchiq shahri',
    'Olmaliq shahri',
    'Angren shahri',
    'Bekobod shahri',
    'Yangiyo‘l shahri',
    'Oqqo‘rg‘on tumani',
    'Ohangaron tumani',
    'Bekobod tumani',
    'Bo‘stonliq tumani',
    'Bo‘ka tumani',
    'Zangiota tumani',
    'Qibray tumani',
    'Parkent tumani',
    'Piskent tumani',
    'O‘rtachirchiq tumani',
    'Chinoz tumani',
    'Yuqorichirchiq tumani',
    'Yangiyo‘l tumani',
  ],
  'Samarqand viloyati': [
    'Samarqand shahri',
    'Kattaqo‘rg‘on shahri',
    'Bulung‘ur tumani',
    'Jomboy tumani',
    'Ishtixon tumani',
    'Kattaqo‘rg‘on tumani',
    'Narpay tumani',
    'Nurobod tumani',
    'Oqdaryo tumani',
    'Paxtachi tumani',
    'Payariq tumani',
    'Pastdarg‘om tumani',
    'Samarqand tumani',
    'Toyloq tumani',
    'Urgut tumani',
    'Qo‘shrabot tumani',
  ],
  'Farg\'ona viloyati': [
    'Farg‘ona shahri',
    'Marg‘ilon shahri',
    'Qo‘qon shahri',
    'Quvasoy shahri',
    'Beshariq tumani',
    'Bog‘dod tumani',
    'Buvayda tumani',
    'Dang‘ara tumani',
    'Yozyovon tumani',
    'Quva tumani',
    'Oltiariq tumani',
    'Rishton tumani',
    'So‘x tumani',
    'Toshloq tumani',
    'Uchko‘prik tumani',
    'O‘zbekiston tumani',
    'Farg‘ona tumani',
  ],
  'Andijon viloyati': [
    'Andijon shahri',
    'Xonobod shahri',
    'Andijon tumani',
    'Asaka tumani',
    'Baliqchi tumani',
    'Bo‘ston tumani',
    'Buloqboshi tumani',
    'Izboskan tumani',
    'Jalaquduq tumani',
    'Marhamat tumani',
    'Oltinko‘l tumani',
    'Paxtaobod tumani',
    'Ulug‘nor tumani',
    'Xo‘jaobod tumani',
    'Shahrixon tumani',
    'Qo‘rg‘ontepa tumani',
  ],
  'Namangan viloyati': [
    'Namangan shahri',
    'Davlatobod tumani',
    'Yangi Namangan tumani',
    'Kosonsoy tumani',
    'Mingbuloq tumani',
    'Namangan tumani',
    'Norin tumani',
    'Pop tumani',
    'To‘raqo‘rg‘on tumani',
    'Uychi tumani',
    'Uchqo‘rg‘on tumani',
    'Chortoq tumani',
    'Chust tumani',
    'Yangiqo‘rg‘on tumani',
  ],
  'Buxoro viloyati': [
    'Buxoro shahri',
    'Kogon shahri',
    'Buxoro tumani',
    'Vobkent tumani',
    'G‘ijduvon tumani',
    'Jondor tumani',
    'Kogon tumani',
    'Olot tumani',
    'Peshku tumani',
    'Romitan tumani',
    'Shofirkon tumani',
    'Qorako‘l tumani',
    'Qorovulbozor tumani',
  ],
  'Qashqadaryo viloyati': [
    'Qarshi shahri',
    'Shahrisabz shahri',
    'Dehqonobod tumani',
    'Kasbi tumani',
    'Kitob tumani',
    'Koson tumani',
    'Mirishkor tumani',
    'Muborak tumani',
    'Nishon tumani',
    'Qamashi tumani',
    'Qarshi tumani',
    'Yakkabog‘ tumani',
    'G‘uzor tumani',
    'Chiroqchi tumani',
    'Ko‘kdala tumani',
  ],
  'Surxondaryo viloyati': [
    'Termiz shahri',
    'Angor tumani',
    'Bandixon tumani',
    'Boysun tumani',
    'Denov tumani',
    'Jarqo‘rg‘on tumani',
    'Muzrabot tumani',
    'Oltinsoy tumani',
    'Sariosiyo tumani',
    'Termiz tumani',
    'Uzun tumani',
    'Sherobod tumani',
    'Sho‘rchi tumani',
    'Qiziriq tumani',
    'Qumqo‘rg‘on tumani',
  ],
  'Jizzax viloyati': [
    'Jizzax shahri',
    'Arnasoy tumani',
    'Baxmal tumani',
    'G‘allaorol tumani',
    'Do‘stlik tumani',
    'Zomin tumani',
    'Zarbdor tumani',
    'Zafarobod tumani',
    'Mirzacho‘l tumani',
    'Paxtakor tumani',
    'Forish tumani',
    'Sharof Rashidov tumani',
    'Yangiobod tumani',
  ],
  'Sirdaryo viloyati': [
    'Guliston shahri',
    'Shirin shahri',
    'Yangiyer shahri',
    'Boyovut tumani',
    'Guliston tumani',
    'Mirzaobod tumani',
    'Oqoltin tumani',
    'Sardoba tumani',
    'Sayxunobod tumani',
    'Sirdaryo tumani',
    'Xovos tumani',
  ],
  'Xorazm viloyati': [
    'Urganch shahri',
    'Xiva shahri',
    'Bog‘ot tumani',
    'Gurlan tumani',
    'Qo‘shko‘pir tumani',
    'Urganch tumani',
    'Xiva tumani',
    'Xonqa tumani',
    'Hazorasp tumani',
    'Shovot tumani',
    'Yangiariq tumani',
    'Yangibozor tumani',
    'Tuproqqal‘a tumani',
  ],
  'Navoiy viloyati': [
    'Navoiy shahri',
    'Zarafshon shahri',
    'Karmana tumani',
    'Konimex tumani',
    'Navbahor tumani',
    'Nurota tumani',
    'Tomdi tumani',
    'Uchquduq tumani',
    'Xatirchi tumani',
    'Qiziltepa tumani',
  ],
  'Qoraqalpog\'iston Respublikasi': [
    'Nukus shahri',
    'Amudaryo tumani',
    'Beruniy tumani',
    'Bo‘zatov tumani',
    'Kegeyli tumani',
    'Mo‘ynoq tumani',
    'Nukus tumani',
    'Qanliko‘l tumani',
    'Qo‘ng‘irot tumani',
    'Qorao‘zak tumani',
    'Taxtako‘pir tumani',
    'To‘rtko‘l tumani',
    'Xo‘jayli tumani',
    'Chimboy tumani',
    'Sho‘manay tumani',
    'Ellikqala tumani',
    'Taxiatosh tumani',
  ],
};

const UZBEKISTAN_REGIONS = Object.keys(UZBEKISTAN_DISTRICTS);

interface FormErrors {
  fullName?: string;
  phone?: string;
  email?: string;
  password?: string;
  region?: string;
  district?: string;
  school?: string;
}

export const RegisterPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { register, isLoading } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('+998 ');
  const [password, setPassword] = useState('');
  const [role] = useState<Role>('student');
  const [grade, setGrade] = useState<number>(9);
  const [region, setRegion] = useState('');
  const [district, setDistrict] = useState('');
  const [school, setSchool] = useState('');
  const [parentConsent, setParentConsent] = useState(false);

  const [errors, setErrors] = useState<FormErrors>({});
  const [submitted, setSubmitted] = useState(false);

  // Phone number mask helper (+998 XX XXX XX XX)
  const formatPhoneNumber = (val: string) => {
    let digits = val.replace(/\D/g, '');
    if (digits.startsWith('998')) {
      digits = digits.slice(3);
    }
    digits = digits.slice(0, 9);

    let formatted = '+998';
    if (digits.length > 0) {
      formatted += ' ' + digits.slice(0, 2);
    }
    if (digits.length > 2) {
      formatted += ' ' + digits.slice(2, 5);
    }
    if (digits.length > 5) {
      formatted += ' ' + digits.slice(5, 7);
    }
    if (digits.length > 7) {
      formatted += ' ' + digits.slice(7, 9);
    }
    return formatted;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhone(formatted);
    if (submitted) {
      const digits = formatted.replace(/\D/g, '').replace(/^998/, '');
      if (digits.length === 9) {
        setErrors((prev) => ({ ...prev, phone: undefined }));
      } else {
        setErrors((prev) => ({ ...prev, phone: "Telefon raqamni to'liq kiriting (+998 XX XXX XX XX)" }));
      }
    }
  };

  const handleRegionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedRegion = e.target.value;
    setRegion(selectedRegion);
    setDistrict(''); // Reset district when region changes
    if (submitted) {
      if (selectedRegion) {
        setErrors((prev) => ({ ...prev, region: undefined }));
      } else {
        setErrors((prev) => ({ ...prev, region: "Viloyatni tanlang" }));
      }
    }
  };

  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedDistrict = e.target.value;
    setDistrict(selectedDistrict);
    if (submitted) {
      if (selectedDistrict) {
        setErrors((prev) => ({ ...prev, district: undefined }));
      } else {
        setErrors((prev) => ({ ...prev, district: "Tumanni tanlang" }));
      }
    }
  };

  // Comprehensive validation function
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // 1. Full Name: Not empty, at least 2 words
    const trimmedName = fullName.trim();
    const words = trimmedName.split(/\s+/).filter(Boolean);
    if (!trimmedName) {
      newErrors.fullName = "To'liq ism va familiyangizni kiriting";
    } else if (words.length < 2) {
      newErrors.fullName = "F.I.SH kamida 2 ta so'zdan iborat bo'lishi shart (Ism va Familiya)";
    }

    // 2. Phone: Full 9 digits with +998 mask
    const digits = phone.replace(/\D/g, '').replace(/^998/, '');
    if (!digits) {
      newErrors.phone = "Telefon raqamingizni kiriting";
    } else if (digits.length < 9) {
      newErrors.phone = "Telefon raqamni to'liq kiriting (+998 XX XXX XX XX)";
    }

    // 3. Email: Valid regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      newErrors.email = "Elektron pochta manzilingizni kiriting";
    } else if (!emailRegex.test(email.trim())) {
      newErrors.email = "Haqiqiy elektron pochta manzilini kiriting (masalan: user@example.com)";
    }

    // 4. Password: At least 8 characters
    if (!password) {
      newErrors.password = "Parolni kiriting";
    } else if (password.length < 8) {
      newErrors.password = "Parol kamida 8 ta belgidan iborat bo'lishi shart";
    }

    // 5. Region and District: Must be selected
    if (!region) {
      newErrors.region = "Viloyatni tanlang";
    }
    if (!district) {
      newErrors.district = "Tumanni tanlang";
    }

    // 6. School: Must not be empty
    if (!school.trim()) {
      newErrors.school = "Maktab yoki ta'lim muassasasini kiriting";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);

    const isValid = validateForm();
    if (!isValid) {
      return;
    }

    try {
      await register({
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        password,
        role,
        grade,
        region,
        district,
        school: school.trim(),
        parentConsent,
      });
      navigate('/dashboard');
    } catch {
      alert("Ro'yxatdan o'tishda xatolik yuz berdi. Iltimos, qayta urinib ko'ring.");
    }
  };

  const availableDistricts = region ? UZBEKISTAN_DISTRICTS[region] || [] : [];

  return (
    <div className="py-12 flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-xl bg-white border border-slate-200 rounded-3xl p-8 sm:p-10 shadow-xl space-y-6">
        <div className="text-center space-y-2 border-b border-slate-100 pb-5">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 mb-1 shadow-xs">
            <GraduationCap className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            {t('auth.registerTitle') || "Ro'yxatdan o'tish"}
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Next Olymp akademik musobaqalariga a'zo bo'ling va o'z bilimingizni sinang
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          {/* 1. Full Name */}
          <div>
            <Input
              label="F.I.SH (To'liq ism-familiya) *"
              placeholder="Masalan: Sardor Rustamov"
              value={fullName}
              onChange={(e) => {
                setFullName(e.target.value);
                if (submitted) {
                  const words = e.target.value.trim().split(/\s+/).filter(Boolean);
                  if (words.length >= 2) {
                    setErrors((prev) => ({ ...prev, fullName: undefined }));
                  }
                }
              }}
              leftIcon={<User className="w-4 h-4" />}
              error={errors.fullName}
              required
            />
          </div>

          {/* 2. Email & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Input
                label="Elektron pochta (Email) *"
                type="email"
                placeholder="sardor@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (submitted) {
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (emailRegex.test(e.target.value.trim())) {
                      setErrors((prev) => ({ ...prev, email: undefined }));
                    }
                  }
                }}
                leftIcon={<Mail className="w-4 h-4" />}
                error={errors.email}
                required
              />
            </div>

            <div>
              <Input
                label="Telefon raqam *"
                type="tel"
                placeholder="+998 90 123 45 67"
                value={phone}
                onChange={handlePhoneChange}
                leftIcon={<Phone className="w-4 h-4" />}
                error={errors.phone}
                required
              />
            </div>
          </div>

          {/* 3. Password & Grade */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Input
                label="Parol (kamida 8 ta belgi) *"
                type="password"
                placeholder="Kamida 8 ta belgi"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (submitted) {
                    if (e.target.value.length >= 8) {
                      setErrors((prev) => ({ ...prev, password: undefined }));
                    }
                  }
                }}
                leftIcon={<Lock className="w-4 h-4" />}
                error={errors.password}
                required
              />
            </div>

            <div className="space-y-1.5 flex flex-col">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                Sinfingiz *
              </label>
              <select
                value={grade}
                onChange={(e) => setGrade(Number(e.target.value))}
                className="w-full py-2.5 px-3.5 text-sm border border-slate-300 rounded-lg bg-white text-slate-900 font-bold outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                {[5, 6, 7, 8, 9, 10, 11].map((g) => (
                  <option key={g} value={g}>{g}-sinf</option>
                ))}
              </select>
            </div>
          </div>

          {/* 4. Region & District (Viloyat va Tuman) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Viloyat */}
            <div className="space-y-1.5 flex flex-col">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-indigo-500" />
                <span>Viloyat / Shahar *</span>
              </label>
              <select
                value={region}
                onChange={handleRegionChange}
                className={clsx(
                  "w-full py-2.5 px-3.5 text-sm border rounded-lg bg-white text-slate-900 font-medium outline-none transition-all",
                  errors.region
                    ? "border-red-500 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    : "border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                )}
              >
                <option value="">-- Viloyatni tanlang --</option>
                {UZBEKISTAN_REGIONS.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
              {errors.region && (
                <span className="text-xs text-red-500 font-medium">{errors.region}</span>
              )}
            </div>

            {/* Tuman */}
            <div className="space-y-1.5 flex flex-col">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 flex items-center gap-1">
                <Building className="w-3.5 h-3.5 text-indigo-500" />
                <span>Tuman / Shahar *</span>
              </label>
              <select
                value={district}
                onChange={handleDistrictChange}
                disabled={!region}
                className={clsx(
                  "w-full py-2.5 px-3.5 text-sm border rounded-lg bg-white text-slate-900 font-medium outline-none transition-all disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed",
                  errors.district
                    ? "border-red-500 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    : "border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                )}
              >
                <option value="">
                  {region ? "-- Tumanni tanlang --" : "-- Avval viloyatni tanlang --"}
                </option>
                {availableDistricts.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
              {errors.district && (
                <span className="text-xs text-red-500 font-medium">{errors.district}</span>
              )}
            </div>
          </div>

          {/* 5. School / Institution */}
          <div>
            <Input
              label="Maktab / Muassasa nomi *"
              placeholder="Masalan: 14-sonli ixtisoslashtirilgan umumta'lim maktabi"
              value={school}
              onChange={(e) => {
                setSchool(e.target.value);
                if (submitted && e.target.value.trim()) {
                  setErrors((prev) => ({ ...prev, school: undefined }));
                }
              }}
              leftIcon={<Building className="w-4 h-4" />}
              error={errors.school}
              required
            />
          </div>

          {/* Parent Consent Checkbox */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-700 font-medium">
              <input
                type="checkbox"
                checked={parentConsent}
                onChange={(e) => setParentConsent(e.target.checked)}
                className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
              />
              <span>{t('auth.parentConsentLabel') || "Ota-onam / vasiyim testda ishtirok etishimdan xabardor va rozilik beradi"}</span>
            </label>
          </div>

          {/* Terms & Agreement */}
          <p className="text-[11px] text-slate-500 text-center leading-relaxed">
            Ro'yxatdan o'tish orqali siz platformaning{' '}
            <Link to="/terms" target="_blank" className="font-semibold text-indigo-600 hover:underline">Foydalanish shartlari</Link>,{' '}
            <Link to="/privacy" target="_blank" className="font-semibold text-indigo-600 hover:underline">Maxfiylik siyosati</Link> hamda{' '}
            <Link to="/rules" target="_blank" className="font-semibold text-indigo-600 hover:underline">Nizom va qoidalari</Link>ga rozilik bildirasiz.
          </p>

          <Button
            type="submit"
            isLoading={isLoading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 text-sm rounded-xl shadow-md shadow-indigo-600/30"
          >
            {t('auth.registerBtn') || "Ro'yxatdan o'tish"}
          </Button>
        </form>

        <p className="text-center text-xs text-slate-600 border-t border-slate-100 pt-4">
          Allaqachon hisobingiz bormi?{' '}
          <Link to="/auth/login" className="font-bold text-indigo-600 hover:underline">
            {t('auth.loginBtn') || "Kirish"}
          </Link>
        </p>
      </div>
    </div>
  );
};
