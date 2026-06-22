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
export class SailorProxyService {
  private readonly baseUrl = process.env.SAILOR_SERVICE_URL || 'http://localhost:3001/sailors';
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

  async createSailor(payload: Record<string, unknown>) {
    try {
      const response = await this.client.post('', payload);
      return response.data;
    } catch (err: unknown) {
      this.handleError(err, 'Sailor service error');
    }
  }

  async authenticateSailor(payload: Record<string, string>) {
    try {
      const response = await this.client.post('/authenticate', payload);
      return response.data;
    } catch (err: unknown) {
      this.handleError(err, 'Sailor authentication error');
    }
  }

  async getSailor(id: string) {
    try {
      const response = await this.client.get(`/${id}`);
      return response.data;
    } catch (err: unknown) {
      this.handleError(err, 'Sailor service error');
    }
  }

  async listSailors() {
    try {
      const response = await this.client.get('');
      return response.data;
    } catch (err: unknown) {
      this.handleError(err, 'Sailor service error');
    }
  }
}
