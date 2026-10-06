export const generateRandomDate = () => {
  const day = Math.floor(Math.random() * 28) + 1;
  const paddedDay = day.toString().padStart(2, '0');
  return `2026-06-${paddedDay}`;
};

export const buildTransactionPayload = (employeeIds: number[], overrides: any = {}) => {
  const defaultPayload = {
    "id": 0,
    "description": "",
    "location_id": 431,
    "business_unit_ids": [],
    "company_ids": [],
    "job_position_ids": [],
    "exclude_days": [],
    "work_schedule_id": 0,
    creator_type: 'management',
    shift_type: '',
    employee_ids: employeeIds.length > 0 ? employeeIds : [Number(process.env.SUBORDINATE_ID)],
    start_date: '2026-06-21',
    end_date: '2026-06-27',
    shifts: [
      {
        shift_id: 1,
        date: '2026-06-21',
      },
    ],
  };

  return { ...defaultPayload, ...overrides };
};

export const buildScheduleUpdatePayload = (overrides: any = {}) => {
  const defaultPayload = {
    id: 0,
    location_id: Number(process.env.LOCATION_ID),
    schedule_date: '2026-06-30',
    break_end_time: '13:00',
    break_start_time: '12:00',
    end_time: '15:00',
    start_time: '07:00',
    is_end_time_next_day: false,
    is_break_end_time_next_day: false,
    is_break_start_time_next_day: false,
    business_unit_ids: [Number(process.env.BUSINESS_UNIT_ID)],
    company_ids: [Number(process.env.COMPANY_ID)],
    creator_type: 'manager',
    department_id: 0,
    description: '',
    employee_ids: [Number(process.env.SUBORDINATE_ID)],
    end_date: '2026-06-30',
    exclude_days: [],
    job_position_ids: [Number(process.env.JOB_POSITION_ID)],
    schedule_type: '',
    shift_id: 0,
    shift_ids: [],
    shift_type: 'template',
    shifts: [],
    start_date: '2026-06-30',
    work_schedule_id: 0
  };

  return { ...defaultPayload, ...overrides };
};
