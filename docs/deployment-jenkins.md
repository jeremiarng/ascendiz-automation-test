# Deployment Jenkins ke VPS (Ubuntu) + Trigger Test via API Call

Panduan step-by-step untuk men-deploy `playwright-automation` ke VPS Ubuntu dan menjadikan test Playwright bisa di-trigger dari luar melalui API call Jenkins.

---

## 1. Ringkasan Arsitektur

```
[Caller / CI lain]  --HTTP POST + token-->  Jenkins REST API (buildWithParameters)
                                                     |
                                             Jenkins Pipeline (di VPS)
                                                     |  git checkout
                                                     |  npm ci
                                                     |  npx playwright install --with-deps chromium
                                                     |  jalankan project (parameterized PROJECT/MODULE/GREP)
                                                     |  generate Allure report + publish
                                                    v
                                        Allure Report (tersaji di UI Jenkins)
```

- Dijalankan **headless** (via env `CI=true`, tanpa `--headed`).
- UI login (auth setup) diproduksi otomatis oleh `auth.setup.ts` → `.auth/hris-admin.json`, sehingga UI test bisa jalan di server tanpa interaksi manusia.
- Hanya butuh **satu Jenkins master di VPS** (tanpa agent terpisah) untuk skala awal.

---

## 2. Spesifikasi VPS Minimal

| Item        | Minimal         | Rekomendasi          | Alasan |
|-------------|-----------------|----------------------|--------|
| CPU         | 2 vCPU          | 4 vCPU               | Chromium boros CPU saat parallel UI test |
| RAM         | 4 GB            | 8 GB                 | Playwright chromium + Jenkins + Java |
| Storage     | 30 GB           | 50 GB                | Node_modules, build report, Allure history |
| OS          | Ubuntu 22.04 LTS| Ubuntu 22.04/24.04   | LTS stabil, repo apt lengkap |
| Network     | —               | Public IP + domain   | Untuk akses Jenkins + API trigger |
| Firewall    | —               | Restrict port 8080   | Jenkins hanya boleh diakses dari sumber tertentu |

> UI test dijalankan headless, sehingga VPS **tidak** butuh monitor / display fisik.

---

## 3. Checklist Persiapan VPS (Ubuntu)

### 3.1. Update OS & dependensi dasar
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y git curl wget unzip ca-certificates gnupg software-properties-common
```

### 3.2. Install JDK 17 (dibutuhkan Jenkins)
```bash
sudo apt install -y openjdk-17-jdk
java -version   # pastikan keluaran 17.x
```

### 3.3. Install Node.js 18+ (dibutuhkan Playwright)
```bash
cd /tmp
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
node -v   # pastikan v20.x
npm -v
```

> Bila memakai nvm: `nvm install --lts`.

### 3.4. Install Allure CLI (untuk report)
```bash
sudo npm install -g allure-commandline
allure --version   # pastikan terpasang
```

### 3.5. Install Jenkins (LTS via repo resmi)
```bash
sudo wget -O /usr/share/keyrings/jenkins-keyring.asc \
  https://pkg.jenkins.io/debian-stable/jenkins.io-2023.key
echo "deb [signed-by=/usr/share/keyrings/jenkins-keyring.asc] \
  https://pkg.jenkins.io/debian-stable binary/" | sudo tee \
  /etc/apt/sources.list.d/jenkins.list > /dev/null
sudo apt update
sudo apt install -y jenkins
```

### 3.6. Start & akses Jenkins
```bash
sudo systemctl enable --now jenkins
sudo systemctl status jenkins   # pastikan active
```

- Jenkins default di port **8080**.
- Ambil password admin awal:
```bash
sudo cat /var/lib/jenkins/secrets/initialAdminPassword
```
- Buka `http://<VPS_IP>:8080`, tempel password, install **suggested plugins**.

---

## 4. Plugin Jenkins yang Dibutuhkan

Lewat **Dashboard → Manage Jenkins → Plugins**, pastikan terpasang:

