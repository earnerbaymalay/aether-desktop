import React, { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/tauri';

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
      const data: ModelManifest = await invoke('fetch_model_manifest', { url: MANIFEST_URL });
      setManifest(data);
    } catch (err) {
      setStatus(`Error fetching manifest: ${err}`);
    } finally {
      setLoading(false);
    }
  };

  const downloadModel = async (entry: ModelEntry) => {
    setDownloading(entry.name);
    setStatus(`Downloading ${entry.name}...`);
    try {
      await invoke('download_model_from_manifest', { entry });
      setStatus(`${entry.name} downloaded and verified successfully!`);
    } catch (err) {
      setStatus(`Error downloading ${entry.name}: ${err}`);
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div className="setting-card glass">
      <h3>Model Registry</h3>
      <p>Curated neural models optimized for Aether's hardware tiers.</p>

      {loading && <p style={{ color: 'var(--text-dim)' }}>Loading manifest from registry...</p>}

      {status && (
        <div style={{
          marginBottom: '16px',
          padding: '8px 12px',
          borderRadius: '8px',
          fontSize: '13px',
          background: status.includes('Error') ? 'rgba(255, 123, 114, 0.1)' : 'rgba(88, 166, 255, 0.1)',
          border: `1px solid ${status.includes('Error') ? 'var(--red)' : 'var(--teal)'}`,
          color: status.includes('Error') ? 'var(--red)' : 'var(--teal)'
        }}>
          {status}
        </div>
      )}

      {!loading && manifest && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
          {manifest.models.map((model) => (
            <div key={model.name} className="system-dashboard" style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 16px'
            }}>
              <div>
                <span style={{ fontWeight: 600, color: 'var(--text)' }}>{model.name}</span>
                <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '4px' }}>{(model.size / 1024 / 1024).toFixed(2)} MB</div>
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
