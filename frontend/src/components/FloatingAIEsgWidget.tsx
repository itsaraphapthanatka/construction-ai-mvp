'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, Leaf, Users, ChevronDown, ChevronUp } from 'lucide-react';

export default function FloatingAIEsgWidget() {
    const [isOpen, setIsOpen] = useState(true);
    const [data, setData] = useState({
        profit: 18.5,
        carbon: 12,
        happiness: 4.8
    });

    return (
        <div className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-50">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.9 }}
                        className="mb-3 md:mb-4 bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.5)] overflow-hidden w-64 md:w-72"
                    >
                        <div className="bg-gradient-to-r from-blue-600/20 to-indigo-600/20 border-b border-white/5 p-2.5 md:p-3 flex justify-between items-center">
                            <span className="text-[10px] md:text-xs font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400 tracking-wider">LIVE AI INSIGHTS</span>
                            <div className="flex space-x-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            </div>
                        </div>

                        <div className="p-3 md:p-4 space-y-3 md:space-y-4">
                            {/* Profit Insight */}
                            <div className="flex items-center space-x-3">
                                <div className="p-1.5 md:p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                                    <TrendingUp className="w-4 h-4" />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-400 font-medium font-sans">AI Forecast</p>
                                    <p className="text-sm font-bold text-white tracking-tight">{data.profit}% Margin</p>
                                </div>
                            </div>

                            {/* ESG - Carbon */}
                            <div className="flex items-center space-x-3">
                                <div className="p-1.5 md:p-2 rounded-lg bg-blue-500/10 text-blue-400">
                                    <Leaf className="w-4 h-4" />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-400 font-medium font-sans">Carbon Credit</p>
                                    <p className="text-sm font-bold text-white tracking-tight">-{data.carbon} Tons CO2</p>
                                </div>
                            </div>

                            {/* Happiness */}
                            <div className="flex items-center space-x-3">
                                <div className="p-1.5 md:p-2 rounded-lg bg-violet-500/10 text-violet-400">
                                    <Users className="w-4 h-4" />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-400 font-medium font-sans">Happiness Index</p>
                                    <p className="text-sm font-bold text-white tracking-tight">{data.happiness}/5.0 Score</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <button
                onClick={() => setIsOpen(!isOpen)}
                className="ml-auto flex items-center justify-center w-10 h-10 md:w-12 md:h-12 bg-slate-800 border border-white/10 hover:border-blue-500/50 rounded-full shadow-[0_0_15px_rgba(0,0,0,0.5)] transition-all duration-300 group"
            >
                {isOpen ? (
                    <ChevronDown className="w-5 h-5 text-slate-400 group-hover:text-white" />
                ) : (
                    <div className="relative">
                        <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500"></span>
                        </span>
                        <ChevronUp className="w-5 h-5 text-slate-400 group-hover:text-white" />
                    </div>
                )}
            </button>
        </div>
    );
}