| Plugin        | Fungsi |
|---------------|--------|
| **Pipeline**  | Menjalankan `Jenkinsfile` (biasanya bawaan) |
| **Allure**    | Generate & tampilkan report Allure di UI Jenkins |
| **AnsiColor** | Warna rapi pada console output |
| **Credentials** | Menyimpan secret env (biasanya bawaan) |

---

## 5. Konfigurasi Jenkins (satu kali)

### 5.1. Buat user khusus untuk trigger API (`ci-trigger`)
1. **Dashboard → Manage Jenkins → Users → Create User**
2. Isi: `ci-trigger`, password kuat.

### 5.2. Buat API Token untuk `ci-trigger`
1. Login sebagai `ci-trigger`.
2. **Profile → Configure**.
3. **API Token → Add new Token** → nama (`jenkins-api`) → **Generate**.
4. **Simpan token ini** — hanya tampil sekali. Dipakai untuk trigger API.

### 5.3. Simpan environment rahasia sebagai Jenkins Credentials
> Pendekatan dipilih: **Jenkins Credentials**, agar tidak hardcode `.env` di server.

1. **Manage Jenkins → Credentials → Global → Add Credentials**.
2. Pilih kind **Secret text**, loop untuk setiap variabel dari README / `.env`:
   - `HRIS_API_URL`
   - `HRIS_WEB_URL`
   - `ADMIN_EMAIL`
   - `ADMIN_PASSWORD`
   - `MANAGER_EMAIL`, `MANAGER_PASSWORD`
   - `EMPLOYEE_EMAIL`, `EMPLOYEE_PASSWORD`
   - `SUBORDINATE_ID`, `LOCATION_ID`, `COMPANY_ID`, `BUSINESS_UNIT_ID`, `DEPARTMENT_ID`, `JOB_POSITION_ID`
3. Beri **ID** yang jelas per credential (misal `HRIS_API_URL`, `ADMIN_PASSWORD`) untuk dipakai di `Jenkinsfile` via `credentials('...')`.

---

## 6. File `Jenkinsfile` (di root repo)

Buat `Jenkinsfile` di root repo `playwright-automation`:

```groovy
pipeline {
  agent any
  options { ansiColor('xterm'); timestamps() }
  parameters {
    string('PROJECT', 'Hris-Ascendiz-API', 'Nama project Playwright (contoh: Hris-Ascendiz-API)')
    string('MODULE', '', 'Sub-folder test opsional (contoh: office-list)')
    string('GREP', '', 'Filter tag opsional (contoh: @smoke)')
  }
  environment {
    CI = 'true'
    // Tarik semua secret env dari Jenkins credentials ke variable process
    HRIS_API_URL = credentials('HRIS_API_URL')
    HRIS_WEB_URL = credentials('HRIS_WEB_URL')
    ADMIN_EMAIL = credentials('ADMIN_EMAIL')
    ADMIN_PASSWORD = credentials('ADMIN_PASSWORD')
    MANAGER_EMAIL = credentials('MANAGER_EMAIL')
    MANAGER_PASSWORD = credentials('MANAGER_PASSWORD')
    EMPLOYEE_EMAIL = credentials('EMPLOYEE_EMAIL')
    EMPLOYEE_PASSWORD = credentials('EMPLOYEE_PASSWORD')
    SUBORDINATE_ID = credentials('SUBORDINATE_ID')
    LOCATION_ID = credentials('LOCATION_ID')
    COMPANY_ID = credentials('COMPANY_ID')
    BUSINESS_UNIT_ID = credentials('BUSINESS_UNIT_ID')
    DEPARTMENT_ID = credentials('DEPARTMENT_ID')
    JOB_POSITION_ID = credentials('JOB_POSITION_ID')
  }
  stages {
    stage('Checkout') {
      steps { checkout scm }
    }
    stage('Dependencies') {
      steps {
        sh 'npm ci'
        sh 'npx playwright install --with-deps chromium'
      }
    }
    stage('Run Tests') {
      steps {
        script {
          def base = "npx playwright test --project=\"${params.PROJECT}\""
          if (params.MODULE) base += " ${params.MODULE}"
          if (params.GREP)   base += " --grep=\"${params.GREP}\""
          sh base
        }
      }
    }
    stage('Allure Report') {
      steps {
        allure includeProperties: false, jdk: '', results: [[path: 'allure-results']]
      }
    }
  }
  post {
    always { cleanWs() }
    success { echo 'Test sukses & report terpublish.' }
    failure { echo 'Test gagal. Lihat console & Allure report.' }
  }
}
```

