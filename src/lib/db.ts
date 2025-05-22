import { PGliteWorker } from '@electric-sql/pglite/worker';
import type { Patient, PatientFormData, QueryResult } from '../types';

let pg: PGliteWorker | null = null;
let dbReady: Promise<void>;

// Initialize database and schema
export const initDatabase = (): Promise<void> => {
  if (dbReady) return dbReady;

  dbReady = new Promise(async (resolve, reject) => {
    try {
      pg = new PGliteWorker(
        new Worker(new URL('./my-pglite-worker.js', import.meta.url), {
          type: 'module',
        }),
        {
          dataDir: 'idb://patient_registration_db',
        }
      );

      // Wait for leader election (optional but safe)
      const waitForLeader = () =>
        new Promise<void>((res) => {
          if (pg!.isLeader) return res();
          const interval = setInterval(() => {
            if (pg!.isLeader) {
              clearInterval(interval);
              res();
            }
          }, 50);
        });

      await waitForLeader();

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

      console.log('Database initialized');
      resolve();
    } catch (error) {
      console.error('Failed to initialize DB:', error);
      reject(error);
    }
  });

  return dbReady;
};

const dispatchDbUpdatedEvent = (detail: object) => {
  window.dispatchEvent(new CustomEvent('db-updated', { detail }));
};

export const registerPatient = async (patientData: PatientFormData): Promise<Patient> => {
  await initDatabase();
  if (!pg) throw new Error('Database not initialized');

  const createdAt = new Date().toISOString();

  const result = await pg.query(
    `INSERT INTO patients (firstName, lastName, dateOfBirth, gender, email, phone, address, createdAt)
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

  dispatchDbUpdatedEvent({ source: 'current-tab', operation: 'insert' });
  return result.rows[0] as Patient;
};

export const getAllPatients = async (): Promise<Patient[]> => {
  await initDatabase();
  if (!pg) throw new Error('Database not initialized');

  const result = await pg.query('SELECT * FROM patients ORDER BY id DESC');
  return result.rows as Patient[];
};

export const executeQuery = async (sqlQuery: string, notifyChange = true): Promise<QueryResult> => {
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
