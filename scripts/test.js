const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const project = process.argv[2];
const moduleName = process.argv[3];

if (!project) {
  console.log('Usage: node scripts/test.js <ProjectName> [ModuleName]');
  console.log('Example: node scripts/test.js Hris-Ascendiz-API all-schedules');
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

// 2. Susun perintah Playwright
let playwrightCmd = `npx playwright test --project="${project}"`;

if (moduleName) {
  // Cukup arahkan langsung ke nama modulnya karena base proyek sudah di dalam tests/api
  playwrightCmd += ` ${moduleName}`;
}

try {
  console.log(`\nMenjalankan: ${playwrightCmd}...\n`);
  execSync(playwrightCmd, { stdio: 'inherit', shell: true });
} catch (e) {
  process.exit(e.status);
}