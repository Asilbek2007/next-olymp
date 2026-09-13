import React from 'react';
import { Sidebar } from '../../components/common/Sidebar';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { UserPlus, Users } from 'lucide-react';
import { authService } from '../../services/authService';

export const TeacherOlympiadsPage: React.FC = () => {
  const registeredUsers = authService.getRegisteredUsers();
  const students = registeredUsers.filter((u) => u.role === 'student');

  return (
    <div className="flex bg-surface min-h-[calc(100vh-4rem)]">
      <Sidebar />

      <main className="flex-1 w-full min-w-0 transition-all duration-300 p-6 md:p-8 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-black text-accent-900">O'quvchilar Boshqaruvi</h1>
          <Button leftIcon={<UserPlus className="w-4 h-4" />}>O'quvchi Qo'shish</Button>
        </div>

        <Card className="p-6">
          {students.length > 0 ? (
            <table className="w-full text-left text-sm">
              <thead className="bg-surface text-accent-600 font-bold uppercase text-xs border-b border-border">
                <tr>
                  <th className="p-3">O'quvchi F.I.SH</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Sinf</th>
                  <th className="p-3">Hudud</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {students.map((s) => (
                  <tr key={s.id}>
                    <td className="p-3 font-bold text-accent-900">{s.fullName}</td>
                    <td className="p-3 font-mono text-xs text-slate-500">{s.email}</td>
                    <td className="p-3">{s.grade ? `${s.grade}-sinf` : '-'}</td>
                    <td className="p-3 font-semibold text-slate-700">{s.region || 'Toshkent'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="py-12 text-center space-y-3">
              <Users className="w-10 h-10 text-slate-300 mx-auto" />
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-900">Hozircha biriktirilgan o'quvchilar mavjud emas</h3>
                <p className="text-xs text-slate-400">O'quvchilar platformadan ro'yxatdan o'tganda ro'yxatda paydo bo'ladi.</p>
              </div>
            </div>
          )}
        </Card>
      </main>
    </div>
  );
};
