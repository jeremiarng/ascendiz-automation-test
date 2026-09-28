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
