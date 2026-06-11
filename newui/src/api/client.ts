import type { NomadError } from './types/common';

let authToken: string | null = null;

export function setAuthToken(token: string | null): void {
  authToken = token;
}

export function getAuthToken(): string | null {
  return authToken;
}

export class NomadClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL.replace(/\/+$/, '');
  }

  private getToken(): string | null {
    return authToken;
  }

  private buildHeaders(): HeadersInit {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    const token = this.getToken();
    if (token) {
      headers['X-Nomad-Token'] = token;
    }
    return headers;
  }

  private buildURL(path: string, params?: Record<string, string>): string {
    const base = this.baseURL || (typeof window !== 'undefined' ? window.location.origin : '')
    const url = new URL(`${base}${path}`);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          url.searchParams.set(key, value);
        }
      });
    }
    return url.toString();
  }

  private parseResponseHeaders(headers: Headers): { index: number; nextToken?: string } {
    const indexStr = headers.get('X-Nomad-Index');
    const index = indexStr ? parseInt(indexStr, 10) : 0;
    const nextToken = headers.get('X-Nomad-NextToken') || undefined;
    return { index, nextToken };
  }

  private async handleResponse<T>(response: Response): Promise<{ data: T; index: number; nextToken?: string }> {
    if (!response.ok) {
      let nomadError: NomadError;
      try {
        const body = await response.json();
        nomadError = {
          statusCode: response.status,
          message: body.error || body.message || response.statusText,
          errors: body.errors || [],
        };
      } catch {
        nomadError = {
          statusCode: response.status,
          message: response.statusText,
          errors: [],
        };
      }
      throw nomadError;
    }

    const { index, nextToken } = this.parseResponseHeaders(response.headers);

    if (response.status === 204) {
      return { data: undefined as T, index, nextToken };
    }

    const data = await response.json();
    return { data, index, nextToken };
  }

  async get<T>(path: string, params?: Record<string, string>, options?: RequestInit): Promise<{ data: T; index: number; nextToken?: string }> {
    const url = this.buildURL(path, params);
    const response = await fetch(url, {
      method: 'GET',
      headers: this.buildHeaders(),
      ...options,
    });
    return this.handleResponse<T>(response);
  }

  async post<T>(path: string, body?: unknown, params?: Record<string, string>): Promise<{ data: T; index: number }> {
    const url = this.buildURL(path, params);
    const response = await fetch(url, {
      method: 'POST',
      headers: this.buildHeaders(),
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    const result = await this.handleResponse<T>(response);
    return { data: result.data, index: result.index };
  }

  async put<T>(path: string, body?: unknown, params?: Record<string, string>): Promise<{ data: T; index: number }> {
    const url = this.buildURL(path, params);
    const response = await fetch(url, {
      method: 'PUT',
      headers: this.buildHeaders(),
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    const result = await this.handleResponse<T>(response);
    return { data: result.data, index: result.index };
  }

  async delete<T>(path: string, params?: Record<string, string>): Promise<{ data: T; index: number }> {
    const url = this.buildURL(path, params);
    const response = await fetch(url, {
      method: 'DELETE',
      headers: this.buildHeaders(),
    });
    const result = await this.handleResponse<T>(response);
    return { data: result.data, index: result.index };
  }

  async stream(path: string, params?: Record<string, string>): Promise<ReadableStream<Uint8Array>> {
    const url = this.buildURL(path, params);
    const response = await fetch(url, {
      method: 'GET',
      headers: this.buildHeaders(),
    });

    if (!response.ok) {
      let nomadError: NomadError;
      try {
        const body = await response.json();
        nomadError = {
          statusCode: response.status,
          message: body.error || body.message || response.statusText,
          errors: body.errors || [],
        };
      } catch {
        nomadError = {
          statusCode: response.status,
          message: response.statusText,
          errors: [],
        };
      }
      throw nomadError;
    }

    if (!response.body) {
      throw new Error('Response body is null');
    }

    return response.body;
  }
}

let clientInstance: NomadClient | null = null;

export function createNomadClient(baseURL: string): NomadClient {
  clientInstance = new NomadClient(baseURL);
  return clientInstance;
}

export function getNomadClient(): NomadClient {
  if (!clientInstance) {
    throw new Error('NomadClient not initialized. Call createNomadClient first.');
  }
  return clientInstance;
}
