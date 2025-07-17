// PWA utilities for QwkSpd
export const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      
      console.log('QwkSpd: Service worker registered successfully');
      
      // Handle updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New service worker available
              console.log('QwkSpd: New version available');
              // Optionally show update notification to user
            }
          });
        }
      });
      
      return registration;
    } catch (error) {
      console.error('QwkSpd: Service worker registration failed:', error);
    }
  }
};

// Check if app is running as PWA
export const isPWA = () => {
  return window.matchMedia('(display-mode: standalone)').matches ||
         (window.navigator as any).standalone === true ||
         document.referrer.includes('android-app://');
};

// Install prompt handling
let deferredPrompt: any = null;

export const setupInstallPrompt = () => {
  window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent the mini-infobar from appearing
    e.preventDefault();
    // Store the event for later use
    deferredPrompt = e;
    console.log('QwkSpd: Install prompt available');
  });
};

export const showInstallPrompt = async () => {
  if (deferredPrompt) {
    try {
      // Show the install prompt
      deferredPrompt.prompt();
      
      // Wait for the user to respond
      const { outcome } = await deferredPrompt.userChoice;
      console.log('QwkSpd: Install prompt outcome:', outcome);
      
      // Clear the prompt
      deferredPrompt = null;
      
      return outcome === 'accepted';
    } catch (error) {
      console.error('QwkSpd: Install prompt error:', error);
      return false;
    }
  }
  return false;
};

export const isInstallPromptAvailable = () => {
  return deferredPrompt !== null;
};
