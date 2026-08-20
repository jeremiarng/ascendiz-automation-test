import { faker } from '@faker-js/faker';
import { setAllureLabels } from '@shared/helpers/allure-labels';
import { test, expect } from '@shared/fixtures/ui.fixture';
import { getAccessToken } from '@hris-ascendiz/helpers/auth';
import { ENDPOINTS } from '@hris-ascendiz/config/endpoints';
import { ApiFixture } from '@shared/fixtures/api.fixture';
import { LocationPage } from '../pages';

test.beforeEach(async ({}, testInfo) => {
  await setAllureLabels(testInfo);
});

test.describe.serial('Office List - Location CRUD Flow', { tag: ['@ui', '@regression'] }, () => {
  // Shared state antar flow: dibuat di OL-001, diedit di OL-002, dihapus di OL-003
  const uniqueSuffix = faker.string.alphanumeric(5);
  const locationName = `Office_${uniqueSuffix}`;
  const locationCode = `TC${faker.string.numeric(4)}`;
  const email = `office${uniqueSuffix.toLowerCase()}@ascendiz.id`;
  const editedName = `${locationName}_Updated`;

  // Id lokasi yang dibuat di OL-001, dipakai untuk cleanup di afterAll
  let createdLocationId: number | undefined;
  let createdOfficeId: number | undefined;

  test('OL-001: Membuat lokasi baru dengan valid required field', async ({ page }) => {
    const location = new LocationPage(page);

    // Tangkap id lokasi yang baru dibuat untuk cleanup otomatis setelah seluruh test
    page.on('response', async res => {
      if (res.request().method() === 'POST' && res.url().includes('/api/v1/locations')) {
        const body = await res.json().catch(() => null);
        createdLocationId = body?.location?.id;
        createdOfficeId = body?.location?.office?.id;
      }
    });

    await location.gotoList();
    await location.clickAddLocation();

    // --- General Info ---
    await location.fillGeneralInfo({
      name: locationName,
      code: locationCode,
      email,
      phone: '81234567890',
      fax: '021123456',
      businessUnit: 'Sozo Skin (PBJ)',
    });

    // --- Address & Geolocation ---
    await location.fillAddress({
      address: `Jl. Automation ${uniqueSuffix} No. 123`,
      province: 'Banten',
      city: 'Serang',
      postalCode: '15111',
      latitude: '-6.32082',
      longitude: '106.64306',
      radius: '100',
    });

    // --- Tax Info ---
    await location.fillTaxInfo({
      taxName: 'PT Ascendiz Tbk',
      nitku: `NTKU${faker.string.numeric(10)}`,
      npwp15: '12.345.678.9-012.345',
      npwp16: '1234 5678 9012 3456',
      taxHolderName: 'Automation Tester',
      taxHolderNpwp15: '12.345.678.9-012.345',
      taxHolderNpwp16: '1234 5678 9012 3456',
      kluCode: '009S',
    });

    // --- Save & verify ---
    await location.saveForm();

    // Redirect kembali ke location list; lokasi baru muncul di paling atas
    await expect(page).toHaveURL(/\/locations$/);
    await location.expectRowVisible(locationName);

    // Verify data sesuai dengan pengisian
    const firstRow = location.rows.first();
    await expect(firstRow).toContainText(locationCode);
    await expect(firstRow).toContainText(locationName);
    await expect(firstRow).toContainText('Banten');
    await expect(firstRow).toContainText('Serang');
    await expect(firstRow).toContainText('Active');

    // --- View detail ---
    await location.openDetail(locationName);
    await location.expectDetailVisible();
    await expect(location.detailNameValue).toHaveText(locationName);
    await expect(page).toHaveURL(/\/location\/\d+/);
  });

  test('OL-002: Melakukan edit data pada lokasi yang telah dibuat', async ({ page }) => {
    const location = new LocationPage(page);

    await location.gotoList();
    await location.searchLocation(locationName);
    await location.expectRowVisible(locationName);

    // Edit lokasi yang dibuat di OL-001
    await location.openEdit(locationName);

    // Edit data yang ingin diedit
    await location.fillName(editedName);
    await location.fillEmail(`edited${uniqueSuffix.toLowerCase()}@ascendiz.id`);

    await location.saveForm();
    await location.expectEditSaved();

    // Kembali ke location list; data terbaru tampil
    await expect(page).toHaveURL(/\/locations$/);
    await location.expectRowVisible(editedName);

    const firstRow = location.rows.first();
    await expect(firstRow).toContainText(editedName);
  });

  test('OL-003: Menghapus data lokasi pada sistem', async ({ page }) => {
    const location = new LocationPage(page);

    await location.gotoList();
    await location.searchLocation(editedName);
    await location.expectRowVisible(editedName);

    // Hapus lokasi yang dibuat di flow sebelumnya
    await location.clickDelete(editedName);
    await location.confirmDelete();

    // Pastikan data yang dihapus tidak muncul di location list
    await expect(page).toHaveURL(/\/locations(#!)?$/);
    await location.expectRowHidden(editedName);
  });

  // Cleanup: pastikan data lokasi test terhapus setelah seluruh test selesai,
  // meskipun ada test yang gagal/berhenti sebelum OL-003 berjalan.
  test.afterAll(async ({ playwright }, testInfo) => {
    if (!createdLocationId) return;

    const tokenContext = await playwright.request.newContext({
      baseURL: process.env.HRIS_API_URL,
    });
    const token = await getAccessToken(tokenContext);
    await tokenContext.dispose();

    const apiContext = await playwright.request.newContext({
      extraHTTPHeaders: { Authorization: `Bearer ${token}` },
    });
    const api = new ApiFixture(apiContext, testInfo);

    if (createdOfficeId) {
      await api.delete(ENDPOINTS.OFFICE_LIST.BY_ID(createdOfficeId), {
        resTitle: 'Cleanup: Delete Office',
      });
    }
    await api.delete(ENDPOINTS.LOCATIONS.BY_ID(createdLocationId), {
      resTitle: 'Cleanup: Delete Location',
    });
    await apiContext.dispose();
  });
});
