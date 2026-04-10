import { motion as Motion } from 'framer-motion';
import { RefreshCw, ShieldAlert, Home } from 'lucide-react';
import { Link } from 'react-router-dom';

const ServerError = () => {
    const handleReload = () => {
        window.location.reload();
    };

    return (
        <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-6 relative overflow-hidden text-white font-inter">
            {/* Background elements with warmer error tones */}
            <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-rose-500/10 rounded-full blur-[130px] pointer-events-none" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-amber-500/5 rounded-full blur-[130px] pointer-events-none" />
            
            <div className="max-w-xl w-full text-center relative z-10">
                <Motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="flex flex-col items-center"
                >
                    <div className="relative mb-10">
                        <Motion.div
                            animate={{ 
                                rotate: [0, -10, 10, -10, 10, 0],
                                scale: [1, 1.05, 1]
                            }}
                            transition={{ 
                                duration: 5, 
                                repeat: Infinity,
                                ease: "easeInOut" 
                            }}
                            className="w-32 h-32 bg-rose-500/20 backdrop-blur-3xl border border-rose-500/30 rounded-[40px] flex items-center justify-center shadow-[0_0_60px_-15px_rgba(244,63,94,0.4)]"
                        >
                            <ShieldAlert className="w-16 h-16 text-rose-400" />
                        </Motion.div>
                        
                        {/* Static numeric backdrop */}
                        <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-10">
                           <span className="text-[240px] font-black tracking-tighter select-none">500</span>
                        </div>
                    </div>

                    <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
                        Error de Sistema
                    </h1>
                    <p className="text-slate-400 text-lg mb-10 max-w-sm mx-auto leading-relaxed">
                        Algo salió mal en nuestros servidores. Estamos trabajando para solucionarlo lo antes posible.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
                        <button 
                            onClick={handleReload}
                            className="w-full sm:w-auto flex items-center justify-center space-x-3 bg-rose-500 hover:bg-rose-600 text-white px-8 py-4 rounded-2xl font-bold transition-all shadow-lg shadow-rose-500/25 group"
                        >
                            <RefreshCw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-700" />
                            <span>Reintentar</span>
                        </button>
                        
                        <Link to="/" className="w-full sm:w-auto flex items-center justify-center space-x-3 bg-slate-800 hover:bg-slate-700 text-white px-8 py-4 rounded-2xl font-bold transition-all border border-slate-700">
                            <Home className="w-5 h-5" />
                            <span>Volver al Dashboard</span>
                        </Link>
                    </div>
                </Motion.div>

                <Motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="mt-16 flex items-center justify-center space-x-2 text-slate-500 text-sm italic"
                >
                    <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                    <span>Incidencia técnica en curso - Reportada automáticamente</span>
                </Motion.div>
            </div>
        </div>
    );
};

export default ServerError;
