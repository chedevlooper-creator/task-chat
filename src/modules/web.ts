import { ApiClient } from '../client';
export class WebModule {
  constructor(private client: ApiClient) {}
  async search(query: string, engine='google'): Promise<any> { return this.client.request('/web/search', { method: 'POST', body: { query, engine } }); }
  async readPage(url: string): Promise<any> { return this.client.request('/web/read', { method: 'POST', body: { url } }); }
  async mapSearch(query: string): Promise<any> { return this.client.request('/web/maps', { method: 'POST', body: { query } }); }
}
