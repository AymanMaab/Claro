import { baseApi } from './baseApi';

interface CreateTransactionRequest {
  accountId: string;
  amount: number;
  description: string;
  category: string;
  date: string;
}

interface Transaction {
  id: string;
  description: string;
  amount: number;
  category: string;
  type: 'income' | 'expense';
  date: string;
}

export const transactionsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createTransaction: builder.mutation<
      Transaction,
      CreateTransactionRequest
    >({
      query: (body) => ({
        url: '/transactions',
        method: 'POST',
        body,
      }),
    }),
  }),
});

export const { useCreateTransactionMutation } = transactionsApi;