import React, { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout';
import PatientForm from './components/PatientForm';
import PatientList from './components/PatientList';
import QueryInterface from './components/QueryInterface';
import type { Patient, PatientFormData } from './types';
import { initDatabase, registerPatient, getAllPatients, executeQuery } from './lib/db';

const App: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'register' | 'query'>('register');

  // Initialize database and load patients
  useEffect(() => {
    const setup = async () => {
      try {
        await initDatabase();
        await loadPatients();
      } catch (error) {
        console.error('Failed to initialize database:', error);
      }
    };

    setup();

    // Listen for updates from other tabs
    const onDbUpdate = (event: Event) => {
      const customEvent = event as CustomEvent;
      if (customEvent.detail?.operation) {
        console.log('Database updated in another tab:', customEvent.detail);
        loadPatients(); // Reload data
      }
    };

    window.addEventListener('db-updated', onDbUpdate);

    return () => {
      window.removeEventListener('db-updated', onDbUpdate);
    };
  }, []);

  const loadPatients = async () => {
    setIsLoading(true);
    try {
      const allPatients = await getAllPatients();
      setPatients(allPatients);
    } catch (error) {
      console.error('Failed to load patients:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterPatient = async (data: PatientFormData) => {
    try {
      await registerPatient(data);
      loadPatients(); // Load for current tab
    } catch (error) {
      console.error('Failed to register patient:', error);
      throw error;
    }
  };

  const handleExecuteQuery = async (query: string) => {
    try {
      const result = await executeQuery(query);
      const mightModifyData = /insert|update|delete|alter|drop/i.test(query);
      if (mightModifyData) {
        loadPatients();
      }
      return result;
    } catch (error) {
      console.error('Failed to execute query:', error);
      throw error;
    }
  };

  if (isLoading) {
    return <div className="text-center mt-20 text-gray-500">Initializing...</div>;
  }

  return (
    <Layout>
      <Toaster position="top-right" />
      <div className="mb-6">
        <div className="sm:hidden">
          <select
            className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            value={activeTab}
            onChange={(e) => setActiveTab(e.target.value as 'register' | 'query')}
          >
            <option value="register">Register Patient</option>
            <option value="query">Query Database</option>
          </select>
        </div>
        <div className="hidden sm:block">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex" aria-label="Tabs">
              <button
                onClick={() => setActiveTab('register')}
                className={`${
                  activeTab === 'register'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } w-1/2 py-4 px-1 text-center border-b-2 font-medium text-sm`}
              >
                Register Patient
              </button>
              <button
                onClick={() => setActiveTab('query')}
                className={`${
                  activeTab === 'query'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } w-1/2 py-4 px-1 text-center border-b-2 font-medium text-sm`}
              >
                Query Database
              </button>
            </nav>
          </div>
        </div>
      </div>

      {activeTab === 'register' ? (
        <>
          <PatientForm onSubmit={handleRegisterPatient} />
          <PatientList patients={patients} isLoading={isLoading} />
        </>
      ) : (
        <QueryInterface executeQuery={handleExecuteQuery} />
      )}
    </Layout>
  );
};

export default App;
