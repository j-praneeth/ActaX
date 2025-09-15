import { IMeetingService } from '../interfaces/services';
import { IApiService } from '../interfaces/services';
import { container } from '../container/container';

export class MeetingService implements IMeetingService {
  private apiService: IApiService;

  constructor() {
    this.apiService = container.get<IApiService>('apiService');
  }

  async getMeetings(): Promise<any[]> {
    try {
      return await this.apiService.get('/meetings');
    } catch (error) {
      console.error('Failed to fetch meetings:', error);
      throw new Error('Failed to fetch meetings');
    }
  }

  async getMeeting(id: string): Promise<any> {
    try {
      return await this.apiService.get(`/meetings/${id}`);
    } catch (error) {
      console.error('Failed to fetch meeting:', error);
      throw new Error('Failed to fetch meeting');
    }
  }

  async createMeeting(meeting: any): Promise<any> {
    try {
      return await this.apiService.post('/meetings', meeting);
    } catch (error) {
      console.error('Failed to create meeting:', error);
      throw new Error('Failed to create meeting');
    }
  }

  async updateMeeting(id: string, updates: any): Promise<any> {
    try {
      return await this.apiService.put(`/meetings/${id}`, updates);
    } catch (error) {
      console.error('Failed to update meeting:', error);
      throw new Error('Failed to update meeting');
    }
  }

  async deleteMeeting(id: string): Promise<void> {
    try {
      await this.apiService.delete(`/meetings/${id}`);
    } catch (error) {
      console.error('Failed to delete meeting:', error);
      throw new Error('Failed to delete meeting');
    }
  }

  async validateMeeting(url: string): Promise<any> {
    try {
      return await this.apiService.post('/meetings/validate', { url });
    } catch (error) {
      console.error('Failed to validate meeting:', error);
      throw new Error('Failed to validate meeting');
    }
  }

  async joinMeetingWithBot(url: string, meetingId: string): Promise<any> {
    try {
      return await this.apiService.post('/meetings/join-bot', { url, meetingId });
    } catch (error) {
      console.error('Failed to join meeting with bot:', error);
      throw new Error('Failed to join meeting with bot');
    }
  }
}
