import { ApiClient } from '../client';
export class SpaceModule {
  constructor(private client: ApiClient) {}
  async getRoutes(): Promise<any> { return this.client.request('/space/routes', { method: 'GET' }); }
  async restartServer(): Promise<any> { return this.client.request('/space/restart', { method: 'POST' }); }
}
