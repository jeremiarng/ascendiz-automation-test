import { APIRequestContext } from '@playwright/test';
import { attachLog } from '../../../shared/helpers/logger';

interface RequestLogOptions {
  reqTitle?: string;
  paramsTitle?: string;
  resTitle?: string;
}

export class ApiFixture {
  constructor(
    private readonly request: APIRequestContext,
    private readonly testInfo: import('@playwright/test').TestInfo,
  ) {}

  async get(
    url: string,
    params?: Record<string, string | number | boolean | undefined>,
    options?: RequestLogOptions,
  ) {
    const response = await this.request.get(url, { params: params as any });
    const responseBody = await this.safeJson(response);
    const status = response.status();
    await attachLog(this.testInfo, {
      requestParams: params,
      paramsTitle: options?.paramsTitle || `Request Params For GET ${url}`,
      responseBody,
      resTitle: options?.resTitle || `Response Body [${status}] For GET ${url}`,
    });
    return { response, responseBody };
  }

  async post(
    url: string,
    data?: any,
    options?: RequestLogOptions,
  ) {
    const response = await this.request.post(url, { data });
    const responseBody = await this.safeJson(response);
    const status = response.status();
    await attachLog(this.testInfo, {
      requestBody: data,
      reqTitle: options?.reqTitle || `Request Body For POST ${url}`,
      responseBody,
      resTitle: options?.resTitle || `Response Body [${status}] For POST ${url}`,
    });
    return { response, responseBody };
  }

  async patch(
    url: string,
    data?: any,
    options?: RequestLogOptions,
  ) {
    const response = await this.request.patch(url, { data });
    const responseBody = await this.safeJson(response);
    const status = response.status();
    await attachLog(this.testInfo, {
      requestBody: data,
      reqTitle: options?.reqTitle || `Request Body For PATCH ${url}`,
      responseBody,
      resTitle: options?.resTitle || `Response Body [${status}] For PATCH ${url}`,
    });
    return { response, responseBody };
  }

  async delete(
    url: string,
    options?: RequestLogOptions,
  ) {
    const response = await this.request.delete(url);
    const responseBody = await this.safeJson(response);
    const status = response.status();
    await attachLog(this.testInfo, {
      responseBody,
      resTitle: options?.resTitle || `Response Body [${status}] For DELETE ${url}`,
    });
    return { response, responseBody };
  }

  async postMultipart(
    url: string,
    data: Record<string, any>,
    options?: RequestLogOptions,
  ) {
    const multipartPayload: Record<string, string> = {};
    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined && value !== null) {
        multipartPayload[key] = String(value);
      }
    }
    const response = await this.request.post(url, { multipart: multipartPayload });
    const responseBody = await this.safeJson(response);
    const status = response.status();
    await attachLog(this.testInfo, {
      requestBody: data,
      reqTitle: options?.reqTitle || `Request Body (multipart) For POST ${url}`,
      responseBody,
      resTitle: options?.resTitle || `Response Body [${status}] For POST ${url}`,
    });
    return { response, responseBody };
  }

  private async safeJson(response: any): Promise<any> {
    try {
      const text = await response.text();
      return text ? JSON.parse(text) : null;
    } catch {
      return null;
    }
  }
}
