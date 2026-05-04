import React from 'react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

interface PageLayoutProps {
  children: React.ReactNode;
  title?: string;
  className?: string;
}

export const PageLayout = ({ children, title, className = '' }: PageLayoutProps) => {
  return (
    <div className="flex bg-[#0A0F1E] min-h-screen text-white">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar title={title} />
        <main className={`flex-1 p-8 overflow-y-auto ${className}`}>
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
