const { execSync } = require('child_process');
const project = process.argv[2];

if (project) {
  execSync(`npx playwright test --project="${project}"`, { stdio: 'inherit', shell: true });
} else {
  console.log('Usage: node scripts/test.js <ProjectName>');
  console.log('Example: node scripts/test.js Hris-Ascendiz-API');
  process.exit(1);
}
