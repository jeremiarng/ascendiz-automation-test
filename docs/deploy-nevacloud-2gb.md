# Deployment Jenkins di VPS NevaCloud 2GB (2 Core / 2GB RAM) — Panduan From Scratch

Panduan step-by-step dari nol untuk men-deploy `playwright-automation` di VPS NevaCloud dengan spesifikasi **2 vCPU / 2 GB RAM**, dan menjadikan test Playwright bisa di-trigger via API call.

> **Penting — realitas spesifikasi**: Jenkins (Java) + Chromium Playwright adalah pemakan RAM. Di 2GB, kamu **harus**:
> - Membatasi JVM Jenkins (`-Xmx512m`).
> - Memakai **1 executor** saja di Jenkins agar tidak menumpuk build.
> - Membuat **swap** (minimal 2GB) sebagai penyangga agar tidak terkena OOM (Out Of Memory).
> - Memaksa Playwright **1 worker** (sudah otomatis via `CI=true` di Jenkinsfile).
>
> Konfigurasi di panduan ini disesuaikan agar tetap stabil di 2GB.

---

## 1. Ringkasan Arsitektur

```
[Caller / CI lain]  --HTTP POST + token-->  Jenkins (VPS 2GB)
                                                  |  git checkout
                                                  |  npm ci
                                                  |  npx playwright install --with-deps chromium
                                                  |  jalankan project (PROJECT/MODULE/GREP)
                                                  |  generate Allure + publish
                                                 v
                                     Allure report di UI Jenkins
```

- Dijalankan **headless** (env `CI=true`, tanpa `--headed`).
- UI login dibuat otomatis `auth.setup.ts` → `.auth/hris-admin.json`.
- Hanya butuh **satu Jenkins master di VPS**; tanpa agent terpisah.

---

## 2. Spesifikasi VPS yang Dipakai

| Item    | Nilai |
|---------|-------|
| Provider | NevaCloud (nevacloud) |
| Paket   | **2 vCPU / 2 GB RAM** |
| OS      | Ubuntu 22.04 LTS (pilih saat create VPS) |
| Storage | 30–50 GB (sesuai paket; pastikan cukup untuk build & report) |
| Swap    | **wajib ditambahkan** (lihat bagian 4.1) |

> UI test jalan headless, jadi VPS tidak butuh monitor/display.

---

## 3. Persiapan Awal (part index)

Setelah VPS aktif, buka terminal SSH:

```bash
ssh root@<IP_VPS_ANDA>
```

### 3.1. Update OS & install tool dasar
```bash
apt update && apt upgrade -y
apt install -y git curl wget unzip ca-certificates gnupg software-properties-common
```

---

## 4. Optimasi RAM Sebelum Instalasi (KRITIS)

Lakukan ini **sebelum** install Jenkins, agar tidak mudah OOM.

### 4.1. Buat swap file (penyangga RAM)
```bash
fallocate -l 2G /swapfile
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile
echo '/swapfile none swap sw 0 0' >> /etc/fstab
```

Cek:
```bash
free -h
```
Pastikan baris Swap menunjukkan ~2.0Gi.

### 4.2. Cek sisa RAM setelah instalasi
Pantau sewaktu-waktu dengan:
```bash
free -h && ps aux --sort=-%mem | head -15
```

---

## 5. Instalasi Dependensi

### 5.1. JDK 17
```bash
apt install -y openjdk-17-jdk
java -version
```

### 5.2. Node.js 20 (untuk Playwright)
```bash
cd /tmp
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
node -v && npm -v
```

### 5.3. Allure CLI (untuk report)
```bash
npm install -g allure-commandline
allure --version
```

---

## 6. Install Jenkins (LTS)

```bash
cd /tmp
wget -O /usr/share/keyrings/jenkins-keyring.asc \
  https://pkg.jenkins.io/debian-stable/jenkins.io-2023.key
echo "deb [signed-by=/usr/share/keyrings/jenkins-keyring.asc] https://pkg.jenkins.io/debian-stable binary/" > /etc/apt/sources.list.d/jenkins.list
apt update
apt install -y jenkins
```

---

## 7. Batasi JVM Jenkins (Kunci di RAM 2GB)

Jenkins default di-set untuk RAM besar. Kita batasi agar tidak membludak.

Edit file `/etc/default/jenkins`:
```bash
nano /etc/default/jenkins
```

