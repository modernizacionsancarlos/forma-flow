import { useState, useEffect, useCallback, useMemo } from 'react';

/** Evita mostrar el aviso durante varios días tras "Ahora no". */
const STORAGE_SNOOZE_UNTIL = 'formaflow_pwa_install_snooze_until';

function readSnoozeUntil() {
  try {
    const raw = localStorage.getItem(STORAGE_SNOOZE_UNTIL);
    const n = raw ? Number(raw) : 0;
    return Number.isFinite(n) ? n : 0;
  } catch {
    return 0;
  }
}

function isSnoozeActive() {
  return Date.now() < readSnoozeUntil();
}

/** Detecta modo standalone (PWA instalada / pantalla de inicio). */
function getStandalone() {
  if (typeof window === 'undefined') return false;
  const mq = window.matchMedia('(display-mode: standalone)');
  return mq.matches === true || window.navigator.standalone === true;
}

function detectIOS() {
  if (typeof navigator === 'undefined') return false;
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  );
}

function detectAndroid() {
  if (typeof navigator === 'undefined') return false;
  return /Android/i.test(navigator.userAgent);
}

/**
 * Hook para gestionar la instalación de la PWA (Chrome/Edge/Android con prompt nativo)
 * y detectar iOS Safari (instrucciones manuales; no hay beforeinstallprompt).
 */
export const usePWAInstall = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(() => getStandalone());
  const [sessionDismissed, setSessionDismissed] = useState(false);

  const isIOS = useMemo(() => detectIOS(), []);
  const isAndroid = useMemo(() => detectAndroid(), []);

  useEffect(() => {
    const mq = window.matchMedia('(display-mode: standalone)');
    const syncStandalone = () => {
      setIsInstalled(getStandalone());
    };
    syncStandalone();
    mq.addEventListener('change', syncStandalone);
    return () => mq.removeEventListener('change', syncStandalone);
  }, []);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      setIsInstallable(false);
      setIsInstalled(true);
      try {
        localStorage.removeItem(STORAGE_SNOOZE_UNTIL);
      } catch {
        /* ignore */
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const dismissPrompt = useCallback(() => {
    const days = 14;
    try {
      localStorage.setItem(STORAGE_SNOOZE_UNTIL, String(Date.now() + days * 86400000));
    } catch {
      /* ignore */
    }
    setSessionDismissed(true);
  }, []);

  const snoozed = sessionDismissed || isSnoozeActive();

  /** Chrome/Edge/Android: hay prompt nativo del navegador. */
  const showNativeInstall = !isInstalled && !snoozed && isInstallable && !!deferredPrompt;

  /** Safari iOS: sin API; mostramos pasos para "Añadir a pantalla de inicio". */
  const showIOSManualGuide = !isInstalled && !snoozed && isIOS && !isInstallable;

  /** Android sin evento (poco frecuente): texto genérico para menú del navegador. */
  const showAndroidFallback =
    !isInstalled && !snoozed && isAndroid && !isInstallable && !isIOS;

  const shouldOfferInstallUI =
    showNativeInstall || showIOSManualGuide || showAndroidFallback;

  const installPWA = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    setIsInstallable(false);
  };

  return {
    isInstallable,
    isInstalled,
    installPWA,
    dismissPrompt,
    shouldOfferInstallUI,
    showNativeInstall,
    showIOSManualGuide,
    showAndroidFallback,
    isIOS,
    isAndroid,
    /** Escritorio u otro entorno (ni iOS ni Android típicos). */
    isLikelyDesktop: !isIOS && !isAndroid,
  };
};