**Penting:**
- Stage `allure` harus berjalan **setelah** stage test (karena hasil ditulis ke `allure-results` dari run).
- `CI=true` mengaktifkan `retries: 2` dan `workers: 1` (per config Playwright), memastikan headless & stabil di server.
- Bila ingin pakai `scripts/test.js` (yang menghapus `allure-results` di awal), ganti command test jadi `node scripts/test.js "PROJECT" "MODULE"` — pastikan masih sebelum stage Allure.

---

## 7. Buat Jenkins Pipeline Job

1. **Dashboard → New Item**.
2. Nama: `ascendiz-playwright` → pilih **Pipeline** → **OK**.
3. Bagian **Pipeline**:
   - **Definition**: `Pipeline script from SCM`
   - **SCM**: `Git`
   - **Repository URL**: `https://git-url/ascendiz-playwright-automation.git`
   - **Branch**: `main`
   - **Script Path**: `Jenkinsfile`
4. **Save**.

---

## 8. Trigger Test via API Call

### 8.1. Parameterized build
```bash
curl -u "ci-trigger:JENKINS_API_TOKEN" \
  -X POST \
  "http://<VPS_IP>:8080/job/ascendiz-playwright/buildWithParameters?PROJECT=Hris-Ascendiz-API&MODULE=office-list"
```

- **Tanpa parameter**: `.../job/ascendiz-playwright/build?` (pakai default).
- Contoh UI: `...?PROJECT=Hris-Ascendiz-UI`

### 8.2. Trigger modul spesifik saja

Untuk menjalankan **satu modul test** tertentu, gunakan parameter `MODULE`. Parameter ini di-append sebagai argumen path ke command Playwright, sehingga hanya test di path/cangkupan itu yang dipilih.

#### Cara kerja
Di `Jenkinsfile`, jika `MODULE` diisi, command yang dibangun menjadi:
```
npx playwright test --project="<PROJECT>" <MODULE>
```
Playwright memperlakukan argumen posisional tersebut sebagai **path atau filter** terhadap test file (relatif terhadap `testDir` project), sehingga hanya modul yang dimaksud yang dieksekusi.

#### API call

**Modul API** (test di bawah `tests/api/`):
```bash
curl -u "ci-trigger:TOKEN" -X POST \
  "http://<VPS_IP>:8080/job/ascendiz-playwright/buildWithParameters?PROJECT=Hris-Ascendiz-API&MODULE=office-list"
```

**Modul UI** (test di bawah `tests/ui/`):
```bash
curl -u "ci-trigger:TOKEN" -X POST \
  "http://<VPS_IP>:8080/job/ascendiz-playwright/buildWithParameters?PROJECT=Hris-Ascendiz-UI&MODULE=office-list"
```

#### Variasi path `MODULE`

| Nilai `MODULE` | Hasil yang dijalankan |
|----------------|------------------------|
| `office-list` | Semua test di folder `office-list/` (relatif ke testDir) |
| `office-list/office-list.spec.ts` | Hanya satu file spec |
| `--grep=office` | Filter test yang namanya cocok pola (selain path) |
| `office-list --grep=@smoke` | Modul `office-list` + hanya test ber-tag `@smoke` |

