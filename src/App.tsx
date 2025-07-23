import React, { useState, useEffect, useRef } from 'react';
import { HomePage } from './components/HomePage';
import LoginPage from './components/LoginPage';
import Alutila999 from './components/Alutila999';
import NotFoundPage from './components/NotFoundPage';
import { getCVData, fetchCVDataFromSupabase } from './utils/cvData';
import { CVData } from './types/cv';

// Simple top progress bar component
function TopProgressBar({ loading }: { loading: boolean }) {
  return loading ? (
    <div className="fixed top-0 left-0 w-full h-1 z-50">
      <div className="h-full bg-blue-500 animate-progress-bar" style={{ width: '100%' }} />
    </div>
  ) : null;
}

// Beautiful animated loader with progress bar and theme-aware background
function LoaderScreen() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-bg text-text transition-colors duration-500">
      {/* Logo at the top */}
      <div className="mb-8 text-3xl font-bold text-primary select-none tracking-wider">Rony.DB</div>
      {/* Animated graphic */}
      <div className="relative mb-8">
        <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="60" cy="60" r="50" stroke="var(--color-accent)" strokeWidth="8" opacity="0.2" />
          <circle
            cx="60" cy="60" r="50"
            stroke="var(--color-accent)"
            strokeWidth="8"
            strokeDasharray="314"
            strokeDashoffset="0"
            strokeLinecap="round"
            className="animate-spin-loader"
          />
          <circle cx="60" cy="60" r="30" fill="var(--color-accent)" opacity="0.08" />
          <circle cx="60" cy="60" r="10" fill="var(--color-accent)" className="animate-pulse" />
        </svg>
      </div>
      {/* Progress bar */}
      <div className="w-64 h-3 bg-row rounded-full overflow-hidden shadow-inner">
        <div className="h-full bg-accent animate-progress-bar-loader" style={{width: '60%'}} />
      </div>
      <div className="mt-6 text-lg font-medium text-secondary animate-pulse">Loading your experience...</div>
    </div>
  );
}

function App() {
  const lastPage = useRef<string>('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentPage, setCurrentPage] = useState('home');
  const [cvData, setCvData] = useState<CVData | null>(null);
  const [loading, setLoading] = useState(true);

  // Initial mount: check auth and set page
  useEffect(() => {
    const authStatus = localStorage.getItem('isAuthenticated');
    if (authStatus === 'true') {
      setIsAuthenticated(true);
    }
    // Handle navigation based on URL
    const path = window.location.pathname;
    if (path === '/alutila999') {
      setCurrentPage('dashboard');
    } else if (path === '/login') {
      setCurrentPage('login');
    } else if (path === '/') {
      setCurrentPage('home');
    } else {
      // Any other path should show 404
      setCurrentPage('404');
    }
  }, []);

  // Fetch fresh data only when currentPage changes to home or dashboard
  useEffect(() => {
    let ignore = false;
    const fetchData = async () => {
      setLoading(true);
      const supabaseData = await fetchCVDataFromSupabase();
      if (!ignore) setCvData(supabaseData);
      setLoading(false);
    };
    if (currentPage === 'home' || currentPage === 'dashboard') {
      fetchData();
    } else {
      // For other pages (login, 404), don't load data
      setLoading(false);
    }
    return () => { ignore = true; };
  }, [currentPage]);

  const handleLogin = () => {
    setIsAuthenticated(true);
    localStorage.setItem('isAuthenticated', 'true');
    setCurrentPage('dashboard');
    window.history.pushState({}, '', '/alutila999');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('isAuthenticated');
    setCurrentPage('home');
    window.history.pushState({}, '', '/');
  };

  const handleNavigateHome = () => {
    setCurrentPage('home');
  };

  // Handle browser navigation
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      if (path === '/alutila999') {
        setCurrentPage('dashboard');
      } else if (path === '/login') {
        setCurrentPage('login');
      } else if (path === '/') {
        setCurrentPage('home');
      } else {
        setCurrentPage('404');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Handle link clicks
  useEffect(() => {
    const handleLinkClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'A' && target.getAttribute('href')?.startsWith('/')) {
        e.preventDefault();
        const href = target.getAttribute('href')!;
        window.history.pushState({}, '', href);
        
        if (href === '/alutila999') {
          setCurrentPage('dashboard');
        } else if (href === '/login') {
          setCurrentPage('login');
        } else if (href === '/') {
          setCurrentPage('home');
        } else {
          setCurrentPage('404');
        }
      }
    };

    document.addEventListener('click', handleLinkClick);
    return () => document.removeEventListener('click', handleLinkClick);
  }, []);



  // Show loader screen while loading (but not for login or 404 pages)
  if ((loading || !cvData) && currentPage !== 'login' && currentPage !== '404') {
    return <LoaderScreen />;
  }

  if (currentPage === 'dashboard') {
    if (!isAuthenticated) {
      return <LoginPage onLogin={handleLogin} />;
    }
    return <>
      <TopProgressBar loading={loading} />
      <Alutila999 onLogout={handleLogout} onDataChange={async () => {
        // Only update cvData, don't set loading (prevents infinite loop)
        const supabaseData = await fetchCVDataFromSupabase();
        setCvData(supabaseData || getCVData());
      }} />
    </>;
  }

  if (currentPage === 'login') {
    return <LoginPage onLogin={handleLogin} />;
  }

  if (currentPage === '404') {
    return <NotFoundPage onNavigateHome={handleNavigateHome} />;
  }

  return <>
    <TopProgressBar loading={loading} />
    <HomePage cvData={cvData} setCvData={setCvData} />
  </>;
}

export default App;

// Add progress bar animation to global styles (tailwind or index.css):
// .animate-progress-bar { animation: progressBar 1.2s cubic-bezier(0.4,0,0.2,1) infinite; }
// @keyframes progressBar { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
// Add loader animation keyframes to global styles (index.css):
// .animate-spin-loader { animation: spinLoader 1.2s linear infinite; transform-origin: 60px 60px; }
// @keyframes spinLoader { 0% { stroke-dashoffset: 314; } 100% { stroke-dashoffset: 0; } }
// .animate-progress-bar-loader { animation: progressBarLoader 1.5s cubic-bezier(0.4,0,0.2,1) infinite; }
// @keyframes progressBarLoader { 0% { width: 0; } 50% { width: 100%; } 100% { width: 0; } }