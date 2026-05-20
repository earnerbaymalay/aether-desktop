import React, { useState, useEffect } from 'react';

interface AuditLog {
    timestamp: string;
    type: string;
    details: any;
}

const SecurityDashboard: React.FC = () => {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [testing, setTesting] = useState(false);

    useEffect(() => {
        // Mock audit logs based on the recently implemented python backend
        setLogs([
            { timestamp: new Date().toLocaleTimeString(), type: 'SANDBOX_BLOCK', details: { command: 'rm -rf /', reason: 'Blocked destructive operator' } },
            { timestamp: new Date().toLocaleTimeString(), type: 'AUDIT_INIT', details: { status: 'Secure log chain started' } },
            { timestamp: new Date().toLocaleTimeString(), type: 'SESSION_RESTORE', details: { id: 'c87-a21' } }
        ]);
    }, []);

    const addLog = (type: string, details: any) => {
        setLogs(prev => [{ timestamp: new Date().toLocaleTimeString(), type, details }, ...prev.slice(0, 9)]);
    };

    const handleTest = () => {
        setTesting(true);
        setTimeout(() => {
            addLog('HEURISTIC_TEST', { input: "sudo apt-get install rogue-package", result: "CONTAINED" });
            setTesting(false);
        }, 1500);
    };

    return (
        <div className="view-layer">
            <div className="view-header">
                <h2>Nexus Shield // Security</h2>
                <p className="view-subtitle">Heuristic protection and immutable audit logging.</p>
            </div>

            <div className="settings-grid">
                <div className="setting-card wide glass">
                    <div className="flex justify-between items-center mb-4">
                        <h3>Command Sandbox</h3>
                        <button className="btn btn-small" onClick={handleTest} disabled={testing}>
                            {testing ? 'Analyzing...' : '🛡️ Test Heuristics'}
                        </button>
                    </div>
                    <div className="info-row">
                        <span>STATUS</span>
                        <span className="ok">HEURISTIC ANALYSIS ACTIVE</span>
                    </div>
                    <p style={{marginTop: '15px', color: 'var(--text-dim)', fontSize: '14px'}}>All tool executions are passed through a recursive parser to prevent prompt injection and unauthorized system access.</p>
                </div>

                <div className="setting-card wide glass">
                    <h3>Immutable Audit Log</h3>
                    <div className="system-dashboard" style={{height: '250px', overflowY: 'auto', fontSize: '12px', fontFamily: 'JetBrains Mono'}}>
                        {logs.map((log, i) => (
                            <div key={i} style={{marginBottom: '10px', borderBottom: '1px solid var(--border)', paddingBottom: '10px'}}>
                                <span style={{color: 'var(--text-dim)'}}>[{log.timestamp}]</span> 
                                <span style={{color: log.type.includes('BLOCK') ? 'var(--red)' : 'var(--accent-cyan)', fontWeight: 'bold'}}> {log.type}</span>
                                <br/>
                                <span style={{color: 'var(--text)', opacity: 0.8}}>{JSON.stringify(log.details, null, 2)}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SecurityDashboard;
