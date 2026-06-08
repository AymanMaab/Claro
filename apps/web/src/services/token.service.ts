let _accessToken: string | null = null;

export const tokenService = {
  set: (token: string) => { _accessToken = token; },
  get: () => _accessToken,
  clear: () => { _accessToken = null; },
};
