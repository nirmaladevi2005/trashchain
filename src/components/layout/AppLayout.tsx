import { useLocation, useOutlet, Navigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';
import { useAuth } from '../../hooks/useAuth';
import { SidebarProvider, useSidebar } from '../../context/SidebarContext';
import { cn } from '../../utils/cn';
import { pageVariants, useShouldReduceMotion } from '../../utils/animationVariants';

import { CustomCursor } from '../ui/CustomCursor';
import { AppHeader } from './AppHeader';
import { PersonalFooter } from './PersonalFooter';

function LayoutContent() {
  const { isAuthenticated, loading, isDemo } = useAuth();
  const { isCollapsed } = useSidebar();
  const location = useLocation();
  const currentOutlet = useOutlet();
  const shouldReduceMotion = useShouldReduceMotion();

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
          "flex-1 pb-28 md:pb-6 transition-all duration-300 ease-in-out flex flex-col min-h-screen overflow-x-hidden",
          isCollapsed ? "md:ml-20" : "md:ml-64"
        )}
      >
        <AppHeader />
        <div className="max-w-7xl mx-auto w-full flex-1 px-4 sm:px-6 md:px-8 py-6 overflow-x-hidden flex flex-col justify-between">
          {shouldReduceMotion ? (
            currentOutlet
          ) : (
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={location.pathname}
                initial="initial"
                animate="animate"
                exit="exit"
                variants={pageVariants}
                className="w-full flex-1 flex flex-col"
              >
                {currentOutlet}
              </motion.div>
            </AnimatePresence>
          )}
          <PersonalFooter />
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
