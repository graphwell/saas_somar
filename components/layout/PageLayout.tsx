"use client";

import React, { useState, useCallback } from 'react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { TrialBannerWrapper } from '@/components/TrialBannerWrapper';

interface PageLayoutProps {
  children: React.ReactNode;
  title?: string;
  className?: string;
}

export const PageLayout = ({ children, title, className = '' }: PageLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const handleClose = useCallback(() => setSidebarOpen(false), []);

  return (
    <div className="flex bg-[#0A0F1E] min-h-screen text-white">
      <Sidebar isOpen={sidebarOpen} onClose={handleClose} />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar title={title} onMenuClick={() => setSidebarOpen(true)} />
        <TrialBannerWrapper />
        <main className={`flex-1 p-4 md:p-8 overflow-y-auto ${className}`}>
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
