/**
 * Checks if a JWT token is expired by decoding the payload and comparing
 * the expiration time to the current time.
 *
 * Note: This only checks expiration, not signature validity.
 * Full validation happens in AuthContext via the /users/me/ endpoint.
 */

import { cookies } from 'next/headers';

export async function refreshTokenCheck(): Promise<boolean> {
  // If there is no refresh token or the refresh token is expired, the user must go to the login page
  // Note: the refresh token is checked instead of the access token because the access token will always expire
  //       before the refresh token; if the refresh token is expired, the user shouldn't be able to refresh their
  //       access token and should, therefore, not be allowed to access protected routes. Actual validation happens
  //       in AuthContext via the /users/me/ endpoint.

  const cookieStore = await cookies();
  const refreshToken = cookieStore.get('refresh_token')?.value;

  if (!refreshToken) {
    return false;
  }

  try {
    const payload = JSON.parse(atob(refreshToken.split('.')[1]));
    const expiryMs = payload.exp * 1000;
    return Date.now() < expiryMs;
  } catch {
    return false;
  }
}
