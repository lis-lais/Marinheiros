import axios, { AxiosInstance } from 'axios';

export function createHttpClient(baseUrl?: string): AxiosInstance {
  return axios.create({ baseURL: baseUrl ?? undefined, timeout: 3000 });
}
