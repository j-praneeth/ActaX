import { IAnalyticsService } from '../interfaces/services';
import { IApiService } from '../interfaces/services';
import { container } from '../container/container';

export class AnalyticsService implements IAnalyticsService {
  private apiService: IApiService;

  constructor() {
    this.apiService = container.get<IApiService>('apiService');
  }

  async getMeetingAnalytics(): Promise<{
    totalMeetings: number;
    completedMeetings: number;
    scheduledMeetings: number;
    inProgressMeetings: number;
  }> {
    try {
      return await this.apiService.get('/analytics/meetings');
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      throw new Error('Failed to fetch analytics');
    }
  }
}
