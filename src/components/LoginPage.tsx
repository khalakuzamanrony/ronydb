import React, { useState, useEffect } from 'react';
import { Lock, Mail, AlertCircle, LogIn, Clock, Eye, EyeOff } from 'lucide-react';
import CryptoJS from 'crypto-js';
import { supabase } from '../utils/supabaseClient';
import { decryptUserData } from '../utils/encryption';
import { startDevToolsProtection, showConsoleWarning } from '../utils/devToolsProtection';

interface LoginPageProps {
  onLogin: () => void;
}

interface LoginAttempt {
  id?: string;
  email: string;
  attempt_count: number;
  last_attempt: string;
  lockout_until?: string;
  created_at?: string;
  updated_at?: string;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [lockoutTime, setLockoutTime] = useState<number>(0);
  const [showPassword, setShowPassword] = useState(false);
  
  // Database validation function
  const validateCredentialsWithDB = async (email: string, password: string): Promise<boolean> => {
    try {
      const hashedPassword = CryptoJS.SHA256(password).toString();
      
      // Get all encrypted records and decrypt them to find match
      const { data: allRecords, error } = await supabase
        .from('allowed_emails')
        .select('email, password_hash');

      if (error) {
        console.error('Database validation error:', error);
        return false;
      }

      if (!allRecords || allRecords.length === 0) {
        return false;
      }

      // Check each record by decrypting and comparing
      for (const record of allRecords) {
        try {
          const decrypted = decryptUserData(record);
          if (decrypted && decrypted.email === email.toLowerCase() && decrypted.password_hash === hashedPassword) {
            return true;
          }
        } catch (decryptError) {
          console.error('Error decrypting record:', decryptError);
          // Continue to next record
        }
      }

      return false;
    } catch (error) {
      console.error('Credential validation failed:', error);
      return false;
    }
  };

