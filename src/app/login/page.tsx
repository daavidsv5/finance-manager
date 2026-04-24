'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BarChart3, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    if (login(email, password)) {
      router.replace('/dashboard');
    } else {
      setError('Nesprávný e-mail nebo heslo.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#f4f7fc]">
      {/* Left panel - dark navy */}
      <div className="hidden lg:flex w-[420px] shrink-0 flex-col justify-between p-12" style={{ background: '#152347' }}>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: '#2563eb' }}>
            <BarChart3 className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-[17px] font-bold text-white">Finance Manager</p>
            <p className="text-[12px] text-white/40">Osobní správa financí</p>
          </div>
        </div>
        <div>
          <h2 className="text-[32px] font-bold text-white leading-tight mb-4">
            Mějte přehled<br />o svých financích
          </h2>
          <p className="text-[15px] text-white/50 leading-relaxed">
            Sledujte příjmy, výdaje, vzdělávání<br />a investice na jednom místě.
          </p>
        </div>
        <p className="text-[12px] text-white/25">© 2026 Finance Manager</p>
      </div>

      {/* Right panel - form */}
      <div className="flex flex-1 items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="mb-2">
            <p className="text-[13px] font-semibold text-slate-400 uppercase tracking-widest mb-2">Vítejte zpět</p>
            <h1 className="text-[30px] font-bold text-[#0f1d3a]">Přihlášení</h1>
          </div>
          <p className="text-[15px] text-slate-500 mb-8">Přihlaste se do svého účtu Finance Manager.</p>

          <div className="bg-white rounded-2xl border border-[#dde5f4] shadow-sm p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label className="text-[14px] font-semibold text-slate-600">E-mail</Label>
                <Input
                  type="email"
                  placeholder="david@finance.cz"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="h-11 text-[15px] border-[#dde5f4] focus-visible:ring-blue-500/30 focus-visible:border-blue-400"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[14px] font-semibold text-slate-600">Heslo</Label>
                <Input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="h-11 text-[15px] border-[#dde5f4] focus-visible:ring-blue-500/30 focus-visible:border-blue-400"
                  required
                />
              </div>
              {error && (
                <div className="flex items-center gap-2 text-[13px] text-red-600 bg-red-50 rounded-xl px-4 py-3 border border-red-200">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {error}
                </div>
              )}
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-11 text-[15px] font-bold rounded-xl shadow-md"
                style={{ background: '#2563eb' }}
              >
                {loading ? 'Přihlašování...' : 'Přihlásit se →'}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
