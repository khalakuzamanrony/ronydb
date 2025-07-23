import React, { useEffect } from 'react';
import { Home, ArrowLeft, Search, FileX } from 'lucide-react';

interface NotFoundPageProps {
  onNavigateHome: () => void;
}

const NotFoundPage: React.FC<NotFoundPageProps> = ({ onNavigateHome }) => {
  // Set browser tab title
  useEffect(() => {
    document.title = "404 - Page Not Found | Rony.DB";
  }, []);

  const handleGoHome = () => {
    window.history.pushState({}, '', '/');
    onNavigateHome();
  };

  const handleGoBack = () => {
    window.history.back();
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-bg text-text transition-colors duration-500 px-4">
      {/* Animated 404 Graphic */}
      <div className="relative mb-8">
        <div className="text-9xl font-bold text-primary opacity-20 select-none tracking-wider">
          404
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative">
            <svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Outer circle with rotating animation */}
              <circle 
                cx="100" 
                cy="100" 
                r="80" 
                stroke="var(--color-accent)" 
                strokeWidth="2" 
                opacity="0.3" 
                strokeDasharray="20 10"
                className="animate-spin-slow"
              />
              {/* Inner circle */}
              <circle 
                cx="100" 
                cy="100" 
                r="60" 
                stroke="var(--color-accent)" 
                strokeWidth="1" 
                opacity="0.5" 
                strokeDasharray="10 5"
                className="animate-spin-reverse"
              />
              {/* Center icon */}
              <circle cx="100" cy="100" r="40" fill="var(--color-accent)" opacity="0.1" />
              <FileX 
                size={48} 
                className="text-accent absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse" 
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="text-center max-w-md mx-auto">
        <h1 className="text-4xl font-bold text-primary mb-4 tracking-wide">
          Page Not Found
        </h1>
        <p className="text-lg text-secondary mb-2 leading-relaxed">
          Oops! The page you're looking for doesn't exist.
        </p>
        <p className="text-sm text-secondary opacity-80 mb-8">
          It might have been moved, deleted, or you entered the wrong URL.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button
            onClick={handleGoHome}
            className="flex items-center gap-2 px-6 py-3 bg-accent text-white rounded-lg hover:bg-accent/90 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl font-medium"
          >
            <Home size={20} />
            Go Home
          </button>
          
          <button
            onClick={handleGoBack}
            className="flex items-center gap-2 px-6 py-3 bg-row text-text border border-border rounded-lg hover:bg-row/80 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl font-medium"
          >
            <ArrowLeft size={20} />
            Go Back
          </button>
        </div>

        {/* Search Suggestion */}
        <div className="mt-8 p-4 bg-row rounded-lg border border-border">
          <div className="flex items-center gap-2 text-secondary mb-2">
            <Search size={16} />
            <span className="text-sm font-medium">Looking for something specific?</span>
          </div>
          <p className="text-xs text-secondary opacity-80">
            Try going back to the homepage to find what you need.
          </p>
        </div>

        {/* Decorative Elements */}
        <div className="mt-12 flex justify-center space-x-2">
          <div className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>

      {/* Background Pattern */}
      <div className="fixed inset-0 pointer-events-none opacity-5 z-0">
        <div className="absolute top-10 left-10 w-20 h-20 border border-accent rounded-full animate-pulse"></div>
        <div className="absolute top-32 right-20 w-16 h-16 border border-accent rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-20 left-20 w-24 h-24 border border-accent rounded-full animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-32 right-10 w-12 h-12 border border-accent rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
      </div>
    </div>
  );
};

export default NotFoundPage;
