import { ApiClient } from '../client';
export class FilesModule {
  constructor(private client: ApiClient) {}
  async readFile(path: string): Promise<any> { return this.client.request(`/files/read?path=${encodeURIComponent(path)}`, { method: 'GET' }); }
  async writeFile(path: string, content: string): Promise<any> { return this.client.request('/files/write', { method: 'POST', body: { path, content } }); }
  async deleteFile(path: string): Promise<any> { return this.client.request(`/files/delete?path=${encodeURIComponent(path)}`, { method: 'DELETE' }); }
  async grep(query: string, path: string): Promise<any> { return this.client.request('/files/grep', { method: 'POST', body: { query, path } }); }
}
