export const buildShiftTransactionPayload = (employeeIds: number[], overrides: any = {}) => {
  const defaultPayload = {
    creator_type: 'management',
    shift_type: 'manual',
    employee_ids: employeeIds.length > 0 ? employeeIds : [Number(process.env.SUBORDINATE_ID)],
    start_date: '2026-07-01',
    end_date: '2026-07-01',
    schedule_date: '2026-07-01',
    schedule_type: 'manual',
    start_time: '08:00',
    end_time: '17:00',
    break_start_time: '12:00',
    break_end_time: '13:00',
    is_end_time_next_day: false,
    is_break_start_time_next_day: false,
    is_break_end_time_next_day: false,
    shifts: [
      {
        start_time: '08:00',
        end_time: '17:00',
        break_start_time: '12:00',
        break_end_time: '13:00',
        is_end_time_next_day: false,
        is_break_end_time_next_day: false
      }
    ]
  };

  return { ...defaultPayload, ...overrides };
};

export const buildShiftTransactionUpdatePayload = (overrides: any = {}) => {
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
    "employee_ids": [
      Number(process.env.SUBORDINATE_ID)
    ],
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