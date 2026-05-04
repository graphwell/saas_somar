"use client";

import React from 'react';
import { Bell, Search, Info } from 'lucide-react';
import { Badge } from '../ui/Badge';

interface TopbarProps {
  title?: string;
}

export const Topbar = ({ title = 'Dashboard' }: TopbarProps) => {
  return (
    <header className="h-[72px] border-b border-white/5 bg-[#0A0F1E]/80 backdrop-blur-md sticky top-0 z-30 px-8 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-bold text-white leading-none">
          {title}
        </h1>
        {/* Exemplo de badge de status global ou trial */}
        <Badge variant="amber" className="ml-2">
          Trial — 7 dias restantes
        </Badge>
      </div>

      <div className="flex items-center gap-4">
        {/* Search Bar - Opcional */}
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]" size={16} />
          <input 
            type="text" 
            placeholder="Buscar..." 
            className="bg-white/5 border border-white/10 rounded-full py-1.5 pl-10 pr-4 text-xs text-white placeholder-[#6B7280] focus:outline-none focus:ring-1 focus:ring-[#00E5A0]/50 transition-base w-48"
          />
        </div>

        <div className="flex items-center gap-2">
          <button className="p-2 rounded-full text-[#9CA3AF] hover:bg-white/5 hover:text-white transition-base relative">
            <Bell size={20} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-[#EF4444] rounded-full border border-[#0A0F1E]" />
          </button>
          <button className="p-2 rounded-full text-[#9CA3AF] hover:bg-white/5 hover:text-white transition-base">
            <Info size={20} />
          </button>
        </div>
      </div>
    </header>
  );
};
