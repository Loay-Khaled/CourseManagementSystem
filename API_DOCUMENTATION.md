# API Documentation

Base URL: `http://localhost:5000`

This document lists all API endpoints grouped by controller, including authorization requirements, request validation, and response formats.

## Auth Controller

Route prefix: `/api/auth`

### POST /api/auth/register

- Required role: Public
- Description: Creates a new user account and immediately returns access and refresh tokens.

Request body:

| Field    | Type   | Required | Validation                                 |
| -------- | ------ | -------- | ------------------------------------------ |
| username | string | Yes      | Max length 50                              |
| email    | string | Yes      | Must be a valid email                      |
| password | string | Yes      | Min length 6                               |
| role     | string | Yes      | Must be one of: Admin, Instructor, Student |

Success response:

- Status: `200 OK`
- Body shape:

```json
{
  "accessToken": "string",
  "refreshToken": "string",
  "role": "Admin | Instructor | Student",
  "username": "string",
  "email": "string"
}
```

Error responses:

- `400 Bad Request`: Invalid role, duplicate email, duplicate username, or body validation failure.
- `401 Unauthorized`: Not used by this endpoint.
- `403 Forbidden`: Not used (endpoint is public).
- `404 Not Found`: Not used by this endpoint.

### POST /api/auth/login

- Required role: Public
- Description: Authenticates a user by email/password and returns new access and refresh tokens.

Request body:

| Field    | Type   | Required | Validation            |
| -------- | ------ | -------- | --------------------- |
| email    | string | Yes      | Must be a valid email |
| password | string | Yes      | Non-empty             |

Success response:

- Status: `200 OK`
- Body shape:

```json
{
  "accessToken": "string",
  "refreshToken": "string",
  "role": "Admin | Instructor | Student",
  "username": "string",
  "email": "string"
}
```

Error responses:

- `400 Bad Request`: Body validation failure.
- `401 Unauthorized`: Invalid credentials.
- `403 Forbidden`: Not used (endpoint is public).
- `404 Not Found`: Not used by this endpoint.

### POST /api/auth/refresh

- Required role: Public
- Description: Exchanges a valid refresh token for a new access token and a rotated refresh token.

Request body:

| Field        | Type   | Required | Validation |
| ------------ | ------ | -------- | ---------- |
| refreshToken | string | Yes      | Non-empty  |

Success response:

- Status: `200 OK`
- Body shape:

```json
{
  "accessToken": "string",
  "refreshToken": "string",
  "role": "Admin | Instructor | Student",
  "username": "string",
  "email": "string"
}
```

Error responses:

- `400 Bad Request`: Body validation failure.
- `401 Unauthorized`: Refresh token missing, expired, revoked, or invalid.
- `403 Forbidden`: Not used (endpoint is public).
- `404 Not Found`: Not used by this endpoint.

### POST /api/auth/logout

- Required role: Public
- Description: Revokes the given refresh token.

Request body:

| Field        | Type   | Required | Validation |
| ------------ | ------ | -------- | ---------- |
| refreshToken | string | Yes      | Non-empty  |

Success response:

- Status: `200 OK`
- Body shape:

```json
{
  "message": "Logged out successfully."
}
```

Error responses:

- `400 Bad Request`: Body validation failure.
- `401 Unauthorized`: Not used by this endpoint.
- `403 Forbidden`: Not used (endpoint is public).
- `404 Not Found`: Refresh token not found.

## Courses Controller

Route prefix: `/api/courses`

### GET /api/courses

- Required role: Any authenticated user (Admin, Instructor, Student)
- Description: Returns all courses.

Request body:

- None

Success response:

- Status: `200 OK`
- Body shape:

```json
[
  {
    "id": 1,
    "title": "string",
    "description": "string | null",
    "credits": 3,
    "instructorName": "string"
  }
]
```

Error responses:

- `400 Bad Request`: Not used by this endpoint.
- `401 Unauthorized`: Missing or invalid JWT.
- `403 Forbidden`: Not used (all authenticated roles are allowed).
- `404 Not Found`: Not used by this endpoint.

### GET /api/courses/{id}

- Required role: Any authenticated user (Admin, Instructor, Student)
- Description: Returns a single course by id.

Request body:

- None

Success response:

- Status: `200 OK`
- Body shape:

```json
{
  "id": 1,
  "title": "string",
  "description": "string | null",
  "credits": 3,
  "instructorName": "string"
}
```

Error responses:

- `400 Bad Request`: Invalid route parameter format.
- `401 Unauthorized`: Missing or invalid JWT.
- `403 Forbidden`: Not used (all authenticated roles are allowed).
- `404 Not Found`: Course id does not exist.

### POST /api/courses

- Required role: Admin or Instructor
- Description: Creates a new course using the authenticated user as instructor.

Request body:

| Field       | Type    | Required | Validation     |
| ----------- | ------- | -------- | -------------- |
| title       | string  | Yes      | Max length 100 |
| description | string  | No       | Max length 500 |
| credits     | integer | Yes      | Range 1 to 6   |

Success response:

- Status: `201 Created`
- Body shape:

```json
{
  "id": 1,
  "title": "string",
  "description": "string | null",
  "credits": 3,
  "instructorName": "string"
}
```

Error responses:

- `400 Bad Request`: Validation failure or instructor lookup failure.
- `401 Unauthorized`: Missing or invalid JWT.
- `403 Forbidden`: Authenticated role is not Admin or Instructor.
- `404 Not Found`: Not used by this endpoint.

### PUT /api/courses/{id}

- Required role: Admin or Instructor
- Description: Updates selected fields of a course.

Request body:

| Field       | Type    | Required | Validation     |
| ----------- | ------- | -------- | -------------- |
| title       | string  | No       | Max length 100 |
| description | string  | No       | Max length 500 |
| credits     | integer | No       | Range 1 to 6   |

