import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';

@Injectable()
export class ScheduleProxyService {
  private readonly baseUrl = 'http://localhost:3002/schedules';
  private readonly client: AxiosInstance;

  constructor() {
    this.client = axios.create({ baseURL: this.baseUrl, timeout: 3000 });
  }

  async createSchedule(payload: Record<string, unknown>) {
    try {
      const response = await this.client.post('', payload);
      return response.data;
    } catch (err: any) {
      const status = err.response?.status ?? HttpStatus.BAD_GATEWAY;
      throw new HttpException(err.response?.data || 'Schedule service error', status);
    }
  }

  async getScheduleBySailor(sailorId: string) {
    try {
      const response = await this.client.get(`/sailor/${sailorId}`);
      return response.data;
    } catch (err: any) {
      const status = err.response?.status ?? HttpStatus.BAD_GATEWAY;
      throw new HttpException(err.response?.data || 'Schedule service error', status);
    }
  }

  async listSchedules() {
    try {
      const response = await this.client.get('');
      return response.data;
    } catch (err: any) {
      const status = err.response?.status ?? HttpStatus.BAD_GATEWAY;
      throw new HttpException(err.response?.data || 'Schedule service error', status);
    }
  }
}
