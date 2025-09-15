import { IAuthService } from '../interfaces/services';
import { User } from '../interfaces/domain';
import { IUserRepository } from '../interfaces/repositories';
import { container } from '../container/container';
import { googleAuthService } from '../../services/google-auth';
import { supabaseService } from '../../services/supabase';

export class AuthService implements IAuthService {
  private userRepository: IUserRepository;

  constructor() {
    this.userRepository = container.get<IUserRepository>('userRepository');
  }

  async verifySessionToken(token: string): Promise<User | null> {
    try {
      return await supabaseService.verifySessionToken(token);
    } catch (error) {
      console.error('Token verification error:', error);
      return null;
    }
  }

  async validateAndRefreshSession(token: string): Promise<{ user: User | null; newToken?: string }> {
    try {
      const user = await supabaseService.verifySessionToken(token);
      if (!user) {
        return { user: null };
      }
      
      // Try to refresh the session if needed
      const refreshResult = await supabaseService.refreshUserSession(token);
      return { 
        user: refreshResult.user, 
        newToken: refreshResult.accessToken || undefined 
      };
    } catch (error) {
      console.error('Session validation error:', error);
      return { user: null };
    }
  }

  getGoogleAuthUrl(state?: string): string {
    try {
      return googleAuthService.getAuthUrl(state);
    } catch (error) {
      console.error('Google auth URL error:', error);
      return '';
    }
  }

  async handleGoogleCallback(code: string, state?: string): Promise<{ user: User; token: string; isNewUser: boolean }> {
    try {
      return await googleAuthService.handleCallback(code, state);
    } catch (error) {
      console.error('Google callback error:', error);
      throw error;
    }
  }
}
