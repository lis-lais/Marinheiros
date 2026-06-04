import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class ScheduleProxyService {
  private readonly baseUrl = 'http://localhost:3002/schedules';

  async createSchedule(payload: Record<string, unknown>) {
    const response = await axios.post(this.baseUrl, payload);
    return response.data;
  }

  async getScheduleBySailor(sailorId: string) {
    const response = await axios.get(`${this.baseUrl}/sailor/${sailorId}`);
    return response.data;
  }

  async listSchedules() {
    const response = await axios.get(this.baseUrl);
    return response.data;
  }
}
