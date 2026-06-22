import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { AxiosInstance } from 'axios';
import { createHttpClient } from '../infrastructure/http/http-client';

interface AxiosErrorLike {
  response?: {
    status?: number;
    data?: unknown;
  };
}

@Injectable()
export class ScheduleProxyService {
  private readonly baseUrl = process.env.SCHEDULE_SERVICE_URL || 'http://localhost:3002/schedules';
  private readonly client: AxiosInstance;

  constructor() {
    this.client = createHttpClient(this.baseUrl);
  }

  private handleError(err: unknown, defaultMessage: string): never {
    const error = err as AxiosErrorLike;
    const status = error.response?.status ?? HttpStatus.BAD_GATEWAY;
    const data = error.response?.data || defaultMessage;
    throw new HttpException(data, status);
  }

  async createSchedule(payload: Record<string, unknown>) {
    try {
      const response = await this.client.post('', payload);
      return response.data;
    } catch (err: unknown) {
      this.handleError(err, 'Schedule service error');
    }
  }

  async updateProfile(payload: Record<string, unknown>) {
    try {
      const response = await this.client.post('/profile', payload);
      return response.data;
    } catch (err: unknown) {
      this.handleError(err, 'Schedule service profile error');
    }
  }

  async getProjections(sailorId: string, year?: string, month?: string) {
    try {
      const response = await this.client.get(`/projections/${sailorId}`, {
        params: { year, month }
      });
      return response.data;
    } catch (err: unknown) {
      this.handleError(err, 'Schedule service projections error');
    }
  }

  async getNotifications(sailorId: string) {
    try {
      const response = await this.client.get(`/notifications/${sailorId}`);
      return response.data;
    } catch (err: unknown) {
      this.handleError(err, 'Schedule service notifications error');
    }
  }

  async confirmTransition(payload: Record<string, unknown>) {
    try {
      const response = await this.client.post('/confirm', payload);
      return response.data;
    } catch (err: unknown) {
      this.handleError(err, 'Schedule service confirm error');
    }
  }

  async triggerCron() {
    try {
      const response = await this.client.post('/trigger-cron');
      return response.data;
    } catch (err: unknown) {
      this.handleError(err, 'Schedule service cron trigger error');
    }
  }

  async getScheduleBySailor(sailorId: string) {
    try {
      const response = await this.client.get(`/sailor/${sailorId}`);
      return response.data;
    } catch (err: unknown) {
      this.handleError(err, 'Schedule service error');
    }
  }

  async listSchedules() {
    try {
      const response = await this.client.get('');
      return response.data;
    } catch (err: unknown) {
      this.handleError(err, 'Schedule service error');
    }
  }
}
