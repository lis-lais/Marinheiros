import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { AxiosInstance } from 'axios';
import { createHttpClient } from '../infrastructure/http/http-client';

@Injectable()
export class SailorProxyService {
  private readonly baseUrl = process.env.SAILOR_SERVICE_URL || 'http://localhost:3001/sailors';
  private readonly client: AxiosInstance;

  constructor() {
    this.client = createHttpClient(this.baseUrl);
  }

  async createSailor(payload: Record<string, unknown>) {
    try {
      const response = await this.client.post('', payload);
      return response.data;
    } catch (err: any) {
      const status = err.response?.status ?? HttpStatus.BAD_GATEWAY;
      throw new HttpException(err.response?.data || 'Sailor service error', status);
    }
  }

  async getSailor(id: string) {
    try {
      const response = await this.client.get(`/${id}`);
      return response.data;
    } catch (err: any) {
      const status = err.response?.status ?? HttpStatus.BAD_GATEWAY;
      throw new HttpException(err.response?.data || 'Sailor service error', status);
    }
  }

  async listSailors() {
    try {
      const response = await this.client.get('');
      return response.data;
    } catch (err: any) {
      const status = err.response?.status ?? HttpStatus.BAD_GATEWAY;
      throw new HttpException(err.response?.data || 'Sailor service error', status);
    }
  }
}
