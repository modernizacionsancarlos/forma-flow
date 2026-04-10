import React from 'react';
import { motion as Motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft, Search } from 'lucide-react';

const NotFound = () => {
    return (
        <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-6 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />
            
            <div className="max-w-2xl w-full text-center relative z-10">
                <Motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <div className="relative inline-block mb-8">
                        <Motion.h1 
                            className="text-[150px] md:text-[200px] font-black leading-none tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white/20 to-transparent select-none"
                            animate={{ 
                                scale: [1, 1.02, 1],
                                opacity: [0.3, 0.4, 0.3]
                            }}
                            transition={{ 
                                duration: 4, 
                                repeat: Infinity,
                                ease: "easeInOut" 
                            }}
                        >
                            404
                        </Motion.h1>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                                className="w-24 h-24 md:w-32 md:h-32 bg-emerald-500/20 backdrop-blur-xl border border-emerald-500/30 rounded-3xl flex items-center justify-center shadow-[0_0_50px_-12px_rgba(16,185,129,0.5)]"
                            >
                                <Search className="w-12 h-12 md:w-16 md:h-16 text-emerald-400" />
                            </Motion.div>
                        </div>
                    </div>

                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">
                        Página no encontrada
                    </h2>
                    <p className="text-slate-400 text-lg mb-10 max-w-md mx-auto leading-relaxed">
                        Parece que el formulario o la página que buscas ha sido movida, eliminada o nunca existió.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link to="/" className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-4 rounded-2xl font-semibold transition-all shadow-lg shadow-emerald-500/20 group">
                            <Home className="w-5 h-5" />
                            <span>Ir al Inicio</span>
                        </Link>
                        <button 
                            onClick={() => window.history.back()}
                            className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-slate-800 hover:bg-slate-700 text-white px-8 py-4 rounded-2xl font-semibold transition-all border border-slate-700 group"
                        >
                            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                            <span>Regresar</span>
                        </button>
                    </div>
                </Motion.div>

                <Motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1, duration: 1 }}
                    className="mt-16 pt-8 border-t border-slate-800/50"
                >
                    <p className="text-slate-500 text-sm">
                        &copy; 2026 FormaFlow Premium. Todos los derechos reservados.
                    </p>
                </Motion.div>
            </div>
        </div>
    );
};

export default NotFound;
