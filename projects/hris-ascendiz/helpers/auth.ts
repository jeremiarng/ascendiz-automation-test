import { APIRequestContext, expect } from '@playwright/test';

// Fungsi ini akan mengembalikan string berupa access_token
// Menerima parameter email dan password opsional, default ke admin jika tidak diisi
export async function getAccessToken(
  request: APIRequestContext,
  email: string = process.env.ADMIN_EMAIL || 'admin.sevenretail@ascendiz.id',
  password: string = process.env.ADMIN_PASSWORD || 'S7RaJTbZdM!'
): Promise<string> {
  const response = await request.post('/api/login', {
    data: {
      device_token: "abc123",
      email: email,
      password: password
    }
  });

  // Validasi dasar agar kita tahu jika login gagal
  expect(response.status(), 'Gagal mendapatkan token di Helper Auth!').toBe(200);

  const body = await response.json();
  // Mengembalikan token secara langsung
  return body.data.access_token;
}