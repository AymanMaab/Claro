import { fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query/react';
import { tokenService } from '../../services/token.service';
import { setCredentials, clearCredentials } from '../../store/slices/authSlice';
import type { AuthUser } from '../../store/slices/authSlice';
import type { AppDispatch } from '../../store';

interface AuthResponse {
  accessToken: string;
  user: AuthUser | null;
}

const rawBaseQuery = fetchBaseQuery({
  baseUrl: '/api/v1',
  prepareHeaders: (headers) => {
    const token = tokenService.get();
    if (token) headers.set('Authorization', `Bearer ${token}`);
    return headers;
  },
  credentials: 'include', // sends HttpOnly refresh_token cookie
});

export const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await rawBaseQuery(args, api, extraOptions);

  if (result.error?.status === 401) {
    // Attempt silent refresh
    const refreshResult = await rawBaseQuery(
      { url: '/auth/refresh', method: 'POST' },
      api,
      extraOptions,
    );

    if (refreshResult.data) {
      const { accessToken, user } = refreshResult.data as AuthResponse;
      tokenService.set(accessToken);
      (api.dispatch as AppDispatch)(setCredentials({ user, accessToken }));
      // Retry original request with new token
      result = await rawBaseQuery(args, api, extraOptions);
    } else {
      tokenService.clear();
      (api.dispatch as AppDispatch)(clearCredentials());
    }
  }

  return result;
};
