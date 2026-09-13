import React, { useState, useRef } from 'react';
import { Sidebar } from '../../components/common/Sidebar';
import { useAuth } from '../../hooks/useAuth';
import { useAuthStore } from '../../store/useAuthStore';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Avatar } from '../../components/common/Avatar';
import { User, Building, Save, Upload, Trash2, Smile, CheckCircle2, Sparkles } from 'lucide-react';

const EMOJI_AVATARS = [
  '🎓', '🏆', '🚀', '💻', '🧠', '🔬',
  '⚡', '🥇', '👑', '🎯', '📚', '🌟'
];

const UZBEKISTAN_REGIONS = [
  'Toshkent shahri',
  'Toshkent viloyati',
  'Andijon viloyati',
  'Buxoro viloyati',
  'Farg\'ona viloyati',
  'Jizzax viloyati',
  'Xorazm viloyati',
  'Namangan viloyati',
  'Navoiy viloyati',
  'Qashqadaryo viloyati',
  'Qoraqalpog\'iston Respublikasi',
  'Samarqand viloyati',
  'Sirdaryo viloyati',
  'Surxondaryo viloyati'
];

export const StudentProfilePage: React.FC = () => {
  const { user } = useAuth();
  const updateProfile = useAuthStore((state) => state.updateProfile);

  const [fullName, setFullName] = useState(user?.fullName || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');
  const [school, setSchool] = useState(user?.school || '');
  const [grade, setGrade] = useState(user?.grade || 9);
  const [region, setRegion] = useState(user?.region || 'Toshkent shahri');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!user) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("Rasm hajmi 5MB dan oshmasligi kerak!");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setAvatarUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveAvatar = () => {
    setAvatarUrl('');
  };

  const handleSelectEmoji = (emoji: string) => {
    setAvatarUrl(emoji);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      fullName,
      avatarUrl,
      school,
      grade,
      region,
    });

    setSuccessMessage("Profil sozlamalari va avatar muvaffaqiyatli saqlandi!");
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  return (
    <div className="flex bg-surface min-h-screen">
      <Sidebar />

      <main className="flex-1 w-full min-w-0 transition-all duration-300 p-6 md:p-8 space-y-6">
        {/* Title Banner */}
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-accent-900 tracking-tight">Profil Sozlamalari</h1>
            <p className="text-xs text-accent-600 font-medium mt-1">
              Shaxsiy ma'lumotlaringiz, avataringiz va sinfingizni yangilang
            </p>
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span className="capitalize">{user.role} Kabinet</span>
          </div>
        </div>

        {/* Success Alert */}
        {successMessage && (
          <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-center gap-3 text-emerald-800 text-sm font-semibold shadow-xs animate-in fade-in duration-200">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        <div className="bg-white border border-border rounded-2xl p-6 md:p-8 shadow-xs space-y-8">
          {/* Avatar Management Card */}
          <div className="space-y-4 border-b border-border pb-6">
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-accent-700">Profil Rasmi / Avatari</h3>
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <Avatar name={fullName} src={avatarUrl} size="xl" className="shadow-md shrink-0" />

              <div className="space-y-3 flex-1">
                <div className="flex flex-wrap items-center gap-3">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept="image/*"
                    className="hidden"
                  />

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    leftIcon={<Upload className="w-4 h-4 text-blue-600" />}
                    className="bg-blue-50/50 hover:bg-blue-100/60 border-blue-200 text-blue-700 font-bold"
                  >
                    Rasm yuklash
                  </Button>

                  {avatarUrl && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleRemoveAvatar}
                      leftIcon={<Trash2 className="w-4 h-4 text-rose-600" />}
                      className="bg-rose-50/50 hover:bg-rose-100/60 border-rose-200 text-rose-700 font-bold"
                    >
                      Rasmni olib tashlash
                    </Button>
                  )}
                </div>

                {/* Emoji Avatars Palette */}
                <div className="space-y-1.5 pt-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-accent-600">
                    <Smile className="w-3.5 h-3.5 text-amber-500" />
                    <span>Yoki tayyor Emoji-avatarlardan birini tanlang:</span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {EMOJI_AVATARS.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => handleSelectEmoji(emoji)}
                        className={`w-9 h-9 rounded-xl text-xl flex items-center justify-center border transition-all cursor-pointer ${
                          avatarUrl === emoji
                            ? 'bg-blue-600 border-blue-600 text-white scale-110 shadow-md ring-2 ring-blue-300'
                            : 'bg-surface hover:bg-blue-50 border-border text-accent-800 hover:scale-105'
                        }`}
                        title="Shu emojini tanlash"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Form Details */}
          <form onSubmit={handleSave} className="space-y-6">
            <Input
              label="F.I.SH (Familiya, Ism va Sharifingiz)"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              leftIcon={<User className="w-4 h-4 text-accent-500" />}
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Grade Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-accent-700">Sinf / Bosqich</label>
                <select
                  value={grade}
                  onChange={(e) => setGrade(Number(e.target.value))}
                  className="w-full p-3 text-sm border border-border rounded-xl bg-white font-semibold text-accent-900 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-xs"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((g) => (
                    <option key={g} value={g}>{g}-sinf</option>
                  ))}
                </select>
              </div>

              {/* Region Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-accent-700">Viloyat / Hudud</label>
                <select
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  className="w-full p-3 text-sm border border-border rounded-xl bg-white font-semibold text-accent-900 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-xs"
                >
                  {UZBEKISTAN_REGIONS.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
            </div>

            <Input
              label="Maktab / Litsey / O'quv Muassasasi"
              value={school}
              onChange={(e) => setSchool(e.target.value)}
              leftIcon={<Building className="w-4 h-4 text-accent-500" />}
              placeholder="Masalan: Prezident Maktabi"
            />

            <div className="pt-4 border-t border-border flex justify-end">
              <Button
                type="submit"
                size="lg"
                variant="primary"
                leftIcon={<Save className="w-5 h-5" />}
                className="bg-blue-600 hover:bg-blue-500 text-white font-black px-8 shadow-lg shadow-blue-900/30"
              >
                O'zgarishlarni Saqlash
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};
