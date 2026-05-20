import React, { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/tauri';
import AetherClient from './services/AetherClient';
import { Pathway, SystemHeartbeat } from './types';
import SetupWizard from './components/SetupWizard';
import DiagnosticDashboard from './components/DiagnosticDashboard';
import QRSync from './components/QRSync';
import IntegrationHub from './components/IntegrationHub';
import Marketplace from './components/Marketplace';
import SecurityDashboard from './components/SecurityDashboard';
import SettingsUI from './components/SettingsUI';
import NeuralSynapse from './components/NeuralSynapse';
import AetherVault from './components/AetherVault';

type View = 'CHAT' | 'VAULT' | 'PATHWAYS' | 'DIAGNOSTICS' | 'INTEGRATION' | 'SYNC' | 'SETTINGS' | 'MARKETPLACE' | 'SECURITY';
type LayoutMode = 'mission-control' | 'neural-link';

interface Pathway {
    id: string;
    title: string;
    model: string;
    icon: string;
    description: string;
}

const PATHWAYS: Pathway[] = [
    {
        id: 'hermes-3-8b',
        title: 'AGENT',
        model: 'Hermes-3-8B',
        icon: '🤖',
        description: 'General intelligence and tool use.'
    },
    {
        id: 'llama-3.2-3b',
        title: 'TURBO',
        model: 'Llama-3.2-3B',
        icon: '⚡',
        description: 'High-speed conversational output.'
    },
    {
        id: 'deepseek-r1',
        title: 'LOGIC',
        model: 'DeepSeek-R1',
        icon: '🧠',
        description: 'Advanced reasoning and architecture.'
    }
];

const App: React.FC = () => {
    const [showSetup, setShowSetup] = useState(() => {
        return localStorage.getItem('aether_setup_complete') !== 'true';
    });
    const [view, setView] = useState<View>(() => {
        return (localStorage.getItem('aether_current_view') as View) || 'PATHWAYS';
    });
    const [layoutMode, setLayoutMode] = useState<LayoutMode>(() => {
        return (localStorage.getItem('aether_layout_mode') as LayoutMode) || 'mission-control';
    });
    const [activeModel, setActiveModel] = useState(() => {
        return localStorage.getItem('aether_active_model') || 'hermes-3-8b';
    });
    const [pathways, setPathways] = useState<Pathway[]>([]);
    const [systemStatus, setSystemStatus] = useState<SystemHeartbeat | null>(null);

    useEffect(() => {
        const initApp = async () => {
            // 1. Start the agent sidecar/backend
            try {
                if ((window as any).__TAURI__) {
                    console.log("[App] Initializing Neural Engine via Tauri...");
                    await invoke('start_agent');
                    // Wait a bit for the API server to warm up
                    await new Promise(r => setTimeout(r, 2000));
                }
            } catch (e) {
                console.error("Failed to start agent", e);
            }

            // 2. Load pathways
            try {
                const data = await AetherClient.getPathways();
                setPathways(data);
            } catch (e) {
                console.error("Failed to load pathways", e);
            }
        };
        initApp();

        const heartbeatInt = setInterval(async () => {
            try {
                const status = await AetherClient.getHeartbeat();
                setSystemStatus(status);
            } catch (e) {
                setSystemStatus({ status: 'CRITICAL', linkStatus: 'DISCONNECTED', latency: 0 });
            }
        }, 10000);

        return () => clearInterval(heartbeatInt);
    }, []);

    const handleSetView = (newView: View) => {
        setView(newView);
        localStorage.setItem('aether_current_view', newView);
    };

    const handleSetLayoutMode = (newMode: LayoutMode) => {
        setLayoutMode(newMode);
        localStorage.setItem('aether_layout_mode', newMode);
    };

    const handleSetActiveModel = (modelId: string) => {
        setActiveModel(modelId);
        localStorage.setItem('aether_active_model', modelId);
    };

    const completeSetup = () => {
        setShowSetup(false);
        localStorage.setItem('aether_setup_complete', 'true');
    };

    if (showSetup) {
        return <SetupWizard onComplete={completeSetup} />;
    }

    const activePathway = pathways.find(p => p.id === activeModel) || pathways[0];
    if (!activePathway) return <div className="neural-shell items-center justify-center">Initializing Neural Pathways...</div>;

    return (
        <div className={`neural-shell ${layoutMode}`}>
            <nav className="sidebar">
                <div className="nav-top">
                    <div className="nav-brand">
                        <span className="logo">🌌</span>
                        <div className="brand-text">
                            <span className="brand-name">AETHER</span>
                            <span className="brand-subtitle">NEURAL OS</span>
                        </div>
                    </div>
                </div>

                <div className="nav-group">
                    {[
                        { id: 'CHAT', icon: '🧠', label: 'Neural Synapse' },
                        { id: 'VAULT', icon: '🗄️', label: 'AetherVault' },
                        { id: 'PATHWAYS', icon: '🌌', label: 'Pathways' },
                        { id: 'DIAGNOSTICS', icon: '🩺', label: 'Health' },
                        { id: 'INTEGRATION', icon: '🔌', label: 'Integrations' },
                        { id: 'MARKETPLACE', icon: '🏪', label: 'Marketplace' },
                        { id: 'SECURITY', icon: '🛡️', label: 'Security' },
                        { id: 'SYNC', icon: '📱', label: 'Neural Link' }
                    ].map(item => (
                        <button 
                            key={item.id}
                            className={`nav-btn ${view === item.id ? 'active' : ''}`} 
                            onClick={() => handleSetView(item.id as View)}
                        >
                            <span className="nav-icon">{item.icon}</span>
                            <span className="nav-label">{item.label}</span>
                        </button>
                    ))}
                </div>

                <div className="nav-bottom">
                    <button className="nav-btn" onClick={() => handleSetLayoutMode(layoutMode === 'mission-control' ? 'neural-link' : 'mission-control')}>
                        <span className="nav-icon">🌓</span>
                        <span className="nav-label">{layoutMode === 'mission-control' ? 'Neural Link' : 'Mission Control'}</span>
                    </button>
                    <button className="nav-btn" onClick={() => handleSetView('SETTINGS')}>
                        <span className="nav-icon">⚙️</span>
                        <span className="nav-label">Settings</span>
                    </button>
                </div>
            </nav>

            <div className="workspace">
                <main className="synapse">
                    {view === 'PATHWAYS' && (
                        <div className="view-layer animate-fade-in">
                            <div className="view-header">
                                <h2>Neural Pathways</h2>
                                <p className="view-subtitle">
                                    Select a cognitive specialist. Active: 
                                    <span className="active-model-tag">{activePathway.model}</span>
                                </p>
                            </div>
                            <div className="pathway-grid">
                                {pathways.map(pathway => (
                                    <div
                                        key={pathway.id}
                                        className={`pathway-card ${activeModel === pathway.id ? 'active' : ''}`}
                                        onClick={() => handleSetActiveModel(pathway.id)}
                                    >
                                        <div className="pathway-icon">{pathway.icon}</div>
                                        <h3 className="pathway-title">{pathway.title}</h3>
                                        <p className="pathway-model">{pathway.model}</p>
                                        <p className="pathway-desc">{pathway.description}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="animate-fade-in h-full">
                        {view === 'CHAT' && <NeuralSynapse activeModel={activePathway} />}
                        {view === 'VAULT' && <AetherVault />}
                        {view === 'DIAGNOSTICS' && <DiagnosticDashboard />}
                        {view === 'INTEGRATION' && <IntegrationHub />}
                        {view === 'MARKETPLACE' && <Marketplace />}
                        {view === 'SECURITY' && <SecurityDashboard />}
                        {view === 'SYNC' && <QRSync />}
                        {view === 'SETTINGS' && <SettingsUI />}
                    </div>
                </main>

                <aside className="peripheral">
                    <div className="peripheral-section">
                        <h3 className="section-label">SYSTEM STATUS</h3>
                        <div className="system-dashboard">
                            <div className="info-row"><span>Status</span><span className="ok">NOMINAL</span></div>
                            <div className="info-row"><span>Mode</span><span>{layoutMode.toUpperCase()}</span></div>
                            <div className="info-row"><span>Pathway</span><span>{activePathway.title}</span></div>
                            <div className="info-row"><span>AetherLink</span><span className="ok" style={{color: 'var(--teal)'}}>SYNCED</span></div>
                        </div>
                    </div>
                    <div className="peripheral-section">
                        <h3 className="section-label">QUICK ACTIONS</h3>
                        <div className="quick-actions">
                            <button className="btn btn-small btn-nexus" onClick={() => handleSetView('SYNC')}>Sync Mobile</button>
                            <button className="btn btn-small" onClick={() => handleSetView('MARKETPLACE')}>Browse Skills</button>
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
};

export default App;
