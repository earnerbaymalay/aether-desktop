import React, { useState, useEffect, useRef } from 'react';
import AetherClient from '../services/AetherClient';

interface Message {
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: string;
}

interface Message {
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: string;
}

const NeuralSynapse: React.FC<{ activeModel: any }> = ({ activeModel }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [typing, setTyping] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const saved = JSON.parse(localStorage.getItem('aether_chat_history') || '[]');
        if (saved.length === 0) {
            setMessages([{
                role: 'system',
                content: `Neural Link established with ${activeModel.model}. Synapse ready for local inference.`,
                timestamp: new Date().toLocaleTimeString()
            }]);
        } else {
            setMessages(saved);
        }
    }, [activeModel]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
        localStorage.setItem('aether_chat_history', JSON.stringify(messages));
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || typing) return;

        const userMsg: Message = {
            role: 'user',
            content: input,
            timestamp: new Date().toLocaleTimeString()
        };

        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setTyping(true);

        try {
            const assistantMsg: Message = {
                role: 'assistant',
                content: '',
                timestamp: new Date().toLocaleTimeString()
            };
            setMessages(prev => [...prev, assistantMsg]);

            let fullText = '';
            const stream = AetherClient.streamChat(input, activeModel.id);

            for await (const chunk of stream) {
                fullText += chunk;
                setMessages(prev => {
                    const last = prev[prev.length - 1];
                    if (last && last.role === 'assistant') {
                        return [...prev.slice(0, -1), { ...last, content: fullText }];
                    }
                    return [...prev, { role: 'assistant', content: fullText, timestamp: new Date().toLocaleTimeString() }];
                });
            }

            await AetherClient.distillFragment({
                title: input.slice(0, 30) + '...',
                content: fullText,
                type: 'FRAGMENT',
                timestamp: new Date().toLocaleDateString()
            });

        } catch (error) {
            console.error('Neural Link Error:', error);
            setMessages(prev => [...prev, {
                role: 'system',
                content: 'Critical Error: Neural link severed. Check Aether Server status.',
                timestamp: new Date().toLocaleTimeString()
            }]);
        } finally {
            setTyping(false);
        }
    };

    return (
        <div className="view-layer flex flex-col h-full" style={{ height: 'calc(100vh - 120px)' }}>
            <div className="view-header">
                <h2>Neural Synapse</h2>
                <p className="view-subtitle">Active cognitive link: <span className="ok">{activeModel.model}</span></p>
            </div>

            <div 
                ref={scrollRef}
                className="flex-1 overflow-y-auto mb-6 p-4 bg-black/20 rounded-xl border border-white/5 space-y-4 custom-scrollbar"
                style={{ scrollBehavior: 'smooth' }}
            >
                {messages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
                        <div className={`max-w-[80%] p-4 rounded-2xl transition-all duration-300 ${
                            msg.role === 'user' 
                                ? 'bg-cyan-500/10 border-glow-cyan text-cyan-50' 
                                : msg.role === 'system'
                                    ? 'bg-white/5 border border-white/10 text-slate-400 text-xs text-center w-full'
                                    : 'bg-white/5 border border-white/10 text-slate-200'
                        }`}>
                            <div className="text-[10px] opacity-40 mb-1 font-mono tracking-widest">{msg.timestamp} // {msg.role.toUpperCase()}</div>
                            <div className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</div>
                        </div>
                    </div>
                ))}
                {typing && (
                    <div className="flex justify-start">
                        <div className="bg-white/5 border border-white/10 p-4 rounded-2xl animate-pulse">
                            <div className="flex gap-1">
                                <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full"></div>
                                <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full delay-100"></div>
                                <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full delay-200"></div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="relative">
                <input 
                    type="text" 
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSend()}
                    placeholder="Enter neural command or query..."
                    className="w-full bg-black/40 border border-white/10 rounded-xl p-4 pr-16 text-white focus:outline-none focus:border-cyan-500/50 transition-colors"
                />
                <button 
                    onClick={handleSend}
                    className="absolute right-3 top-2.5 btn btn-small btn-nexus"
                    disabled={!input.trim() || typing}
                >
                    SEND
                </button>
            </div>
        </div>
    );
};

export default NeuralSynapse;
