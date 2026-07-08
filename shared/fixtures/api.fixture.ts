import { APIRequestContext, TestInfo } from "@playwright/test";
import { attachLog } from "../helpers/logger";
export class ApiFixture {
  constructor(
    private apiContext: APIRequestContext,
    private testInfo: TestInfo,
  ) {}
  async post(
    endpoint: string,
    payload: any,
    options: {
      reqTitle?: string;
      resTitle?: string;
      params?: any;
      paramsTitle?: string;
    } = {},
  ) {
    const response = await this.apiContext.post(endpoint, {
      data: payload,
      params: options.params,
    });
    const responseBody = await response.json().catch(() => null);
    const status = response.status();

    await attachLog(this.testInfo, {
      requestParams: options.params,
      paramsTitle: options.paramsTitle || "Request Params",
      requestBody: payload,
      reqTitle: options.reqTitle || `Request Body For POST ${endpoint}`,
      responseBody,
      resTitle: options.resTitle || `Response Body [${status}] For POST ${endpoint}`,
    });

    return { response, responseBody };
  }
  async postMultipart(
    endpoint: string,
    formData: Record<string, string | number | boolean>,
    options: { reqTitle?: string; resTitle?: string } = {},
  ) {
    const multipartPayload: Record<string, string> = {};
    for (const [key, value] of Object.entries(formData)) {
      multipartPayload[key] = String(value);
    }

    const response = await this.apiContext.post(endpoint, {
      multipart: multipartPayload,
    });
    const responseBody = await response.json().catch(() => null);
    const status = response.status();

    await attachLog(this.testInfo, {
      requestBody: formData,
      reqTitle:
        options.reqTitle || `Request Body (multipart) For POST ${endpoint}`,
      responseBody,
      resTitle: options.resTitle || `Response Body [${status}] For POST ${endpoint}`,
    });

    return { response, responseBody };
  }

  async patch(
    endpoint: string,
    payload: any,
    options: {
      reqTitle?: string;
      resTitle?: string;
      params?: any;
      paramsTitle?: string;
    } = {},
  ) {
    const response = await this.apiContext.patch(endpoint, {
      data: payload,
      params: options.params,
    });
    const responseBody = await response.json().catch(() => null);
    const status = response.status();

    await attachLog(this.testInfo, {
      requestParams: options.params,
      paramsTitle: options.paramsTitle || "Request Params",
      requestBody: payload,
      reqTitle: options.reqTitle || `Request Body For PATCH ${endpoint}`,
      responseBody,
      resTitle: options.resTitle || `Response Body [${status}] For PATCH ${endpoint}`,
    });

    return { response, responseBody };
  }
  async delete(endpoint: string, options: { resTitle?: string } = {}) {
    const response = await this.apiContext.delete(endpoint);
    const responseBody = await response.json().catch(() => null);
    const status = response.status();

    await attachLog(this.testInfo, {
      responseBody,
      resTitle: options.resTitle || `Response Body [${status}] For DELETE ${endpoint}`,
    });

    return { response, responseBody };
  }
  async get(
    endpoint: string,
    params: any,
    options: { paramsTitle?: string; resTitle?: string } = {},
  ) {
    const response = await this.apiContext.get(endpoint, { params });
    const responseBody = await response.json().catch(() => null);
    const status = response.status();

    await attachLog(this.testInfo, {
      requestParams: params,
      paramsTitle: options.paramsTitle || `Request Params For GET ${endpoint}`,
      responseBody,
      resTitle: options.resTitle || `Response Body [${status}] For GET ${endpoint}`,
    });

    return { response, responseBody };
  }
}
