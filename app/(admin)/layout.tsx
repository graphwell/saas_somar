'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { useEffect, useState } from 'react';
import {
  Users, Server, ShieldAlert, LogOut,
  Loader2, LayoutDashboard, Bell, AlertTriangle,
} from 'lucide-react';

type Notification = {
  id: string;
  type: string;
  message: string;
  read: boolean;
  createdAt: string;
};

function AdminPanel({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotif, setShowNotif] = useState(false);

  useEffect(() => {
    const fetchNotifications = () => {
      fetch('/api/admin/notifications')
        .then(r => r.json())
        .then(d => {
          setUnreadCount(d.unreadCount ?? 0);
          setNotifications(d.notifications ?? []);
        })
        .catch(() => {});
    };
    fetchNotifications();
    const id = setInterval(fetchNotifications, 30000);
    return () => clearInterval(id);
  }, []);

  const markAllRead = async () => {
    await fetch('/api/admin/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ markAllRead: true }),
    });
    setUnreadCount(0);
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

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

  const typeColor: Record<string, string> = {
    TRIAL_POOL_EMPTY: 'text-[#EF4444]',
    TRIAL_POOL_LOW: 'text-[#F59E0B]',
    PAID_POOL_EMPTY: 'text-[#EF4444]',
    PAID_POOL_LOW: 'text-[#F59E0B]',
  };

  return (
    <div className="flex h-screen bg-[#060910]">
      <aside className="w-[240px] h-screen bg-[#111827] border-r border-white/5 flex flex-col shrink-0">
        {/* Logo */}
        <div className="p-5 flex items-center justify-between border-b border-white/5">
          <div className="flex items-center gap-3">
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

          {/* Sino de notificações */}
          <div className="relative">
            <button
              onClick={() => setShowNotif(!showNotif)}
              className="relative p-1.5 rounded-lg hover:bg-white/5 transition-colors"
            >
              <Bell size={16} className="text-[#9CA3AF]" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#EF4444] rounded-full text-[9px] font-black text-white flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Dropdown de notificações */}
            {showNotif && (
              <div className="absolute left-0 top-9 w-72 bg-[#111827] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
                  <span className="text-xs font-bold text-white">Notificações</span>
                  {unreadCount > 0 && (
                    <button onClick={markAllRead} className="text-[10px] text-[#6C5DD3] hover:underline">
                      Marcar todas lidas
                    </button>
                  )}
                </div>
                <div className="max-h-72 overflow-y-auto divide-y divide-white/5">
                  {notifications.length === 0 ? (
                    <p className="text-center text-[#6B7280] text-xs py-8">Sem notificações.</p>
                  ) : (
                    notifications.map(n => (
                      <div
                        key={n.id}
                        className={`px-4 py-3 flex gap-3 ${n.read ? 'opacity-50' : 'bg-white/[0.02]'}`}
                      >
                        <AlertTriangle size={13} className={`shrink-0 mt-0.5 ${typeColor[n.type] ?? 'text-[#F59E0B]'}`} />
                        <div>
                          <p className="text-[11px] text-white leading-relaxed">{n.message}</p>
                          <p className="text-[10px] text-[#6B7280] mt-1">
                            {new Date(n.createdAt).toLocaleString('pt-BR')}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <div className="px-4 py-3 border-t border-white/5">
                  <Link
                    href="/admin/instances"
                    onClick={() => setShowNotif(false)}
                    className="text-[10px] text-[#6C5DD3] hover:underline font-bold uppercase tracking-widest"
                  >
                    Gerenciar Pool →
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Info do admin */}
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

        {/* Navegação */}
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

        {/* Rodapé */}
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

      <main className="flex-1 overflow-auto p-8" onClick={() => setShowNotif(false)}>
        {children}
      </main>
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname === '/admin/login') return <>{children}</>;
  return <AdminPanel>{children}</AdminPanel>;
}
