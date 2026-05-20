import React, { useState, useEffect } from 'react';
// import { invoke } from '@tauri-apps/api/tauri';

interface ModelEntry {
  name: string;
  url: string;
  hash: string;
  size: number;
}

interface ModelManifest {
  models: ModelEntry[];
}

const ModelDownloader: React.FC = () => {
  const [manifest, setManifest] = useState<ModelManifest | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string>('');
  const [downloading, setDownloading] = useState<string | null>(null);

  const MANIFEST_URL = 'https://raw.githubusercontent.com/earnerbaymalay/aether-tauri/main/agent/models.json';

  useEffect(() => {
    fetchManifest();
  }, []);

  const fetchManifest = async () => {
    setLoading(true);
    try {
      const response = await fetch(MANIFEST_URL);
      if (response.ok) {
        const data = await response.json();
        setManifest(data);
      } else {
        throw new Error('Failed to fetch manifest');
      }
    } catch (err) {
      console.error('Error fetching manifest, using fallback:', err);
      // Fallback manifest
      const fallbackManifest: ModelManifest = {
        models: [
          { name: 'Hermes-3-8B (Q4_K_M)', size: 4920000000, url: '#', hash: 'sha256:...' },
          { name: 'Llama-3.2-3B (Q8_0)', size: 3200000000, url: '#', hash: 'sha256:...' },
          { name: 'DeepSeek-R1 (Distill)', size: 7500000000, url: '#', hash: 'sha256:...' }
        ]
      };
      setManifest(fallbackManifest);
    } finally {
      setLoading(false);
    }
  };

  const [progress, setProgress] = useState<number>(0);

  const downloadModel = async (entry: ModelEntry) => {
    setDownloading(entry.name);
    setStatus(`Initializing neural stream for ${entry.name}...`);
    setProgress(0);
    
    // Simulated progressive download for PWA Demo
    for (let i = 0; i <= 100; i += 5) {
      await new Promise(resolve => setTimeout(resolve, 100));
      setProgress(i);
      if (i === 100) {
        setStatus(`${entry.name} synced to local cache.`);
        setDownloading(null);
      }
    }
  };

  return (
    <div className="setting-card glass">
      <h3>Model Registry</h3>
      <p>Curated neural models optimized for Aether's hardware tiers.</p>

      {loading && <p className="animate-pulse">Loading manifest from registry...</p>}

      {status && (
        <div className={`mb-4 p-2 rounded text-sm ${status.includes('Error') ? 'bg-red-900/50' : 'bg-teal-900/50'}`}>
          {status}
          {downloading && (
            <div className="w-full bg-white/10 h-1 mt-2 rounded-full overflow-hidden">
              <div 
                className="bg-cyan-500 h-full transition-all duration-300" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          )}
        </div>
      )}

      {!loading && manifest && (
        <div className="space-y-3 mt-4">
          {manifest.models.map((model) => (
            <div key={model.name} className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
              <div>
                <span className="font-medium text-white">{model.name}</span>
                <div className="text-xs text-slate-400">{(model.size / 1024 / 1024).toFixed(2)} MB</div>
              </div>
              <button
                onClick={() => downloadModel(model)}
                disabled={downloading === model.name}
                className="btn btn-small"
              >
                {downloading === model.name ? 'Downloading...' : 'Pull'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ModelDownloader;
