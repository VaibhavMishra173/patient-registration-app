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

This application is deployed at: [https://patient-registration-app.vercel.app](https://patient-registration-app.vercel.app)

## Development Challenges

### Challenge 1: Cross-Tab Synchronization

Implementing cross-tab synchronization required careful configuration of PgLite's synchronization options. The solution involved:

- Creating a named database pool with `synchronize: true` option
- Using the broadcast channel API under the hood to notify other tabs of changes
- Ensuring consistent state across all open tabs

### Challenge 2: Data Persistence

Ensuring data persistence across page refreshes was achieved by:

- Using PgLite's IndexedDB storage backend
- Creating proper table schemas with appropriate constraints
- Handling database initialization on application startup

### Challenge 3: Form Validation

Implementing robust form validation required:

- Using Zod schema validation for type-safe validation
- Creating user-friendly error messages
- Validating in real-time as users interact with the form

## Git Commit History

```
- Initial commit: Project setup with Vite, React, TypeScript and Tailwind CSS
- Add PgLite dependency and database configuration
- Create patient database schema and initialization
- Implement patient registration form with validation
- Add patient listing functionality
- Create SQL query interface
- Implement cross-tab synchronization
- Add responsive design and UI improvements
- Add documentation and deployment configuration
- Fix edge cases and performance optimizations
```

## License

MIT