import React from 'react';
import { BrowserRouter, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { AppRouter } from './router';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const LayoutContent: React.FC = () => {
  const location = useLocation();
  const path = location.pathname;

  const isContestPage = path.includes('/participate') || path.includes('/diagnostic');
  const isEgaAdminPage = path.startsWith('/ega');
  const isDashboardPage =
    path.startsWith('/dashboard') ||
    path.startsWith('/results') ||
    path.startsWith('/certificates') ||
    path.startsWith('/profile') ||
    path.startsWith('/teacher') ||
    path.startsWith('/student');

  // Hide top public Navbar on contest page, EGA admin page, or student/teacher cabinet pages
  const hideNavbar = isContestPage || isEgaAdminPage || isDashboardPage;

  // Hide bottom Footer on ALL dashboard pages (both Admin and User dashboards), contest page, and EGA pages
  const hideFooter = isContestPage || isEgaAdminPage || isDashboardPage;

  return (
    <div className="min-h-screen flex flex-col justify-between bg-surface text-accent font-sans">
      {!hideNavbar && <Navbar />}
      <div className="flex-1">
        <AppRouter />
      </div>
      {!hideFooter && <Footer />}
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <LayoutContent />
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
