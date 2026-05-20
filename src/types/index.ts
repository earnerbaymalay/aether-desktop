export interface AetherResponse<T = any> {
    success: boolean;
    data: T;
    error?: string;
}

export interface Pathway {
    id: string;
    title: string;
    model: string;
    icon: string;
    description: string;
}

export interface ServerStatus {
    id: string;
    name: string;
    type: 'MCP' | 'LSP' | 'CORE' | 'API';
    status: 'online' | 'offline' | 'restarting';
    uptime: string;
}

export interface VaultFragment {
    id: number;
    title: string;
    content: string;
    type: string;
    timestamp: string;
}

export interface SystemHeartbeat {
    status: 'NOMINAL' | 'DEGRADED' | 'CRITICAL';
    linkStatus: 'SYNCED' | 'DISCONNECTED';
    latency: number;
}
