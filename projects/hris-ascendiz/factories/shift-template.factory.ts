export const generateRandomName = (prefix = 'Shift_Test') => {
  return `${prefix}_${Math.floor(Math.random() * 100000000)}`;
};

export const buildPayload = (overrides: any = {}) => {
  const defaultPayload = {
    name: generateRandomName(),
    start_time: '06:00',
    end_time: '16:00',
    is_end_time_next_day: false,
    break_start_time: '12:00',
    is_break_start_time_next_day: false,
    break_end_time: '13:00',
    is_break_end_time_next_day: false,
    include_on_report: false,
    is_active: true,
    required_clock_in_out: true,
    required_break_start_end: true,
  };

  return { ...defaultPayload, ...overrides };
};