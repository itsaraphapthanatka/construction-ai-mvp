'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, ShieldAlert, X } from 'lucide-react';
import axios from 'axios';

interface Alert {
    id: string;
    type: string;
    message: string;
    projectName: string;
}

export default function IntegrityAlerts() {
    const [alerts, setAlerts] = useState<Alert[]>([]);

    useEffect(() => {
        // Mock polling for critical integrity alerts
        const fetchAlerts = async () => {
            try {
                const response = await axios.get('/api/alerts');
                const criticalAlerts = response.data
                    .filter((a: any) => a.type === 'danger')
                    .slice(0, 1) // Only show the most critical one as popup
                    .map((a: any, idx: number) => ({
                        id: `alert-${idx}`,
                        ...a
                    }));

                // Mock a slight delay to simulate "AI detecting an anomaly in real-time"
                setTimeout(() => {
                    setAlerts(criticalAlerts);
                }, 3000);
            } catch (err) {
                console.error(err);
            }
        };

        fetchAlerts();
    }, []);

    const removeAlert = (id: string) => {
        setAlerts(alerts.filter(a => a.id !== id));
    };

    return (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] w-full max-w-md px-4 pointer-events-none">
            <AnimatePresence>
                {alerts.map(alert => (
                    <motion.div
                        key={alert.id}
                        initial={{ opacity: 0, y: -50, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
                        className="pointer-events-auto bg-rose-500/10 backdrop-blur-xl border border-rose-500/50 rounded-2xl shadow-[0_10px_40px_rgba(225,29,72,0.3)] p-4 flex items-start space-x-4 mb-4"
                    >
                        <div className="bg-rose-500/20 text-rose-400 p-2 rounded-xl flex-shrink-0 animate-pulse">
                            <ShieldAlert className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                            <div className="flex justify-between items-center mb-1">
                                <h4 className="text-rose-100 font-bold uppercase tracking-wide text-xs">Standard of Integrity</h4>
                                <button onClick={() => removeAlert(alert.id)} className="text-rose-400 hover:text-white transition-colors">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                            <p className="text-white font-medium text-sm leading-snug">{alert.projectName}</p>
                            <p className="text-rose-200/80 text-xs mt-1 leading-relaxed">
                                <strong className="text-rose-400 mr-1">AI ALERT:</strong>
                                {alert.message}
                            </p>
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
}
