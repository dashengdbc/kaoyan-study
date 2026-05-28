// Obsidian REST API Client
// Requires Obsidian Local REST API plugin: https://github.com/coddingtonbear/obsidian-local-rest-api

export interface ObsidianConfig {
  host: string;
  port: number;
  apiKey: string;
}

export interface ObsidianFile {
  path: string;
  content: string;
  modified: string;
}

const DEFAULT_CONFIG: ObsidianConfig = {
  host: 'localhost',
  port: 27123,
  apiKey: '',
};

export class ObsidianClient {
  private config: ObsidianConfig;

  constructor(config: Partial<ObsidianConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  private getBaseUrl(): string {
    return `http://${this.config.host}:${this.config.port}`;
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.config.apiKey) {
      headers['Authorization'] = `Bearer ${this.config.apiKey}`;
    }

    return headers;
  }

  // Test connection
  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.getBaseUrl()}/`, {
        method: 'GET',
        headers: this.getHeaders(),
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  // List all files in vault
  async listFiles(): Promise<string[]> {
    try {
      const response = await fetch(`${this.getBaseUrl()}/vault/`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to list files');
      }

      const data = await response.json();
      return data.files || [];
    } catch (error) {
      console.error('Error listing files:', error);
      return [];
    }
  }

  // Read file content
  async readFile(path: string): Promise<string | null> {
    try {
      const response = await fetch(`${this.getBaseUrl()}/vault/${encodeURIComponent(path)}`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to read file: ${path}`);
      }

      return await response.text();
    } catch (error) {
      console.error(`Error reading file ${path}:`, error);
      return null;
    }
  }

  // Write file content
  async writeFile(path: string, content: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.getBaseUrl()}/vault/${encodeURIComponent(path)}`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: content,
      });

      return response.ok;
    } catch (error) {
      console.error(`Error writing file ${path}:`, error);
      return false;
    }
  }

  // Create new file
  async createFile(path: string, content: string = ''): Promise<boolean> {
    return this.writeFile(path, content);
  }

  // Delete file
  async deleteFile(path: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.getBaseUrl()}/vault/${encodeURIComponent(path)}`, {
        method: 'DELETE',
        headers: this.getHeaders(),
      });

      return response.ok;
    } catch (error) {
      console.error(`Error deleting file ${path}:`, error);
      return false;
    }
  }

  // Search files
  async searchFiles(query: string): Promise<string[]> {
    try {
      const response = await fetch(`${this.getBaseUrl()}/search/simple/?query=${encodeURIComponent(query)}`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error('Search failed');
      }

      const data = await response.json();
      return data.results?.map((r: any) => r.filename) || [];
    } catch (error) {
      console.error('Error searching:', error);
      return [];
    }
  }

  // Get file metadata
  async getFileMetadata(path: string): Promise<any | null> {
    try {
      const response = await fetch(`${this.getBaseUrl()}/vault/${encodeURIComponent(path)}/metadata`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        return null;
      }

      return await response.json();
    } catch {
      return null;
    }
  }

  // Update config
  updateConfig(config: Partial<ObsidianConfig>): void {
    this.config = { ...this.config, ...config };
  }

  getConfig(): ObsidianConfig {
    return { ...this.config };
  }
}

// Singleton instance
let obsidianClient: ObsidianClient | null = null;

export function getObsidianClient(config?: Partial<ObsidianConfig>): ObsidianClient {
  if (!obsidianClient) {
    obsidianClient = new ObsidianClient(config);
  } else if (config) {
    obsidianClient.updateConfig(config);
  }
  return obsidianClient;
}

// Save/load config from localStorage
export function saveObsidianConfig(config: ObsidianConfig): void {
  localStorage.setItem('obsidian-config', JSON.stringify(config));
}

export function loadObsidianConfig(): ObsidianConfig | null {
  const saved = localStorage.getItem('obsidian-config');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      return null;
    }
  }
  return null;
}
