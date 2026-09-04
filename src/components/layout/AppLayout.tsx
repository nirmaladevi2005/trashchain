import { Outlet, Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';
import { useAuth } from '../../hooks/useAuth';
import { SidebarProvider, useSidebar } from '../../context/SidebarContext';
import { cn } from '../../utils/cn';

import { CustomCursor } from '../ui/CustomCursor';
import { AppHeader } from './AppHeader';

function LayoutContent() {
  const { isAuthenticated, loading, isDemo } = useAuth();
  const { isCollapsed } = useSidebar();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F6F8F5] dark:bg-[#0A0F0D] text-[#0F172A] dark:text-[#F8FAFC]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600 dark:text-emerald-400" />
          <p className="text-xs font-mono text-[#64748B] dark:text-[#94A3B8]">Initializing session...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated && !isDemo) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex min-h-screen bg-[#F6F8F5] dark:bg-[#0A0F0D] text-[#0F172A] dark:text-[#F8FAFC] transition-colors duration-200">
      <CustomCursor />
      <Sidebar />
      
      <main 
        className={cn(
          "flex-1 pb-24 md:pb-6 transition-all duration-300 ease-in-out flex flex-col min-h-screen",
          isCollapsed ? "md:ml-20" : "md:ml-64"
        )}
      >
        <AppHeader />
        <div className="max-w-7xl mx-auto w-full flex-1 px-4 sm:px-6 md:px-8 py-6">
          <Outlet />
        </div>
      </main>
      
      <BottomNav />
    </div>
  );
}

export function AppLayout() {
  return (
    <SidebarProvider>
      <LayoutContent />
    </SidebarProvider>
  );
}
