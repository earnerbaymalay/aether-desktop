import React, { useState, useEffect } from 'react';

interface Skill {
    id: string;
    name: string;
    author: string;
    tier: 'free' | 'pro';
    description: string;
}

const Marketplace: React.FC = () => {
    const [skills, setSkills] = useState<Skill[]>([]);
    const [installed, setInstalled] = useState<string[]>(() => {
        return JSON.parse(localStorage.getItem('aether_installed_skills') || '[]');
    });
    const [installing, setInstalling] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simulating fetch from marketplace logic implemented in python
        setTimeout(() => {
            setSkills([
                { id: "git-tools", name: "Git Operations", author: "core", tier: "free", description: "Manage git repositories locally." },
                { id: "advanced-search", name: "Deep Web Search", author: "community", tier: "free", description: "Search the web using SearxNG." },
                { id: "cloud-relay", name: "AetherLink Cloud Relay", author: "official", tier: "pro", description: "Sync vault across non-LAN networks. Requires Aether Pro." },
                { id: "vision-pro", name: "Enhanced Aether Eye", author: "official", tier: "pro", description: "High-resolution screen analysis and multi-monitor support." }
            ]);
            setLoading(false);
        }, 1000);
    }, []);

    const handleInstall = (id: string) => {
        setInstalling(id);
        setTimeout(() => {
            const newInstalled = [...installed, id];
            setInstalled(newInstalled);
            localStorage.setItem('aether_installed_skills', JSON.stringify(newInstalled));
            setInstalling(null);
        }, 2000);
    };

    const handleUninstall = (id: string) => {
        const newInstalled = installed.filter(i => i !== id);
        setInstalled(newInstalled);
        localStorage.setItem('aether_installed_skills', JSON.stringify(newInstalled));
    };

    return (
        <div className="view-layer">
            <div className="view-header">
                <h2>Skill Marketplace</h2>
                <p className="view-subtitle">Expand your agent's capabilities with verified local tools.</p>
            </div>

            <div className="pathway-grid">
                {skills.map(skill => (
                    <div key={skill.id} className={`pathway-card ${skill.tier === 'pro' ? 'pro-tier' : ''}`}>
                        <div className="tag" style={{ fontSize: '10px', color: skill.tier === 'pro' ? 'var(--accent-purple)' : 'var(--accent-cyan)', marginBottom: '8px', fontWeight: 'bold' }}>
                            {skill.author.toUpperCase()} // {skill.tier.toUpperCase()}
                        </div>
                        <h3 style={{ fontSize: '18px', marginBottom: '12px' }}>{skill.name}</h3>
                        <p style={{ fontSize: '13px', color: 'var(--text-dim)', lineHeight: '1.4' }}>{skill.description}</p>
                        
                        <div style={{ marginTop: '24px' }}>
                            {installed.includes(skill.id) ? (
                                <button className="btn btn-small" style={{ borderColor: 'var(--red)', color: 'var(--red)', width: '100%' }} onClick={() => handleUninstall(skill.id)}>
                                    Uninstall
                                </button>
                            ) : (
                                <button 
                                    className={`btn btn-small ${skill.tier === 'pro' ? 'btn-nexus' : ''}`} 
                                    style={{ width: '100%' }}
                                    onClick={() => skill.tier === 'pro' ? alert("Requires Aether Pro Subscription") : handleInstall(skill.id)}
                                    disabled={installing === skill.id}
                                >
                                    {installing === skill.id ? (
                                        <span className="animate-pulse">Installing...</span>
                                    ) : (
                                        skill.tier === 'pro' ? 'Upgrade to Install' : 'Install Skill'
                                    )}
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Marketplace;
