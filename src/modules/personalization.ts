import { ApiClient } from '../client';
export class PersonalizationModule {
  constructor(private client: ApiClient) {}
  async listPersonas(): Promise<any> { return this.client.request('/personas', { method: 'GET' }); }
  async createPersona(data: any): Promise<any> { return this.client.request('/personas', { method: 'POST', body: data }); }
  async setActivePersona(id: string): Promise<any> { return this.client.request(`/personas/${id}/active`, { method: 'POST' }); }
  async listRules(): Promise<any> { return this.client.request('/rules', { method: 'GET' }); }
  async createRule(data: any): Promise<any> { return this.client.request('/rules', { method: 'POST', body: data }); }
  async updateSettings(settings: any): Promise<any> { return this.client.request('/settings', { method: 'PUT', body: settings }); }
}
