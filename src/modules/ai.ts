import { ApiClient } from '../client';
export class AIModule {
  constructor(private client: ApiClient) {}
  async ask(params: any): Promise<any> { return this.client.request('/api/ask', { method: 'POST', body: params }); }
  async getAvailableModels(): Promise<any[]> { return this.client.request('/models/available', { method: 'GET' }); }
  async getAvailablePersonas(): Promise<any[]> { return this.client.request('/personas/available', { method: 'GET' }); }
}
