import { PGliteWorker } from '@electric-sql/pglite/worker';
import type { Patient, PatientFormData, QueryResult } from '../types';
import MyWorker from '../worker/my-pglite-worker?worker';
import { normalizePatientKeys } from '../utils/normalizePatientKeys';

// Global variables
let pg: PGliteWorker | null = null;
let dbReady: Promise<void>;

// BroadcastChannel for notifying other tabs
const bc = new BroadcastChannel('db-updates');

// Initialize the database connection and schema
export const initDatabase = (): Promise<void> => {
  if (dbReady) return dbReady;

  dbReady = new Promise(async (resolve, reject) => {
    try {
      pg = new PGliteWorker(
        new MyWorker(),
        { dataDir: 'idb://patient_registration_db' }
      );

      // Wait for leader election
      const waitForLeader = async () => {
        const timeout = 5000;
        const start = Date.now();
        while (!pg!.isLeader) {
          if (Date.now() - start > timeout) {
            console.warn('Leader election timed out. Proceeding without leadership.');
            break;
          }
          await new Promise(res => setTimeout(res, 100));
        }
      };

      await waitForLeader();

      console.log('Is this tab the leader?', pg.isLeader);

      // Only leader creates schema
      if (pg.isLeader) {
        await pg.query(`
          CREATE TABLE IF NOT EXISTS patients (
            id SERIAL PRIMARY KEY,
            firstName TEXT NOT NULL,
            lastName TEXT NOT NULL,
            dateOfBirth TEXT NOT NULL,
            gender TEXT NOT NULL,
            email TEXT NOT NULL,
            phone TEXT NOT NULL,
            address TEXT NOT NULL,
            createdAt TEXT NOT NULL
          )
        `);
        console.log('Database schema ensured.');
      }

      resolve();
    } catch (error) {
      console.error('Failed to initialize DB:', error);
      reject(error);
    }
  });

  return dbReady;
};

// Notify all tabs of a DB update
export const dispatchDbUpdatedEvent = (detail: object) => {
  bc.postMessage(detail);
};

// Listen to BroadcastChannel and emit custom window event
bc.onmessage = (event) => {
  window.dispatchEvent(new CustomEvent('db-updated', { detail: event.data }));
};

// Register a new patient
export const registerPatient = async (patientData: PatientFormData): Promise<Patient> => {
  await initDatabase();
  if (!pg) throw new Error('Database not initialized');

  const createdAt = new Date().toISOString();

  try {
    const result = await pg.query(
      `INSERT INTO patients 
       (firstName, lastName, dateOfBirth, gender, email, phone, address, createdAt)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        patientData.firstName,
        patientData.lastName,
        patientData.dateOfBirth,
        patientData.gender,
        patientData.email,
        patientData.phone,
        patientData.address,
        createdAt,
      ]
    );

    if (!result?.rows?.[0]) {
      throw new Error('Patient insert failed.');
    }

    dispatchDbUpdatedEvent({ source: 'current-tab', operation: 'insert' });

    return result.rows[0] as Patient;
  } catch (error) {
    console.error('Error inserting patient:', error);
    throw error;
  }
};

// Get all patients in descending order
export const getAllPatients = async (): Promise<Patient[]> => {
  await initDatabase();
  if (!pg) throw new Error('Database not initialized');

  const result = await pg.query(`
    SELECT 
      id,
      firstName,
      lastName,
      dateOfBirth,
      gender,
      email,
      phone,
      address,
      createdAt
    FROM patients
    ORDER BY id DESC
  `);

  return result.rows.map(normalizePatientKeys);
};

// Execute a custom query
export const executeQuery = async (
  sqlQuery: string,
  notifyChange = true
): Promise<QueryResult> => {
  await initDatabase();
  if (!pg) throw new Error('Database not initialized');

  const result = await pg.query(sqlQuery);

  const isWrite =
    sqlQuery.trim().toLowerCase().startsWith('insert') ||
    sqlQuery.trim().toLowerCase().startsWith('update') ||
    sqlQuery.trim().toLowerCase().startsWith('delete');

  if (notifyChange && isWrite) {
    dispatchDbUpdatedEvent({ source: 'current-tab', operation: 'custom-query' });
  }

  return {
    rows: result.rows as any,
    fields: result.fields,
  };
};
