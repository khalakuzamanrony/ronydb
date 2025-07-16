import React, { useState, useEffect } from 'react';
import { HomePage } from './components/HomePage';
import LoginPage from './components/LoginPage';
import Dashboard from './components/Dashboard';
import { getCVData } from './utils/cvData';
import { CVData } from './types/cv';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentPage, setCurrentPage] = useState('home');
  const [cvData, setCvData] = useState<CVData>(getCVData());

  useEffect(() => {
    // Check authentication status on component mount
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

  if (currentPage === 'dashboard') {
    if (!isAuthenticated) {
      return <LoginPage onLogin={handleLogin} />;
    }
    return <Dashboard onLogout={handleLogout} onDataChange={() => setCvData(getCVData())} />;
  }

  if (currentPage === 'login') {
    return <LoginPage onLogin={handleLogin} />;
  }

  return <HomePage cvData={cvData} onNavigateToDashboard={handleNavigateToDashboard} />;
}

export default App;