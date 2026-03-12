import { useState, useEffect } from 'react';

export interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

interface RelatedApplication {
  id: string;
  platform: string;
  url: string;
}

interface NavigatorWithRelatedApps extends Navigator {
  getInstalledRelatedApps(): Promise<RelatedApplication[]>;
}

export const useInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isAlreadyInstalled, setIsAlreadyInstalled] = useState(false);
  
  const [isStandalone, setIsStandalone] = useState(() => {
    return !!(window.matchMedia('(display-mode: standalone)').matches || (navigator as Navigator & { standalone?: boolean }).standalone);
  });

  const [isIOS, setIsIOS] = useState(() => {
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as Window & { MSStream?: boolean }).MSStream;
    return !!(isIOSDevice && !isStandalone);
  });

  const [isInstallable, setIsInstallable] = useState(isIOS);

  useEffect(() => {
    // Check if app is already installed
    const nav = navigator as NavigatorWithRelatedApps;
    if (typeof nav.getInstalledRelatedApps === 'function') {
      nav.getInstalledRelatedApps().then((apps) => {
        if (apps && apps.length > 0) {
          setIsAlreadyInstalled(true);
        }
      });
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Update UI notify the user they can install the PWA
      setIsInstallable(true);
      setIsIOS(false);
    };

    const handleAppInstalled = () => {
      // Clear the deferredPrompt so it can be garbage collected
      setDeferredPrompt(null);
      setIsInstallable(false);
      setIsStandalone(true);
      setIsAlreadyInstalled(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const promptInstall = async () => {
    if (!deferredPrompt) return null;

    // Show the install prompt
    await deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    
    // We've used the prompt, and can't use it again, throw it away
    setDeferredPrompt(null);
    setIsInstallable(false);

    return outcome;
  };

  const hideInstall = () => {
    setIsInstallable(false);
  };

  return { isInstallable, isIOS, isStandalone, isAlreadyInstalled, promptInstall, hideInstall };
};
