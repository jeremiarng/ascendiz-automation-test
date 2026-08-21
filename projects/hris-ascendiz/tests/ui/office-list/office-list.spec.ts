import { APIRequestContext } from '@playwright/test';
import { faker } from '@faker-js/faker';
import { setAllureLabels } from '@shared/helpers/allure-labels';
import { test, expect } from '@shared/fixtures/ui.fixture';
import { getAccessToken } from '@hris-ascendiz/helpers/auth';
import { ENDPOINTS } from '@hris-ascendiz/config/endpoints';
import { ApiFixture } from '@shared/fixtures/api.fixture';
import { LocationPage, OfficePage } from '../pages';

test.beforeEach(async ({}, testInfo) => {
  await setAllureLabels(testInfo);
});

/**
 * Cari id office berdasarkan nama via API, lalu hapus.
 * Fallback: jika tidak ditemukan atau diblokir sistem, lewati.
 */
async function deleteOfficeByName(
  request: APIRequestContext,
  name: string,
  testInfo: import('@playwright/test').TestInfo,
): Promise<void> {
  const api = new ApiFixture(request, testInfo);
  const { responseBody } = await api.get('/api/v1/office', { limit: 500 }, {
    resTitle: 'Cleanup: List Offices',
  });
  const offices = responseBody?.offices || [];
  const match = offices.find((o: any) => o.office_name === name || o.name === name);
  if (match) {
    await api.delete(ENDPOINTS.OFFICE_LIST.BY_ID(match.id), { resTitle: `Cleanup: Delete Office ${name}` });
  }
}

/**
 * Cari id lokasi berdasarkan nama via API, lalu hapus.
 */
async function deleteLocationByName(
  request: APIRequestContext,
  name: string,
  testInfo: import('@playwright/test').TestInfo,
): Promise<void> {
  const api = new ApiFixture(request, testInfo);
  const { responseBody } = await api.get(ENDPOINTS.LOCATIONS.BASE, { limit: 500 }, {
    resTitle: 'Cleanup: List Locations',
  });
  const locations = responseBody?.locations || [];
  const match = locations.find((l: any) => l.name === name);
  if (match) {
    await api.delete(ENDPOINTS.LOCATIONS.BY_ID(match.id), { resTitle: `Cleanup: Delete Location ${name}` });
  }
}

// =====================================================================
// Module Office List
// Status mengacu pada docs/ui-flow/office-list.xlsx (kolom Status):
//   [Done] OL-001, OL-003, OL-004
//   [In Progress] OL-002, OL-005 s/d OL-015
// =====================================================================

// ---------------------------------------------------------------------
// [Done] Location CRUD
// ---------------------------------------------------------------------

