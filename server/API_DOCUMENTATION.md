# Smart Inventory API Documentation

## Base URL
```
http://localhost:3000/api
```

## Swagger Documentation
```
http://localhost:3000/api/docs
```

---

## Authentication

All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

---

## API Endpoints

### 1. Authentication Endpoints

#### Register User
- **URL:** `POST /api/auth/register`
- **Access:** Public
- **Description:** Register a new user account
- **Request Body:**
```json
{
  "email": "john.doe@example.com",
  "password": "Pass@1234"
}
```
- **Password Requirements:**
  - Minimum 8 characters
  - At least one uppercase letter
  - At least one lowercase letter
  - At least one number
  - At least one special character (@$!%*?&)

- **Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": 1,
      "email": "john.doe@example.com",
      "role": "user",
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "statusCode": 201
}
```

#### Login
- **URL:** `POST /api/auth/login`
- **Access:** Public
- **Description:** Login with email and password
- **Request Body:**
```json
{
  "email": "john.doe@example.com",
  "password": "Pass@1234"
}
```

- **Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": 1,
      "email": "john.doe@example.com",
      "role": "user",
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "statusCode": 200
}
```

#### Get Profile
- **URL:** `GET /api/auth/profile`
- **Access:** Protected (JWT required)
- **Description:** Get current authenticated user's profile
- **Headers:**
```
Authorization: Bearer <your-jwt-token>
```

- **Response (200):**
```json
{
  "success": true,
  "message": "Profile retrieved successfully",
  "data": {
    "id": 1,
    "email": "john.doe@example.com",
    "role": "user",
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  },
  "statusCode": 200
}
```

#### Create User (Admin Only)
- **URL:** `POST /api/auth/create-user`
- **Access:** Protected (Admin/Super Admin only)
- **Description:** Create a new user with specific role (Admin only)
- **Headers:**
```
Authorization: Bearer <admin-jwt-token>
```
- **Request Body:**
```json
{
  "email": "jane.smith@example.com",
  "password": "Pass@1234",
  "role": "manager",
  "isActive": true
}
```
- **Available Roles:** `super_admin`, `admin`, `manager`, `staff`, `user`

- **Response (201):**
```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "id": 2,
    "email": "jane.smith@example.com",
    "role": "manager",
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  },
  "statusCode": 201
}
```

---

### 2. Users Endpoints

#### Get All Users
- **URL:** `GET /api/users`
- **Access:** Protected (Admin/Manager/Super Admin only)
- **Description:** Get list of all users
- **Headers:**
```
Authorization: Bearer <admin-jwt-token>
```

- **Response (200):**
```json
{
  "success": true,
  "message": "Users retrieved successfully",
  "data": [
    {
      "id": 1,
      "email": "john.doe@example.com",
      "role": "user",
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    },
    {
      "id": 2,
      "email": "jane.smith@example.com",
      "role": "manager",
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "statusCode": 200
}
```

#### Get User by ID
- **URL:** `GET /api/users/:id`
- **Access:** Protected (Users can view their own profile, Admins/Managers can view any)
- **Description:** Get user details by ID
- **Headers:**
```
Authorization: Bearer <jwt-token>
```

- **Response (200):**
```json
{
  "success": true,
  "message": "User retrieved successfully",
  "data": {
    "id": 1,
    "email": "john.doe@example.com",
    "role": "user",
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  },
  "statusCode": 200
}
```

#### Create User
- **URL:** `POST /api/users`
- **Access:** Protected (Admin/Super Admin only)
- **Description:** Create a new user
- **Headers:**
```
Authorization: Bearer <admin-jwt-token>
```
- **Request Body:**
```json
{
  "email": "new.user@example.com",
  "password": "Pass@1234",
  "role": "staff",
  "isActive": true
}
```

- **Response (201):**
```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "id": 3,
    "email": "new.user@example.com",
    "role": "staff",
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  },
  "statusCode": 201
}
```

#### Update User
- **URL:** `PATCH /api/users/:id`
- **Access:** Protected (Admin/Super Admin only)
- **Description:** Update user information
- **Headers:**
```
Authorization: Bearer <admin-jwt-token>
```
- **Request Body:**
```json
{
  "email": "updated.email@example.com",
  "isActive": false
}
```
- **Note:** All fields are optional

- **Response (200):**
```json
{
  "success": true,
  "message": "User updated successfully",
  "data": {
    "id": 1,
    "email": "updated.email@example.com",
    "role": "user",
    "isActive": false,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  },
  "statusCode": 200
}
```

#### Delete User
- **URL:** `DELETE /api/users/:id`
- **Access:** Protected (Admin/Super Admin only)
- **Description:** Delete a user permanently
- **Headers:**
```
Authorization: Bearer <admin-jwt-token>
```

- **Response (200):**
```json
{
  "success": true,
  "message": "User deleted successfully",
  "data": null,
  "statusCode": 200
}
```

#### Deactivate User
- **URL:** `PATCH /api/users/:id/deactivate`
- **Access:** Protected (Admin/Super Admin only)
- **Description:** Deactivate a user account
- **Headers:**
```
Authorization: Bearer <admin-jwt-token>
```

- **Response (200):**
```json
{
  "success": true,
  "message": "User deactivated successfully",
  "data": {
    "id": 1,
    "email": "john.doe@example.com",
    "role": "user",
    "isActive": false,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  },
  "statusCode": 200
}
```

