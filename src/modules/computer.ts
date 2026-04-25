import { ApiClient } from '../client';
export class ComputerModule {
  constructor(private client: ApiClient) {}
  async runBash(command: string): Promise<any> { return this.client.request('/computer/bash', { method: 'POST', body: { command } }); }
  async runBashMultiple(commands: string[]): Promise<any> { return this.client.request('/computer/bash/batch', { method: 'POST', body: { commands } }); }
  async changeHardware(spec: any): Promise<any> { return this.client.request('/computer/hardware', { method: 'POST', body: spec }); }
}
