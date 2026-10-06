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
          } catch (err) {
            currentBuild.result = 'UNSTABLE'
            echo "Ada test yang gagal (failed), tetapi pipeline dilanjutkan untuk men-generate Allure Report."
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
        // TEMPATKAN DI SINI (untuk status sukses)
        // Ganti URL https://xxxx.ngrok-free.app dengan URL ngrok kamu saat ini
        sh "curl -X POST https://parsleylike-allopatrically-meg.ngrok-free.dev -H 'Content-Type: application/json' -d '{\"buildNumber\": \"${env.BUILD_NUMBER}\", \"status\": \"SUCCESS\"}'"
      }
      echo 'Pipeline selesai.'
    }
    unstable {
      script {
        // TEMPATKAN DI SINI JUGA (jika ada test yang gagal tapi tetap generate report)
        sh "curl -X POST https://parsleylike-allopatrically-meg.ngrok-free.dev -H 'Content-Type: application/json' -d '{\"buildNumber\": \"${env.BUILD_NUMBER}\", \"status\": \"UNSTABLE\"}'"
      }
      echo 'Test selesai dengan beberapa assertion/test yang gagal (UNSTABLE). Cek Allure report untuk detailnya.'
    }
    failure {
      script {
        // TEMPATKAN DI SINI (jika pipeline gagal total di luar test)
        sh "curl -X POST https://parsleylike-allopatrically-meg.ngrok-free.dev -H 'Content-Type: application/json' -d '{\"buildNumber\": \"${env.BUILD_NUMBER}\", \"status\": \"FAILURE\"}'"
      }
      echo 'Pipeline mengalami kendala serius di luar test failure.'
    }
  }
}
