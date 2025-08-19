// Dev Tools Detection and Protection
let devToolsOpen = false;
let devToolsCheckInterval: NodeJS.Timeout;
let devToolsProtectionEnabled = true;
let eventListenersAttached = false;

// More precise dev tools detection
const detectDevTools = () => {
  // If protection is disabled, never detect dev tools
  if (!devToolsProtectionEnabled) {
    return false;
  }
  
  const threshold = 200; // Increased threshold to reduce false positives
  
  // Method 1: Check window size difference (more conservative)
  const widthDiff = window.outerWidth - window.innerWidth;
  const heightDiff = window.outerHeight - window.innerHeight;
  const widthThreshold = widthDiff > threshold;
  const heightThreshold = heightDiff > threshold;
  
  // Method 2: Console detection (simplified to reduce false triggers)
  let consoleOpen = false;
  
  // Only use image element detection
  const element = new Image();
  Object.defineProperty(element, 'id', {
    get: function() {
      consoleOpen = true;
      return 'devtools-detector';
    }
  });
  
  // Temporarily log to trigger detection
  // console.log(element);
  
  // Method 3: Performance timing (more lenient)
  const start = performance.now();
  debugger;
  const end = performance.now();
  const debuggerDetected = end - start > 200; // Increased threshold
  
  // Only trigger if multiple methods detect or very obvious signs
  const sizeDetection = (widthThreshold && heightThreshold) || (widthDiff > 300) || (heightDiff > 300);
  
  return sizeDetection || (consoleOpen && debuggerDetected);
};

// Actions to take when dev tools are detected
const onDevToolsOpen = () => {
  if (!devToolsOpen && devToolsProtectionEnabled) {
    devToolsOpen = true;
    
    // Clear sensitive data from memory
    clearSensitiveData();
    
    // Show warning
    showDevToolsWarning();
    
    // Optional: Redirect or disable functionality
    // window.location.href = '/security-warning';
  }
};

// Clear sensitive data from browser
const clearSensitiveData = () => {
  // Clear localStorage
  localStorage.removeItem('current_user_email');
  
  // Clear sessionStorage
  sessionStorage.clear();
  
  // Clear any cached API responses
  if ('caches' in window) {
    caches.keys().then(names => {
      names.forEach(name => {
        caches.delete(name);
      });
    });
  }
};

