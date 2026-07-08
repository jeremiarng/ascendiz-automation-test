import { TestInfo } from '@playwright/test';

interface AttachLogOptions {
  requestBody?: any;
  reqTitle?: string;
  responseBody?: any;
  resTitle?: string;
  requestParams?: any;
  paramsTitle?: string;
}

export const attachLog = async (testInfo: TestInfo, options: AttachLogOptions) => {
  const { 
    requestBody, reqTitle = 'Request Body', 
    responseBody, resTitle = 'Response Body', 
    requestParams, paramsTitle = 'Request Params' 
  } = options;

  if (requestParams) {
    await testInfo.attach(paramsTitle, { body: JSON.stringify(requestParams, null, 2), contentType: 'application/json' });
  }
  if (requestBody) {
    await testInfo.attach(reqTitle, { body: JSON.stringify(requestBody, null, 2), contentType: 'application/json' });
  }
  if (responseBody) {
    await testInfo.attach(resTitle, { body: JSON.stringify(responseBody, null, 2), contentType: 'application/json' });
  }
};
