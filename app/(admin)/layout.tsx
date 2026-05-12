'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { Users, Server, ShieldAlert, LogOut } from 'lucide-react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname();

  const navItems = [
    { name: 'Usuários/Clientes', href: '/admin/users', icon: Users },
    { name: 'Pool de Instâncias', href: '/admin/instances', icon: Server },
    { name: 'Logs e Monitoramento', href: '/admin/logs', icon: ShieldAlert },
  ];

  return (
    <div className="flex h-screen bg-[#060910]">
      <aside className="w-[240px] h-screen bg-[#111827] border-r border-white/5 flex flex-col shrink-0">
        {/* Logo Admin */}
        <div className="p-6 flex items-center gap-3 border-b border-white/5">
          <div className="w-16 h-16 rounded-lg bg-[#EF4444]/10 flex items-center justify-center">
            <ShieldAlert size={32} className="text-[#EF4444]" />
          </div>
          <span className="text-[28px] font-bold text-white tracking-tight">
            Somar<span className="text-[#EF4444]">.IA</span>{' '}
            <span className="text-[20px] text-[#6B7280] font-normal">ADMIN</span>
          </span>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`
                  flex items-center gap-3 px-3 py-2 rounded-[8px] text-sm font-medium transition-all duration-150
                  ${isActive
                    ? 'bg-[#EF4444]/10 border-l-2 border-[#EF4444] text-white'
                    : 'text-[#9CA3AF] hover:bg-white/5 hover:text-white'
                  }
                `}
              >
                <Icon size={18} strokeWidth={2.5} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="px-4 py-6 border-t border-white/5">
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="flex items-center gap-3 w-full px-3 py-2 rounded-[8px] text-sm font-medium text-[#9CA3AF] hover:bg-[#EF4444]/5 hover:text-[#EF4444] transition-all duration-150"
          >
            <LogOut size={18} strokeWidth={2.5} />
            Sair do Admin
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto p-8">
        {children}
      </main>
    </div>
  );
}
