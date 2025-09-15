import { container } from './container';

// Services
import { ApiService } from '../services/api.service';
import { AuthService } from '../services/auth.service';
import { MeetingService } from '../services/meeting.service';
import { IntegrationService } from '../services/integration.service';
import { AnalyticsService } from '../services/analytics.service';
import { StorageService } from '../services/storage.service';

// Interfaces
import { IApiService } from '../interfaces/services';
import { IAuthService } from '../interfaces/services';
import { IMeetingService } from '../interfaces/services';
import { IIntegrationService } from '../interfaces/services';
import { IAnalyticsService } from '../interfaces/services';
import { IStorageService } from '../interfaces/services';

export function setupContainer(): void {
  // Register services
  container.register<IApiService>('apiService', new ApiService());
  container.register<IStorageService>('storageService', new StorageService());
  container.register<IAuthService>('authService', new AuthService());
  container.register<IMeetingService>('meetingService', new MeetingService());
  container.register<IIntegrationService>('integrationService', new IntegrationService());
  container.register<IAnalyticsService>('analyticsService', new AnalyticsService());
}
