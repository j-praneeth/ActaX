import { IIntegrationService } from '../interfaces/services';
import { IApiService } from '../interfaces/services';
import { container } from '../container/container';

export class IntegrationService implements IIntegrationService {
  private apiService: IApiService;

  constructor() {
    this.apiService = container.get<IApiService>('apiService');
  }

  async getIntegrations(): Promise<any[]> {
    try {
      return await this.apiService.get('/integrations');
    } catch (error) {
      console.error('Failed to fetch integrations:', error);
      throw new Error('Failed to fetch integrations');
    }
  }

  async connectIntegration(provider: string): Promise<{ authUrl: string }> {
    try {
      return await this.apiService.post(`/integrations/${provider}/connect`);
    } catch (error) {
      console.error('Failed to connect integration:', error);
      throw new Error('Failed to connect integration');
    }
  }

  async disconnectIntegration(id: string): Promise<void> {
    try {
      await this.apiService.delete(`/integrations/${id}`);
    } catch (error) {
      console.error('Failed to disconnect integration:', error);
      throw new Error('Failed to disconnect integration');
    }
  }

  async handleOAuthCallback(provider: string, code: string, state: string): Promise<any> {
    try {
      return await this.apiService.post('/integrations/callback', { provider, code, state });
    } catch (error) {
      console.error('Failed to handle OAuth callback:', error);
      throw new Error('Failed to handle OAuth callback');
    }
  }
}