Success response:

- Status: `200 OK`
- Body shape:

```json
{
  "id": 1,
  "title": "string",
  "description": "string | null",
  "credits": 3,
  "instructorName": "string"
}
```

Error responses:

- `400 Bad Request`: Validation failure.
- `401 Unauthorized`: Missing or invalid JWT.
- `403 Forbidden`: Authenticated role is not Admin or Instructor.
- `404 Not Found`: Course id does not exist.

### DELETE /api/courses/{id}

- Required role: Admin
- Description: Deletes a course.

Request body:

- None

Success response:

- Status: `204 No Content`
- Body: empty

Error responses:

- `400 Bad Request`: Invalid route parameter format.
- `401 Unauthorized`: Missing or invalid JWT.
- `403 Forbidden`: Authenticated role is not Admin.
- `404 Not Found`: Course id does not exist.

## Students Controller

Route prefix: `/api/students`

### GET /api/students

- Required role: Admin or Instructor
- Description: Returns all students.

Request body:

- None

Success response:

- Status: `200 OK`
- Body shape:

```json
[
  {
    "id": 1,
    "fullName": "string",
    "email": "string"
  }
]
```

Error responses:

- `400 Bad Request`: Not used by this endpoint.
- `401 Unauthorized`: Missing or invalid JWT.
- `403 Forbidden`: Authenticated role is not Admin or Instructor.
- `404 Not Found`: Not used by this endpoint.

### GET /api/students/{id}

- Required role: Admin or Instructor
- Description: Returns one student by id.

Request body:

- None

Success response:

- Status: `200 OK`
- Body shape:

```json
{
  "id": 1,
  "fullName": "string",
  "email": "string"
}
```

Error responses:

- `400 Bad Request`: Invalid route parameter format.
- `401 Unauthorized`: Missing or invalid JWT.
- `403 Forbidden`: Authenticated role is not Admin or Instructor.
- `404 Not Found`: Student id does not exist.

### POST /api/students

- Required role: Admin
- Description: Creates a student and linked user account.

Request body:

| Field    | Type   | Required | Validation            |
| -------- | ------ | -------- | --------------------- |
| fullName | string | Yes      | Max length 100        |
| email    | string | Yes      | Must be a valid email |

Success response:

- Status: `201 Created`
- Body shape:

```json
{
  "id": 1,
  "fullName": "string",
  "email": "string"
}
```

Error responses:

- `400 Bad Request`: Validation failure or duplicate email.
- `401 Unauthorized`: Missing or invalid JWT.
- `403 Forbidden`: Authenticated role is not Admin.
- `404 Not Found`: Not used by this endpoint.

### PUT /api/students/{id}

- Required role: Admin
- Description: Updates student full name and/or email.

Request body:

| Field    | Type   | Required | Validation            |
| -------- | ------ | -------- | --------------------- |
| fullName | string | No       | Max length 100        |
| email    | string | No       | Must be a valid email |

Success response:

- Status: `200 OK`
- Body shape:

```json
{
  "id": 1,
  "fullName": "string",
  "email": "string"
}
```

Error responses:

- `400 Bad Request`: Validation failure or duplicate email.
- `401 Unauthorized`: Missing or invalid JWT.
- `403 Forbidden`: Authenticated role is not Admin.
- `404 Not Found`: Student id does not exist.

### DELETE /api/students/{id}

- Required role: Admin
- Description: Deletes a student record.

Request body:

- None

Success response:

- Status: `204 No Content`
- Body: empty

Error responses:

- `400 Bad Request`: Invalid route parameter format.
- `401 Unauthorized`: Missing or invalid JWT.
- `403 Forbidden`: Authenticated role is not Admin.
- `404 Not Found`: Student id does not exist.

## Enrollments Controller

Route prefix: `/api/enrollments`

### GET /api/enrollments

- Required role: Admin or Instructor
- Description: Returns all enrollments (newest first).

Request body:

- None

Success response:

- Status: `200 OK`
- Body shape:

```json
[
  {
    "id": 1,
    "studentName": "string",
    "courseTitle": "string",
    "enrolledAt": "2026-03-19T02:42:57Z"
  }
]
```

Error responses:

- `400 Bad Request`: Not used by this endpoint.
- `401 Unauthorized`: Missing or invalid JWT.
- `403 Forbidden`: Authenticated role is not Admin or Instructor.
- `404 Not Found`: Not used by this endpoint.

### POST /api/enrollments

- Required role: Admin
- Description: Enrolls a student in a course.

Request body:

| Field     | Type    | Required | Validation                         |
| --------- | ------- | -------- | ---------------------------------- |
| studentId | integer | Yes      | Must reference an existing student |
| courseId  | integer | Yes      | Must reference an existing course  |

Success response:

- Status: `200 OK`
- Body shape:

```json
{
  "id": 1,
  "studentName": "string",
  "courseTitle": "string",
  "enrolledAt": "2026-03-19T02:42:57Z"
}
```

Error responses:

- `400 Bad Request`: Validation failure, missing referenced entities, or duplicate enrollment.
- `401 Unauthorized`: Missing or invalid JWT.
- `403 Forbidden`: Authenticated role is not Admin.
- `404 Not Found`: Not used by this endpoint.

### DELETE /api/enrollments/{id}

- Required role: Admin
- Description: Removes an enrollment.

Request body:

- None

Success response:

- Status: `204 No Content`
- Body: empty

Error responses:

- `400 Bad Request`: Invalid route parameter format.
- `401 Unauthorized`: Missing or invalid JWT.
- `403 Forbidden`: Authenticated role is not Admin.
- `404 Not Found`: Enrollment id does not exist.
