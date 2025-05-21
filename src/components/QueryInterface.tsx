import React, { useState } from 'react';
import type { QueryResult } from '../types';
import toast from 'react-hot-toast';

interface QueryInterfaceProps {
  executeQuery: (query: string) => Promise<QueryResult>;
}

const QueryInterface: React.FC<QueryInterfaceProps> = ({ executeQuery }) => {
  const [queryText, setQueryText] = useState<string>('SELECT * FROM patients');
  const [result, setResult] = useState<QueryResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!queryText.trim()) {
      toast.error('Query cannot be empty');
      return;
    }
    
    setIsExecuting(true);
    setError(null);
    
    try {
      const queryResult = await executeQuery(queryText);
      setResult(queryResult);
      toast.success('Query executed successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      setResult(null);
      toast.error('Query execution failed');
    } finally {
      setIsExecuting(false);
    }
  };
  
  // Helper to render result table dynamically based on columns in results
  const renderResultTable = (result: QueryResult) => {
    if (result.rows.length === 0) {
      return <p className="text-gray-500 italic">Query executed successfully, but returned no results.</p>;
    }
    
    const columns = result.fields.map(field => field.name);
    
    return (
      <div className="overflow-x-auto border rounded-md mt-4">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column, index) => (
                <th 
                  key={index}
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {result.rows.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {columns.map((column, colIndex) => (
                  <td key={`${rowIndex}-${colIndex}`} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {String(row[column] !== null && row[column] !== undefined ? row[column] : 'NULL')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };
  
  return (
    <div className="bg-white shadow-md rounded-lg p-6 mt-6">
      <h2 className="text-xl font-semibold mb-4">SQL Query Interface</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="queryText">
            Enter SQL Query
          </label>
          <textarea
            id="queryText"
            value={queryText}
            onChange={(e) => setQueryText(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="Example: SELECT * FROM patients"
          />
        </div>
        
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isExecuting}
            className={`px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${
              isExecuting ? 'opacity-75 cursor-not-allowed' : ''
            }`}
          >
            {isExecuting ? 'Executing...' : 'Execute Query'}
          </button>
        </div>
      </form>
      
      <div className="mt-6">
        <h3 className="text-lg font-medium text-gray-700 mb-2">Query Results</h3>
        
        {isExecuting && (
          <div className="flex justify-center items-center h-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          </div>
        )}
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            <p className="font-medium">Error executing query</p>
            <p className="mt-1 text-sm">{error}</p>
          </div>
        )}
        
        {!isExecuting && !error && result && renderResultTable(result)}
      </div>
    </div>
  );
};

export default QueryInterface;