#### Activate User
- **URL:** `PATCH /api/users/:id/activate`
- **Access:** Protected (Admin/Super Admin only)
- **Description:** Activate a deactivated user account
- **Headers:**
```
Authorization: Bearer <admin-jwt-token>
```

- **Response (200):**
```json
{
  "success": true,
  "message": "User activated successfully",
  "data": {
    "id": 1,
    "email": "john.doe@example.com",
    "role": "user",
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  },
  "statusCode": 200
}
```

---

## User Roles

- **super_admin**: Full system access
- **admin**: Administrative access
- **manager**: Management access
- **staff**: Staff access
- **user**: Basic user access

---

## Error Responses

All errors follow this format:

```json
{
  "success": false,
  "message": "Error message here",
  "data": null,
  "statusCode": 400
}
```

### Common Error Codes:
- **400**: Bad Request (validation errors)
- **401**: Unauthorized (invalid credentials or missing token)
- **403**: Forbidden (insufficient permissions)
- **404**: Not Found (resource not found)
- **409**: Conflict (duplicate resource)
- **500**: Internal Server Error

---

## How to Test in Postman

### Step 1: Setup Environment
1. Open Postman
2. Create a new Environment (e.g., "Smart Inventory API")
3. Add variables:
   - `base_url`: `http://localhost:3000/api`
   - `token`: (leave empty, will be set after login)

### Step 2: Register a User
1. Create a new request
2. Method: `POST`
3. URL: `{{base_url}}/auth/register`
4. Body (raw JSON):
```json
{
  "email": "test@example.com",
  "password": "Test@1234"
}
```
5. Send request
6. Copy the `accessToken` from response
7. Set it to the `token` variable in your environment

### Step 3: Login (Alternative)
1. Method: `POST`
2. URL: `{{base_url}}/auth/login`
3. Body (raw JSON):
```json
{
  "email": "test@example.com",
  "password": "Test@1234"
}
```
4. Send request
5. Copy the `accessToken` and update `token` variable

### Step 4: Test Protected Endpoints
1. Add Authorization header:
   - Type: Bearer Token
   - Token: `{{token}}`
2. Or manually add header:
   - Key: `Authorization`
   - Value: `Bearer {{token}}`

### Step 5: Create a Postman Collection

**Collection Structure:**
```
Smart Inventory API
├── Authentication
│   ├── Register
│   ├── Login
│   ├── Get Profile
│   └── Create User (Admin)
└── Users
    ├── Get All Users
    ├── Get User by ID
    ├── Create User
    ├── Update User
    ├── Delete User
    ├── Deactivate User
    └── Activate User
```

### Quick Test Flow:
1. **Register** → Get token
2. **Login** → Get token (if already registered)
3. **Get Profile** → Verify token works
4. **Get All Users** → Test admin endpoint (requires admin role)

---

## Postman Collection JSON

You can import this collection directly into Postman:

```json
{
  "info": {
    "name": "Smart Inventory API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Authentication",
      "item": [
        {
          "name": "Register",
          "request": {
            "method": "POST",
            "header": [],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"email\": \"test@example.com\",\n  \"password\": \"Test@1234\"\n}"
            },
            "url": {
              "raw": "{{base_url}}/auth/register",
              "host": ["{{base_url}}"],
              "path": ["auth", "register"]
            }
          }
        },
        {
          "name": "Login",
          "request": {
            "method": "POST",
            "header": [],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"email\": \"test@example.com\",\n  \"password\": \"Test@1234\"\n}"
            },
            "url": {
              "raw": "{{base_url}}/auth/login",
              "host": ["{{base_url}}"],
              "path": ["auth", "login"]
            }
          }
        },
        {
          "name": "Get Profile",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{token}}",
                "type": "text"
              }
            ],
            "url": {
              "raw": "{{base_url}}/auth/profile",
              "host": ["{{base_url}}"],
              "path": ["auth", "profile"]
            }
          }
        }
      ]
    },
    {
      "name": "Users",
      "item": [
        {
          "name": "Get All Users",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{token}}",
                "type": "text"
              }
            ],
            "url": {
              "raw": "{{base_url}}/users",
              "host": ["{{base_url}}"],
              "path": ["users"]
            }
          }
        },
        {
          "name": "Get User by ID",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{token}}",
                "type": "text"
              }
            ],
            "url": {
              "raw": "{{base_url}}/users/1",
              "host": ["{{base_url}}"],
              "path": ["users", "1"]
            }
          }
        }
      ]
    }
  ],
  "variable": [
    {
      "key": "base_url",
      "value": "http://localhost:3000/api"
    },
    {
      "key": "token",
      "value": ""
    }
  ]
}
```

---

## Notes

1. **JWT Token Expiration**: Tokens expire after 24 hours (configurable via `JWT_EXPIRES_IN`)
2. **Password Hashing**: Passwords are automatically hashed using bcrypt
3. **Validation**: All inputs are validated using class-validator
4. **Error Handling**: All errors are caught and formatted consistently
5. **CORS**: Configured to allow cross-origin requests (adjust in `.env`)

---

## Setup Instructions

1. Copy `.env.example` to `.env` and fill in your database credentials
2. Install dependencies: `npm install`
3. Run migrations (if any): `npm run migration:run`
4. Start the server: `npm run start:dev`
5. Access Swagger docs: `http://localhost:3000/api/docs`


