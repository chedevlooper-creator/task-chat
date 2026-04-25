import { ApiClient } from '../client';
export class IntegrationsModule {
  constructor(private client: ApiClient) {}
  async listConnections(): Promise<any> { return this.client.request('/integrations/connections', { method: 'GET' }); }
  async triggerAction(id: string, action: string, payload: any): Promise<any> { return this.client.request(`/integrations/${id}/action`, { method: 'POST', body: { action, payload } }); }
}
