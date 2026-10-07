pipeline {
  agent any
  options { ansiColor('xterm'); timestamps() }
  parameters {
    string(name: 'PROJECT', defaultValue: 'Hris-Ascendiz-API', description: 'Nama project Playwright')
    string(name: 'MODULE', defaultValue: '', description: 'Sub-folder test opsional')
    string(name: 'GREP', defaultValue: '', description: 'Filter tag opsional')
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
        sh 'npx playwright install chromium'
      }
    }
    stage('Run Tests') {
      steps {
        script {
          def base = "npx playwright test --project=\"${params.PROJECT}\" --retries=0"
          if (params.MODULE) base += " ${params.MODULE}"
          if (params.GREP)   base += " --grep=\"${params.GREP}\""

          try {
            sh base
            env.TEST_STATUS = "SUCCESS"
          } catch (err) {
            currentBuild.result = 'UNSTABLE'
            env.TEST_STATUS = "UNSTABLE"
            echo "Ada test yang gagal, pipeline dilanjutkan untuk Allure Report."
          }
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
    always {
      cleanWs()
    }
    success {
      script {
        // Skrip Node.js inline untuk membaca file JSON Playwright dan mengirim webhook dinamis
        sh '''
          node -e '
            const fs = require("fs");
            try {
              const data = JSON.parse(fs.readFileSync("test-results/test-results.json", "utf8"));
              let passed = 0, failed = 0, total = 0;
              
              // Menghitung jumlah test dari struktur JSON Playwright
              if (data.suites) {
                function countTests(suites) {
                  suites.forEach(suite => {
                    if (suite.specs) {
                      suite.specs.forEach(spec => {
                        spec.tests.forEach(test => {
                          total++;
                          if (test.status === "expected" || test.status === "passed") passed++;
                          else failed++;
                        });
                      });
                    }
                    if (suite.suites) countTests(suite.suites);
                  });
                }
                countTests(data.suites);
              }

              const payload = JSON.stringify({
                buildNumber: process.env.BUILD_NUMBER,
                status: "SUCCESS",
                total: total,
                passed: passed,
                failed: failed
              });

              console.log("Mengirim payload webhook:", payload);
              // Kirim via curl menggunakan node
              const { execSync } = require("child_process");
              execSync(`curl -X POST https://parsleylike-allopatrically-meg.ngrok-free.dev/api/jenkins-webhook -H "Content-Type: application/json" -d '\''${payload}'\''`);
            } catch (e) {
              console.error("Gagal membaca hasil test:", e.message);
            }
          '
        '''
      }
      echo 'Pipeline selesai.'
    }
    unstable {
      script {
        // Menggunakan logika hitung yang sama untuk status UNSTABLE
        sh '''
          node -e '
            const fs = require("fs");
            try {
              const data = JSON.parse(fs.readFileSync("test-results/test-results.json", "utf8"));
              let passed = 0, failed = 0, total = 0;
              
              if (data.suites) {
                function countTests(suites) {
                  suites.forEach(suite => {
                    if (suite.specs) {
                      suite.specs.forEach(spec => {
                        spec.tests.forEach(test => {
                          total++;
                          if (test.status === "expected" || test.status === "passed") passed++;
                          else failed++;
                        });
                      });
                    }
                    if (suite.suites) countTests(suite.suites);
                  });
                }
                countTests(data.suites);
              }

              const payload = JSON.stringify({
                buildNumber: process.env.BUILD_NUMBER,
                status: "UNSTABLE",
                total: total,
                passed: passed,
                failed: failed
              });

              const { execSync } = require("child_process");
              execSync(`curl -X POST https://parsleylike-allopatrically-meg.ngrok-free.dev/api/jenkins-webhook -H "Content-Type: application/json" -d '\''${payload}'\''`);
            } catch (e) {
              console.error("Gagal membaca hasil test:", e.message);
            }
          '
        '''
      }
      echo 'Test selesai dengan beberapa assertion/test yang gagal (UNSTABLE).'
    }
    failure {
      script {
        sh "curl -X POST https://parsleylike-allopatrically-meg.ngrok-free.dev/api/jenkins-webhook -H 'Content-Type: application/json' -d '{\"buildNumber\": \"${env.BUILD_NUMBER}\", \"status\": \"FAILURE\", \"total\": 0, \"passed\": 0, \"failed\": 0}'"
      }
      echo 'Pipeline mengalami kendala serius.'
    }
  }
}
