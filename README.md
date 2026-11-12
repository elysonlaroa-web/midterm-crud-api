#1. Project Description
This project is a RESTful CRUD (Create, Read, Update, Delete) API built using TypeScript, Node.js,
Express, and TypeORM with a MySQL database. It provides complete user management functionalities
including robust data validation, error handling, duplicate email checking, and secure password field
exclusions.

#2. Setup Instructions
Step 1: Database Setup
Open MySQL Workbench and connect to your local MySQL server instance.
Execute the SQL command below to create the project database:
CREATE DATABASE midterm_api;

Verify that the database was successfully created:
SHOW DATABASES;

Step 2: Project Installation
Create a new folder on your Desktop named midterm-crud-api and open it in VS Code.
Open your integrated terminal and initialize the Node.js project:
npm init -y

Install core runtime dependencies:
npm install express typeorm mysql2 reflect-metadata dotenv cors

Install development dependencies:
npm install @types/node typescript ts-node ts-node-dev @types/cors --save-dev

Initialize TypeScript configuration:
npx tsc --init

Step 3: Environment Configuration
Create a .env file in the root directory of your project with the following environment variables:
DB_HOST=localhost
DB_PORT=3308
DB_USERNAME=midterm_user
DB_PASSWORD=elissonzxc@2020
DB_NAME=midterm_api
PORT=3000
NODE_ENV=development

#3. How to Run the Application
Development Mode
Starts the server with live reloading enabled using tsx watch:
npm run dev

Build for Production
Compiles TypeScript files into production-ready JavaScript in the dist/ folder:
npm run build

Start Production Server

Executes the compiled JavaScript code:
npm start

#4. API Endpoints Documentation
Base URL: http://localhost:3000
1. Health Check
 Endpoint: GET /health
 Description: Verifies that the API server is up and running.
Response:
{
&quot;success&quot;: true,
&quot;message&quot;: &quot;API is running&quot;,
&quot;timestamp&quot;: &quot;2026-10-17T00:00:00.000Z&quot;
}

2. Get All Users
Endpoint: GET /api/users
Description: Retrieves all registered users. User passwords are automatically excluded from the
response.
Response:
{
&quot;success&quot;: true,
&quot;count&quot;: 2,
&quot;data&quot;: [
{
&quot;id&quot;: 1,
&quot;name&quot;: &quot;Elyson Laroa&quot;,
&quot;email&quot;: &quot;elyson@example.com&quot;,
&quot;isActive&quot;: true,
&quot;createdAt&quot;: &quot;2026-10-16T13:55:02.591Z&quot;,
&quot;updatedAt&quot;: &quot;2026-10-16T13:55:02.591Z&quot;
},
{
&quot;id&quot;: 2,
&quot;name&quot;: &quot;Jane Smith&quot;,
&quot;email&quot;: &quot;jane@example.com&quot;,
&quot;isActive&quot;: true,

&quot;createdAt&quot;: &quot;2026-10-16T13:59:44.150Z&quot;,
&quot;updatedAt&quot;: &quot;2026-10-16T13:59:44.150Z&quot;
}
]
}

3. Get User by ID
Endpoint: GET /api/users/:id
Description: Fetches a single user record by unique ID.
Response:
{
&quot;success&quot;: true,
&quot;data&quot;: {
&quot;id&quot;: 1,
&quot;name&quot;: &quot;Elyson Laroa&quot;,
&quot;email&quot;: &quot;elyson@example.com&quot;,
&quot;isActive&quot;: true,
&quot;createdAt&quot;: &quot;2026-10-16T13:55:02.591Z&quot;,
&quot;updatedAt&quot;: &quot;2026-10-16T13:55:02.591Z&quot;
}
}

4. Create User
Endpoint: POST /api/users
Description: Creates a new user record. Requires name, email, and password.
Request Body:
{
&quot;name&quot;: &quot;Elyson Laroa&quot;,
&quot;email&quot;: &quot;elyson@example.com&quot;,
&quot;password&quot;: &quot;elissonzxc@2020&quot;
}