> **Penting**: Karena `MODULE` di-append langsung ke CLI, nilai yang dikirim harus berupa **path relative terhadap `testDir` project** (API: `tests/api/...`, UI: `tests/ui/...`). Kirim nama folder saja (misal `office-list`) untuk menjalankan seluruh folder.

> **Catatan sekuritas/pemeliharaan**: `MODULE` adalah string bebas yang diteruskan ke CLI. Untuk penggunaan internal ini sudah cukup. Namun bila API trigger diekspos ke pihak luar yang tidak dipercaya, lebih baik jadikan `MODULE` pilihan enum/whitelist di Jenkins (bukan string bebas) untuk menghindari injeksi argumen.

### 8.3. Tambah keamanan trigger (disarankan)
**Reverse proxy + firewall via Nginx** (saat ini port 8080 terbuka):
```
location /jenkins/ {
  proxy_pass http://127.0.0.1:8080;
  proxy_set_header Host $host;
  proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
  allow <IP_KAMU>;
  deny all;
}
```
Akses Jenkins jadi `https://domain/jenkins/` (enkripsi + proteksi port publik).

---

## 9. Verifikasi (End-to-End)

### 9.1. Sanity check di server (di luar Jenkins)
```bash
cd <folder checkout>
CI=true npx playwright test --project=Hris-Ascendiz-API
CI=true npx playwright test --project=Hris-Ascendiz-UI
```
- Pastikan API test hijau; UI test menghasilkan `.auth/hris-admin.json` setelah setup login.

### 9.2. Trigger manual dari UI Jenkins
- **Build with Parameters** → isi `Hris-Ascendiz-UI` → **Build**.
- Pastikan sukses dan **Allure Report** muncul sebagai tab.

### 9.3. Trigger via API dari lokal
```bash
curl -u "ci-trigger:TOKEN" -X POST \
  "http://<VPS_IP>:8080/job/ascendiz-playwright/buildWithParameters?PROJECT=Hris-Ascendiz-UI"
```
- Build masuk antrian → selesai. Periksa hasil & Allure report.

### 9.4. Ambil hasil report sebagai JSON

Hal penting yang perlu dipahami dulu: **call `buildWithParameters` bersifat asynchronous** — Jenkins hanya membalas (HTTP 201) untuk mengonfirmasi build ter-submit, **sebelum** test selesai. Hasil report tidak pernah tersedia di response trigger itu sendiri. Untuk mengambil hasil report, ada dua pendekatan: **Opsi A** (satu call + polling di caller) dan **Opsi B** (dua call terpisah). Bagian ini memakai **Opsi B**.

#### Opsi A — Satu trigger call + polling (caller menunggu sampai selesai)
Caller men-submit lalu **loop polling** `api/json` sampai `building=false`, baru mengambil report. Dari sudut pandang caller ini terasa seperti "satu request = satu hasil".

```bash
# 1) Submit, dapatkan nomor build dari header Location
loc=$(curl -si -u "ci-trigger:TOKEN" -X POST \
  "http://<VPS_IP>:8080/job/ascendiz-playwright/buildWithParameters?PROJECT=Hris-Ascendiz-API" \
  | grep -i '^Location:' | tr -d '\r' | awk '{print $2}')
build=${loc%%/}; build=${build##*/}

# 2) Polling sampai build selesai
until [ "$(curl -u "ci-trigger:TOKEN" \
  "http://<VPS_IP>:8080/job/ascendiz-playwright/$build/api/json?tree=building" \
  | grep -o '"building":[^,]*' | cut -d: -f2)" = "false" ]; do sleep 10; done

# 3) Baca hasil
curl -u "ci-trigger:TOKEN" \
  "http://<VPS_IP>:8080/job/ascendiz-playwright/$build/api/json?tree=number,result,duration"
```
- **Kelebihan**: satu alur berkesinambungan — caller langsung dapat hasil tanpa perlu tahu kapan build selesai.
- **Kekurangan**: caller harus punya logika polling (loop + timeout).