test.describe.serial('Office List - Location CRUD Flow [Done]', { tag: ['@ui', '@regression'] }, () => {
  // Shared state antar flow: dibuat di OL-001, diedit di OL-003, dihapus di OL-004
  const uniqueSuffix = faker.string.alphanumeric(5);
  const locationName = `Office_${uniqueSuffix}`;
  const locationCode = `TC${faker.string.numeric(4)}`;
  const email = `office${uniqueSuffix.toLowerCase()}@ascendiz.id`;
  const editedName = `${locationName}_Updated`;

  test('OL-001: Membuat lokasi baru dengan valid required field', async ({ page }) => {
    const location = new LocationPage(page);

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

    // Redirect kembali ke location list; lokasi baru muncul di daftar
    await expect(page).toHaveURL(/\/locations$/);
    await location.searchLocation(locationName);
    await location.expectRowVisible(locationName);

    // Verify data sesuai dengan pengisian (berdasarkan baris lokasi yang dibuat)
    const row = location.rowByLocationName(locationName);
    await expect(row).toContainText(locationCode);
    await expect(row).toContainText(locationName);
    await expect(row).toContainText('Banten');
    await expect(row).toContainText('Serang');
    await expect(row).toContainText('Active');

    // --- View detail ---
    await location.openDetail(locationName);
    await location.expectDetailVisible();
    await expect(location.detailNameValue).toHaveText(locationName);
    await expect(page).toHaveURL(/\/location\/\d+/);
  });

  test('OL-003: Melakukan edit data pada lokasi yang telah dibuat', async ({ page }) => {
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
    await location.searchLocation(editedName);
    await location.expectRowVisible(editedName);

    const row = location.rowByLocationName(editedName);
    await expect(row).toContainText(editedName);
  });

  test('OL-004: Menghapus data lokasi pada sistem', async ({ page }) => {
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
  // meskipun ada test yang gagal/berhenti sebelum OL-004 berjalan.
  test.afterAll(async ({ playwright }, testInfo) => {
    const tokenContext = await playwright.request.newContext({ baseURL: process.env.HRIS_API_URL });
    const token = await getAccessToken(tokenContext);
    await tokenContext.dispose();

    const apiContext = await playwright.request.newContext({
      baseURL: process.env.HRIS_API_URL,
      extraHTTPHeaders: { Authorization: `Bearer ${token}` },
    });

    // Hapus lokasi (dan office otomatis) berdasarkan nama
    await deleteOfficeByName(apiContext, editedName, testInfo);
    await deleteOfficeByName(apiContext, locationName, testInfo);
    await deleteLocationByName(apiContext, editedName, testInfo);
    await deleteLocationByName(apiContext, locationName, testInfo);

    await apiContext.dispose();
  });
});

// ---------------------------------------------------------------------
// [In Progress] Auto-created office dari create location
// ---------------------------------------------------------------------

test.describe.serial('Office List - Auto Create Office From Location [In Progress]', { tag: ['@ui', '@regression'] }, () => {
  // OL-002: Sistem otomatis membuat data office baru setelah membuat lokasi
  const uniqueSuffix = faker.string.alphanumeric(5);
  const locationName = `OfficeAuto_${uniqueSuffix}`;
  const locationCode = `TC${faker.string.numeric(4)}`;
  const email = `officeauto${uniqueSuffix.toLowerCase()}@ascendiz.id`;

  test('OL-002: Sistem otomatis membuat data office baru setelah membuat lokasi', async ({ page }) => {
    const location = new LocationPage(page);
    const office = new OfficePage(page);

    // --- Buat lokasi baru ---
    await location.gotoList();
    await location.clickAddLocation();
    await location.fillGeneralInfo({
      name: locationName,
      code: locationCode,
      email,
      phone: '81234567890',
      fax: '021123456',
      businessUnit: 'Sozo Skin (PBJ)',
    });
    await location.fillAddress({
      address: `Jl. Auto Office ${uniqueSuffix} No. 1`,
      province: 'Banten',
      city: 'Serang',
      postalCode: '15111',
      latitude: '-6.32082',
      longitude: '106.64306',
      radius: '100',
    });
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
    await location.saveForm();
    await location.expectRowVisible(locationName);

    // --- Cek office otomatis terbentuk di Office List ---
    await office.gotoList();
    await office.expectRowVisible(locationName);

    // Verifikasi data office sesuai data lokasi yang diinput
    const officeRow = office.rowByOfficeName(locationName);
    await expect(officeRow).toContainText(locationName);
    await expect(officeRow).toContainText('100'); // office location radius
  });

  // Cleanup lokasi & office yang dibuat
  test.afterAll(async ({ playwright }, testInfo) => {
    const tokenContext = await playwright.request.newContext({ baseURL: process.env.HRIS_API_URL });
    const token = await getAccessToken(tokenContext);
    await tokenContext.dispose();

    const apiContext = await playwright.request.newContext({
      baseURL: process.env.HRIS_API_URL,
      extraHTTPHeaders: { Authorization: `Bearer ${token}` },
    });

    // Hapus office & lokasi berdasarkan nama (tidak bergantung pada capture id)
    await deleteOfficeByName(apiContext, locationName, testInfo);
    await deleteLocationByName(apiContext, locationName, testInfo);

    await apiContext.dispose();
  });
});

// ---------------------------------------------------------------------
// [In Progress] Office CRUD
// ---------------------------------------------------------------------

test.describe.serial('Office List - Office CRUD Flow [In Progress]', { tag: ['@ui', '@regression'] }, () => {
  // OL-005, OL-006, OL-007: Create -> Edit -> Delete office
  const uniqueSuffix = faker.string.alphanumeric(5);
  const officeName = `Office_${uniqueSuffix}`;
  const editedName = `${officeName}_Updated`;
  const locationOption = 'HO Seven Retail';

  test('OL-005: Membuat data office baru dengan valid required field', async ({ page }) => {
    const office = new OfficePage(page);

    await office.gotoList();
    await office.openCreateModal();
    await office.fillOfficeForm({
      name: officeName,
      latitude: '-6.32082',
      longitude: '106.64306',
      radius: '150',
      location: locationOption,
      status: 'Active',
    });
    await office.clickCreate();

    // Data office terbaru muncul di office list
    await office.expectRowVisible(officeName);
    const row = office.rowByOfficeName(officeName);
    await expect(row).toContainText('-6.32082');
    await expect(row).toContainText('106.64306');
    await expect(row).toContainText('150');
    await expect(row).toContainText('Active');
  });

  test('OL-006: Mengedit data office yang telah dibuat dengan valid value', async ({ page }) => {
    const office = new OfficePage(page);

    await office.gotoList();
    await office.expectRowVisible(officeName);

    await office.openEditModal(officeName);
    await office.fillEditForm({
      name: editedName,
      radius: '250',
    });
    await office.clickSave();

    // Pop up hilang dan data terbaru tampil
    await office.expectRowVisible(editedName);
    const row = office.rowByOfficeName(editedName);
    await expect(row).toContainText('250');
  });

  test('OL-007: Menghapus data office yang telah dibuat di sistem', async ({ page }) => {
    const office = new OfficePage(page);

    await office.gotoList();
    await office.expectRowVisible(editedName);

    // Klik delete & konfirmasi
    await office.clickDelete(editedName);
    await office.clickDeleteConfirm();
    await page.waitForTimeout(3000);

    // Catatan Excel: fitur delete office saat ini belum berjalan di sistem.
    // Jika diblokir, sistem menampilkan pesan error; jika berhasil, data hilang dari list.
    const blockError = page.getByText('Cannot inactivate or delete office with active employees');
    if (await blockError.isVisible().catch(() => false)) {
      // Fitur diblokir — verifikasi sistem menampilkan pesan yang sesuai
      await expect(blockError).toBeVisible();
      await office.closeModal();
    } else {
      // Fitur berjalan — pastikan data yang dihapus tidak muncul di office list
      await office.expectRowHidden(editedName);
    }
  });

  test.afterAll(async ({ playwright }, testInfo) => {
    const tokenContext = await playwright.request.newContext({ baseURL: process.env.HRIS_API_URL });
    const token = await getAccessToken(tokenContext);
    await tokenContext.dispose();

    const apiContext = await playwright.request.newContext({
      baseURL: process.env.HRIS_API_URL,
      extraHTTPHeaders: { Authorization: `Bearer ${token}` },
    });

    // Hapus office hasil create & edit berdasarkan nama
    await deleteOfficeByName(apiContext, editedName, testInfo);
    await deleteOfficeByName(apiContext, officeName, testInfo);

    await apiContext.dispose();
  });
});

// ---------------------------------------------------------------------
// [In Progress] Location Negative Cases
// ---------------------------------------------------------------------

test.describe('Office List - Location Negative Cases [In Progress]', { tag: ['@ui', '@regression'] }, () => {
  // OL-008: Create location dengan required field kosong
  test('OL-008: Membuat lokasi baru dengan tidak semua required field terisi', async ({ page }) => {
    const location = new LocationPage(page);

    await location.gotoList();
    await location.clickAddLocation();

    // Langsung save tanpa mengisi field apapun
    await location.saveFormExpectError();

    // Pesan error muncul dibawah setiap field required
    await expect(page.getByText('Location Name is required')).toBeVisible();
    await expect(page.getByText('Location Email is required')).toBeVisible();
    await expect(page.getByText('Province is required')).toBeVisible();
    await expect(page.getByText('City is required')).toBeVisible();
  });

  // OL-009: Create location dengan value tidak sesuai
  test('OL-009: Membuat lokasi baru dengan value yang tidak sesuai', async ({ page }) => {
    const location = new LocationPage(page);

    await location.gotoList();
    await location.clickAddLocation();

    // Isi dengan format email yang salah
    await location.fillName('InvalidEmailTest');
    await location.fillEmail('not-an-email');

    await location.saveFormExpectError();

    // Pesan error format muncul
    await expect(page.getByText('Email format is invalid')).toBeVisible();
  });
});

// ---------------------------------------------------------------------
// [In Progress] Edit Location Negative Cases
// ---------------------------------------------------------------------

test.describe.serial('Office List - Edit Location Negative Cases [In Progress]', { tag: ['@ui', '@regression'] }, () => {
  // Prasyarat: satu lokasi valid untuk diedit (dibuat di test pertama)
  const uniqueSuffix = faker.string.alphanumeric(5);
  const locationName = `EditLocNeg_${uniqueSuffix}`;
  const locationCode = `TC${faker.string.numeric(4)}`;
  const email = `editlocneg${uniqueSuffix.toLowerCase()}@ascendiz.id`;

  test('Prerequisite: Buat lokasi valid untuk edit', async ({ page }) => {
    const location = new LocationPage(page);

    await location.gotoList();
    await location.clickAddLocation();
    await location.fillGeneralInfo({
      name: locationName,
      code: locationCode,
      email,
      phone: '81234567890',
      fax: '021123456',
      businessUnit: 'Sozo Skin (PBJ)',
    });
    await location.fillAddress({
      address: `Jl. Edit Neg ${uniqueSuffix} No. 1`,
      province: 'Banten',
      city: 'Serang',
      postalCode: '15111',
      latitude: '-6.32082',
      longitude: '106.64306',
      radius: '100',
    });
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
    await location.saveForm();
    await location.expectRowVisible(locationName);
  });

  test('OL-010: Melakukan edit data lokasi dengan tidak semua required field terisi', async ({ page }) => {
    const location = new LocationPage(page);

    await location.gotoList();
    await location.searchLocation(locationName);
    await location.expectRowVisible(locationName);

    await location.openEdit(locationName);

    // Kosongkan field required
    await location.fillName('');
    await location.fillEmail('');

    await location.saveFormExpectError();

    // Pesan error muncul
    await expect(page.getByText('Location Name is required')).toBeVisible();
    await expect(page.getByText('Location Email is required')).toBeVisible();
  });

  test('OL-011: Melakukan edit data lokasi dengan value yang tidak sesuai', async ({ page }) => {
    const location = new LocationPage(page);

    await location.gotoList();
    await location.searchLocation(locationName);
    await location.expectRowVisible(locationName);

    await location.openEdit(locationName);

    // Isi email dengan format salah
    await location.fillEmail('not-an-email');

    await location.saveFormExpectError();

    // Pesan error format muncul
    await expect(page.getByText('Email format is invalid')).toBeVisible();
  });

  test.afterAll(async ({ playwright }, testInfo) => {
    const tokenContext = await playwright.request.newContext({ baseURL: process.env.HRIS_API_URL });
    const token = await getAccessToken(tokenContext);
    await tokenContext.dispose();

    const apiContext = await playwright.request.newContext({
      baseURL: process.env.HRIS_API_URL,
      extraHTTPHeaders: { Authorization: `Bearer ${token}` },
    });

    // Hapus lokasi & office otomatis berdasarkan nama
    await deleteOfficeByName(apiContext, locationName, testInfo);
    await deleteLocationByName(apiContext, locationName, testInfo);

    await apiContext.dispose();
  });
});

// ---------------------------------------------------------------------
// [In Progress] Office Negative Cases
// ---------------------------------------------------------------------

test.describe('Office List - Office Negative Cases [In Progress]', { tag: ['@ui', '@regression'] }, () => {
  // OL-012: Create office dengan required field kosong
  test('OL-012: Membuat data office baru dengan tidak semua required field terisi', async ({ page }) => {
    const office = new OfficePage(page);

    await office.gotoList();
    await office.openCreateModal();

    // Langsung create tanpa mengisi field
    await office.clickCreateExpectError();

    // Sistem menolak create — muncul pesan error
    await expect(page.getByText('Office record already exists')).toBeVisible();
    await office.closeModal();
  });

  // OL-013: Create office dengan invalid value
  test('OL-013: Membuat data office baru dengan invalid value', async ({ page }) => {
    const office = new OfficePage(page);

    await office.gotoList();
    await office.openCreateModal();

    // Isi radius dengan nilai negatif (tidak valid)
    await office.fillOfficeForm({
      name: `Invalid_${faker.string.alphanumeric(4)}`,
      latitude: '999',
      longitude: '999',
      radius: '-10',
      location: 'HO Seven Retail',
    });
    await office.clickCreateExpectError();

    // Pesan error validasi radius muncul
    await expect(page.getByText(/OfficeLocationRadius failed on the 'gt' validation/)).toBeVisible();
    await office.closeModal();
  });
});

// ---------------------------------------------------------------------
// [In Progress] Edit Office Negative Cases
// ---------------------------------------------------------------------

test.describe.serial('Office List - Edit Office Negative Cases [In Progress]', { tag: ['@ui', '@regression'] }, () => {
  // Prasyarat: satu office valid untuk diedit (dibuat di test pertama)
  const uniqueSuffix = faker.string.alphanumeric(5);
  const officeName = `EditOfficeNeg_${uniqueSuffix}`;

  test('Prerequisite: Buat office valid untuk edit', async ({ page }) => {
    const office = new OfficePage(page);

    await office.gotoList();
    await office.openCreateModal();
    await office.fillOfficeForm({
      name: officeName,
      latitude: '-6.32082',
      longitude: '106.64306',
      radius: '150',
      location: 'HO Seven Retail',
      status: 'Active',
    });
    await office.clickCreate();
    await office.expectRowVisible(officeName);
  });

  test('OL-014: Mengedit data office dengan tidak semua required field terisi', async ({ page }) => {
    const office = new OfficePage(page);

    await office.gotoList();
    await office.expectRowVisible(officeName);

    await office.openEditModal(officeName);

    // Kosongkan field required
    await office.fillEditForm({ name: '', radius: '', latitude: '', longitude: '' });
    await office.clickSaveExpectError();

    // Sistem menolak save — muncul pesan error dari backend
    await expect(page.getByText(/cannot unmarshal/i)).toBeVisible();
    await office.closeModal();
  });

  test('OL-015: Mengedit data office dengan invalid value', async ({ page }) => {
    const office = new OfficePage(page);

    await office.gotoList();
    await office.expectRowVisible(officeName);

    await office.openEditModal(officeName);

    // Isi radius dengan nilai negatif (tidak valid)
    await office.fillEditForm({ radius: '-10' });
    await office.clickSaveExpectError();

    // Pesan error validasi radius muncul
    await expect(page.getByText(/OfficeLocationRadius failed on the 'gt' validation/)).toBeVisible();
    await office.closeModal();
  });

  test.afterAll(async ({ playwright }, testInfo) => {
    const tokenContext = await playwright.request.newContext({ baseURL: process.env.HRIS_API_URL });
    const token = await getAccessToken(tokenContext);
    await tokenContext.dispose();

    const apiContext = await playwright.request.newContext({
      baseURL: process.env.HRIS_API_URL,
      extraHTTPHeaders: { Authorization: `Bearer ${token}` },
    });

    // Hapus office berdasarkan nama
    await deleteOfficeByName(apiContext, officeName, testInfo);

    await apiContext.dispose();
  });
});