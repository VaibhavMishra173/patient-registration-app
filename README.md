# Patient Registration System

A frontend-only patient registration application built with React, TypeScript, and PgLite for data storage. This application enables users to register patients, query records using SQL, and persist data across page refreshes and browser tabs.

## Features

- ✅ Register new patients with validation
- ✅ View patient records in a table format
- ✅ Query patient data using raw SQL
- ✅ Cross-tab synchronization for real-time updates
- ✅ Data persistence across page refreshes
- ✅ Responsive design with Tailwind CSS

## Tech Stack

- **Frontend Framework**: React with TypeScript
- **Database**: PgLite (WebAssembly-based SQLite database)
- **Styling**: Tailwind CSS
- **Form Validation**: Zod
- **Notifications**: React Hot Toast
- **Build Tool**: Vite

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/VaibhavMishra173/patient-registration-app.git
   cd patient-registration-app
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Build for production:
   ```bash
   npm run build
   ```

## Usage

### Patient Registration

1. Navigate to the "Register Patient" tab
2. Fill in the patient details form with validated fields:
   - First Name
   - Last Name
   - Date of Birth
   - Gender
   - Email
   - Phone
   - Address
3. Click "Register Patient" to save the data
4. View the newly registered patient in the list below

### SQL Query Interface

1. Navigate to the "Query Database" tab
2. Enter SQL queries in the text area
3. Click "Execute Query" to run the query
4. View the results in the table below

### Example Queries

```sql
-- Get all patients
SELECT * FROM patients

-- Find patients by last name
SELECT * FROM patients WHERE lastName LIKE '%Smith%'

-- Count patients by gender
SELECT gender, COUNT(*) as count FROM patients GROUP BY gender

-- Find patients registered in the last 7 days
SELECT * FROM patients WHERE createdAt > date('now', '-7 days')
```

## Deployment

This application is deployed at: [https://patient-registration-app-woad.vercel.app/](https://patient-registration-app-woad.vercel.app/)

## Development Challenges

### Challenge 1: Cross-Tab Synchronization

Implementing cross-tab synchronization required careful configuration of PgLite's synchronization options. The solution involved:

- Using the broadcast channel API under the hood to notify other tabs of changes
- Ensuring consistent state across all open tabs
- Creating a named database pool

### Challenge 2: Data Persistence

Ensuring data persistence across page refreshes was achieved by:

- Handling database initialization on application startup
- Using PgLite's IndexedDB storage backend
- Creating proper table schemas

### Challenge 3: Form Validation

Implementing robust form validation required:

- Creating user-friendly error messages
- Using Zod schema validation for type-safe validation

## Git Commit History
Check here - [https://github.com/VaibhavMishra173/patient-registration-app/commits/main/](https://github.com/VaibhavMishra173/patient-registration-app/commits/main/)

## License

MIT