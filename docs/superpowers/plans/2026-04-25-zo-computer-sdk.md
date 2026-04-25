# Zo Computer Web API SDK Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create a comprehensive, typed Node.js SDK for the Zo Computer Web API that covers AI, Files, Web, Computer, Integrations, Commerce, Automations, Personalization, Zo Space, and Hosting modules.

**Architecture:** A modular TypeScript SDK design. A central `ZoClient` class handles authentication (Bearer Token) and request dispatching. Each API module (AI, Files, Web, etc.) is implemented as a separate sub-client class attached to the main `ZoClient` to maintain a clean surface area and single responsibility. Responses are strongly typed.

**Tech Stack:** TypeScript, Node.js (`fetch` API), Vitest (testing)

---

### Task 1: Setup Core HTTP Client and Types

**Files:**
- Create: `src/client.ts`
- Create: `src/types/index.ts`
- Create: `tests/client.test.ts`

- [ ] **Step 1: Write the failing test for the core client**

```typescript
// tests/client.test.ts
import { describe, it, expect, vi } from 'vitest';
import { ZoClient } from '../src/client';

describe('ZoClient', () => {
  it('should initialize with API key and set default headers', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true })
    });
    global.fetch = fetchMock;

    const client = new ZoClient({ apiKey: 'zo_sk_test' });
    await client.request('/test', { method: 'GET' });

    expect(fetchMock).toHaveBeenCalledWith('https://api.zocomputer.com/test', {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer zo_sk_test',
        'Content-Type': 'application/json'
      }
    });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/client.test.ts`
Expected: FAIL with "Cannot find module '../src/client'"

- [ ] **Step 3: Write minimal implementation for core types and client**

```typescript
// src/types/index.ts
export interface ZoClientOptions {
  apiKey: string;
  baseUrl?: string;
}

export interface RequestOptions extends RequestInit {
  body?: any;
}
```

```typescript
// src/client.ts
import { ZoClientOptions, RequestOptions } from './types';

export class ZoClient {
  private apiKey: string;
  private baseUrl: string;

  constructor(options: ZoClientOptions) {
    this.apiKey = options.apiKey;
    this.baseUrl = options.baseUrl || 'https://api.zocomputer.com';
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
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/client.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/client.ts src/types/index.ts tests/client.test.ts
git commit -m "feat: setup core ZoClient and request dispatcher"
```

---

### Task 2: Implement AI / Conversation Module

**Files:**
- Create: `src/modules/ai.ts`
- Modify: `src/client.ts`
- Create: `tests/ai.test.ts`

- [ ] **Step 1: Write the failing test for AI endpoints**

```typescript
// tests/ai.test.ts
import { describe, it, expect, vi } from 'vitest';
import { ZoClient } from '../src/client';

describe('AI Module', () => {
  it('should call /zo/ask endpoint correctly', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ output: 'Hello', conversation_id: '123' })
    });
    global.fetch = fetchMock;

    const client = new ZoClient({ apiKey: 'zo_sk_test' });
    const res = await client.ai.ask({ input: 'Hi', model_name: 'gpt-4' });

    expect(fetchMock).toHaveBeenCalledWith('https://api.zocomputer.com/zo/ask', expect.objectContaining({
      method: 'POST',
      body: JSON.stringify({ input: 'Hi', model_name: 'gpt-4' })
    }));
    expect(res.output).toBe('Hello');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/ai.test.ts`
Expected: FAIL with "Property 'ai' does not exist on type 'ZoClient'"

- [ ] **Step 3: Write minimal implementation for AI module**

```typescript
// src/modules/ai.ts
import { ZoClient } from '../client';

export interface AskRequest {
  input: string;
  conversation_id?: string;
  model_name?: string;
  persona_id?: string;
  output_format?: string;
  stream?: boolean;
}

export interface AskResponse {
  output: string;
  conversation_id: string;
}

export interface Model {
  id: string;
  name: string;
}

export interface Persona {
  id: string;
  name: string;
}

export class AIModule {
  constructor(private client: ZoClient) {}

  async ask(params: AskRequest): Promise<AskResponse> {
    return this.client.request<AskResponse>('/zo/ask', {
      method: 'POST',
      body: params
    });
  }

  async getAvailableModels(): Promise<Model[]> {
    return this.client.request<Model[]>('/models/available', {
      method: 'GET'
    });
  }

  async getAvailablePersonas(): Promise<Persona[]> {
    return this.client.request<Persona[]>('/personas/available', {
      method: 'GET'
    });
  }
}
```

