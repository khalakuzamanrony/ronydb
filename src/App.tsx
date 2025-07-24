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

// Modern interactive loader with smooth animations
function LoaderScreen() {
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState('Preparing your experience...');
  const messages = [
    'Loading your data...',
    'Almost there...',
    'Just a moment...',
    'Finishing up...'
  ];

  useEffect(() => {
    // Simulate progress
    const interval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + Math.random() * 10;
        // Update message at certain progress points
        if (newProgress > 20 && newProgress < 30) setMessage(messages[1]);
        if (newProgress > 50 && newProgress < 60) setMessage(messages[2]);
        if (newProgress > 80) setMessage(messages[3]);
        return newProgress > 100 ? 100 : newProgress;
      });
    }, 300);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gray-900 text-white p-4">
      {/* Animated logo */}
      <div className="relative mb-12">
        <div className="relative z-10 text-4xl font-bold text-white select-none tracking-wider transform hover:scale-105 transition-transform duration-500">
          Rony.DB
        </div>
        <div className="absolute -inset-4 bg-indigo-500/20 rounded-full blur-xl opacity-70 animate-pulse-slow" />
      </div>

      {/* Animated circles */}
      <div className="relative w-40 h-40 mb-8">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="absolute inset-0 rounded-full border-4 border-accent/20"
            style={{
              transform: `scale(${1 - i * 0.2})`,
              animation: `pulse 2s cubic-bezier(0.4, 0, 0.6, 1) ${i * 0.3}s infinite`,
            }}
          />
        ))}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center">
            <div className="w-3 h-3 rounded-full bg-accent animate-ping" />
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full max-w-xs mb-6">
        <div className="flex justify-between text-sm text-gray-300 mb-1">
          <span>{message}</span>
          <span className="font-mono">{Math.min(100, Math.round(progress))}%</span>
        </div>
        <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-300 ease-out shadow-lg shadow-indigo-500/30"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Loading dots */}
      <div className="flex space-x-2 mt-4">
        {[0, 1, 2].map((i) => (
          <div 
            key={i}
            className="w-2.5 h-2.5 bg-white rounded-full opacity-0"
            style={{
              animation: `bounce 1.4s infinite ${i * 0.16}s`,
            }}
          />
        ))}
      </div>
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