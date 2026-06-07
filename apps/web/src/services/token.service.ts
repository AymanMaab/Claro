import type { AuthTokens } from '@claro/types';

const ACCESS = 'claro_access_token';
const REFRESH = 'claro_refresh_token';

export const tokenService = {
  set(tokens: AuthTokens) {
    localStorage.setItem(ACCESS, tokens.accessToken);
    localStorage.setItem(REFRESH, tokens.refreshToken);
  },
  clear() {
    localStorage.removeItem(ACCESS);
    localStorage.removeItem(REFRESH);
  },
  getAccess: () => localStorage.getItem(ACCESS),
  getRefresh: () => localStorage.getItem(REFRESH),
  isAuthenticated: () => !!localStorage.getItem(ACCESS),
};
