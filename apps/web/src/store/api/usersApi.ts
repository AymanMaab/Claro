import { baseApi } from './baseApi';
import { setCredentials } from '../slices/authSlice';
import { tokenService } from '../../services/token.service';
import type { AuthUser } from '../slices/authSlice';

interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
}

export const usersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    updateMe: builder.mutation<AuthUser, UpdateProfileRequest>({
      query: (body) => ({ url: '/users/me', method: 'PATCH', body }),
      async onQueryStarted(_, { dispatch, queryFulfilled, getState }) {
        const { data: updated } = await queryFulfilled;
        const token = tokenService.get();
        if (token) {
          const currentUser = (getState() as any).auth.user;
          dispatch(setCredentials({
            accessToken: token,
            user: { ...currentUser, ...updated },
          }));
        }
      },
    }),
  }),
});

export const { useUpdateMeMutation } = usersApi;
