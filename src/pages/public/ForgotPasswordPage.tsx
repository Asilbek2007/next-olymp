import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white border border-border rounded-2xl p-8 shadow-lg space-y-6">
        <Link to="/auth/login" className="inline-flex items-center gap-1 text-xs font-bold text-accent-500 hover:text-accent-900">
          <ArrowLeft className="w-4 h-4" /> Kirishga qaytish
        </Link>

        {sent ? (
          <div className="text-center space-y-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-accent-900">SMS / Link yuborildi</h3>
            <p className="text-xs text-accent-600">
              <strong className="text-accent-900">{email}</strong> manziliga tiklash kodi yuborildi. Pochtadan tekshiring.
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-1">
              <h2 className="text-2xl font-black text-accent-900">Parolni Tiklash</h2>
              <p className="text-xs text-accent-500">Email manzilingizni kiriting, tiklash kodini yuboramiz.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Email Manzilingiz"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                leftIcon={<Mail className="w-4 h-4" />}
                required
              />
              <Button type="submit" className="w-full">
                Tiklash Kodini Yuborish
              </Button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};
