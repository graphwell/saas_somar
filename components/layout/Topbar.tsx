"use client";

import React from 'react';
import { Bell, Search, Info, Menu } from 'lucide-react';
import { Badge } from '../ui/Badge';

interface TopbarProps {
  title?: string;
  onMenuClick?: () => void;
}

export const Topbar = ({ title = 'Dashboard', onMenuClick }: TopbarProps) => {
  return (
    <header className="h-[64px] md:h-[72px] border-b border-white/5 bg-[#0A0F1E]/80 backdrop-blur-md sticky top-0 z-30 px-4 md:px-8 flex items-center justify-between">
      <div className="flex items-center gap-3">
        {/* Hamburger — só mobile */}
        <button
          className="md:hidden p-2 rounded-lg text-[#9CA3AF] hover:text-white hover:bg-white/10 transition-colors"
          onClick={onMenuClick}
          aria-label="Abrir menu"
        >
          <Menu size={20} />
        </button>

        <h1 className="text-base md:text-xl font-bold text-white leading-none">
          {title}
        </h1>
        <Badge variant="amber" className="ml-1 hidden sm:inline-flex">
          Trial — 7 dias restantes
        </Badge>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        {/* Search — só desktop */}
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]" size={16} />
          <input
            type="text"
            placeholder="Buscar..."
            className="bg-white/5 border border-white/10 rounded-full py-1.5 pl-10 pr-4 text-xs text-white placeholder-[#6B7280] focus:outline-none focus:ring-1 focus:ring-[#00E5A0]/50 transition-colors w-48"
          />
        </div>

        <div className="flex items-center gap-1">
          <button className="p-2 rounded-full text-[#9CA3AF] hover:bg-white/5 hover:text-white transition-colors relative">
            <Bell size={18} />
            <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-[#EF4444] rounded-full border border-[#0A0F1E]" />
          </button>
          <button className="hidden sm:flex p-2 rounded-full text-[#9CA3AF] hover:bg-white/5 hover:text-white transition-colors">
            <Info size={18} />
          </button>
        </div>
      </div>
    </header>
  );
};
