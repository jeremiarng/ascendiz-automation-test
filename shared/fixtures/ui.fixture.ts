import { test as base, expect, Page } from '@playwright/test';

interface NetworkEntry {
  url: string;
  method: string;
  requestBody?: any;
  status: number;
  responseBody?: any;
}

export const test = base.extend<{ page: Page }>({
  page: async ({ page }, use, testInfo) => {
    const pending = new Map<string, { method: string; requestBody?: any }>();
    const logs: NetworkEntry[] = [];
    let reqCounter = 0;

    page.on('request', req => {
      if (req.resourceType() !== 'xhr' && req.resourceType() !== 'fetch') return;
      const method = req.method();
      if (!['POST', 'GET', 'PUT', 'PATCH'].includes(method)) return;

      const id = `${++reqCounter}_${req.url()}`;
      const entry: { method: string; requestBody?: any } = { method };
      const postData = req.postData();
      if (postData) {
        try {
          entry.requestBody = JSON.parse(postData);
        } catch {
          // not JSON, skip body
        }
      }
      pending.set(id, entry);
    });

    page.on('response', async res => {
      const req = res.request();
      if (req.resourceType() !== 'xhr' && req.resourceType() !== 'fetch') return;
      const method = req.method();
      if (!['POST', 'GET', 'PUT', 'PATCH'].includes(method)) return;

      const keys = [...pending.keys()];
      const id = keys.reverse().find(k => k.endsWith(`_${req.url()}`)) as string;
      const reqEntry = pending.get(id);
      if (!reqEntry) return;
      pending.delete(id);

      const entry: NetworkEntry = {
        url: req.url(),
        method,
        requestBody: reqEntry.requestBody,
        status: res.status(),
      };

      const ct = res.headers()['content-type'] || '';
      if (ct.includes('json')) {
        try {
          entry.responseBody = JSON.parse((await res.body()).toString());
        } catch {
          // not parseable
        }
      }
      logs.push(entry);
    });

    page.on('requestfailed', req => {
      if (req.resourceType() !== 'xhr' && req.resourceType() !== 'fetch') return;
      const method = req.method();
      if (!['POST', 'GET', 'PUT', 'PATCH'].includes(method)) return;

      const keys = [...pending.keys()];
      const id = keys.reverse().find(k => k.endsWith(`_${req.url()}`)) as string;
      if (id) pending.delete(id);
    });

    await use(page);

    // 1. Screenshot — attached first so it appears before network attachments
    try {
      const screenshotBuffer = await page.screenshot({ fullPage: true, timeout: 5000 });
      const label = testInfo.status === 'failed' || testInfo.status === 'timedOut'
        ? 'SCREENSHOT ON FAILURE'
        : 'SCREENSHOT';
      await testInfo.attach(label, {
        body: screenshotBuffer,
        contentType: 'image/png',
      });
    } catch {
      // page already closed or screenshot failed
    }

    // 2. Individual network attachments
    for (const entry of logs) {
      const path = new URL(entry.url).pathname;
      if (entry.requestBody !== undefined) {
        await testInfo.attach(`NETWORK - Request Body For ${entry.method} ${path}`, {
          body: JSON.stringify(entry.requestBody, null, 2),
          contentType: 'application/json',
        });
      }
      await testInfo.attach(`NETWORK - Response Body [${entry.status}] For ${entry.method} ${path}`, {
        body: JSON.stringify(entry.responseBody ?? {}, null, 2),
        contentType: 'application/json',
      });
    }
  },
});

export { expect };
