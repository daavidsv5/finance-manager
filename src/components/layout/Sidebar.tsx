'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { cn } from '@/lib/utils';
import {
  CreditCard,
  GraduationCap,
  TrendingUp,
  Wallet,
  LogOut,
  BarChart3,
} from 'lucide-react';

const navItems = [
  { href: '/dashboard/monthly', label: 'Měsíční výdaje', icon: CreditCard },
  { href: '/dashboard/education', label: 'Vzdělávání', icon: GraduationCap },
  { href: '/dashboard/income', label: 'Příjmy', icon: Wallet },
  { href: '/dashboard/investments', label: 'Investice', icon: TrendingUp },
];

export function Sidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();
  const router = useRouter();

  return (
    <aside className="flex h-screen w-[260px] shrink-0 flex-col" style={{ background: '#152347' }}>
      {/* Logo */}
      <div className="flex h-20 items-center gap-3.5 px-6 border-b border-white/8">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: '#2563eb' }}>
          <BarChart3 className="h-5 w-5 text-white" />
        </div>
        <div>
          <p className="text-[22px] font-bold text-white leading-tight">Finance</p>
          <p className="text-[14px] text-white/40 leading-tight">Manager</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        <p className="px-3 mb-4 text-[13px] font-bold uppercase tracking-[0.12em] text-white/25">Přehledy</p>
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3.5 rounded-xl px-4 py-3 text-[18px] font-semibold transition-all duration-150',
                active ? 'text-white' : 'text-white/45 hover:text-white/80 hover:bg-white/6'
              )}
              style={active ? { background: '#2563eb' } : {}}
            >
              <Icon className={cn('h-5 w-5 shrink-0', active ? 'text-white' : 'text-white/35')} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* User + logout */}
      <div className="border-t border-white/8 p-4">
        <div className="px-3 py-2 mb-1">
          <p className="text-[18px] font-bold text-white/70">David</p>
          <p className="text-[14px] text-white/30">david@finance.cz</p>
        </div>
        <button
          onClick={() => { logout(); router.replace('/login'); }}
          className="flex w-full items-center gap-3.5 rounded-xl px-4 py-3 text-[18px] font-semibold text-white/40 hover:bg-white/6 hover:text-white/70 transition-all"
        >
          <LogOut className="h-5 w-5 shrink-0 text-white/25" />
          Odhlásit se
        </button>
      </div>
    </aside>
  );
}
