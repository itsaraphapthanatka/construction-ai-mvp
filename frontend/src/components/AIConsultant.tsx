'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, Bot, User, Loader2 } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

export default function AIConsultant() {
    const { t } = useLanguage();
    const [messages, setMessages] = useState<Message[]>([
        {
            role: 'assistant',
            content: t('ai.greeting')
        }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const sendMessage = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage = { role: 'user' as const, content: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const apiMessages = [...messages, userMessage].map(m => ({
                role: m.role,
                content: m.content
            }));

            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages: apiMessages })
            });

            if (!response.ok) throw new Error('Failed to fetch AI response');

            const data = await response.json();

            const aiResponse = data.choices?.[0]?.message?.content || t('ai.errorBackend');

            setMessages(prev => [...prev, { role: 'assistant', content: aiResponse }]);
        } catch (error) {
            console.error(error);
            setMessages(prev => [...prev, { role: 'assistant', content: t('ai.errorConnection') }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-[600px] glass-card overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-white/5 bg-slate-900/50 flex items-center space-x-3 shadow-sm">
                <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400">
                    <Bot className="w-5 h-5" />
                </div>
                <div>
                    <h2 className="text-white font-semibold">{t('ai.title')}</h2>
                    <p className="text-xs text-blue-400 flex items-center mt-0.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse mr-1"></span>
                        {t('ai.connected')}
                    </p>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg, idx) => (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        key={idx}
                    >
                        <div className={`flex max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                            <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${msg.role === 'user' ? 'bg-indigo-500/20 text-indigo-300 ml-3' : 'bg-blue-500/20 text-blue-300 mr-3'
                                }`}>
                                {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                            </div>
                            <div className={`px-4 py-3 rounded-2xl ${msg.role === 'user'
                                ? 'bg-indigo-600/20 border border-indigo-500/30 text-indigo-50 rounded-tr-sm'
                                : 'bg-slate-800/80 border border-slate-700 text-slate-200 rounded-tl-sm'
                                }`}>
                                <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                            </div>
                        </div>
                    </motion.div>
                ))}
                {isLoading && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                        <div className="flex bg-slate-800/80 border border-slate-700 rounded-2xl rounded-tl-sm px-4 py-3 ml-11">
                            <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
                            <span className="ml-2 text-sm text-slate-400">{t('ai.analyzing')}</span>
                        </div>
                    </motion.div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-white/5 bg-slate-900/50">
                {/* Suggestions */}
                <div className="flex flex-wrap gap-2 mb-4">
                    {['Analyze Q4 Margin Risk', 'View ESG Financial ROI', 'Competitor Market Shift'].map((suggestion) => (
                        <button
                            key={suggestion}
                            onClick={() => { setInput(suggestion); }}
                            className="px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-bold uppercase tracking-widest hover:bg-blue-500/20 transition-all"
                        >
                            {suggestion}
                        </button>
                    ))}
                </div>

                <form onSubmit={sendMessage} className="relative flex items-center">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        disabled={isLoading}
                        placeholder={t('ai.inputPlaceholder')}
                        className="w-full bg-slate-800/50 border border-slate-700 rounded-full px-6 py-3.5 pr-14 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all disabled:opacity-50"
                    />
                    <button
                        type="submit"
                        disabled={!input.trim() || isLoading}
                        className="absolute right-2 p-2 bg-blue-600 hover:bg-blue-500 text-white rounded-full transition-colors disabled:opacity-50 disabled:hover:bg-blue-600"
                    >
                        <Send className="w-4 h-4" />
                    </button>
                </form>
            </div>
        </div>
    );
}
