export type AccountType = 'current' | 'savings' | 'credit';

export interface Account {
  id: string;
  bankName: string;
  accountName: string;
  type: AccountType;
  balance: number;
  lastImportedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAccountDto {
  bankName: string;
  accountName: string;
  type: AccountType;
}
