import { PrismaClient } from '@prisma/client';
import { IMeetingRepository } from '../interfaces/repositories';
import { Meeting } from '../interfaces/domain';
import { BaseRepository } from './base-repository';

export class MeetingRepository extends BaseRepository implements IMeetingRepository {
  constructor(prisma: PrismaClient) {
    super(prisma);
  }

  async findById(id: string): Promise<Meeting | null> {
    try {
      const meeting = await this.prisma.meeting.findUnique({
        where: { id }
      });
      return meeting ? this.mapToDomain(meeting) : null;
    } catch (error) {
      this.handleError(error, 'find meeting by id');
    }
  }

  async findByOrganizationId(organizationId: string): Promise<Meeting[]> {
    try {
      const meetings = await this.prisma.meeting.findMany({
        where: { organizationId },
        orderBy: { createdAt: 'desc' }
      });
      return meetings.map(meeting => this.mapToDomain(meeting));
    } catch (error) {
      this.handleError(error, 'find meetings by organization');
    }
  }

  async create(meetingData: Omit<Meeting, 'id' | 'createdAt' | 'updatedAt'>): Promise<Meeting> {
    try {
      const meeting = await this.prisma.meeting.create({
        data: {
          title: meetingData.title,
          description: meetingData.description,
          organizationId: meetingData.organizationId,
          recallBotId: meetingData.recallBotId,
          status: meetingData.status,
          startTime: meetingData.startTime,
          endTime: meetingData.endTime,
          platform: meetingData.platform,
          meetingUrl: meetingData.meetingUrl,
          transcript: meetingData.transcript,
          summary: meetingData.summary,
          actionItems: meetingData.actionItems,
          keyTopics: meetingData.keyTopics,
          decisions: meetingData.decisions,
          takeaways: meetingData.takeaways,
          sentiment: meetingData.sentiment
        }
      });
      return this.mapToDomain(meeting);
    } catch (error) {
      this.handleError(error, 'create meeting');
    }
  }

  async update(id: string, updates: Partial<Meeting>): Promise<Meeting> {
    try {
      const meeting = await this.prisma.meeting.update({
        where: { id },
        data: {
          ...(updates.title && { title: updates.title }),
          ...(updates.description !== undefined && { description: updates.description }),
          ...(updates.recallBotId !== undefined && { recallBotId: updates.recallBotId }),
          ...(updates.status && { status: updates.status }),
          ...(updates.startTime !== undefined && { startTime: updates.startTime }),
          ...(updates.endTime !== undefined && { endTime: updates.endTime }),
          ...(updates.platform !== undefined && { platform: updates.platform }),
          ...(updates.meetingUrl !== undefined && { meetingUrl: updates.meetingUrl }),
          ...(updates.transcript !== undefined && { transcript: updates.transcript }),
          ...(updates.summary !== undefined && { summary: updates.summary }),
          ...(updates.actionItems !== undefined && { actionItems: updates.actionItems }),
          ...(updates.keyTopics !== undefined && { keyTopics: updates.keyTopics }),
          ...(updates.decisions !== undefined && { decisions: updates.decisions }),
          ...(updates.takeaways !== undefined && { takeaways: updates.takeaways }),
          ...(updates.sentiment !== undefined && { sentiment: updates.sentiment })
        }
      });
      return this.mapToDomain(meeting);
    } catch (error) {
      this.handleError(error, 'update meeting');
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.prisma.meeting.delete({
        where: { id }
      });
    } catch (error) {
      this.handleError(error, 'delete meeting');
    }
  }

  private mapToDomain(prismaMeeting: any): Meeting {
    return {
      id: prismaMeeting.id,
      title: prismaMeeting.title,
      description: prismaMeeting.description,
      organizationId: prismaMeeting.organizationId,
      recallBotId: prismaMeeting.recallBotId,
      status: prismaMeeting.status,
      startTime: prismaMeeting.startTime,
      endTime: prismaMeeting.endTime,
      platform: prismaMeeting.platform,
      meetingUrl: prismaMeeting.meetingUrl,
      transcript: prismaMeeting.transcript,
      summary: prismaMeeting.summary,
      actionItems: prismaMeeting.actionItems,
      keyTopics: prismaMeeting.keyTopics,
      decisions: prismaMeeting.decisions,
      takeaways: prismaMeeting.takeaways,
      sentiment: prismaMeeting.sentiment,
      createdAt: prismaMeeting.createdAt,
      updatedAt: prismaMeeting.updatedAt
    };
  }
}
