import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Mail, Lock, LogIn } from 'lucide-react';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { useAuth } from '../../hooks/useAuth';

export const LoginPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { login, isLoading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await login({ email, password });
      const user = JSON.parse(localStorage.getItem('next_olymp_user') || '{}');
      if (user.role === 'admin') navigate('/ega');
      else if (user.role === 'teacher') navigate('/teacher/dashboard');
      else navigate('/dashboard');
    } catch {
      setError('Kirishda xatolik yuz berdi. Parol yoki emailni tekshiring.');
    }
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white border border-border rounded-2xl p-8 shadow-lg space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-primary-50 text-primary-600 mx-auto flex items-center justify-center font-bold">
            <LogIn className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black text-accent-900 tracking-tight">{t('auth.loginTitle')}</h2>
          <p className="text-xs text-accent-500">Profil va olimpiadalarga kirish uchun billing hisobingiz</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label={t('auth.emailLabel')}
            type="email"
            placeholder="email@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            leftIcon={<Mail className="w-4 h-4" />}
            required
          />

          <Input
            label={t('auth.passwordLabel')}
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            leftIcon={<Lock className="w-4 h-4" />}
            required
          />

          {error && <p className="text-xs text-rose-600 font-semibold">{error}</p>}

          <Button type="submit" isLoading={isLoading} className="w-full">
            {t('auth.loginBtn')}
          </Button>
        </form>

        <div className="text-center text-xs text-accent-600 space-y-2 pt-2 border-t border-border">
          <p>
            {t('auth.noAccount')}{' '}
            <Link to="/auth/register" className="font-bold text-primary hover:underline">
              {t('auth.registerBtn')}
            </Link>
          </p>
          <p>
            <Link to="/auth/forgot-password" className="text-accent-400 hover:underline">
              {t('auth.forgotPassword')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
