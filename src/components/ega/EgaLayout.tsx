import React, { useState } from 'react';
import { EgaSidebar } from './EgaSidebar';
import { EgaNavbar } from './EgaNavbar';
import { useThemeStore } from '../../store/useThemeStore';
import { clsx } from 'clsx';

interface EgaLayoutProps {
  children: React.ReactNode;
}

export const EgaLayout: React.FC<EgaLayoutProps> = ({ children }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { theme } = useThemeStore();
  const isDark = theme === 'dark';

  return (
    <div
      className={clsx(
        "flex h-screen w-screen overflow-hidden font-sans transition-colors duration-300",
        isDark ? "bg-[#0A1428] text-slate-100" : "bg-[#F8FAFC] text-slate-900"
      )}
    >
      {/* Sticky Collapsible Left Sidebar */}
      <EgaSidebar isCollapsed={isCollapsed} />

      {/* Main Content Independent Scroll Container */}
      <div
        className={clsx(
          "flex-1 flex flex-col h-screen overflow-y-auto min-w-0 transition-colors duration-300",
          isDark ? "bg-[#0A1428]" : "bg-[#F8FAFC]"
        )}
      >
        <EgaNavbar isCollapsed={isCollapsed} onToggleCollapse={() => setIsCollapsed(!isCollapsed)} />
        <main className="p-6 md:p-8 max-w-[1600px] w-full mx-auto space-y-8 flex-1">
          {children}
        </main>
      </div>
    </div>
  );
};
