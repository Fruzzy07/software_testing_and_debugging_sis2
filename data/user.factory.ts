import { randomUUID } from 'node:crypto';

export interface Address {
  street: string;
  houseNumber: string;
  city: string;
  state: string;
  country: string; // ISO code used by the country <select>, e.g. 'KZ'
  postalCode: string;
}

export interface User {
  firstName: string;
  lastName: string;
  dob: string; // yyyy-mm-dd, the app requires an adult
  phone: string;
  email: string;
  password: string;
  address: Address;
}

/**
 * A brand-new customer that nobody has registered yet.
 * Every call returns a different email, so the suite can run any number of
 * times, in parallel, on a shared public application.
 */
export function createUser(overrides: Partial<User> = {}): User {
  const id = `${Date.now()}.${randomUUID().slice(0, 8)}`;
  return {
    firstName: 'Sis',
    lastName: 'Tester',
    dob: '1998-04-12',
    phone: '77011234567',
    email: `sis2.${id}@example.com`,
    // Upper, lower, digit, symbol, and unique, so it never appears in a breached-password list.
    password: `Sis2!${randomUUID().slice(0, 8)}Aa9`,
    address: {
      street: 'Abay Avenue',
      houseNumber: '12',
      city: 'Almaty',
      state: 'Almaty',
      country: 'KZ',
      postalCode: '050000',
    },
    ...overrides,
  };
}

/** An address that is guaranteed not to be registered. */
export function unknownEmail(): string {
  return `nobody.${Date.now()}.${randomUUID().slice(0, 8)}@example.com`;
}
