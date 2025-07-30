export interface DataEntry {
  id: string;
  plateNumber: string;
  name: string;
  ic: string;
  phoneNumber: string;
  vehicleType: string;
  expiryDate: string;
  source: string;
  quoteBy: string;
  numberOfQuotations: number;
  status: string;
  remarks: string;
  createdAt: string;
}

export interface DateGroup {
  date: string;
  entries: DataEntry[];
}

export type ExportFormat = 'excel' | 'csv';