"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { 
  LayoutDashboard, 
  Bot, 
  MessageSquare, 
  Smartphone, 
  CreditCard, 
  HelpCircle, 
  Settings, 
  LogOut 
} from 'lucide-react';

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
  { label: 'Meu Agente', icon: Bot, href: '/agente' },
  { label: 'Conversas', icon: MessageSquare, href: '/conversas' },
  { label: 'WhatsApp', icon: Smartphone, href: '/whatsapp' },
  { label: 'Plano & Cobrança', icon: CreditCard, href: '/plano' },
];

const secondaryItems = [
  { label: 'Suporte', icon: HelpCircle, href: '/suporte' },
  { label: 'Configurações', icon: Settings, href: '/configuracoes' },
];

export const Sidebar = () => {
  const pathname = usePathname();
  const { data: session } = useSession();

  const userName = session?.user?.name || 'Usuário';
  const userEmail = session?.user?.email || '';
  const userInitial = userName.charAt(0).toUpperCase();

  const handleLogout = () => {
    signOut({ callbackUrl: '/login' });
  };

  return (
    <aside className="w-[240px] h-screen bg-[#111827] border-r border-white/5 flex flex-col shrink-0">
      {/* Logo */}
      <div className="relative px-5 py-4">
        {/* Halo de brilho atrás da logo */}
        <div
          aria-hidden
          style={{
            position: 'absolute',
            left: '14px',
            top: '50%',
            transform: 'translateY(-50%)',
            width: '72px',
            height: '72px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,255,255,0.14) 0%, rgba(255,80,80,0.08) 45%, transparent 70%)',
            filter: 'blur(8px)',
            pointerEvents: 'none',
          }}
        />
        <Link href="/dashboard" className="flex items-center gap-2 relative z-10">
          <img
            src="/logo.png"
            alt="Somar.IA"
            className="h-14 w-auto object-contain"
            style={{
              filter: 'drop-shadow(0 0 6px rgba(255,255,255,0.55)) drop-shadow(0 0 14px rgba(255,100,100,0.35))',
              mixBlendMode: 'screen',
            }}
          />
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex items-center gap-3 px-3 py-2 rounded-[8px] text-sm font-medium transition-base
                ${isActive 
                  ? 'bg-[#00E5A0]/10 border-l-2 border-[#00E5A0] text-white shadow-[0_0_15px_rgba(0,229,160,0.1)]' 
                  : 'text-[#9CA3AF] hover:bg-white/5 hover:text-white'
                }
              `}
            >
              <item.icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Secondary & User */}
      <div className="px-4 py-6 space-y-4 border-t border-white/5">
        <div className="space-y-1">
          {secondaryItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2 rounded-[8px] text-sm font-medium text-[#9CA3AF] hover:bg-white/5 hover:text-white transition-base"
            >
              <item.icon size={18} />
              {item.label}
            </Link>
          ))}
        </div>

        {/* User Info — dados reais da sessão */}
        <div className="flex items-center justify-between p-3 rounded-[12px] bg-white/5">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-full bg-[#6C5DD3] flex items-center justify-center text-xs font-bold text-white shrink-0">
              {userInitial}
            </div>
            <div className="flex flex-col min-w-0 leading-tight">
              <span className="text-xs font-medium text-white truncate">{userName}</span>
              <span className="text-[10px] text-[#6B7280] truncate">{userEmail}</span>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            title="Sair"
            className="text-[#9CA3AF] hover:text-[#EF4444] transition-base p-1 rounded"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
};