Cari baris `JAVA_ARGS` dan ubah menjadi:
```
JAVA_ARGS="-Djava.awt.headless=true -Xmx512m -Xms256m"
```

Simpan, lalu restart:
```bash
systemctl restart jenkins
systemctl enable jenkins
```

Cek memori Jenkins:
```bash
ps aux | grep jenkins | grep -v grep | awk '{print $6/1024" MB"}'
```

---

## 8. Jam Server Jenkins

```bash
systemctl status jenkins
```

- Default port: **8080**.
- Password admin awal: fb0ab8d06c4245eaa73f7a0b67d033af
```bash
cat /var/lib/jenkins/secrets/initialAdminPassword
```
- Buka `http://<IP_VPS>:8080`, tempel password, pilih **Install suggested plugins**.

---

## 9. Plugin Jenkins yang Dibutuhkan

Lewat **Dashboard → Manage Jenkins → Plugins** pastikan terpasang:
- **Pipeline**
- **Allure**
- **AnsiColor**
- **Credentials** (biasanya bawaan)

---

## 10. Konfigurasi Jenkins (satu kali)

### 10.1. Batasi executor jadi 1 (penting untuk 2GB)
1. **Dashboard → Manage Jenkins → Nodes → built-in node → Configure**.
2. Pada **Number of executors**, isi **`1`**.
3. **Save**.

### 10.2. Buat user `ci-trigger`
1. **Manage Jenkins → Users → Create User**.
2. Isi `ci-trigger`, password kuat.

### 10.3. Buat API token untuk `ci-trigger`
1. Login sebagai `ci-trigger`.
2. **Profile → Configure**.
3. **API Token → Add new Token** → nama (`jenkins-api`) → **Generate**.
4. **Simpan token** (hanya tampil sekali).

### 10.4. Simpan env rahasia sebagai Jenkins Credentials
1. **Manage Jenkins → Credentials → Global → Add Credentials**.
2. Pilih **Secret text** untuk tiap variabel dari README / `.env`:
   - `HRIS_API_URL`, `HRIS_WEB_URL`
   - `ADMIN_EMAIL`, `ADMIN_PASSWORD`
   - `MANAGER_EMAIL`, `MANAGER_PASSWORD`
   - `EMPLOYEE_EMAIL`, `EMPLOYEE_PASSWORD`
   - `SUBORDINATE_ID`, `LOCATION_ID`, `COMPANY_ID`, `BUSINESS_UNIT_ID`, `DEPARTMENT_ID`, `JOB_POSITION_ID`
3. Beri **ID** yang jelas per credential (misal `ADMIN_PASSWORD`) untuk dipakai di `Jenkinsfile`.

---

## 11. File `Jenkinsfile` (di root repo)

Buat `Jenkinsfile` di root repo:

```groovy
pipeline {
  agent any
  options { ansiColor('xterm'); timestamps() }
  parameters {
    string('PROJECT', 'Hris-Ascendiz-API', 'Nama project Playwright')
    string('MODULE', '', 'Sub-folder test opsional')
    string('GREP', '', 'Filter tag opsional')
  }
  environment {
    CI = 'true'
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

**Penting untuk 2GB:**
- `CI=true` memastikan `workers: 1` (sesuai config Playwright) — jangan mengubahnya jadi lebih besar.
- Jangan atur `fullyParallel` maupun workers > 1 di server 2GB agar Chromium tidak menumpuk proses.

---

## 12. Buat Jenkins Pipeline Job

1. **Dashboard → New Item** → nama `ascendiz-playwright` → **Pipeline** → OK.
2. Bagian **Pipeline**:
   - Definition: `Pipeline script from SCM`
   - SCM: `Git`
   - Repository URL: `https://git-url/ascendiz-playwright-automation.git`
   - Branch: `main`
   - Script Path: `Jenkinsfile`
3. **Save**.

---

## 13. Trigger Test via API Call

### 13.1. Trigger semua/default project
```bash
curl -u "ci-trigger:TOKEN" -X POST \
  "http://<IP_VPS>:8080/job/ascendiz-playwright/build?PROJECT=Hris-Ascendiz-API"
```

### 13.2. Trigger + modul spesifik
```bash
curl -u "ci-trigger:TOKEN" -X POST \
  "http://<IP_VPS>:8080/job/ascendiz-playwright/buildWithParameters?PROJECT=Hris-Ascendiz-API&MODULE=office-list"
```

