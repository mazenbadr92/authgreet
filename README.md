# Auth Greet Task

This is the Auth Greet task repository for handling authentication and greeting the user once successfully logged into the application. It is built with NestJS and uses MongoDB for data persistence. The code adheres to clean code principles and production-ready best practices.

## Prerequisites

- **Node.js:** v18.17.0  
- **npm:** 9.6.7  
- **MongoDB:** 6.0.6 Community Edition  
- **TypeScript:** 5.4.3  

## Installation

1. **Clone the repository:**

   ```bash
   git clone <repository-url>
   cd <repository-folder>/backend
   ```

2. **Install dependencies:**

    - for frontend
        ```
        cd frontend
        npm install
        ```
    - for backend
        ```
        cd frontend
        npm install
        ```

3. **Environment Configuration:**

  - Ensure that your backend URL is correctly configured in the Axios instance (check src/axiosInstance.ts).
  - create .env.local file in the backend root directory and fill in the required fields
  
  ```
  NODE_ENV=development
  PORT=3000

  # Access JWT
  ACCESS_JWT_SECRET=your-dev-access-jwt-secret
  ACCESS_JWT_EXPIRES_IN=5m

  # Refresh JWT
  REFRESH_JWT_SECRET=your-dev-refresh-jwt-secret
  REFRESH_JWT_EXPIRES_IN=30d

  # Bcrypt
  BCRYPT_PEPPER=your-dev-pepper
  BCRYPT_SALT_ROUNDS=10

  # MongoDB
  MONGO_URI=mongodb://localhost:27017/auth_greet_dev
  ```

## Build & Start
  
  
  # Build the application:
  - for frontend
  
  ```
  cd frontend
  npm run build
  ```
  
  - for backend
  
  ```
  cd backend
  npm run build
  ```
  
  # Start the application:
  
  - for frontend
  
  ```
  cd frontend
  npm run start
  ```
  
  - for backend
  
  ```
  cd backend
  npm run start
  ```

## API Documentation
  - once Backend is running, API documentation is available at: **http://localhost:3000/api-docs**

