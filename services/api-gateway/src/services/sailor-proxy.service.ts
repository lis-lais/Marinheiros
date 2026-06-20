import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';

@Injectable()
export class SailorProxyService {
  private readonly baseUrl = 'http://localhost:3001/sailors';
  private readonly client: AxiosInstance;

  constructor() {
    this.client = axios.create({ baseURL: this.baseUrl, timeout: 3000 });
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
