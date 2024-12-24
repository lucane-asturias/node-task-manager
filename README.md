# Task Manager

## Description

This project is a **Task Manager API** built using **Node.js**, **Express.js**, **MongoDB**, and **Mongoose**. It serves as a learning experience for mastering the fundamentals of backend development with Node.js.

The application demonstrates core concepts such as RESTful routing, database integration with MongoDB, testing with Jest, etc.

## Features
- **User Authentication**: Secure login and registration with JWT-based authentication.
- **Task Management**: Ability to create, update, read, and delete tasks.
- **User-specific Tasks**: Each user can only access their own tasks.
- **Input Validation**: User inputs are validated before being saved to the database.
- **Test Suite**: Comprehensive test coverage with **Jest** and **Supertest**.

## Tech Stack

- **Node.js**: The runtime environment for executing JavaScript on the server side.
- **Express.js**: A minimal and flexible Node.js web application framework for building APIs.
- **MongoDB**: A NoSQL database used to store data.
- **Mongoose**: A MongoDB object modeling tool designed to work in an asynchronous environment.
- **JWT**: JSON Web Tokens for securing user authentication.
- **bcryptjs**: A library for hashing passwords securely.
- **Jest**: A JavaScript testing framework for running unit and integration tests.
- **Supertest**: A library for testing HTTP endpoints.

## Installation

1. Clone this repository:
   ```bash
   git clone https://github.com/yourusername/task-manager.git
   ```

2. Navigate to the project directory:
   ```bash
   cd task-manager
   ```

3. Install the dependencies:
   ```bash
   npm install
   ```

4. Create a `.env` file in the root directory and configure your environment variables (for MongoDB URI, JWT secrets, etc.).

5. Run the app:
   ```bash
   npm run dev
   ```

6. Run tests:
   ```bash
   npm test
   ```
