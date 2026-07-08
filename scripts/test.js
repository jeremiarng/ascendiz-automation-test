const { execSync } = require('child_process');
const project = process.argv[2];

if (!project) {
  console.log('Usage: node scripts/test.js <ProjectName>');
  console.log('Example: node scripts/test.js Hris-Ascendiz-API');
  process.exit(1);
}

try {
  execSync(`npx playwright test --project="${project}"`, { stdio: 'inherit', shell: true });
} catch (e) {
  process.exit(e.status);
}
