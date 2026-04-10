import React from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';

const PremiumSplash = ({ isLoading }) => {
    return (
        <AnimatePresence>
            {isLoading && (
                <Motion.div
                    initial={{ opacity: 1 }}
                    exit={{ 
                        opacity: 0,
                        transition: { duration: 0.8, ease: "easeInOut" }
                    }}
                    className="fixed inset-0 z-[9999] bg-[#0f172a] flex flex-col items-center justify-center overflow-hidden"
                >
                    {/* Background Gradients */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none animate-pulse" />
                    
                    <div className="relative">
                        {/* Animated Logo Container */}
                        <Motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ 
                                duration: 1,
                                ease: [0.16, 1, 0.3, 1]
                            }}
                            className="flex flex-col items-center"
                        >
                            <div className="w-24 h-24 relative mb-8">
                                {/* Outer ring */}
                                <Motion.div 
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                                    className="absolute inset-0 border-t-2 border-r-2 border-emerald-500/30 rounded-full"
                                />
                                
                                {/* Inner glow */}
                                <div className="absolute inset-4 bg-emerald-500/20 blur-xl rounded-full" />
                                
                                {/* Center Icon Template */}
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Motion.div
                                        animate={{ 
                                            scale: [1, 1.1, 1],
                                            opacity: [1, 0.8, 1]
                                        }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                        className="w-10 h-10 bg-emerald-500 rounded-xl shadow-[0_0_30px_rgba(16,185,129,0.5)] transform rotate-12"
                                    />
                                </div>
                            </div>

                            <Motion.h1 
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.5, duration: 0.8 }}
                                className="text-4xl font-black text-white tracking-tighter mb-2"
                            >
                                FORMA<span className="text-emerald-500">FLOW</span>
                            </Motion.h1>
                            
                            <Motion.div
                                initial={{ width: 0 }}
                                animate={{ width: 140 }}
                                transition={{ delay: 0.8, duration: 1.2, ease: "circOut" }}
                                className="h-0.5 bg-gradient-to-r from-transparent via-emerald-500 to-transparent opacity-50 mb-4"
                            />

                            <Motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 1.2 }}
                                className="text-slate-500 text-sm font-medium tracking-[0.2em] uppercase"
                            >
                                Premium Experience
                            </Motion.p>
                        </Motion.div>

                        {/* Loading progress indicator */}
                        <div className="absolute -bottom-32 left-1/2 -translate-x-1/2 w-48">
                            <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                                <Motion.div 
                                    className="h-full bg-emerald-500"
                                    initial={{ x: "-100%" }}
                                    animate={{ x: "100%" }}
                                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Footer decoration */}
                    <div className="absolute bottom-10 left-0 right-0 flex justify-center opacity-20">
                        <span className="text-white text-[10px] font-mono tracking-widest">SYSTEM INITIALIZING... ACQUIRING ASSETS</span>
                    </div>
                </Motion.div>
            )}
        </AnimatePresence>
    );
};

export default PremiumSplash;
