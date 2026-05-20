import React, { useState, useEffect } from 'react';
import AetherClient from '../services/AetherClient';
import { VaultFragment } from '../types';

const AetherVault: React.FC = () => {
    const [fragments, setFragments] = useState<VaultFragment[]>([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);

    const fetchFragments = async () => {
        setLoading(true);
        try {
            const data = await AetherClient.getVaultFragments();
            setFragments(data);
        } catch (error) {
            console.error('Failed to sync vault:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFragments();
    }, []);

    const filtered = fragments.filter(f => 
        f.title.toLowerCase().includes(search.toLowerCase()) || 
        f.content.toLowerCase().includes(search.toLowerCase())
    );

    const handleDelete = async (id: number) => {
        try {
            await AetherClient.deleteVaultFragment(id);
            setFragments(prev => prev.filter(f => f.id !== id));
        } catch (error) {
            console.error('Failed to purge fragment:', error);
        }
    };

    const handleClear = async () => {
        if (confirm("Permanently wipe all neural fragments?")) {
            try {
                await AetherClient.wipeVault();
                setFragments([]);
            } catch (error) {
                console.error('Failed to wipe vault:', error);
            }
        }
    };

    return (
        <div className="view-layer">
            <div className="view-header">
                <div className="flex justify-between items-center">
                    <div>
                        <h2>AetherVault</h2>
                        <p className="view-subtitle">Immutable long-term cognitive memory fragments.</p>
                    </div>
                    <button className="btn btn-small" style={{ borderColor: 'var(--red)', color: 'var(--red)' }} onClick={handleClear}>
                        Wipe Vault
                    </button>
                </div>
            </div>

            <div className="mb-8">
                <input 
                    type="text" 
                    placeholder="Search neural fragments..." 
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-cyan-500/30"
                />
            </div>

            <div className="pathway-grid">
                {loading ? (
                    <div className="col-span-full text-center py-20">
                        <div className="neural-loader mx-auto"></div>
                        <p className="mt-4 text-slate-500 animate-pulse">Synchronizing with vault fragments...</p>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="col-span-full text-center py-20 bg-white/5 rounded-2xl border border-dashed border-white/10">
                        <div className="text-4xl mb-4 opacity-20">🗄️</div>
                        <p className="text-slate-500">Vault is empty. Fragments are generated during neural synapse interactions.</p>
                    </div>
                ) : (
                    filtered.map(fragment => (
                        <div key={fragment.id} className="pathway-card group">
                            <div className="flex justify-between items-start mb-4">
                                <span className="text-[10px] font-bold text-cyan-500 tracking-tighter bg-cyan-500/10 px-2 py-1 rounded">
                                    {fragment.type}
                                </span>
                                <button 
                                    className="opacity-0 group-hover:opacity-100 transition-opacity text-red-500 text-xs hover:underline"
                                    onClick={() => handleDelete(fragment.id)}
                                >
                                    Purge
                                </button>
                            </div>
                            <h3 className="text-lg font-bold mb-2 truncate">{fragment.title}</h3>
                            <p className="text-sm text-slate-400 line-clamp-3 mb-4 leading-relaxed">
                                {fragment.content}
                            </p>
                            <div className="text-[10px] text-slate-500 font-mono">
                                CREATED: {fragment.timestamp}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default AetherVault;