// Show warning overlay
const showDevToolsWarning = () => {
  const overlay = document.createElement('div');
  overlay.id = 'devtools-warning';
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.9);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 999999;
    font-family: Arial, sans-serif;
    font-size: 24px;
    text-align: center;
    backdrop-filter: blur(10px);
  `;
  
  overlay.innerHTML = `
    <div>
      <h2>⚠️ Security Warning</h2>
      <p>Developer tools detected. For security reasons, this session has been terminated.</p>
      <p>Please refresh the page and log in again.</p>
      <button onclick="window.location.reload()" style="
        background: #dc2626;
        color: white;
        border: none;
        padding: 12px 24px;
        border-radius: 6px;
        font-size: 16px;
        cursor: pointer;
        margin-top: 20px;
      ">Refresh Page</button>
    </div>
  `;
  
  document.body.appendChild(overlay);
};

// Anti-debugger interval reference
let antiDebuggerInterval: NodeJS.Timeout;

// Start monitoring
export const startDevToolsProtection = () => {
  if (!devToolsProtectionEnabled) return;
  
  // Skip initial check to prevent false positives on page load
  
  // Less aggressive periodic checks (every 500ms to reduce false positives)
  devToolsCheckInterval = setInterval(() => {
    if (devToolsProtectionEnabled && detectDevTools()) {
      onDevToolsOpen();
    }
  }, 500);
  
  // Reduced debugger statements to prevent false triggers
  const antiDebugger = () => {
    antiDebuggerInterval = setInterval(() => {
      if (devToolsProtectionEnabled) {
        debugger;
      }
    }, 1000);
  };
  
  antiDebugger();
  
  // Enhanced keyboard shortcuts detection
  const handleKeyDown = (e: KeyboardEvent) => {
    if (!devToolsProtectionEnabled) return;
    
    // F12
    if (e.key === 'F12') {
      e.preventDefault();
      e.stopPropagation();
      onDevToolsOpen();
      return false;
    }
    
    // Ctrl+Shift+I (Windows/Linux) or Cmd+Option+I (Mac)
    if ((e.ctrlKey && e.shiftKey && e.key === 'I') || 
        (e.metaKey && e.altKey && e.key === 'I')) {
      e.preventDefault();
      e.stopPropagation();
      onDevToolsOpen();
      return false;
    }
    
    // Ctrl+Shift+J (Console) or Cmd+Option+J (Mac)
    if ((e.ctrlKey && e.shiftKey && e.key === 'J') || 
        (e.metaKey && e.altKey && e.key === 'J')) {
      e.preventDefault();
      e.stopPropagation();
      onDevToolsOpen();
      return false;
    }
    
    // Ctrl+U (View Source) or Cmd+U (Mac)
    if ((e.ctrlKey && e.key === 'u') || (e.metaKey && e.key === 'u')) {
      e.preventDefault();
      e.stopPropagation();
      onDevToolsOpen();
      return false;
    }
    
    // Ctrl+Shift+C (Inspect Element) or Cmd+Shift+C (Mac)
    if ((e.ctrlKey && e.shiftKey && e.key === 'C') || 
        (e.metaKey && e.shiftKey && e.key === 'C')) {
      e.preventDefault();
      e.stopPropagation();
      onDevToolsOpen();
      return false;
    }
    
    // Block Ctrl+A (Select All)
    if (e.ctrlKey && e.key === 'a') {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
    
    // Block Ctrl+S (Save)
    if (e.ctrlKey && e.key === 's') {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
    
    // Block right-click context menu key
    if (e.key === 'ContextMenu') {
      e.preventDefault();
      e.stopPropagation();
      onDevToolsOpen();
      return false;
    }
  };
  
  if (!eventListenersAttached) {
    document.addEventListener('keydown', handleKeyDown, true);
    document.addEventListener('keyup', handleKeyDown, true);
    
    // Enhanced right-click prevention
    document.addEventListener('contextmenu', (e) => {
      if (!devToolsProtectionEnabled) return;
      e.preventDefault();
      e.stopPropagation();
      onDevToolsOpen();
      return false;
    }, true);
  
    // Mouse button prevention
    document.addEventListener('mousedown', (e) => {
      if (!devToolsProtectionEnabled) return;
      
      // Allow mousedown for draggable elements (needed for drag initiation)
      const target = e.target as HTMLElement;
      if (target && (target.draggable || target.closest('[draggable="true"]'))) {
        if (e.button === 2) { // Still prevent right click on draggable elements
          e.preventDefault();
          e.stopPropagation();
          onDevToolsOpen();
          return false;
        }
        return; // Allow left/middle click for drag
      }
      
      if (e.button === 2) { // Right click
        e.preventDefault();
        e.stopPropagation();
        onDevToolsOpen();
        return false;
      }
    }, true);
  
    // Copy/paste prevention - completely disabled for now to avoid conflicts
    /*
    document.addEventListener('copy', (e) => {
      if (!devToolsProtectionEnabled) return;
      e.preventDefault();
      e.stopPropagation();
      return false;
    }, true);
    
    document.addEventListener('cut', (e) => {
      if (!devToolsProtectionEnabled) return;
      e.preventDefault();
      e.stopPropagation();
      return false;
    }, true);
    
    document.addEventListener('paste', (e) => {
      if (!devToolsProtectionEnabled) return;
      e.preventDefault();
      e.stopPropagation();
      return false;
    }, true);
    */
  
    // Completely disable selection and drag prevention for now
    // This was blocking drag and drop functionality
    /*
    document.addEventListener('selectstart', (e) => {
      if (!devToolsProtectionEnabled) return;
      e.preventDefault();
    });
    
    document.addEventListener('dragstart', (e) => {
      if (!devToolsProtectionEnabled) return;
      e.preventDefault();
    });
    */
    
    eventListenersAttached = true;
  }
};

// Stop monitoring
export const stopDevToolsProtection = () => {
  if (devToolsCheckInterval) {
    clearInterval(devToolsCheckInterval);
    devToolsCheckInterval = null as any;
  }
  if (antiDebuggerInterval) {
    clearInterval(antiDebuggerInterval);
    antiDebuggerInterval = null as any;
  }
};

// Enable/disable dev tools protection
export const setDevToolsProtectionEnabled = (enabled: boolean) => {
  const wasEnabled = devToolsProtectionEnabled;
  devToolsProtectionEnabled = enabled;
  
  // Store preference in localStorage
  localStorage.setItem('devToolsProtectionEnabled', enabled.toString());
  
  if (enabled && !wasEnabled) {
    // Starting protection
    startDevToolsProtection();
  } else if (!enabled && wasEnabled) {
    // Stopping protection
    stopDevToolsProtection();
    // Remove any existing warning overlay
    const existingOverlay = document.getElementById('devtools-warning');
    if (existingOverlay) {
      existingOverlay.remove();
    }
    devToolsOpen = false;
  }
};

// Get current protection status
export const isDevToolsProtectionEnabled = (): boolean => {
  return devToolsProtectionEnabled;
};

// Initialize protection status from localStorage
export const initializeDevToolsProtection = () => {
  const stored = localStorage.getItem('devToolsProtectionEnabled');
  if (stored !== null) {
    devToolsProtectionEnabled = stored === 'true';
  }
  
  if (devToolsProtectionEnabled) {
    startDevToolsProtection();
    showConsoleWarning();
  }
};

// Console warning
export const showConsoleWarning = () => {
  console.clear();
  console.log('%c⚠️ SECURITY WARNING', 'color: red; font-size: 40px; font-weight: bold;');
  console.log('%cThis is a browser feature intended for developers. Unauthorized access to this console may compromise your account security.', 'color: red; font-size: 16px;');
  console.log('%cIf someone told you to copy/paste something here, it is likely a scam.', 'color: red; font-size: 16px;');
};
