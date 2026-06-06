export type ImportStatus = 'completed' | 'failed';

export interface CsvImport {
  importId: string;
  bankName: string;
  fileName: string;
  totalRows: number;
  imported: number;
  skippedDuplicates: number;
  status: ImportStatus;
  importedAt: string;
}

export interface ImportResult {
  importId: string;
  bankName: string;
  totalRows: number;
  imported: number;
  skippedDuplicates: number;
  status: ImportStatus;
}