  // Get login attempts from database
  const getLoginAttemptsFromDB = async (email: string): Promise<LoginAttempt | null> => {
    try {
      const { data, error } = await supabase
        .from('login_attempts')
        .select('*')
        .eq('email', email.toLowerCase())
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
        console.error('Error fetching login attempts:', error);
        return null;
      }

      return data || null;
    } catch (error) {
      console.error('Failed to get login attempts:', error);
      return null;
    }
  };

  // Update login attempts in database
  const updateLoginAttemptsInDB = async (email: string, attemptCount: number, lockoutUntil?: Date): Promise<void> => {
    try {
      const updateData: any = {
        email: email.toLowerCase(),
        attempt_count: attemptCount,
        last_attempt: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      if (lockoutUntil) {
        updateData.lockout_until = lockoutUntil.toISOString();
      } else {
        updateData.lockout_until = null;
      }

      const { error } = await supabase
        .from('login_attempts')
        .upsert(updateData, { onConflict: 'email' });

      if (error) {
        console.error('Error updating login attempts:', error);
      }
    } catch (error) {
      console.error('Failed to update login attempts:', error);
    }
  };

  // Check if account is locked out using database
  const checkLockoutStatus = async (email: string): Promise<boolean> => {
    if (!email) return false;
    
    const attempts = await getLoginAttemptsFromDB(email);
    if (!attempts) return false;
    
    const now = new Date();
    
    if (attempts.lockout_until) {
      const lockoutUntil = new Date(attempts.lockout_until);
      if (now < lockoutUntil) {
        const remainingTime = Math.ceil((lockoutUntil.getTime() - now.getTime()) / 1000);
        setLockoutTime(remainingTime);
        setIsLocked(true);
        setError(`Account locked. Try again in ${formatLockoutTime(remainingTime)}.`);
        return true;
      }
    }
    
    setIsLocked(false);
    setLockoutTime(0);
    return false;
  };

  // Handle failed login attempt using database
  const handleFailedAttempt = async (email: string) => {
    const attempts = await getLoginAttemptsFromDB(email) || { 
      email: email.toLowerCase(), 
      attempt_count: 0, 
      last_attempt: new Date().toISOString() 
    };
    
    const newAttemptCount = attempts.attempt_count + 1;
    let lockoutUntil: Date | undefined;

    // Progressive lockout schedule
    if (newAttemptCount >= 4) {
      let lockoutDuration = 0;
      
      switch (newAttemptCount) {
        case 4:
          lockoutDuration = 60 * 60 * 1000; // 1 hour
          break;
        case 5:
          lockoutDuration = 12 * 60 * 60 * 1000; // 12 hours
          break;
        case 6:
          lockoutDuration = 24 * 60 * 60 * 1000; // 24 hours
          break;
        case 7:
          lockoutDuration = 48 * 60 * 60 * 1000; // 48 hours
          break;
        default:
          lockoutDuration = 7 * 24 * 60 * 60 * 1000; // 1 week
      }
      
      lockoutUntil = new Date(Date.now() + lockoutDuration);
      const lockoutTime = Math.ceil(lockoutDuration / 1000);
      setLockoutTime(lockoutTime);
      setIsLocked(true);
      setError(`Account locked after ${newAttemptCount} failed attempts. Try again in ${formatLockoutTime(lockoutTime)}.`);
    } else {
      const remainingAttempts = 4 - newAttemptCount;
      setError(`Invalid credentials. ${remainingAttempts} attempt${remainingAttempts !== 1 ? 's' : ''} remaining before lockout.`);
    }

    await updateLoginAttemptsInDB(email, newAttemptCount, lockoutUntil);
  };

  // Handle successful login
  const handleSuccessfulLogin = async (email: string) => {
    // Clear login attempts on successful login
    await updateLoginAttemptsInDB(email, 0);
    setError('');
    setIsLocked(false);
    setLockoutTime(0);
    onLogin();
  };

  // Main login handler
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if account is locked before attempting login
    const isLocked = await checkLockoutStatus(email);
    if (isLocked) {
      return;
    }

    setLoading(true);
    setError('');

    // Simulate network delay for security
    await new Promise(resolve => setTimeout(resolve, 1000));

    const isValid = await validateCredentialsWithDB(email, password);
    
    if (isValid) {
      console.log('Login successful for:', email);
      // Store current user email for dashboard use
      localStorage.setItem('current_user_email', email);
      await handleSuccessfulLogin(email);
    } else {
      console.log('Login failed for:', email);
      await handleFailedAttempt(email);
    }

    setLoading(false);
  };

  // Format remaining lockout time (expects seconds)
  const formatLockoutTime = (seconds: number): string => {
    if (seconds <= 0) return '';
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  // Check lockout status on component mount and initialize security
  useEffect(() => {
    const checkInitialLockout = async () => {
      if (email) {
        await checkLockoutStatus(email);
      }
    };
    checkInitialLockout();
    
    // Initialize security protection for login page
    startDevToolsProtection();
    showConsoleWarning();
  }, [email]);

  // Update lockout countdown every second
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isLocked && lockoutTime > 0) {
      interval = setInterval(() => {
        setLockoutTime(prev => {
          if (prev <= 1) {
            setIsLocked(false);
            setError('');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isLocked, lockoutTime]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center mb-4">
            <LogIn className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Portal Login</h1>
          <p className="text-gray-600">Sign in to access the dashboard</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          </div>
        )}

        {isLocked && lockoutTime > 0 && (
          <div className="mb-6 p-4 bg-yellow-50 border-l-4 border-yellow-500 rounded-r-lg">
            <div className="flex items-center">
              <Clock className="w-5 h-5 text-yellow-500 mr-2" />
              <p className="text-yellow-700 text-sm">
                Account locked. Time remaining: {formatLockoutTime(lockoutTime)}
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                required
              />
            </div>
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading || isLocked}
            className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Signing in...' : 'Sign in with Email'}
          </button>
        </form>

        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-600 text-center">
            <strong>Note:</strong> Only authorized users can access this portal. 
            After 4 failed attempts, the account will be locked with progressive timeouts.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
