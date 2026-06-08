import { baseApi } from './baseApi';
import { tokenService } from '../../services/token.service';
import { setCredentials, clearCredentials } from '../slices/authSlice';
import type { AuthUser } from '../slices/authSlice';

interface LoginRequest {
  email: string;
  password: string;
}

interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

interface AuthResponse {
  accessToken: string;
  user: AuthUser;
}

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<AuthResponse, LoginRequest>({
      query: (body) => ({ url: '/auth/login', method: 'POST', body }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        const { data } = await queryFulfilled;
        tokenService.set(data.accessToken);
        dispatch(setCredentials({ user: data.user, accessToken: data.accessToken }));
      },
    }),

    register: builder.mutation<{ message: string }, RegisterRequest>({
      query: (body) => ({ url: '/auth/register', method: 'POST', body }),
    }),

    logout: builder.mutation<void, void>({
      query: () => ({ url: '/auth/logout', method: 'POST' }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        await queryFulfilled;
        tokenService.clear();
        dispatch(clearCredentials());
      },
    }),
  }),
});

export const { useLoginMutation, useRegisterMutation, useLogoutMutation } = authApi;
