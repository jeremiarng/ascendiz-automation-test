export const generateRandomName = (prefix = "Location_Test") => {
  return `${prefix}_${Math.floor(Math.random() * 100000000)}`;
};

export const generateRandomCode = (prefix = "TC") => {
  return `${prefix}${Math.floor(Math.random() * 10000)}`;
};

export const buildCreatePayload = (overrides: any = {}) => {
  const office_name = generateRandomName();
  const defaultPayload: Record<string, string | number> = {
    code: generateRandomCode(),
    name: office_name,
    email: "testlocation@ascendiz.id",
    phone: "81234567890",
    address: "Jl. Testing Automation No. 123",
    postal_code: "12345",
    fax: "021123456",
    tax_name: "PT Testing Tbk",
    ntku: "NTKU1234567890",
    npwp: "12.345.678.9-012.345",
    npwp_new: "1234 5678 9012 3456",
    tax_holder_name: "John Tester",
    tax_holder_npwp: "12.345.678.9-012.345",
    tax_holder_npwp_new: "1234 5678 9012 3456",
    klu_code: "009S",
    jht_payment_source: "employee",
    bpjs_payment_source: "employee",
    attendance_on_mobile: "gps",
    city_id: "115",
    office_name: office_name,
    latitude: "-6.32082",
    longitude: "106.64306",
    office_location_radius: "100",
    office_status: "1",
  };

  return { ...defaultPayload, ...overrides };
};

export const buildUpdatePayload = (overrides: any = {}) => {
  const defaultPayload: Record<string, string | number> = {
    name: generateRandomName("Updated_Location"),
    email: "updated@ascendiz.id",
    phone: "81123456789",
    address: "Jl. Testing Update No. 456",
    postal_code: "54321",
    fax: "021654321",
    npwp: "123456789012345",
    tax_name: "PT Testing Updated",
  };

  return { ...defaultPayload, ...overrides };
};
