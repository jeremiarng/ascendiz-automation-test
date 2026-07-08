import { TestInfo } from '@playwright/test';

interface AttachLogOptions {
  requestBody?: any;
  reqTitle?: string;
  responseBody?: any;
  resTitle?: string;
  requestParams?: any;
  paramsTitle?: string;
  requestInfo?: { method: string; url: string };
  requestHeaders?: Record<string, string>;
  responseStatus?: number;
  responseStatusText?: string;
  responseHeaders?: Record<string, string>;
}

export const attachLog = async (testInfo: TestInfo, options: AttachLogOptions) => {
  const { 
    requestBody, reqTitle = 'Request Body', 
    responseBody, resTitle = 'Response Body', 
    requestParams, paramsTitle = 'Request Params',
    requestInfo,
    requestHeaders,
    responseStatus,
    responseStatusText,
    responseHeaders,
  } = options;

  if (requestInfo) {
    await testInfo.attach('Request Info', { body: JSON.stringify(requestInfo, null, 2), contentType: 'application/json' });
  }
  if (requestHeaders) {
    await testInfo.attach('Request Headers', { body: JSON.stringify(requestHeaders, null, 2), contentType: 'application/json' });
  }
  if (requestParams) {
    await testInfo.attach(paramsTitle, { body: JSON.stringify(requestParams, null, 2), contentType: 'application/json' });
  }
  if (requestBody) {
    await testInfo.attach(reqTitle, { body: JSON.stringify(requestBody, null, 2), contentType: 'application/json' });
  }
  if (responseStatus !== undefined) {
    await testInfo.attach('Response Status', { body: JSON.stringify({ status: responseStatus, statusText: responseStatusText }, null, 2), contentType: 'application/json' });
  }
  if (responseHeaders) {
    await testInfo.attach('Response Headers', { body: JSON.stringify(responseHeaders, null, 2), contentType: 'application/json' });
  }
  if (responseBody) {
    await testInfo.attach(resTitle, { body: JSON.stringify(responseBody, null, 2), contentType: 'application/json' });
  }
};
