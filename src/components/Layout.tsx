import React from 'react';
import type  { ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-blue-600 shadow-md">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-white">Patient Registration System</h1>
        </div>
      </header>
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {children}
      </main>
      <footer className="bg-gray-200 border-t border-gray-300">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 text-center text-gray-600">
          <p>&copy; {new Date().getFullYear()} Patient Registration App. Built with PgLite.</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;