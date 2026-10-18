// Where the suite points. Override with environment variables to run the same
// suite against the deliberately buggy build (see README).
export const BASE_URL = process.env.BASE_URL ?? 'https://practicesoftwaretesting.com';
export const API_URL = process.env.API_URL ?? 'https://api.practicesoftwaretesting.com';
// The buggy build is an older Angular release with hash routing ("/#/auth/login").
export const ROUTE_PREFIX = process.env.ROUTE_PREFIX ?? '';

// Written by tests/auth.setup.ts, read by specs that need a signed-in customer.
export const STORAGE_STATE = 'playwright/.auth/customer.json';
