# Course Management System

A full-stack Course Management System built with ASP.NET Core Web API and React + Vite. The platform supports role-based access for Admin, Instructor, and Student users, and includes secure JWT authentication with refresh tokens, course management, student management, and enrollments.

## Repository Structure

- `backend` - ASP.NET Core Web API (.NET 8)
- `frontend` - React 18 + Vite client

## How to Run the Backend

```bash
cd backend
dotnet ef database update
dotnet run
```

Backend URL:

- `http://localhost:5000`

## How to Run the Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend URL:

- `http://localhost:5173`

## Technologies Used

- **ASP.NET Core Web API** - Builds the REST API and application middleware pipeline.
- **Entity Framework Core** - Provides ORM features for data modeling, querying, and migrations.
- **SQLite** - Lightweight relational database used by the backend.
- **JWT Authentication** - Secures API endpoints with signed access tokens and role claims.
- **BCrypt.Net** - Hashes user passwords securely before storage.
- **Hangfire** - Runs background jobs, including refresh-token cleanup.
- **React + Vite** - Creates a fast, modern frontend with component-based UI.
- **Axios** - Handles API communication and token-aware interceptors.
- **React Router v6** - Manages public, protected, and role-based routes.

## Why HTTP-only Cookies for Authentication Security

### What HTTP-only cookies are

HTTP-only cookies are browser cookies that JavaScript cannot read or modify. They are sent automatically by the browser with matching requests, but are inaccessible from frontend scripts.

### Why they prevent XSS attacks

In an XSS scenario, malicious JavaScript can run inside the page. If auth tokens are stored in places JavaScript can read, the attacker can steal them. HTTP-only cookies block direct JavaScript access, reducing token theft risk.

### Why they are safer than localStorage for tokens

`localStorage` is fully accessible to JavaScript in the page, including injected scripts. HTTP-only cookies are not accessible through `window` APIs, so they provide stronger protection for sensitive authentication tokens.

### Why they are the industry standard

Many production systems use short-lived access tokens and secure, HTTP-only cookie storage for session-related credentials because it balances usability and strong security controls against common browser-based attacks.

usernames:
admin@test.com
student@test.com
instructor@test.com
password: admin123