#### Opsi B — Dua call terpisah: trigger dulu, lalu ambil report (YANG DIPAKAI)
Yang kamu pilih. Caller hanya men-submit (balik cepat), lalu **pada langkah terpisah / kapan pun sesudahnya** mengambil hasil report.

**Call 1 — Trigger (balik cepat, HTTP 201):**
```bash
curl -u "ci-trigger:TOKEN" -X POST \
  "http://<VPS_IP>:8080/job/ascendiz-playwright/buildWithParameters?PROJECT=Hris-Ascendiz-API&MODULE=office-list"
```
Untuk tahu nomor build, tambahkan `-si` dan baca header `Location` → `.../job/ascendiz-playwright/42/` → build = `42`. Bila nomor tidak di-track, bisa pakai `lastBuild` pada call kedua.

**Call 2 — Ambil hasil report (setelah build selesai):**
```bash
# Ringkasan build
curl -u "ci-trigger:TOKEN" \
  "http://<VPS_IP>:8080/job/ascendiz-playwright/42/api/json?tree=number,building,result,duration"

# Detail per-testcase
curl -u "ci-trigger:TOKEN" \
  "http://<VPS_IP>:8080/job/ascendiz-playwright/42/testReport/api/json?tree=totalCount,failCount,skipCount,suites[name,cases[name,status,duration,errorDetails]]"
```
Jika tidak melacak nomor build, gunakan `lastBuild`: `.../job/ascendiz-playwright/lastBuild/testReport/api/json`.

- **Kelebihan**: caller sangat sederhana — dua perintah lurus, tanpa loop polling.
- **Kekurangan**: butuh 2 langkah terpisah, dan hasil (`testReport`) baru tersedia **setelah build selesai**. Jika call ke-2 terlalu cepat, respons tidak lengkap / `building=true`. Caller perlu memastikan build sudah selesai (cek `building` dulu, atau beri jeda/coba ulang bila masih berjalan).

> **Catatan arsitektur**: polling akan dilakukan oleh *caller* (sisi pemanggil), langsung memakai API Jenkins. Bila nanti kamu ingin satu call = satu JSON tanpa logika polling di caller, kamu bisa membungkusnya dalam service kecil (misal Node/Express) sebagai enhancement.

---

## 10. Troubleshooting Umum

| Gejala | Kemungkinan penyebab | Solusi |
|--------|----------------------|--------|
| Chromium gagal start | library OS chromium belum ada | `npx playwright install --with-deps chromium` |
| UI login gagal | `ADMIN_EMAIL`/`ADMIN_PASSWORD` salah/null | pastikan Jenkins credential terisi & ter-bind |
| Allure report kosong | stage `allure` jalan sebelum hasil ditulis | pastikan urutan test → allure |
| "port already in use" Jenkins | service lain di 8080 | ubah `HTTP_PORT` di `/etc/default/jenkins` |
| API trigger ditolak (403) | token salah / IP terblokir firewall | cek token, buka `deny` dulu saat testing |

---

## 11. Opsional / Catatan

- **Deploy report eksternal** (GitHub Pages/S3/Nginx): `package.json` merujuk `scripts/deploy-report.ps1` yang **tidak ada di repo**; dengan Allure plugin tidak wajib. Bila mau, buat script `.sh` untuk kopi `allure-report` ke hosting statis.
- **Scheduling**: tambah trigger `Build periodically` untuk nightly test.
- **Notify**: stage notifikasi ke Slack/email bila dibutuhkan.

---

## 12. Ringkasan Keamanan

- Trigger via API wajib memakai **API Token** (bukan password).
- Env sensitive disimpan di **Jenkins Credentials**, tidak hardcode.
- Disarankan HTTPS (Nginx) + batasi IP yang bisa trigger.
- Simpan `JENKINS_API_TOKEN` di tempat aman.

---

**Selesai.** Dengan panduan ini, `playwright-automation` siap di-trigger dari API call di VPS Ubuntu.