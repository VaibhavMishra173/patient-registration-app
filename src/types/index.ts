export interface Patient {
  id: number;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  email: string;
  phone: string;
  address: string;
  createdAt: string;
}

export type PatientFormData = Omit<Patient, 'id' | 'createdAt'>;

export interface DatabaseOperationResult {
  success: boolean;
  message: string;
}

export interface QueryResult {
  rows: Record<string, any>[];
  fields: { name: string }[];
}