### 13.3. Combine dengan tag (`GREP`)
```bash
curl -u "ci-trigger:TOKEN" -X POST \
  "http://<IP_VPS>:8080/job/ascendiz-playwright/buildWithParameters?PROJECT=Hris-Ascendiz-API&MODULE=office-list&GREP=@smoke"
```

---

## 14. Ambil Hasil Report sebagai JSON

> `buildWithParameters` **asynchronous** — tidak pernah mengembalikan hasil di response trigger. Ambil report dengan **dua call terpisah**:

**Call 1 — Trigger:**
```bash
curl -si -u "ci-trigger:TOKEN" -X POST \
  "http://<IP_VPS>:8080/job/ascendiz-playwright/buildWithParameters?PROJECT=Hris-Ascendiz-API&MODULE=office-list"
```
Catat nomor build dari `Location: .../job/ascendiz-playwright/42/` → build `42`. Atau gunakan `lastBuild`.

**Call 2 — Ambil hasil (setelah build selesai):**
```bash
# Ringkasan build
curl -u "ci-trigger:TOKEN" \
  "http://<IP_VPS>:8080/job/ascendiz-playwright/42/api/json?tree=number,building,result,duration"

# Detail per-testcase
curl -u "ci-trigger:TOKEN" \
  "http://<IP_VPS>:8080/job/ascendiz-playwright/42/testReport/api/json?tree=totalCount,failCount,skipCount,suites[name,cases[name,status,duration,errorDetails]]"
```

Jika tidak melacak nomor: `.../job/ascendiz-playwright/lastBuild/testReport/api/json`.

> Hasil `testReport` baru tersedia **setelah build selesai**. Jika terlalu cepat, response belum lengkap/`building=true` — tunggu sebentar lalu coba ulang.

---

## 15. Verifikasi (End-to-End)

### 15.1. Sanity check via SSH (di luar Jenkins)
```bash
cd /var/lib/jenkins/workspace/ascendiz-playwright
CI=true npx playwright test --project=Hris-Ascendiz-API
```

### 15.2. Trigger manual dari UI Jenkins
- Buka job → **Build with Parameters** → isi `Hris-Ascendiz-UI` → Build.
- Pastikan sukses dan **Allure Report** muncul.

### 15.3. Trigger via API
```bash
curl -u "ci-trigger:TOKEN" -X POST \
  "http://<IP_VPS>:8080/job/ascendiz-playwright/buildWithParameters?PROJECT=Hris-Ascendiz-UI"
```

### 15.4. Pantau RAM
Selama build berjalan, cek dari SSH:
```bash
free -h
```
- Harapan: tidak sampai OOM; Chromium + Jenkins tetap berjalan karena swap.

---

## 16. Troubleshooting Khusus 2GB

| Gejala | Kemungkinan penyebab | Solusi |
|--------|----------------------|--------|
| Jenkins sering restart / OOM | JVM terlalu besar | sudah dibatasi `-Xmx512m`; pastikan swap 2G |
| Chromium mendadak mati saat test | memory tak cukup | pastikan `CI=true` (worker 1), jalankan 1 job saja |
| UI `auth.setup` gagal login | `ADMIN_EMAIL`/`ADMIN_PASSWORD` salah/null | cek credential Jenkins |
| Allure report kosong | stage allure jalan sebelum hasil ditulis | pastikan urutan test → allure |
| API trigger ditolak (403) | token salah / IP terblokir firewall | cek token, buka `deny` dulu saat testing |

---

## 17. Keamanan (Ringkasan)

- Gunakan **API token** (bukan password) untuk trigger.
- Env sensitive disimpan di Jenkins Credentials.
- Disarankan HTTPS (Nginx) + batasi IP peng-trigger.
- Simpan `TOKEN` di tempat aman.

---

## 18. Setelah Web Automation Sendiri Siap

Karena automation web (UI) dibangun belakangan, sementara jalan **API test dulu** cukup:
1. API project di `Jenkinsfile` sudah siap.
2. Nanti tinggal tambahkan UI project — **tidak perlu ubah Jenkins`, cukup isi credential UI dan pastikan `auth.setup.ts` jalan.
3. Untuk UI di 2GB: pastikan `workers: 1`, dan jangan trigger UI + API bersamaan.

---

**Selesai.** Dengan susunan ini, `playwright-automation` siap di-remote via Jenkins di VPS NevaCloud 2GB, dengan trigger via API call.
