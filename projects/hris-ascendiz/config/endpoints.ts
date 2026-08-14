export const ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/login',
  },
  SCHEDULES: {
    BASE: '/api/v1/schedules',
    BY_ID: (id: number | string) => `/api/v1/schedules/${id}`,
  },
  SHIFTS: {
    TRANSACTIONS: '/api/v1/shifts/transactions',
    TRANSACTION_BY_ID: (id: number | string) => `/api/v1/shifts/transactions/${id}`,
    SCHEDULES: '/api/v1/shifts/schedules',
    SCHEDULE_BY_ID: (id: number | string) => `/api/v1/shifts/schedules/${id}`,
    ALL_TRANSACTIONS: '/api/v1/shifts/all-transactions',
    SUBORDINATE_TRANSACTIONS: '/api/v1/shifts/subordinate-transactions',
    MY_TRANSACTIONS: '/api/v1/shifts/transactions/me',
    SUBORDINATE_SCHEDULES: '/api/v1/shifts/subordinate-schedules',
    MY_SCHEDULES: '/api/v1/shifts/my-schedules',
  },
  SHIFT_TEMPLATES: {
    BASE: '/api/v1/shift-templates',
    BY_ID: (id: number | string) => `/api/v1/shift-templates/${id}`,
  },
  ATTENDANCE: {
    BASE: '/api/v1/attendance/',
    MY: '/api/v1/attendance/me',
    MY_PER_DATE: '/api/v1/attendance/me/per-date',
    MY_STATISTICS: '/api/v1/attendance/me/statistics',
    SUPERIOR: (id: number | string) => `/api/v1/attendance/superior/${id}`,
    EMPLOYEE: (id: number | string) => `/api/v1/attendance/employee/${id}`,
    EMPLOYEE_PER_DATE: (id: number | string) => `/api/v1/attendance/employee/${id}/per-date`,
  },
  TENANTS: {
    COMPANIES: (tenantId: number | string) => `/api/v1/tenants/${tenantId}/companies`,
  },
  POSITIONS: '/api/v1/positions',
  LOCATIONS: {
    BASE: '/api/v1/locations',
    BY_ID: (id: number | string) => `/api/v1/locations/${id}`,
    PROVINCES: '/api/v1/provinces',
    CITIES: '/api/v1/cities',
    EMPLOYEES: '/api/v1/employees',
  },
  OFFICE_LIST: {
    BY_ID: (id: number | string) => `/api/v1/office/${id}`,
  }
} as const;
