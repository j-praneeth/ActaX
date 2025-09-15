import { IAuthService } from '../interfaces/services';
import { IApiService } from '../interfaces/services';
import { IStorageService } from '../interfaces/services';
import { container } from '../container/container';

export class AuthService implements IAuthService {
  private apiService: IApiService;
  private storageService: IStorageService;
  private tokenKey = 'auth_token';
  private userKey = 'current_user';

  constructor() {
    this.apiService = container.get<IApiService>('apiService');
    this.storageService = container.get<IStorageService>('storageService');
  }

  async login(email: string, password: string): Promise<{ user: any; token: string }> {
    try {
      // This would integrate with your auth provider (Supabase, etc.)
      // For now, we'll return a mock response
      const mockUser = { id: '1', email, name: email.split('@')[0] };
      const mockToken = 'mock-token';
      
      this.storageService.set(this.tokenKey, mockToken);
      this.storageService.set(this.userKey, mockUser);
      this.apiService.setToken(mockToken);
      
      return { user: mockUser, token: mockToken };
    } catch (error) {
      console.error('Login error:', error);
      throw new Error('Login failed');
    }
  }

  async signup(email: string, password: string, name: string): Promise<{ user: any; token: string }> {
    try {
      // This would integrate with your auth provider
      const mockUser = { id: '1', email, name };
      const mockToken = 'mock-token';
      
      this.storageService.set(this.tokenKey, mockToken);
      this.storageService.set(this.userKey, mockUser);
      this.apiService.setToken(mockToken);
      
      return { user: mockUser, token: mockToken };
    } catch (error) {
      console.error('Signup error:', error);
      throw new Error('Signup failed');
    }
  }

  async logout(): Promise<void> {
    this.storageService.remove(this.tokenKey);
    this.storageService.remove(this.userKey);
    this.apiService.setToken(null);
  }

  async getCurrentUser(): Promise<any | null> {
    const user = this.storageService.get(this.userKey);
    if (user) {
      return user;
    }

    // Try to refresh the session
    const token = this.getToken();
    if (token) {
      try {
        const response = await this.apiService.post<{ user: any; newToken?: string }>('/auth/refresh', { token });
        if (response.user) {
          this.storageService.set(this.userKey, response.user);
          return response.user;
        }
      } catch (error) {
        console.error('Session refresh failed:', error);
        this.logout();
      }
    }

    return null;
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  getToken(): string | null {
    return this.storageService.get(this.tokenKey);
  }
}
