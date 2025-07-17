import React, { useState, useEffect, useRef } from 'react';
import { HomePage } from './components/HomePage';
import LoginPage from './components/LoginPage';
import Dashboard from './components/Dashboard';
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
    if (path === '/dashboard') {
      setCurrentPage('dashboard');
    } else if (path === '/login') {
      setCurrentPage('login');
    } else {
      setCurrentPage('home');
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
    }
    return () => { ignore = true; };
  }, [currentPage]);

  const handleLogin = () => {
    setIsAuthenticated(true);
    localStorage.setItem('isAuthenticated', 'true');
    setCurrentPage('dashboard');
    window.history.pushState({}, '', '/dashboard');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('isAuthenticated');
    setCurrentPage('home');
    window.history.pushState({}, '', '/');
  };

  // Handle browser navigation
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      if (path === '/dashboard') {
        setCurrentPage('dashboard');
      } else if (path === '/login') {
        setCurrentPage('login');
      } else {
        setCurrentPage('home');
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
        
        if (href === '/dashboard') {
          setCurrentPage('dashboard');
        } else if (href === '/login') {
          setCurrentPage('login');
        } else {
          setCurrentPage('home');
        }
      }
    };

    document.addEventListener('click', handleLinkClick);
    return () => document.removeEventListener('click', handleLinkClick);
  }, []);

  const handleNavigateToDashboard = () => {
    setCurrentPage('dashboard');
    window.history.pushState({}, '', '/dashboard');
  };

  // Show top progress bar while loading
  if (loading || !cvData) {
    return <>
      <TopProgressBar loading={true} />
      <div className="min-h-screen flex items-center justify-center text-xl text-gray-600">Loading...</div>
    </>;
  }

  if (currentPage === 'dashboard') {
    if (!isAuthenticated) {
      return <LoginPage onLogin={handleLogin} />;
    }
    return <>
      <TopProgressBar loading={loading} />
      <Dashboard onLogout={handleLogout} onDataChange={async () => {
        // Only update cvData, don't set loading (prevents infinite loop)
        const supabaseData = await fetchCVDataFromSupabase();
        setCvData(supabaseData || getCVData());
      }} />
    </>;
  }

  if (currentPage === 'login') {
    return <LoginPage onLogin={handleLogin} />;
  }

  return <>
    <TopProgressBar loading={loading} />
    <HomePage cvData={cvData} onNavigateToDashboard={handleNavigateToDashboard} />
  </>;
}

export default App;

// Add progress bar animation to global styles (tailwind or index.css):
// .animate-progress-bar { animation: progressBar 1.2s cubic-bezier(0.4,0,0.2,1) infinite; }
// @keyframes progressBar { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }