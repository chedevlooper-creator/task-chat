import { ApiClient } from '../client';
export class AutomationsModule {
  constructor(private client: ApiClient) {}
  async listAutomations(): Promise<any> { return this.client.request('/automations', { method: 'GET' }); }
  async getAutomation(id: string): Promise<any> { return this.client.request(`/automations/${id}`, { method: 'GET' }); }
  async createAutomation(data: any): Promise<any> { return this.client.request('/automations', { method: 'POST', body: data }); }
  async updateAutomation(id: string, data: any): Promise<any> { return this.client.request(`/automations/${id}`, { method: 'PUT', body: data }); }
  async deleteAutomation(id: string): Promise<any> { return this.client.request(`/automations/${id}`, { method: 'DELETE' }); }
}
