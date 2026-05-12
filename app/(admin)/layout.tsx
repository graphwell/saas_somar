'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { Users, Server, ShieldAlert, LogOut, Loader2, LayoutDashboard } from 'lucide-react';

// Sub-componente que contém toda a lógica de sessão — nunca renderizado na login page
function AdminPanel({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-[#060910] flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-[#EF4444]" />
      </div>
    );
  }

  if (status === 'unauthenticated' || (session && (session.user as any)?.role !== 'ADMIN')) {
    router.replace('/admin/login');
    return (
      <div className="min-h-screen bg-[#060910] flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-[#EF4444]" />
      </div>
    );
  }

  const navItems = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Usuários/Clientes', href: '/admin/users', icon: Users },
    { name: 'Pool de Instâncias', href: '/admin/instances', icon: Server },
    { name: 'Logs e Auditoria', href: '/admin/logs', icon: ShieldAlert },
  ];

  return (
    <div className="flex h-screen bg-[#060910]">
      <aside className="w-[240px] h-screen bg-[#111827] border-r border-white/5 flex flex-col shrink-0">
        <div className="p-5 flex items-center gap-3 border-b border-white/5">
          <div className="w-9 h-9 rounded-lg bg-[#EF4444]/10 flex items-center justify-center shrink-0">
            <ShieldAlert size={18} className="text-[#EF4444]" />
          </div>
          <div>
            <span className="text-sm font-bold text-white tracking-tight leading-none">
              Somar<span className="text-[#EF4444]">.IA</span>
            </span>
            <p className="text-[10px] text-[#6B7280] font-medium mt-0.5">PAINEL ADMIN</p>
          </div>
        </div>

        <div className="px-4 py-3 border-b border-white/5">
          <div className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg bg-white/[0.02]">
            <div className="w-7 h-7 rounded-full bg-[#EF4444]/20 flex items-center justify-center text-[#EF4444] font-bold text-xs shrink-0">
              {session?.user?.name?.charAt(0).toUpperCase() ?? 'A'}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-white truncate leading-none">{session?.user?.name ?? 'Admin'}</p>
              <p className="text-[10px] text-[#EF4444] font-medium mt-0.5">ADMINISTRADOR</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-[8px] text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-[#EF4444]/10 border-l-2 border-[#EF4444] text-white'
                    : 'text-[#9CA3AF] hover:bg-white/5 hover:text-white'
                }`}
              >
                <Icon size={17} strokeWidth={2.5} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="px-3 py-5 border-t border-white/5 space-y-1">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 w-full px-3 py-2 rounded-[8px] text-sm font-medium text-[#6B7280] hover:bg-white/5 hover:text-white transition-all duration-150"
          >
            <LayoutDashboard size={17} strokeWidth={2.5} />
            Ir ao Dashboard
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: '/admin/login' })}
            className="flex items-center gap-3 w-full px-3 py-2 rounded-[8px] text-sm font-medium text-[#9CA3AF] hover:bg-[#EF4444]/5 hover:text-[#EF4444] transition-all duration-150"
          >
            <LogOut size={17} strokeWidth={2.5} />
            Sair do Admin
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto p-8">{children}</main>
    </div>
  );
}

// Layout raiz — só verifica o pathname, sem hooks de sessão aqui
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Na página de login, renderiza apenas o conteúdo sem sidebar nem verificação de sessão
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  return <AdminPanel>{children}</AdminPanel>;
}
