# Finance Data Processing and Access Control Backend

## Live Deployed Demo
Live Link: [https://finance-dashboard-placeholder.onrender.com](https://finance-dashboard-placeholder.onrender.com)  
(Note: Initial load may take up to 30-60 seconds due to Render's free tier spinning up the server).

## Project Overview
This project is a high-performance backend system designed to manage financial records with strict Role-Based Access Control (RBAC). It allows different users (Viewer, Analyst, and Admin) to interact with financial data based on specific permission levels while providing aggregated summary-level insights for dashboard visualization.

---

## Architecture
The project follows a modular, scalable architecture to ensure separation of concerns and ease of maintenance:

* models: Database schemas defining the data structure.
* controllers: Handling incoming HTTP requests and responses.
* services: Isolated business logic and database orchestration.
* routes: Clean mapping of API definitions.
* middleware: Centralized access control, authentication, and payload validation.
* config: Environment-based database connectivity.

---

## Core Features
* User and Role Management: Creation and management of users with assigned system roles.
* Role-Based Access Control: Middleware-driven permission checks for all sensitive actions.
* Financial Records CRUD: Full lifecycle management of transaction data.
* Dynamic Data Filtering: Built-in support for filtering records by type, date, and category.
* Dashboard Aggregation: Server-side calculation of income, expenses, and net balance via MongoDB aggregation.
* Robust Validation: Input sanitization and validation to ensure database integrity.

---

## Roles and Permissions Matrix
| Role | Access Level | Description |
| :--- | :--- | :--- |
| Viewer | Read-Only | Can view personal records and dashboard summaries. |
| Analyst | Read/Write | Can view records, access summaries, and create/update financial data. |
| Admin | Full Access | Complete system control including user management and record deletion. |

---

## API Endpoints

### User Management
| Method | Endpoint | Action | Access |
| :--- | :--- | :--- | :--- |
| GET | /api/users/directory | Fetch basic user info | Public |
| GET | /api/users | Fetch all users | Admin, Analyst, Viewer |
| POST | /api/users | Create new user | Admin |
| PATCH | /api/users/:id | Update user details | Admin |
| DELETE | /api/users/:id | Remove user | Admin |

### Financial Records
| Method | Endpoint | Action | Access |
| :--- | :--- | :--- | :--- |
| GET | /api/records | Fetch transaction list | Admin, Analyst, Viewer |
| POST | /api/records | Create new transaction | Admin, Analyst |
| PATCH | /api/records/:id | Update transaction | Admin, Analyst |
| DELETE | /api/records/:id | Delete transaction | Admin |

### Dashboard and Summary
| Method | Endpoint | Action | Access |
| :--- | :--- | :--- | :--- |
| GET | /api/dashboard/summary | Fetch financial overview | Admin, Analyst |

---

## Data Models

### User Schema
```javascript
{
  name: String,
  email: String (Unique),
  role: Enum('viewer', 'analyst', 'admin'),
  status: Enum('active', 'inactive')
}
```

### Record Schema
```javascript
{
  amount: Number (Non-negative),
  type: Enum('income', 'expense'),
  category: String,
  date: Date,
  note: String
}
```

---

## Setup Instructions

1.  Clone the Repository
    ```bash
    git clone https://github.com/nicksboson/Finance-Dashboard.git
    cd Finance-Dashboard
    ```

2.  Install Dependencies
    ```bash
    npm install
    ```

3.  Environment Configuration
    Create a .env file in the root directory and add your MongoDB connection string:
    ```env
    MONGO_URI=your_mongodb_connection_string
    PORT=5000
    ```

4.  Seed Data (Optional)
    Initialize the database with test users:
    ```bash
    node scripts/seed.js
    ```

5.  Run the Server
    ```bash
    npm run dev
    ```

---

## Design Decisions
* Backend-First Approach: Priority was given to API reliability, security, and data integrity over complex UI layouts.
* Service Layer Pattern: Business logic is separated from controllers to make the code more testable and reusable.
* Aggregation over Computation: All financial math is performed inside the database via MongoDB pipelines to optimize performance for large datasets.

---

## Conclusion
This backend effectively demonstrates the ability to manage complex data flows, enforce strict security via RBAC, and handle server-side data processing in a clean, professional manner. 
