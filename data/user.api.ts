import { APIRequestContext, expect } from '@playwright/test';
import { API_URL } from './env';
import { User } from './user.factory';

/**
 * Creates the account through the REST API instead of the UI.
 * Used for tests whose subject is NOT registration: it is fast and it does not
 * make five tests fail when the register form breaks.
 */
export async function registerViaApi(request: APIRequestContext, user: User): Promise<void> {
  let response = await request.post(`${API_URL}/users/register`, { data: currentPayload(user) });

  // The deliberately buggy build (with-bugs.practicesoftwaretesting.com) runs an
  // older API version that wants a flat address. Fall back so the same suite can
  // be pointed at it.
  if (response.status() === 422 && (await response.text()).includes('address field must be a string')) {
    response = await request.post(`${API_URL}/users/register`, { data: legacyPayload(user) });
  }

  expect(response.status(), `register ${user.email}: ${await response.text()}`).toBe(201);
}

function currentPayload(user: User) {
  return {
    first_name: user.firstName,
    last_name: user.lastName,
    dob: user.dob,
    phone: user.phone,
    email: user.email,
    password: user.password,
    address: {
      street: user.address.street,
      city: user.address.city,
      state: user.address.state,
      country: user.address.country,
      postal_code: user.address.postalCode,
    },
  };
}

function legacyPayload(user: User) {
  return {
    first_name: user.firstName,
    last_name: user.lastName,
    dob: user.dob,
    phone: user.phone,
    email: user.email,
    password: user.password,
    address: user.address.street,
    city: user.address.city,
    state: user.address.state,
    country: user.address.country,
    postcode: user.address.postalCode,
  };
}
