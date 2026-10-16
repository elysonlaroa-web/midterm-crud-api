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