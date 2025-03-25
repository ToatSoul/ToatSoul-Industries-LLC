# Architecture Overview

## Overview

This repository contains a full-stack web application built using a React frontend and Express backend. It implements a discussion forum platform with features for user management, thread creation, commenting, and content categorization. The application follows a modern client-server architecture with clear separation between frontend and backend components.

The project uses a PostgreSQL database (via Neon's serverless Postgres) with Drizzle ORM for data access, authentication via session cookies, and a comprehensive UI built with React and Shadcn UI components.

## System Architecture

### High-Level Architecture

The application follows a classic three-tier architecture:

1. **Frontend Layer**: React-based single-page application (SPA) with TailwindCSS for styling
2. **Backend Layer**: Express.js server handling API requests and business logic
3. **Data Layer**: PostgreSQL database accessed via Drizzle ORM

### Directory Structure

```
├── client/               # Frontend application
│   ├── src/              # React source code
│   │   ├── components/   # UI components
│   │   ├── lib/          # Utility functions and client-side services
│   │   ├── hooks/        # React hooks
│   │   └── pages/        # Page components
├── server/               # Backend application
│   ├── routes.ts         # API route definitions
│   ├── storage.ts        # Data access layer
│   └── vite.ts           # Development server configuration
├── shared/               # Shared code between frontend and backend
│   └── schema.ts         # Database schema and validation
└── uploads/              # File upload storage
```

## Key Components

### Frontend

1. **Component Library**: The application uses a comprehensive set of UI components based on Radix UI primitives, customized with TailwindCSS via Shadcn UI. Components include buttons, forms, dialogs, and more complex interactive elements.

2. **State Management**: The application leverages React Query (`@tanstack/react-query`) for server state management, providing data fetching, caching, and synchronization capabilities.

3. **Routing**: The application uses `wouter` for client-side routing, a lightweight alternative to React Router.

4. **Authentication**: Authentication state is managed through a custom AuthProvider context, which exposes login, register, and logout functions, as well as the current user's information.

5. **API Client**: The application uses a custom API client for making requests to the backend, with integrated error handling and response processing.

### Backend

1. **Express Server**: The main server is built with Express.js, handling HTTP requests, middleware, and routing.

2. **Authentication**: The backend uses Passport.js with a local strategy for username/password authentication, along with session-based persistence stored in PostgreSQL.

3. **File Upload**: The application supports file uploads using Multer, with storage configured for local disk.

4. **Data Access Layer**: The `storage.ts` file implements an interface for database operations, abstracting database access from the route handlers.

### Data Model

The application uses Drizzle ORM with the following core entities:

1. **Users**: Stores user information, including authentication details and profile information.
2. **Categories**: Represents different forum sections or topics.
3. **Threads**: Contains discussion threads started by users within specific categories.
4. **Comments**: Stores replies to threads.
5. **Votes**: Tracks upvotes/downvotes for threads and comments.
6. **Files**: Manages uploaded file metadata.
7. **Tags**: Provides a way to categorize threads with keywords.

### Authentication & Authorization

The application uses a session-based authentication system:

1. **Session Storage**: Sessions are stored in PostgreSQL using `connect-pg-simple`.
2. **Password Security**: Passwords are stored securely (assuming hashing occurs within the storage layer).
3. **Authorization Logic**: Different API endpoints enforce different authorization rules based on user roles and content ownership.

## Data Flow

### Client-Server Communication

1. **API Requests**: The frontend communicates with the backend via RESTful API endpoints, using React Query for data fetching and mutation.

2. **Data Validation**: Data is validated on both client and server sides using Zod schemas defined in `shared/schema.ts`.

3. **Error Handling**: The application implements consistent error handling patterns, with errors from the API translated into user-friendly messages.

### Request Lifecycle

1. A user action triggers a data request (e.g., loading threads, submitting a comment).
2. React Query initiates an API call to the appropriate endpoint.
3. The Express server routes the request to the proper handler.
4. The handler performs authentication/authorization checks.
5. The handler uses the storage interface to interact with the database.
6. The database returns results, which are transformed as needed.
7. The response is sent back to the client.
8. React Query updates its cache and component state.

## External Dependencies

### Frontend Dependencies

- **UI Framework**: React
- **Styling**: TailwindCSS
- **Component Library**: Radix UI primitives via Shadcn UI components
- **State Management**: React Query
- **Routing**: Wouter
- **Form Handling**: React Hook Form with Zod validation
- **Date Handling**: date-fns

### Backend Dependencies

- **Server Framework**: Express.js
- **Database ORM**: Drizzle ORM
- **Database Adapter**: @neondatabase/serverless for Postgres
- **Authentication**: Passport.js with local strategy
- **Session Management**: express-session with connect-pg-simple
- **File Upload**: Multer
- **Validation**: Zod

### Database

- **PostgreSQL**: Via Neon's serverless offering
- **Schema Management**: Drizzle Kit

## Deployment Strategy

The application is configured to deploy on platforms like Replit:

1. **Build Process**: The application uses Vite for frontend bundling and esbuild for backend transpilation.

2. **Environment Configuration**: The application expects environment variables like `DATABASE_URL` for database connection.

3. **Static Asset Serving**: The Express server serves static assets from the built frontend.

4. **Development Tools**: The application includes development-only tools like Drizzle Kit for database schema management.

5. **File Storage**: Uploaded files are stored in a local `uploads` directory, which would need to be adapted for production deployment with persistent storage.

### Production Considerations

For production deployment, several enhancements would be recommended:

1. **Cloud File Storage**: Replace local file storage with a cloud storage solution.
2. **HTTPS**: Ensure secure connections are enforced.
3. **Rate Limiting**: Implement rate limiting to prevent abuse.
4. **Monitoring**: Add logging and monitoring solutions.

## Development Workflow

The application supports the following development workflows:

1. **Local Development**: Run with `npm run dev` to start both frontend and backend in development mode.
2. **Database Schema Management**: Use Drizzle Kit commands like `npm run db:push` to update the database schema.
3. **Type Checking**: Run `npm run check` for TypeScript type checking.
4. **Production Build**: Use `npm run build` to create optimized bundles for both frontend and backend.