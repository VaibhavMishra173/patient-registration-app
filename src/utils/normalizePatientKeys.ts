import type { Patient } from "../types";

export const normalizePatientKeys = (patient: any): Patient => ({
  id: patient.id,
  firstName: patient.firstName || patient.firstname,
  lastName: patient.lastName || patient.lastname,
  dateOfBirth: patient.dateOfBirth || patient.dateofbirth,
  gender: patient.gender,
  email: patient.email,
  phone: patient.phone,
  address: patient.address,
  createdAt: patient.createdAt || patient.createdat,
});
