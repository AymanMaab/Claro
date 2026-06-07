import type { AuthTokens } from '@claro/types';
import { post } from './http';

export const authApi = {
  login: (email: string, password: string) =>
    post<AuthTokens>('/auth/login', { email, password }),

  register: (firstName: string, lastName: string, email: string, password: string) =>
    post<{ message: string }>('/auth/register', { firstName, lastName, email, password }),

  refresh: (refreshToken: string) =>
    post<AuthTokens>('/auth/refresh', { refreshToken }),

  logout: (refreshToken: string) =>
    post<void>('/auth/logout', { refreshToken }),
};
