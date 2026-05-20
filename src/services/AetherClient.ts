import { AetherResponse, Pathway, ServerStatus, SystemHeartbeat } from '../types';

class AetherClient {
    private static instance: AetherClient;
    private baseUrl: string;

    private constructor() {
        this.baseUrl = localStorage.getItem('aether_server_url') || 'http://localhost:8000';
    }

    public static getInstance(): AetherClient {
        if (!AetherClient.instance) {
            AetherClient.instance = new AetherClient();
        }
        return AetherClient.instance;
    }

    public setServerUrl(url: string) {
        this.baseUrl = url;
        localStorage.setItem('aether_server_url', url);
    }

    private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
        });

        if (!response.ok) {
            throw new Error(`Aether Server Error: ${response.statusText}`);
        }

        const data = await response.json();
        return data as T;
    }

    // Pathways
    async getPathways(): Promise<Pathway[]> {
        return this.request<Pathway[]>('/pathways');
    }

    // Chat
    async *streamChat(message: string, modelId: string): AsyncIterable<string> {
        const response = await fetch(`${this.baseUrl}/synapse/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message, modelId }),
        });

        if (!response.ok || !response.body) {
            throw new Error('Failed to establish neural stream');
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
            const { value, done } = await reader.read();
            if (done) break;
            yield decoder.decode(value, { stream: true });
        }
    }

    // Vault
    async getVaultFragments(): Promise<VaultFragment[]> {
        return this.request<VaultFragment[]>('/vault/fragments');
    }

    async distillFragment(fragment: Partial<VaultFragment>): Promise<VaultFragment> {
        return this.request<VaultFragment>('/vault/distill', {
            method: 'POST',
            body: JSON.stringify(fragment),
        });
    }

    async deleteVaultFragment(id: number): Promise<void> {
        await this.request<void>(`/vault/fragment/${id}`, {
            method: 'DELETE',
        });
    }

    async wipeVault(): Promise<void> {
        await this.request<void>('/vault/wipe', {
            method: 'DELETE',
        });
    }

    // Integrations
    async getServerStatus(): Promise<ServerStatus[]> {
        return this.request<ServerStatus[]>('/integrations/status');
    }

    async restartServer(id: string): Promise<AetherResponse> {
        return this.request<AetherResponse>('/integrations/restart', {
            method: 'POST',
            body: JSON.stringify({ id }),
        });
    }

    async addProvider(name: string, type: string): Promise<ServerStatus> {
        return this.request<ServerStatus>('/integrations/add', {
            method: 'POST',
            body: JSON.stringify({ name, type }),
        });
    }

    // Heartbeat
    async getHeartbeat(): Promise<SystemHeartbeat> {
        return this.request<SystemHeartbeat>('/heartbeat');
    }

    async getSystemStats(): Promise<any> {
        return this.request<any>('/system/stats');
    }
}

export default AetherClient.getInstance();
