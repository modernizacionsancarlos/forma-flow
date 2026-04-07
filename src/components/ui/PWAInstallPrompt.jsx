import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, AppWindow, Smartphone } from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';

const PWAInstallPrompt = () => {
  const { isInstallable, installPWA } = usePWAInstall();
  const [show, setShow] = React.useState(true);

  const MotionDiv = motion.div;

  if (!isInstallable || !show) return null;

  return (
    <AnimatePresence>
      <MotionDiv
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 50, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed bottom-6 left-6 right-6 md:left-auto md:right-8 md:w-96 z-50"
      >
        <div className="bg-slate-900/90 backdrop-blur-xl border border-blue-500/30 rounded-2xl shadow-2xl p-4 overflow-hidden relative group">
          {/* Decorative Gradient */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 blur-3xl -z-10 group-hover:bg-blue-600/20 transition-colors" />
          
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-600/20">
              <AppWindow className="text-white w-6 h-6" />
            </div>
            
            <div className="flex-1">
              <h3 className="text-white font-semibold text-sm">Instalar FormaFlow</h3>
              <p className="text-slate-400 text-xs mt-1 leading-relaxed">
                Disfruta de una experiencia más rápida, acceso sin conexión y notificaciones en tiempo real.
              </p>
              
              <div className="flex items-center gap-2 mt-4">
                <button
                  onClick={installPWA}
                  className="flex-1 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-all active:scale-95 shadow-md shadow-blue-600/10"
                >
                  <Download size={14} />
                  Instalar ahora
                </button>
                <button
                  onClick={() => setShow(false)}
                  className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"
                  title="Cerrar"
                >
                  <X size={14} />
                </button>
              </div>
            </div>
          </div>

          {/* Device Indication Footnote */}
          <div className="mt-3 pt-3 border-t border-slate-800/50 flex items-center justify-between">
            <span className="text-[10px] text-slate-500 flex items-center gap-1">
              <Smartphone size={10} /> Compatible con Móvil y PC
            </span>
            <span className="text-[10px] text-blue-400 font-medium">Native Experience</span>
          </div>
        </div>
      </MotionDiv>
    </AnimatePresence>
  );
};

export default PWAInstallPrompt;
