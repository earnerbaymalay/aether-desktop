import React from 'react';

const QRSync: React.FC = () => {
    const [seed, setSeed] = React.useState(Math.random());
    const [status, setStatus] = React.useState('ACTIVE');

    const handleRefresh = () => {
        setStatus('REFRESHING...');
        setTimeout(() => {
            setSeed(Math.random());
            setStatus('ACTIVE');
        }, 1000);
    };

    return (
        <div className="view-layer">
            <div className="view-header">
                <h2>Neural Link</h2>
                <p className="view-subtitle">Sync your workstation with the Aether mobile node.</p>
            </div>

            <div className="setting-card glass" style={{ textAlign: 'center', padding: '60px 40px' }}>
                <h3 style={{ marginBottom: '24px' }}>Handoff Session</h3>
                
                <div className="qr-container" style={{ 
                    background: 'white', 
                    padding: '24px', 
                    display: 'inline-block', 
                    borderRadius: '16px',
                    marginBottom: '32px',
                    boxShadow: '0 0 40px rgba(255,255,255,0.1)'
                }}>
                    <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(10, 15px)', 
                        gridTemplateRows: 'repeat(10, 15px)',
                        gap: '2px',
                        background: 'white'
                    }}>
                        {Array.from({ length: 100 }).map((_, i) => (
                            <div key={i} style={{ 
                                background: (Math.sin(i * seed) > 0) ? 'black' : 'white',
                                width: '15px',
                                height: '15px'
                            }} />
                        ))}
                    </div>
                </div>
                
                <div className="sync-info" style={{ fontSize: '13px', color: 'var(--accent-cyan)', fontFamily: 'JetBrains Mono', marginBottom: '32px' }}>
                    LINK STATUS: <span className={status === 'ACTIVE' ? 'ok' : 'animate-pulse'}>{status}</span><br/>
                    NODE_ID: AETHER-UX-77
                </div>

                <button className="btn btn-nexus" onClick={handleRefresh}>
                    Rotate Neural Link
                </button>
            </div>
        </div>
    );
};

export default QRSync;
