import { epic, feature } from 'allure-js-commons';

export async function setAllureLabels(testInfo: import('@playwright/test').TestInfo): Promise<void> {
  const filePath = testInfo.file.replace(/\\/g, '/');
  const match = filePath.match(/projects\/([^/]+)\/tests\/(?:api|ui)\/([^/]+)/);

  if (match) {
    const projectName = match[1];
    const moduleName = match[2];

    await epic(projectName);
    await feature(moduleName);
  }
}