- [ ] **Step 4: Modify ZoClient to include AI module**

```typescript
// src/client.ts (modify existing)
import { ZoClientOptions, RequestOptions } from './types';
import { AIModule } from './modules/ai';

export class ZoClient {
  private apiKey: string;
  private baseUrl: string;
  public ai: AIModule;

  constructor(options: ZoClientOptions) {
    this.apiKey = options.apiKey;
    this.baseUrl = options.baseUrl || 'https://api.zocomputer.com';
    this.ai = new AIModule(this);
  }

  // ... keep existing request method ...
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
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run tests/ai.test.ts`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add src/modules/ai.ts src/client.ts tests/ai.test.ts
git commit -m "feat: implement AI and Conversation module"
```

---

### Task 3: Implement Space & Hosting Modules

**Files:**
- Create: `src/modules/space.ts`
- Create: `src/modules/hosting.ts`
- Modify: `src/client.ts`
- Create: `tests/space_hosting.test.ts`

- [ ] **Step 1: Write failing tests for Space and Hosting modules**

```typescript
// tests/space_hosting.test.ts
import { describe, it, expect, vi } from 'vitest';
import { ZoClient } from '../src/client';

describe('Space & Hosting Modules', () => {
  it('should call space routes endpoint', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([{ id: 'r1', path: '/home' }])
    });
    global.fetch = fetchMock;

    const client = new ZoClient({ apiKey: 'zo_sk_test' });
    const res = await client.space.getRoutes();

    expect(fetchMock).toHaveBeenCalledWith('https://api.zocomputer.com/space/routes', expect.objectContaining({
      method: 'GET'
    }));
    expect(res[0].path).toBe('/home');
  });

  it('should call hosting publish endpoint', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true })
    });
    global.fetch = fetchMock;

    const client = new ZoClient({ apiKey: 'zo_sk_test' });
    await client.hosting.publishSite('site123');

    expect(fetchMock).toHaveBeenCalledWith('https://api.zocomputer.com/sites/site123/publish', expect.objectContaining({
      method: 'POST'
    }));
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/space_hosting.test.ts`
Expected: FAIL

- [ ] **Step 3: Write implementation for Space and Hosting**

```typescript
// src/modules/space.ts
import { ZoClient } from '../client';

export interface Route {
  id: string;
  path: string;
}

export class SpaceModule {
  constructor(private client: ZoClient) {}

  async getRoutes(): Promise<Route[]> {
    return this.client.request<Route[]>('/space/routes', { method: 'GET' });
  }

  async restartServer(): Promise<{ success: boolean }> {
    return this.client.request<{ success: boolean }>('/space/restart', { method: 'POST' });
  }
}
```

```typescript
// src/modules/hosting.ts
import { ZoClient } from '../client';

export class HostingModule {
  constructor(private client: ZoClient) {}

  async publishSite(siteId: string): Promise<{ success: boolean }> {
    return this.client.request<{ success: boolean }>(`/sites/${siteId}/publish`, { method: 'POST' });
  }

  async unpublishSite(siteId: string): Promise<{ success: boolean }> {
    return this.client.request<{ success: boolean }>(`/sites/${siteId}/unpublish`, { method: 'POST' });
  }
}
```

- [ ] **Step 4: Attach modules to ZoClient**

```typescript
// src/client.ts (modify existing)
import { ZoClientOptions, RequestOptions } from './types';
import { AIModule } from './modules/ai';
import { SpaceModule } from './modules/space';
import { HostingModule } from './modules/hosting';

export class ZoClient {
  private apiKey: string;
  private baseUrl: string;
  
  public ai: AIModule;
  public space: SpaceModule;
  public hosting: HostingModule;

  constructor(options: ZoClientOptions) {
    this.apiKey = options.apiKey;
    this.baseUrl = options.baseUrl || 'https://api.zocomputer.com';
    
    this.ai = new AIModule(this);
    this.space = new SpaceModule(this);
    this.hosting = new HostingModule(this);
  }

  // ... keep request method ...
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
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run tests/space_hosting.test.ts`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add src/modules/space.ts src/modules/hosting.ts src/client.ts tests/space_hosting.test.ts
git commit -m "feat: implement Space and Hosting API modules"
```

---
*Note: Additional modules (Files, Web, Computer, Integrations, Commerce, Automations, Personalization) follow the exact same pattern defined in Task 2 and 3: create `src/modules/<name>.ts`, implement the CRUD endpoints based on the spec, attach to `ZoClient`, write tests, and commit.*