Response:
{
&quot;success&quot;: true,
&quot;message&quot;: &quot;User created successfully&quot;,
&quot;data&quot;: {
&quot;name&quot;: &quot;Elyson Laroa&quot;,
&quot;email&quot;: &quot;elyson@example.com&quot;,

&quot;id&quot;: 1,
&quot;isActive&quot;: true,
&quot;createdAt&quot;: &quot;2026-10-16T13:55:02.591Z&quot;,
&quot;updatedAt&quot;: &quot;2026-10-16T13:55:02.591Z&quot;
}
}

5. Update User
Endpoint: PUT /api/users/:id
Description: Updates existing user details by ID (e.g., name, email, active status).
Request Body:
{
&quot;name&quot;: &quot;Elyson Updated&quot;,
&quot;isActive&quot;: false
}

Response:
{
&quot;success&quot;: true,
&quot;message&quot;: &quot;User updated successfully&quot;,
&quot;data&quot;: {
&quot;id&quot;: 1,
&quot;name&quot;: &quot;Elyson Updated&quot;,
&quot;email&quot;: &quot;elyson@example.com&quot;,
&quot;isActive&quot;: false,
&quot;createdAt&quot;: &quot;2026-10-16T13:55:02.591Z&quot;,
&quot;updatedAt&quot;: &quot;2026-10-16T14:14:05.000Z&quot;
}
}

6. Delete User
Endpoint: DELETE /api/users/:id
Description: Deletes a user record permanently by ID.
Response:
{
&quot;success&quot;: true,
&quot;message&quot;: &quot;User deleted successfully&quot;
}

6. Error Handling &amp; HTTP Status Codes
The API returns standardized JSON responses for errors with appropriate HTTP status codes:
400 Bad Request
Triggered when required fields are missing or ID parameter is invalid.
{
&quot;success&quot;: false,
&quot;error&quot;: {
&quot;code&quot;: &quot;MISSING_FIELDS&quot;,
&quot;message&quot;: &quot;Name, email, and password are required&quot;
}
}

404 Not Found
Triggered when a requested user ID or API route does not exist.
{
&quot;success&quot;: false,
&quot;error&quot;: {
&quot;code&quot;: &quot;USER_NOT_FOUND&quot;,
&quot;message&quot;: &quot;User with ID 999 does not exist&quot;
}
}

409 Conflict
Triggered when attempting to create/update a user with an email that is already registered.
{
&quot;success&quot;: false,
&quot;error&quot;: {
&quot;code&quot;: &quot;EMAIL_EXISTS&quot;,
&quot;message&quot;: &quot;A user with this email already exists&quot;
}
}

500 Internal Server Error

Triggered when an unexpected database or server failure occurs.
{
&quot;success&quot;: false,
&quot;error&quot;: {
&quot;code&quot;: &quot;INTERNAL_ERROR&quot;,
&quot;message&quot;: &quot;Failed to fetch users&quot;
}
}

#Reflection answers
1. What was the most challenging part of building this API?
- The most challenging part was connecting the API to the database and handling errors.
2. How does TypeORM make database operations easier compared to raw SQL?
- TypeORM uses entities and simple methods instead of writing raw SQL queries.
3. Why is it important to exclude the password field from API responses? How did you implement this?
- It protects users' sensitive information. I removed the password field before sending user data in API responses.
4. Describe a scenario where you would need to use database transactions instead of individual operations.
- Transferring money requires transactions so all related operations succeed together.
5. What is the difference between synchronize: true and migrations? When should you use each?
- synchronize: true automatically updates database tables, while migrations manage changes safely. Use synchronization for development and migrations for production.
6. If you had to add a Product entity with a relationship to User (a user can have many products), how would you modify the code?
- I would create a Product entity with a ManyToOne relationship to User and a OneToMany relationship in User.
7. What security improvements would you make before deploying this API to production?
- I would hash passwords, add authentication and rate limiting, validate inputs, and use HTTPS.

// Phase 3: README.md

# Midterm CRUD API - Updated Documentation

## 1. New API Endpoints

All API endpoints use the version 1 prefix:

`http://localhost:3000/api/v1`

| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/login` | Authenticates a user using email and password. |
| POST | `/users/with-initial-task` | Creates a user and an initial task in one database transaction. |
| GET | `/users/:userId/tasks` | Retrieves tasks belonging to a specific user. Supports filtering, sorting, and pagination. |
| POST | `/users/:userId/tasks` | Creates a task for a specific user. |
| GET | `/users/:userId/stats` | Retrieves the user's task statistics. |
| GET | `/tasks/overdue` | Retrieves unfinished tasks with past due dates. |
| DELETE | `/tasks/:id` | Soft-deletes a task by ID. |

### Existing User Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/users` | Retrieves all users. |
| GET | `/users/:id` | Retrieves a user by ID. |
| POST | `/users` | Creates a new user. |
| PUT | `/users/:id` | Updates user information. |
| DELETE | `/users/:id` | Deletes a user. |

## 2. Updated Database Schema

The database contains four main tables and one junction table for managing users, tasks, categories, and tags.

### Users Table

Stores user account information.

| Column | Description |
|---|---|
| id | Primary key |
| name | User's name |
| email | Unique email address |
| password | Hashed password |
| phoneNumber | Optional phone number |
| isActive | Account status |
| createdAt | Creation timestamp |
| updatedAt | Last update timestamp |

### Tasks Table

Stores tasks assigned to users.

| Column | Description |
|---|---|
| id | Primary key |
| title | Task title |
| description | Task description |
| status | pending, in-progress, or completed |
| priority | low, medium, or high |
| isDeleted | Soft-delete indicator |
| dueDate | Task due date |
| userId | Foreign key referencing users |
| categoryId | Foreign key referencing categories |
| createdAt | Creation timestamp |
| updatedAt | Last update timestamp |

### Categories Table

Stores task categories.

| Column | Description |
|---|---|
| id | Primary key |
| name | Unique category name |
| description | Optional category description |
| createdAt | Creation timestamp |
| updatedAt | Last update timestamp |

### Tags Table

Stores reusable labels for tasks.

| Column | Description |
|---|---|
| id | Primary key |
| name | Unique tag name |
| createdAt | Creation timestamp |

### Tasks-Tags Junction Table

The `tasks_tags_tags` table connects tasks and tags through a many-to-many relationship.

It contains the task and tag foreign keys generated by TypeORM.

### Database Relationships

1. **Users and Tasks:** One user can have many tasks. Each task can belong to one user. The task's `userId` is nullable, and deleting a user sets the associated task's `userId` to NULL.
2. **Categories and Tasks:** One category can have many tasks. Each task can belong to one category. The task's `categoryId` is nullable.
3. **Tasks and Tags:** Many tasks can have many tags. This relationship uses the `tasks_tags_tags` junction table.

## 3. Database Seed Script Instructions

The project includes a seed script that automatically inserts sample users and tasks into the database for testing.

### Step 1: Make sure the database is running

Start your MySQL server and make sure the database connection settings in your `.env` file are correct.

### Step 2: Run the seed script

Open the project terminal and execute:

```bash
npm run seed
```

### Step 3: Check the seed results

The seed script creates up to:

- 5 sample users
- 3 tasks for each sample user
- 15 sample tasks in total

The script checks existing records before inserting them to avoid duplicating the sample users and their tasks when it is run again.

### Sample Login Credentials

The seed accounts use the following shared development password:

| Account | Email | Password |
|---|---|---|
| Seed User One | seeduser1@example.com | SeedPassword123 |
| Seed User Two | seeduser2@example.com | SeedPassword123 |
| Seed User Three | seeduser3@example.com | SeedPassword123 |
| Seed User Four | seeduser4@example.com | SeedPassword123 |
| Seed User Five | seeduser5@example.com | SeedPassword123 |

**Note:** These credentials are for development and testing only. Do not use the shared sample password for production accounts.

## 4. Running the Updated API

After configuring the database and running the migrations, start the application:

```bash
npm run dev
```

The API will be available at:

`http://localhost:3000/api/v1`

To compile the project and check for TypeScript errors:

```bash
npm run build
```