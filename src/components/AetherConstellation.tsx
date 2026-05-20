import React, { useEffect, useState } from 'react';

const AetherConstellation: React.FC = () => {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setProgress(prev => (prev < 100 ? prev + 1 : 0));
        }, 100);
        return () => clearInterval(timer);
    }, []);

    // Constellation Points (Astrology Style)
    const stars = [
        { x: 50, y: 20 },
        { x: 80, y: 40 },
        { x: 90, y: 70 },
        { x: 60, y: 90 },
        { x: 30, y: 80 },
        { x: 10, y: 50 },
        { x: 40, y: 45 }
    ];

    return (
        <div className="constellation-container">
            <svg viewBox="0 0 100 100" className="constellation-svg">
                {/* Connection Lines */}
                <polyline
                    points={stars.map(s => `${s.x},${s.y}`).join(' ')}
                    className="constellation-path"
                    style={{ strokeDasharray: 500, strokeDashoffset: 500 - (progress * 5) }}
                />
                
                {/* Stars */}
                {stars.map((star, i) => (
                    <circle
                        key={i}
                        cx={star.x}
                        cy={star.y}
                        r="1.5"
                        className={`star ${progress > (i * 14) ? 'active' : ''}`}
                    />
                ))}
            </svg>
            <div className="loading-text">
                <span className="glow-text">INITIALIZING NEURAL PATHWAYS</span>
                <div className="progress-bar-container">
                    <div className="progress-bar" style={{ width: `${progress}%` }} />
                </div>
            </div>
        </div>
    );
};

export default AetherConstellation;
