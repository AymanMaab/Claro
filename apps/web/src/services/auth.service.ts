import { authApi } from '../api';
import { tokenService } from './token.service';

export const authService = {
  async login(email: string, password: string) {
    const tokens = await authApi.login(email, password);
    tokenService.set(tokens);
    return tokens;
  },

  async register(firstName: string, lastName: string, email: string, password: string) {
    return authApi.register(firstName, lastName, email, password);
  },

  async logout() {
    const refreshToken = tokenService.getRefresh() ?? '';
    await authApi.logout(refreshToken);
    tokenService.clear();
  },

  async refresh() {
    const refreshToken = tokenService.getRefresh() ?? '';
    const tokens = await authApi.refresh(refreshToken);
    tokenService.set(tokens);
    return tokens;
  },

  isAuthenticated: tokenService.isAuthenticated,
};
