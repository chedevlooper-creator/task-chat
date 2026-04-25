import { ApiClient } from '../client';
export class HostingModule {
  constructor(private client: ApiClient) {}
  async publishSite(id: string): Promise<any> { return this.client.request(`/sites/${id}/publish`, { method: 'POST' }); }
  async unpublishSite(id: string): Promise<any> { return this.client.request(`/sites/${id}/unpublish`, { method: 'POST' }); }
}
