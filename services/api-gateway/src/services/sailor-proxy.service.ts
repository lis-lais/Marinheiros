import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class SailorProxyService {
  private readonly baseUrl = 'http://localhost:3001/sailors';

  async createSailor(payload: Record<string, unknown>) {
    const response = await axios.post(this.baseUrl, payload);
    return response.data;
  }

  async getSailor(id: string) {
    const response = await axios.get(`${this.baseUrl}/${id}`);
    return response.data;
  }

  async listSailors() {
    const response = await axios.get(this.baseUrl);
    return response.data;
  }
}
