const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const project = process.argv[2];
const moduleName = process.argv[3];
// Cek apakah ada argumen '--headed' di baris perintah
const isHeaded = process.argv.includes('--headed');

if (!project) {
  console.log('Usage: node scripts/test.js <ProjectName> [ModuleName] [--headed]');
  console.log('Example: node scripts/test.js Hris-Ascendiz-API all-schedules --headed');
  process.exit(1);
}

// 1. Bersihkan folder report lama
const foldersToClean = ['allure-results', 'allure-report'];
console.log('Membersihkan folder report lama...');
foldersToClean.forEach(folder => {
  const targetDir = path.join(process.cwd(), folder);
  if (fs.existsSync(targetDir)) {
    fs.rmSync(targetDir, { recursive: true, force: true });
    console.log(`- Berhasil menghapus: ${folder}`);
  }
});

// 2. Susun perintah Playwright dasar
let playwrightCmd = `npx playwright test --project="${project}"`;

// Tambahkan modul jika ada (pastikan bukan flag '--headed' yang masuk sebagai modul)
if (moduleName && moduleName !== '--headed') {
  playwrightCmd += ` ${moduleName}`;
}

// 3. Tambahkan flag --headed jika diminta
if (isHeaded) {
  playwrightCmd += ` --headed`;
}

try {
  console.log(`\nMenjalankan: ${playwrightCmd}...\n`);
  execSync(playwrightCmd, { stdio: 'inherit', shell: true });
} catch (e) {
  process.exit(e.status);
}