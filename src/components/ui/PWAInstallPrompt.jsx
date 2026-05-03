import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';

const Motion = motion;
import { Download, X, AppWindow, Smartphone, Share2, PlusSquare } from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';

const ENTER_DELAY_MS = 1400;

/**
 * Modal global para instalar la PWA: prompt nativo en Chrome/Edge/Android
 * y guía manual en iOS (Compartir → Añadir a pantalla de inicio).
 */
const PWAInstallPrompt = () => {
  const {
    shouldOfferInstallUI,
    showNativeInstall,
    showIOSManualGuide,
    showAndroidFallback,
    installPWA,
    dismissPrompt,
    isLikelyDesktop,
  } = usePWAInstall();

  const [delayReady, setDelayReady] = useState(false);

  useEffect(() => {
    const t = window.setTimeout(() => setDelayReady(true), ENTER_DELAY_MS);
    return () => window.clearTimeout(t);
  }, []);

  const open = shouldOfferInstallUI && delayReady;

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') dismissPrompt();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, dismissPrompt]);

  const title = showIOSManualGuide
    ? 'Añadir FormaFlow a tu pantalla de inicio'
    : showAndroidFallback
      ? 'Instalar FormaFlow en tu teléfono'
      : isLikelyDesktop
        ? 'Instalar FormaFlow en tu computadora'
        : 'Instalar FormaFlow como aplicación';

  const subtitle = showIOSManualGuide
    ? 'En Safari podés usarla como app sin pasar por la tienda.'
    : showAndroidFallback
      ? 'Abrí el menú del navegador (⋮) y elegí «Instalar aplicación» o «Añadir a la pantalla principal».'
      : showNativeInstall
        ? 'Acceso rápido desde el escritorio o la pantalla de inicio, con mejor rendimiento.'
        : 'Acceso rápido desde el escritorio o la pantalla de inicio.';

  const modal = (
    <AnimatePresence>
      {open ? (
        <Motion.div
          role="dialog"
          aria-modal="true"
          aria-labelledby="pwa-install-title"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[400] flex items-end justify-center sm:items-center p-4 sm:p-6 bg-black/65 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) dismissPrompt();
          }}
        >
          <Motion.div
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            className="w-full max-w-md rounded-2xl border border-emerald-500/25 bg-[#0b1726]/95 shadow-2xl shadow-black/40 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative px-5 pt-5 pb-4 border-b border-slate-800/80">
              <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-600/10 blur-3xl rounded-full pointer-events-none" />
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-xl bg-emerald-600 flex items-center justify-center shrink-0 shadow-lg shadow-emerald-900/40">
                  {showIOSManualGuide || showAndroidFallback ? (
                    <Smartphone className="text-white w-6 h-6" aria-hidden />
                  ) : (
                    <AppWindow className="text-white w-6 h-6" aria-hidden />
                  )}
                </div>
                <div className="flex-1 min-w-0 pt-0.5">
                  <h2 id="pwa-install-title" className="text-white font-semibold text-base leading-snug">
                    {title}
                  </h2>
                  <p className="text-slate-400 text-sm mt-1.5 leading-relaxed">{subtitle}</p>
                </div>
                <button
                  type="button"
                  onClick={dismissPrompt}
                  className="shrink-0 p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors"
                  title="Cerrar"
                  aria-label="Cerrar aviso de instalación"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {showIOSManualGuide ? (
              <ul className="px-5 py-4 space-y-3 text-sm text-slate-300">
                <li className="flex gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-800 text-emerald-400 font-semibold text-xs">
                    1
                  </span>
                  <span className="pt-0.5">
                    Tocá el botón <Share2 className="inline w-4 h-4 mx-0.5 text-emerald-400 align-text-bottom" aria-hidden />{' '}
                    <strong className="text-slate-200">Compartir</strong> en la barra inferior de Safari.
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-800 text-emerald-400 font-semibold text-xs">
                    2
                  </span>
                  <span className="pt-0.5 flex items-start gap-1 flex-wrap">
                    Desplazate y tocá{' '}
                    <PlusSquare className="inline w-4 h-4 mt-0.5 text-emerald-400 shrink-0" aria-hidden />{' '}
                    <strong className="text-slate-200">Añadir a pantalla de inicio</strong>.
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-800 text-emerald-400 font-semibold text-xs">
                    3
                  </span>
                  <span className="pt-0.5">Confirmá con <strong className="text-slate-200">Añadir</strong>.</span>
                </li>
              </ul>
            ) : null}

            <div className="px-5 pb-5 pt-2 flex flex-col sm:flex-row gap-2 sm:gap-3">
              {showNativeInstall ? (
                <button
                  type="button"
                  onClick={() => void installPWA()}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium py-3 px-4 transition-colors shadow-md shadow-emerald-900/30"
                >
                  <Download size={18} aria-hidden />
                  Instalar ahora
                </button>
              ) : null}

              <button
                type="button"
                onClick={dismissPrompt}
                className={`${showNativeInstall ? 'sm:flex-1' : 'w-full'} rounded-xl border border-slate-600/80 bg-slate-800/50 hover:bg-slate-800 text-slate-200 text-sm font-medium py-3 px-4 transition-colors`}
              >
                Ahora no
              </button>
            </div>

            <p className="px-5 pb-4 text-[11px] text-slate-500 text-center">
              Podés volver a ver esta opción más adelante; si la cerrás, te la recordamos en unos días.
            </p>
          </Motion.div>
        </Motion.div>
      ) : null}
    </AnimatePresence>
  );

  if (typeof document === 'undefined') return null;
  return createPortal(modal, document.body);
};

export default PWAInstallPrompt;
