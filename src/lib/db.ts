import { PGlite } from '@electric-sql/pglite';
import type { Patient, PatientFormData, QueryResult } from '../types';

// Create a PGlite instance - using default options
// PGlite already uses IndexedDB for storage by default
const dbName = 'patient_registration_db';
const pglite = new PGlite();

// Set up broadcast channel for cross-tab communication
const channelName = `${dbName}-channel`;
let broadcastChannel: BroadcastChannel | null = null;

// Initialize the database and set up cross-tab communication
export const initDatabase = async (): Promise<void> => {
  try {
    // Execute the create table query
    await pglite.query(`
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
    
    // Set up broadcast channel for cross-tab communication
    if (typeof BroadcastChannel !== 'undefined') {
      broadcastChannel = new BroadcastChannel(channelName);
      
      // Listen for database changes from other tabs
      broadcastChannel.onmessage = async (event) => {
        if (event.data.type === 'db-changed') {
          console.log('Database updated in another tab');
          // Trigger custom event for UI components to refresh
          window.dispatchEvent(new CustomEvent('db-updated', { 
            detail: { source: 'other-tab', timestamp: event.data.timestamp }
          }));
        }
      };
    }
    
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
};

// Function to notify other tabs of database changes
const notifyDatabaseChanged = () => {
  try {
    if (broadcastChannel) {
      broadcastChannel.postMessage({
        type: 'db-changed',
        timestamp: Date.now()
      });
    }
  } catch (error) {
    console.error('Error broadcasting change:', error);
  }
};

// Register a new patient
export const registerPatient = async (patientData: PatientFormData): Promise<Patient> => {
  try {
    const createdAt = new Date().toISOString();
    
    const result = await pglite.query(
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
        createdAt
      ]
    );
    
    // Notify other tabs about the change
    notifyDatabaseChanged();
    
    // Trigger local event for UI updates
    window.dispatchEvent(new CustomEvent('db-updated', { 
      detail: { source: 'current-tab', operation: 'insert' }
    }));
    
    return result.rows[0] as Patient;
  } catch (error) {
    console.error('Error registering patient:', error);
    throw error;
  }
};

// Get all patients
export const getAllPatients = async (): Promise<Patient[]> => {
  try {
    const result = await pglite.query('SELECT * FROM patients ORDER BY id DESC');
    return result.rows as Patient[];
  } catch (error) {
    console.error('Error getting patients:', error);
    throw error;
  }
};

// Execute a custom SQL query
export const executeQuery = async (sqlQuery: string, notifyChange = true): Promise<QueryResult> => {
  try {
    const result = await pglite.query(sqlQuery);
    
    // For write operations, notify other tabs
    if (notifyChange && (
      sqlQuery.trim().toLowerCase().startsWith('insert') ||
      sqlQuery.trim().toLowerCase().startsWith('update') ||
      sqlQuery.trim().toLowerCase().startsWith('delete')
    )) {
      notifyDatabaseChanged();
      
      // Trigger local event for UI updates
      window.dispatchEvent(new CustomEvent('db-updated', { 
        detail: { source: 'current-tab', operation: 'custom-query' }
      }));
    }
    
    return {
        // FIXME: update type here
      rows: result.rows as any,
      fields: result.fields
    };
  } catch (error) {
    console.error('Error executing query:', error);
    throw error;
  }
};

// Cleanup function to close the broadcast channel when needed
export const cleanup = (): void => {
  if (broadcastChannel) {
    broadcastChannel.close();
    broadcastChannel = null;
  }
};