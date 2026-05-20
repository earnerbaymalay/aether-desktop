import React, { useState, useEffect } from 'react';
// import { invoke } from '@tauri-apps/api/tauri';

// Replacing the terminal-based /settings flow
const SettingsUI: React.FC = () => {
    const [config, setConfig] = useState<any>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const data = JSON.parse(localStorage.getItem('aether_settings') || '{}');
                setConfig(data);
                if (data.theme) {
                    document.body.setAttribute('data-theme', data.theme);
                }
            } catch (e) {
                console.error("Failed to load settings:", e);
            } finally {
                setLoading(false);
            }
        };
        fetchConfig();
    }, []);

    const [saveStatus, setSaveStatus] = useState<string | null>(null);

    const handleSave = async () => {
        try {
            localStorage.setItem('aether_settings', JSON.stringify(config));
            if (config.theme) {
                document.body.setAttribute('data-theme', config.theme);
            }
            setSaveStatus("Settings synced to vault.");
            setTimeout(() => setSaveStatus(null), 3000);
        } catch (e) {
            console.error("Failed to save settings:", e);
            setSaveStatus("Error saving settings.");
        }
    };

    const handleReset = () => {
        if (confirm("This will wipe all local neural fragments and reset Aether. Continue?")) {
            localStorage.clear();
            window.location.reload();
        }
    };

    if (loading) return <div>Loading settings...</div>;

    return (
        <div className="view-layer settings-panel glass">
            <h2>Aether Configuration</h2>

            {saveStatus && (
                <div className="mb-4 p-2 bg-cyan-900/50 border border-cyan-500/50 rounded text-cyan-200 text-sm animate-pulse">
                    {saveStatus}
                </div>
            )}
            
            <div className="setting-group">
                <label>
                    <input 
                        type="checkbox" 
                        checked={config.uncensored || false} 
                        onChange={(e) => setConfig({...config, uncensored: e.target.checked})} 
                    />
                    Enable Uncensored Mode
                </label>
                <p className="help-text">Disables safety system prompts. Use with caution.</p>
            </div>

            <div className="setting-group">
                <label>
                    <input 
                        type="checkbox" 
                        checked={config.auto_memory || false} 
                        onChange={(e) => setConfig({...config, auto_memory: e.target.checked})} 
                    />
                    Auto-Memory (Shadow Monitor)
                </label>
                <p className="help-text">Passively distills conversations into AetherVault fragments.</p>
            </div>
            
            <div className="setting-group">
                <label>
                    Theme:
                    <select 
                        value={config.theme || 'cyan'} 
                        onChange={(e) => setConfig({...config, theme: e.target.value})}
                    >
                        <option value="cyan">Cyan (Default)</option>
                        <option value="purple">Purple</option>
                        <option value="green">Hacker Green</option>
                    </select>
                </label>
            </div>

            <div className="flex gap-4">
                <button className="btn btn-nexus" onClick={handleSave}>Save Configuration</button>
                <button className="btn" style={{ borderColor: 'var(--red)', color: 'var(--red)' }} onClick={handleReset}>Factory Reset</button>
            </div>

            <style>{`
                .settings-panel { padding: 20px; }
                .setting-group { margin-bottom: 20px; }
                .setting-group label { display: block; font-weight: bold; margin-bottom: 5px; color: var(--text); }
                .help-text { font-size: 12px; color: var(--text-dim); }
            `}</style>
        </div>
    );
};

export default SettingsUI;
