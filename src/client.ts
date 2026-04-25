import { ApiClientOptions, RequestOptions } from './types';
import { AIModule } from './modules/ai';
import { SpaceModule } from './modules/space';
import { HostingModule } from './modules/hosting';
import { FilesModule } from './modules/files';
import { WebModule } from './modules/web';
import { ComputerModule } from './modules/computer';
import { IntegrationsModule } from './modules/integrations';
import { CommerceModule } from './modules/commerce';
import { AutomationsModule } from './modules/automations';
import { PersonalizationModule } from './modules/personalization';

export class ApiClient {
  private apiKey: string;
  private baseUrl: string;
  
  public ai: AIModule;
  public space: SpaceModule;
  public hosting: HostingModule;
  public files: FilesModule;
  public web: WebModule;
  public computer: ComputerModule;
  public integrations: IntegrationsModule;
  public commerce: CommerceModule;
  public automations: AutomationsModule;
  public personalization: PersonalizationModule;

  constructor(options: ApiClientOptions) {
    this.apiKey = options.apiKey;
    this.baseUrl = options.baseUrl || 'https://api.example.com';
    
    this.ai = new AIModule(this);
    this.space = new SpaceModule(this);
    this.hosting = new HostingModule(this);
    this.files = new FilesModule(this);
    this.web = new WebModule(this);
    this.computer = new ComputerModule(this);
    this.integrations = new IntegrationsModule(this);
    this.commerce = new CommerceModule(this);
    this.automations = new AutomationsModule(this);
    this.personalization = new PersonalizationModule(this);
  }

  async request<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    const headers = new Headers(options.headers || {});
    
    headers.set('Authorization', `Bearer ${this.apiKey}`);
    if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
      headers.set('Content-Type', 'application/json');
    }

    const config: RequestInit = {
      ...options,
      headers,
      body: options.body && !(options.body instanceof FormData) 
        ? JSON.stringify(options.body) 
        : options.body
    };

    const response = await fetch(url, config);
    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }
    return response.json();
  }
}
