export const generateRandomName = () =>
  `Schedule_Test_${Math.floor(Math.random() * 100000000)}`;
export const getRandomItem = (arr: any[]) =>
  arr[Math.floor(Math.random() * arr.length)];

let jobIndex = 0;
export const getNextJobPosition = (validJobPositions: any[]) => {
  if (!validJobPositions || validJobPositions.length === 0) return { id: 0 };
  const job = validJobPositions[jobIndex % validJobPositions.length];
  jobIndex++;
  return job;
};

export const createSchedulePayload = (
  validCompanies: any[],
  validJobPositions: any[],
  overrides: any = {},
) => {
  const company = getRandomItem(validCompanies);
  const job = getNextJobPosition(validJobPositions);

  const company_ids =
    overrides.company_ids !== undefined
      ? overrides.company_ids
      : [company.parent_company_id];
  const business_unit_ids =
    overrides.business_unit_ids !== undefined
      ? overrides.business_unit_ids
      : [company.id];
  const job_position_ids =
    overrides.job_position_ids !== undefined
      ? overrides.job_position_ids
      : [job.id];

  const defaultPayload = {
    name: overrides.name || generateRandomName(),
    weekday: 1,
    is_active: true,
    company_ids,
    business_unit_ids,
    job_position_ids,
    start_time: "11:00",
    end_time: "14:00",
    break_start_time: "12:00",
    break_end_time: "13:00",
    is_end_time_next_day: false,
    is_break_start_time_next_day: false,
    is_break_end_time_next_day: false,
    required_break_in_out: true,
    required_clock_in_out: true,
  };

  return { ...defaultPayload, ...overrides };
};
