'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { useStore } from '@/lib/store';
import { Sidebar } from '@/components/layout/Sidebar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const { dbLoaded } = useStore();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) router.replace('/login');
  }, [isAuthenticated, router]);

  if (!isAuthenticated) return null;

  return (
    <div className="flex h-screen overflow-hidden bg-[#f4f7fc]">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        {!dbLoaded ? (
          <div className="flex h-full items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#2563eb] border-t-transparent" />
              <p className="text-[14px] font-medium text-slate-400">Načítám data…</p>
            </div>
          </div>
        ) : (
          <div className="p-8 max-w-screen-xl mx-auto">
            {children}
          </div>
        )}
      </main>
    </div>
  );
}
