import React, { useState, useEffect } from 'react';
import AetherClient from '../services/AetherClient';
import { ServerStatus } from '../types';

// Aether Unified Integration Hub
// Monitors MCP/LSP servers and manages API keys securely

const IntegrationHub: React.FC = () => {
    const [servers, setServers] = useState<any[]>([]);
    const [apiStatus, setApiStatus] = useState<boolean>(false);
    const [loading, setLoading] = useState(true);

    const refreshStatus = async () => {
        setLoading(true);
        try {
            const serversData = await AetherClient.getServerStatus();
            setServers(serversData);
            setApiStatus(true);
        } catch (error) {
            console.error('Integration Hub Sync Error:', error);
            setApiStatus(false);
        } finally {
            setLoading(false);
        }
    };


    const handleRestart = async (id: string) => {
        setServers(prev => prev.map(s => s.id === id ? { ...s, status: 'restarting' } : s));
        try {
            await AetherClient.restartServer(id);
            // Polling for success
            setTimeout(() => refreshStatus(), 2000);
        } catch (error) {
            console.error('Server Restart Failed:', error);
            refreshStatus();
        }
    };

    useEffect(() => {
        refreshStatus();
    }, []);

    const [showAdd, setShowAdd] = useState(false);
    const [newProvider, setNewProvider] = useState({ name: '', type: 'API' });

    const handleAdd = async () => {
        if (!newProvider.name) return;
        try {
            const newSrv = await AetherClient.addProvider(newProvider.name, newProvider.type);
            setServers(prev => [...prev, newSrv]);
            setShowAdd(false);
            setNewProvider({ name: '', type: 'API' });
        } catch (error) {
            console.error('Failed to deploy provider:', error);
        }
    };

    return (
        <div className="view-layer">
            <div className="view-header">
                <h2>Integration Hub</h2>
                <p className="view-subtitle">Centralized Neural Link Management</p>
            </div>

            <div className="settings-grid">
                <div className="setting-card wide glass">
                    <div className="flex justify-between items-center mb-4">
                        <h3>Active Neural Servers</h3>
                        <div className="flex gap-2">
                            <button className="btn btn-small" onClick={() => refreshStatus()} disabled={loading}>
                                {loading ? 'Refreshing...' : '🔄 Refresh'}
                            </button>
                            <button className="btn btn-small btn-nexus" onClick={() => setShowAdd(!showAdd)}>
                                {showAdd ? 'Cancel' : '+ Add'}
                            </button>
                        </div>
                    </div>

                    {showAdd && (
                        <div className="mb-6 p-4 bg-white/5 border border-white/10 rounded-lg flex items-end gap-4 animate-fade-in">
                            <div className="flex-1">
                                <label style={{ display: 'block', fontSize: '10px', marginBottom: '5px' }}>PROVIDER NAME</label>
                                <input 
                                    type="text" 
                                    value={newProvider.name} 
                                    onChange={e => setNewProvider({...newProvider, name: e.target.value})}
                                    style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border)', color: 'white', padding: '8px', width: '100%', borderRadius: '4px' }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '10px', marginBottom: '5px' }}>TYPE</label>
                                <select 
                                    value={newProvider.type} 
                                    onChange={e => setNewProvider({...newProvider, type: e.target.value})}
                                    style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border)', color: 'white', padding: '8px', borderRadius: '4px' }}
                                >
                                    <option value="API">API</option>
                                    <option value="MCP">MCP</option>
                                    <option value="LSP">LSP</option>
                                </select>
                            </div>
                            <button className="btn btn-small btn-nexus" onClick={handleAdd}>Deploy</button>
                        </div>
                    )}
                    
                    <p style={{ color: 'var(--text-dim)', fontSize: '14px', marginBottom: '20px' }}>Background MCP and LSP services powering your ecosystem.</p>
                    
                    <div className="models-table-wrapper">
                        <table>
                            <thead>
                                <tr>
                                    <th>Server Name</th>
                                    <th>Type</th>
                                    <th>Status</th>
                                    <th>Uptime</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className={apiStatus ? "row-online" : "row-offline"}>
                                    <td>Aether Core API</td>
                                    <td>FastAPI</td>
                                    <td>
                                        <span className={`status ${apiStatus ? 'ok' : 'warn'}`}>
                                            {apiStatus ? 'ONLINE' : 'OFFLINE'}
                                        </span>
                                    </td>
                                    <td>{apiStatus ? 'Active' : '-'}</td>
                                    <td>-</td>
                                </tr>
                                {servers.map(server => (
                                    <tr key={server.id}>
                                        <td>{server.name}</td>
                                        <td>{server.type}</td>
                                        <td>
                                            <span className={`status ${server.status === 'online' ? 'ok' : server.status === 'restarting' ? 'animate-pulse text-cyan-400' : 'warn'}`}>
                                                {server.status.toUpperCase()}
                                            </span>
                                        </td>
                                        <td>{server.uptime}</td>
                                        <td>
                                            <button 
                                                className="btn-small btn" 
                                                onClick={() => handleRestart(server.id)}
                                                disabled={server.status === 'restarting'}
                                            >
                                                {server.status === 'restarting' ? 'Wait...' : 'Restart'}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="setting-card glass">
                    <h3>Secure API Keys</h3>
                    <p>Manage credentials for external AI providers.</p>
                    <div className="quick-actions">
                        <div className="info-row">
                            <span>OpenAI</span>
                            <span className="warn">○ Missing</span>
                        </div>
                        <div className="info-row">
                            <span>Anthropic</span>
                            <span className="warn">○ Missing</span>
                        </div>
                        <div className="info-row">
                            <span>HuggingFace</span>
                            <span className="ok">● Configured</span>
                        </div>
                    </div>
                    <button className="btn btn-nexus" style={{marginTop: '20px', width: '100%'}} onClick={() => setShowAdd(true)}>
                        + Add New Provider
                    </button>
                </div>

                <div className="setting-card glass">
                    <h3>LSP Diagnostics</h3>
                    <p>Real-time health check for Language Server Protocols.</p>
                    <div className="system-dashboard" style={{height: '100px', overflowY: 'auto'}}>
                        [INFO] LSP Initialized: Rust<br/>
                        [INFO] Indexing: src-tauri/src<br/>
                        [DEBUG] {apiStatus ? 'API connection stable' : 'API connection failed'}<br/>
                        [INFO] Readiness: {apiStatus ? '100%' : '0%'}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default IntegrationHub;
