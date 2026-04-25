import { ApiClient } from '../client';
export class CommerceModule {
  constructor(private client: ApiClient) {}
  async createProduct(data: any): Promise<any> { return this.client.request('/commerce/products', { method: 'POST', body: data }); }
  async listProducts(): Promise<any> { return this.client.request('/commerce/products', { method: 'GET' }); }
  async createPaymentLink(productId: string): Promise<any> { return this.client.request('/commerce/payment-links', { method: 'POST', body: { productId } }); }
  async listOrders(): Promise<any> { return this.client.request('/commerce/orders', { method: 'GET' }); }
}
