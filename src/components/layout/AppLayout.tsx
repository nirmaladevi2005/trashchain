import { Outlet, Navigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';
import { useAuth } from '../../hooks/useAuth';
import { SidebarProvider, useSidebar } from '../../context/SidebarContext';
import { cn } from '../../utils/cn';

function LayoutContent() {
  const { isAuthenticated, loading, isDemo } = useAuth();
  const { isCollapsed } = useSidebar();

  if (!loading && !isAuthenticated && !isDemo) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex min-h-screen bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 transition-colors duration-200">
      <Sidebar />
      
      <main 
        className={cn(
          "flex-1 pb-16 md:pb-0 transition-all duration-300 ease-in-out",
          isCollapsed ? "md:ml-20" : "md:ml-64"
        )}
      >
        <div className="max-w-7xl mx-auto w-full min-h-screen">
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
