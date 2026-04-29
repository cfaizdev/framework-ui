/**
 * JWT decode utilities for the browser.
 * No signature verification here — the gateway already verified it.
 */

/**
 * Decodes a JWT token and returns the payload claims.
 * @param {string} token - JWT string
 * @returns {object|null} decoded payload or null if invalid
 */
export function decodeJwt(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

/**
 * Checks if a JWT token is expired.
 * @param {string} token - JWT string
 * @returns {boolean} true if expired or invalid
 */
export function isTokenExpired(token) {
  const claims = decodeJwt(token);
  if (!claims || !claims.exp) return true;
  return Date.now() >= claims.exp * 1000;
}

/**
 * Extracts user info from a JWT token.
 * @param {string} token - JWT string
 * @returns {{ userId, name, companyId, branchId, branchFilterEnabled, roles, branches }|null}
 */
export function getClaimsFromToken(token) {
  const claims = decodeJwt(token);
  if (!claims) return null;
  return {
    userId: claims.sub,
    name: claims.name || '',
    companyId: claims.companyId || '',
    branchId: claims.branchId || '',
    branchFilterEnabled: claims.branchFilterEnabled || false,
    roles: claims.roles || [],
    branches: claims.branches || [],
  };
}
