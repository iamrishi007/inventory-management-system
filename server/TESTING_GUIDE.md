# Testing Guide

## Prerequisites
1. PostgreSQL database running
2. `.env` file configured (see `ENV_TEMPLATE.txt`)
3. Server running: `npm run start:dev`

## Quick Test Flow

### 1. Start the Server
```bash
npm run start:dev
```

The server should start on `http://localhost:3000`

### 2. Test with Postman

#### Step 1: Register a User
- **Method:** POST
- **URL:** `http://localhost:3000/api/auth/register`
- **Body (JSON):**
```json
{
  "email": "test@example.com",
  "password": "Test@1234"
}
```
- **Expected Response:** 201 Created with user data and accessToken

#### Step 2: Login
- **Method:** POST
- **URL:** `http://localhost:3000/api/auth/login`
- **Body (JSON):**
```json
{
  "email": "test@example.com",
  "password": "Test@1234"
}
```
- **Expected Response:** 200 OK with user data and accessToken
- **Action:** Copy the `accessToken` from the response

#### Step 3: Get Profile (Protected Endpoint)
- **Method:** GET
- **URL:** `http://localhost:3000/api/auth/profile`
- **Headers:**
  - `Authorization: Bearer <your-access-token>`
- **Expected Response:** 200 OK with user profile

#### Step 4: Create Admin User (Manual Database)
To test admin endpoints, you need to create an admin user directly in the database:

```sql
-- First, register a user normally, then update their role in the database
UPDATE users SET role = 'admin' WHERE email = 'test@example.com';
```

Or create directly:
```sql
INSERT INTO users (email, password, role, "isActive", "createdAt", "updatedAt")
VALUES (
  'admin@example.com',
  '$2b$10$YourHashedPasswordHere', -- Use bcrypt to hash 'Admin@1234'
  'admin',
  true,
  NOW(),
  NOW()
);
```

**Note:** To hash password, you can use:
```javascript
const bcrypt = require('bcrypt');
const hash = await bcrypt.hash('Admin@1234', 10);
console.log(hash);
```

#### Step 5: Login as Admin
- **Method:** POST
- **URL:** `http://localhost:3000/api/auth/login`
- **Body (JSON):**
```json
{
  "email": "admin@example.com",
  "password": "Admin@1234"
}
```
- Copy the admin accessToken

#### Step 6: Test Admin Endpoints

**Get All Users:**
- **Method:** GET
- **URL:** `http://localhost:3000/api/users`
- **Headers:** `Authorization: Bearer <admin-token>`
- **Expected Response:** 200 OK with list of users

**Create User:**
- **Method:** POST
- **URL:** `http://localhost:3000/api/users`
- **Headers:** `Authorization: Bearer <admin-token>`
- **Body (JSON):**
```json
{
  "email": "newuser@example.com",
  "password": "Pass@1234",
  "role": "staff",
  "isActive": true
}
```

**Get User by ID:**
- **Method:** GET
- **URL:** `http://localhost:3000/api/users/1`
- **Headers:** `Authorization: Bearer <admin-token>`

**Update User:**
- **Method:** PATCH
- **URL:** `http://localhost:3000/api/users/1`
- **Headers:** `Authorization: Bearer <admin-token>`
- **Body (JSON):**
```json
{
  "email": "updated@example.com",
  "isActive": false
}
```

**Deactivate User:**
- **Method:** PATCH
- **URL:** `http://localhost:3000/api/users/1/deactivate`
- **Headers:** `Authorization: Bearer <admin-token>`

**Activate User:**
- **Method:** PATCH
- **URL:** `http://localhost:3000/api/users/1/activate`
- **Headers:** `Authorization: Bearer <admin-token>`

**Delete User:**
- **Method:** DELETE
- **URL:** `http://localhost:3000/api/users/1`
- **Headers:** `Authorization: Bearer <admin-token>`

## Testing with cURL

### Register
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test@1234"}'
```

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test@1234"}'
```

### Get Profile (Replace TOKEN with actual token)
```bash
curl -X GET http://localhost:3000/api/auth/profile \
  -H "Authorization: Bearer TOKEN"
```

## Testing Error Cases

### 1. Invalid Credentials
- **Login with wrong password**
- **Expected:** 401 Unauthorized

### 2. Missing Token
- **Access protected endpoint without Authorization header**
- **Expected:** 401 Unauthorized

### 3. Invalid Token
- **Access protected endpoint with invalid token**
- **Expected:** 401 Unauthorized

### 4. Insufficient Permissions
- **Regular user trying to access admin endpoint**
- **Expected:** 403 Forbidden

### 5. Duplicate Email
- **Register with existing email**
- **Expected:** 409 Conflict

### 6. Invalid Password Format
- **Register with weak password**
- **Expected:** 400 Bad Request with validation errors

### 7. User Not Found
- **Get user with non-existent ID**
- **Expected:** 404 Not Found

## Swagger UI Testing

1. Start the server
2. Open browser: `http://localhost:3000/api/docs`
3. Click "Authorize" button
4. Enter your JWT token (without "Bearer" prefix)
5. Test endpoints directly from Swagger UI

## Automated Testing Script

Create a test script to verify all endpoints:

```javascript
// test-api.js
const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

async function testAPI() {
  try {
    // Register
    const registerRes = await axios.post(`${BASE_URL}/auth/register`, {
      email: 'test@example.com',
      password: 'Test@1234'
    });
    console.log('✅ Register:', registerRes.status);
    
    // Login
    const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'test@example.com',
      password: 'Test@1234'
    });
    console.log('✅ Login:', loginRes.status);
    const token = loginRes.data.data.accessToken;
    
    // Get Profile
    const profileRes = await axios.get(`${BASE_URL}/auth/profile`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Get Profile:', profileRes.status);
    
    console.log('All tests passed!');
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}


```
src/modules/products/
├── entities/
│   └── product.entity.ts          # Product entity with all fields
├── dto/
│   └── product.dto.ts             # DTOs for create, update, filter
├── products.controller.ts          # REST API endpoints
├── products.service.ts             # Business logic
└── products.module.ts              # Module configuration
```

## Setup Instructions

### 1. Add Products Module to App Module

The `app.module.ts` has already been updated to include `ProductsModule`.

### 2. Run Migration

```bash
# Build the project
npm run build

# Run the new products migration
npm run migration:run
```

### 3. Restart Application

```bash
npm run start:dev
```

## Role-Based Access Control (RBAC)

### Permission Matrix

| Operation | Super Admin | Admin | Manager | Staff |
|-----------|-------------|-------|---------|-------|
| Create    | ✅          | ✅    | ❌      | ❌    |
| Read      | ✅          | ✅    | ✅      | ✅    |
| Update    | ✅          | ✅    | ✅      | ❌    |
| Delete    | ✅          | ✅    | ❌      | ❌    |
| Stats     | ✅          | ✅    | ✅      | ❌    |

### Role Descriptions

- **Super Admin & Admin**: Full CRUD access
- **Manager**: Create, Read, Update (CRU)
- **Staff**: Read-only access

## API Endpoints

### Base URL
```
/api/v1/products
```

### Authentication
All endpoints require JWT Bearer token in the Authorization header:
```
Authorization: Bearer <your_access_token>
```

---

## 1. Create Product

**POST** `/api/v1/products`

**Access**: Super Admin, Admin only

**Request Body:**
```json
{
  "name": "Laptop HP Pavilion",
  "price": 45999.99,
  "description": "High-performance laptop with 16GB RAM and 512GB SSD"
}
```

**Validation Rules:**
- `name`: Required, 3-200 characters
- `price`: Required, positive number
- `description`: Optional, max 1000 characters

**Success Response (201):**
```json
{
  "statusCode": 201,
  "message": "Product created successfully",
  "data": {
    "id": 1,
    "name": "Laptop HP Pavilion",
    "price": "45999.99",
    "description": "High-performance laptop with 16GB RAM and 512GB SSD",
    "createdBy": "super_admin",
    "updatedBy": null,
    "createdAt": "2024-01-08T10:00:00.000Z",
    "updatedAt": "2024-01-08T10:00:00.000Z"
  }
}
```

**Error Responses:**

403 Forbidden (Staff/Manager tries to create):
```json
{
  "statusCode": 403,
  "message": "Access denied. Required roles: super_admin, admin",
  "error": "Forbidden"
}
```

400 Validation Error:
```json
{
  "statusCode": 400,
  "message": [
    "Product name must be at least 3 characters",
    "Price must be a positive number"
  ],
  "error": "Bad Request"
}
```

---

## 2. Get All Products (with Filtering, Sorting, Pagination)

**GET** `/api/v1/products`

**Access**: All roles (Super Admin, Admin, Manager, Staff)

**Query Parameters:**

| Parameter  | Type   | Required | Default      | Description                           |
|------------|--------|----------|--------------|---------------------------------------|
| search     | string | No       | -            | Search products by name               |
| minPrice   | number | No       | -            | Filter products with price >= value   |
| maxPrice   | number | No       | -            | Filter products with price <= value   |
| sortBy     | enum   | No       | createdAt    | Field to sort by (id, name, price, createdAt, updatedAt) |
| sortOrder  | enum   | No       | DESC         | Sort direction (ASC or DESC)          |
| page       | number | No       | 1            | Page number (min: 1)                  |
| limit      | number | No       | 10           | Items per page (min: 1, max: 100)     |

**Example Requests:**

1. **Basic - Get all products:**
```
GET /api/v1/products
```

2. **With search:**
```
GET /api/v1/products?search=laptop
```

3. **With price filter:**
```
GET /api/v1/products?minPrice=1000&maxPrice=50000
```

4. **With sorting:**
```
GET /api/v1/products?sortBy=price&sortOrder=ASC
```

5. **With pagination:**
```
GET /api/v1/products?page=2&limit=20
```

6. **Combined filters:**
```
GET /api/v1/products?search=laptop&minPrice=30000&sortBy=price&sortOrder=DESC&page=1&limit=10
```

**Success Response (200):**
```json
{
  "statusCode": 200,
  "message": "Products retrieved successfully",
  "data": {
    "data": [
      {
        "id": 1,
        "name": "Laptop HP Pavilion",
        "price": "45999.99",
        "description": "High-performance laptop",
        "createdBy": "super_admin",
        "updatedBy": null,
        "createdAt": "2024-01-08T10:00:00.000Z",
        "updatedAt": "2024-01-08T10:00:00.000Z"
      },
      {
        "id": 2,
        "name": "Dell Inspiron Laptop",
        "price": "42000.00",
        "description": "Business laptop",
        "createdBy": "admin",
        "updatedBy": "manager",
        "createdAt": "2024-01-08T11:00:00.000Z",
        "updatedAt": "2024-01-08T12:00:00.000Z"
      }
    ],
    "meta": {
      "total": 50,
      "page": 1,
      "limit": 10,
      "totalPages": 5,
      "hasNextPage": true,
      "hasPreviousPage": false
    }
  }
}
```

---

## 3. Get Product by ID

**GET** `/api/v1/products/:id`

**Access**: All roles

**Example:**
```
GET /api/v1/products/1
```

**Success Response (200):**
```json
{
  "statusCode": 200,
  "message": "Product retrieved successfully",
  "data": {
    "id": 1,
    "name": "Laptop HP Pavilion",
    "price": "45999.99",
    "description": "High-performance laptop",
    "createdBy": "super_admin",
    "updatedBy": null,
    "createdAt": "2024-01-08T10:00:00.000Z",
    "updatedAt": "2024-01-08T10:00:00.000Z"
  }
}
```

**Error Response (404):**
```json
{
  "statusCode": 404,
  "message": "Product with ID 999 not found",
  "error": "Not Found"
}
```

---

## 4. Update Product

**PATCH** `/api/v1/products/:id`

**Access**: Super Admin, Admin, Manager

**Request Body (all fields optional):**
```json
{
  "name": "Laptop HP Pavilion Updated",
  "price": 42999.99,
  "description": "Updated description"
}
```

**Example:**
```
PATCH /api/v1/products/1
```

**Success Response (200):**
```json
{
  "statusCode": 200,
  "message": "Product updated successfully",
  "data": {
    "id": 1,
    "name": "Laptop HP Pavilion Updated",
    "price": "42999.99",
    "description": "Updated description",
    "createdBy": "super_admin",
    "updatedBy": "manager",
    "createdAt": "2024-01-08T10:00:00.000Z",
    "updatedAt": "2024-01-08T15:00:00.000Z"
  }
}
```

**Error Responses:**

403 Forbidden (Staff tries to update):
```json
{
  "statusCode": 403,
  "message": "Access denied. Required roles: super_admin, admin, manager",
  "error": "Forbidden"
}
```

---

## 5. Delete Product

**DELETE** `/api/v1/products/:id`

**Access**: Super Admin, Admin only

**Example:**
```
DELETE /api/v1/products/1
```

**Success Response (200):**
```json
{
  "statusCode": 200,
  "message": "Product deleted successfully",
  "data": null
}
```

**Error Responses:**

403 Forbidden (Manager/Staff tries to delete):
```json
{
  "statusCode": 403,
  "message": "Access denied. Required roles: super_admin, admin",
  "error": "Forbidden"
}
```

404 Not Found:
```json
{
  "statusCode": 404,
  "message": "Product with ID 999 not found",
  "error": "Not Found"
}
```

---

## 6. Get Product Statistics

**GET** `/api/v1/products/stats`

**Access**: Super Admin, Admin, Manager

**Example:**
```
GET /api/v1/products/stats
```

**Success Response (200):**
```json
{
  "statusCode": 200,
  "message": "Product statistics retrieved successfully",
  "data": {
    "totalProducts": 150,
    "averagePrice": "35499.50",
    "maxPrice": "99999.00",
    "minPrice": "999.00"
  }
}
```

---

## Database Schema

### Products Table

| Column      | Type         | Description                                |
|-------------|--------------|--------------------------------------------|
| id          | INTEGER      | Primary key, auto-increment                |
| name        | VARCHAR(200) | Product name                               |
| price       | DECIMAL(10,2)| Product price                              |
| description | TEXT         | Product description (optional)             |
| createdBy   | VARCHAR(50)  | Role of creator (super_admin, admin, etc.) |
| updatedBy   | VARCHAR(50)  | Role of last updater                       |
| createdAt   | TIMESTAMP    | Record creation timestamp                  |
| updatedAt   | TIMESTAMP    | Record last update timestamp               |

**Indexes:**
- `IDX_PRODUCT_NAME` on `name`
- `IDX_PRODUCT_PRICE` on `price`
- `IDX_PRODUCT_CREATED_AT` on `createdAt`

---

## Validation Rules Summary

### Create Product
- **name**: Required, string, 3-200 chars
- **price**: Required, positive number
- **description**: Optional, string, max 1000 chars

### Update Product
- All fields optional
- Same validation rules as create when provided

### Filter Query
- **search**: Optional, string
- **minPrice**: Optional, number >= 0
- **maxPrice**: Optional, number >= 0
- **sortBy**: Optional, enum (id, name, price, createdAt, updatedAt)
- **sortOrder**: Optional, enum (ASC, DESC)
- **page**: Optional, integer >= 1
- **limit**: Optional, integer 1-100

---

## Testing Examples

### Using cURL

**1. Create Product (as Admin):**
```bash
curl -X POST http://localhost:3000/api/v1/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "Laptop HP Pavilion",
    "price": 45999.99,
    "description": "High-performance laptop"
  }'
```

**2. Get Products with Filters:**
```bash
curl -X GET "http://localhost:3000/api/v1/products?search=laptop&minPrice=30000&sortBy=price&sortOrder=ASC&page=1&limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**3. Update Product (as Manager):**
```bash
curl -X PATCH http://localhost:3000/api/v1/products/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "price": 42999.99
  }'
```

**4. Delete Product (as Admin):**
```bash
curl -X DELETE http://localhost:3000/api/v1/products/1 \
  -H "Authorization: Bearer YOUR_TOKEN

---

## Common Use Cases

### 1. Search Products by Name
```
GET /products?search=laptop
```

### 2. Get Products in Price Range
```
GET /products?minPrice=10000&maxPrice=50000
```

### 3. Get Cheapest Products First
```
GET /products?sortBy=price&sortOrder=ASC
```

### 4. Get Latest Products
```
GET /products?sortBy=createdAt&sortOrder=DESC
```

### 5. Get Second Page with 20 Items
```
GET /products?page=2&limit=20
```

### 6. Complex Filter (Search + Price + Sort + Pagination)
```
GET /products?search=laptop&minPrice=30000&maxPrice=60000&sortBy=price&sortOrder=ASC&page=1&limit=15

```

# Inventory Management Module - Complete Documentation

## Overview
Complete inventory management system with automatic stock status tracking, buy functionality, and role-based access control.

## Features Implemented

✅ Product inventory tracking with quantity
✅ Automatic status update (in_stock/out_of_stock based on quantity)
✅ Buy product functionality with stock validation
✅ Filtering by status, quantity range, product name
✅ Sorting by multiple fields including createdAt and updatedAt
✅ Pagination with metadata
✅ Low stock alerts
✅ Inventory statistics
✅ Role-based access control (RBAC)
✅ CreatedBy/UpdatedBy tracking

## File Structure

```
src/modules/inventory/
├── entities/
│   └── inventory.entity.ts        # Inventory entity with product relation
├── dto/
│   └── inventory.dto.ts           # All DTOs (Create, Update, Buy, Filter)
├── inventory.controller.ts         # REST API endpoints
├── inventory.service.ts            # Business logic
└── inventory.module.ts             # Module configuration
```

## Role-Based Access Control (RBAC)

| Operation        | Super Admin | Admin | Manager | Staff | User |
|------------------|-------------|-------|---------|-------|------|
| Create           | ✅          | ✅    | ❌      | ❌    | ❌   |
| Read             | ✅          | ✅    | ✅      | ✅    | ❌   |
| Update           | ✅          | ✅    | ✅      | ❌    | ❌   |
| Delete           | ✅          | ✅    | ❌      | ❌    | ❌   |
| Buy Product      | ✅          | ✅    | ✅      | ✅    | ✅   |
| Stats/Low Stock  | ✅          | ✅    | ✅      | ❌    | ❌   |

## Database Schema

### Inventory Table

| Column     | Type         | Description                              |
|------------|--------------|------------------------------------------|
| id         | INTEGER      | Primary key, auto-increment              |
| productId  | INTEGER      | Foreign key to products table            |
| quantity   | INTEGER      | Available quantity (default: 0)          |
| status     | ENUM         | in_stock or out_of_stock (auto-updated)  |
| createdBy  | VARCHAR(50)  | Role of creator                          |
| updatedBy  | VARCHAR(50)  | Role of last updater                     |
| createdAt  | TIMESTAMP    | Creation timestamp                       |
| updatedAt  | TIMESTAMP    | Last update timestamp                    |

**Constraints:**
- Foreign key: `productId` references `products(id)` with CASCADE
- Unique: Only one inventory record per product
- Check: quantity >= 0

**Indexes:**
- `IDX_INVENTORY_PRODUCT_ID` on `productId`
- `IDX_INVENTORY_STATUS` on `status`
- `IDX_INVENTORY_QUANTITY` on `quantity`
- `IDX_INVENTORY_CREATED_AT` on `createdAt`
- `IDX_INVENTORY_UPDATED_AT` on `updatedAt`
- `UQ_INVENTORY_PRODUCT` unique index on `productId`

## Status Logic

```typescript
if (quantity > 0) {
  status = 'in_stock'
} else {
  status = 'out_of_stock'
}
```

The status is **automatically updated** whenever quantity changes.

---

## API Endpoints

### Base URL: `/api/v1/inventory`

All endpoints require JWT Bearer token authentication.

---

## 1. Add Product to Inventory

**POST** `/api/v1/inventory`

**Access:** Super Admin, Admin only

**Request Body:**
```json
{
  "productId": 1,
  "quantity": 100
}
```

**Validation:**
- `productId`: Required, positive integer, product must exist
- `quantity`: Required, integer >= 0

**Success Response (201):**
```json
{
  "statusCode": 201,
  "message": "Inventory created successfully",
  "data": {
    "id": 1,
    "productId": 1,
    "quantity": 100,
    "status": "in_stock",
    "createdBy": "super_admin",
    "updatedBy": null,
    "createdAt": "2024-01-08T10:00:00.000Z",
    "updatedAt": "2024-01-08T10:00:00.000Z",
    "product": {
      "id": 1,
      "name": "Laptop HP Pavilion",
      "price": "45999.99",
      "description": "High-performance laptop"
    }
  }
}
```

**Error Responses:**

409 Conflict (Inventory already exists):
```json
{
  "statusCode": 409,
  "message": "Inventory already exists for product ID 1",
  "error": "Conflict"
}
```

404 Not Found (Product doesn't exist):
```json
{
  "statusCode": 404,
  "message": "Product with ID 999 not found",
  "error": "Not Found"
}
```

---

## 2. Get All Inventory (Filtering, Sorting, Pagination)

**GET** `/api/v1/inventory`

**Access:** All roles (Super Admin, Admin, Manager, Staff)

**Query Parameters:**

| Parameter   | Type   | Required | Default      | Description                                    |
|-------------|--------|----------|--------------|------------------------------------------------|
| search      | string | No       | -            | Search by product name                         |
| status      | enum   | No       | -            | Filter by status (in_stock, out_of_stock)      |
| minQuantity | number | No       | -            | Filter items with quantity >= value            |
| maxQuantity | number | No       | -            | Filter items with quantity <= value            |
| sortBy      | enum   | No       | createdAt    | Sort field (id, product.name, quantity, status, createdAt, updatedAt) |
| sortOrder   | enum   | No       | DESC         | Sort order (ASC, DESC)                         |
| page        | number | No       | 1            | Page number                                    |
| limit       | number | No       | 10           | Items per page (max: 100)                      |

**Example Requests:**

1. **Get all inventory:**
```
GET /api/v1/inventory
```

2. **Get only in-stock items:**
```
GET /api/v1/inventory?status=in_stock
```

3. **Get out of stock items:**
```
GET /api/v1/inventory?status=out_of_stock
```

4. **Search by product name:**
```
GET /api/v1/inventory?search=laptop
```

5. **Filter by quantity range:**
```
GET /api/v1/inventory?minQuantity=10&maxQuantity=100
```

6. **Sort by quantity (lowest first):**
```
GET /api/v1/inventory?sortBy=quantity&sortOrder=ASC
```

7. **Sort by latest updated:**
```
GET /api/v1/inventory?sortBy=updatedAt&sortOrder=DESC
```

8. **Combined filters:**
```
GET /api/v1/inventory?status=in_stock&minQuantity=20&sortBy=quantity&sortOrder=ASC&page=1&limit=20
```

**Success Response (200):**
```json
{
  "statusCode": 200,
  "message": "Inventory retrieved successfully",
  "data": {
    "data": [
      {
        "id": 1,
        "productId": 1,
        "quantity": 95,
        "status": "in_stock",
        "createdBy": "super_admin",
        "updatedBy": "manager",
        "createdAt": "2024-01-08T10:00:00.000Z",
        "updatedAt": "2024-01-08T15:00:00.000Z",
        "product": {
          "id": 1,
          "name": "Laptop HP Pavilion",
          "price": "45999.99"
        }
      }
    ],
    "meta": {
      "total": 50,
      "page": 1,
      "limit": 10,
      "totalPages": 5,
      "hasNextPage": true,
      "hasPreviousPage": false
    }
  }
}
```

---

## 3. Get Inventory by ID

**GET** `/api/v1/inventory/:id`

**Access:** All roles (Super Admin, Admin, Manager, Staff)

**Example:**
```
GET /api/v1/inventory/1
```

**Success Response (200):**
```json
{
  "statusCode": 200,
  "message": "Inventory retrieved successfully",
  "data": {
    "id": 1,
    "productId": 1,
    "quantity": 95,
    "status": "in_stock",
    "createdBy": "super_admin",
    "updatedBy": "manager",
    "createdAt": "2024-01-08T10:00:00.000Z",
    "updatedAt": "2024-01-08T15:00:00.000Z",
    "product": {
      "id": 1,
      "name": "Laptop HP Pavilion",
      "price": "45999.99",
      "description": "High-performance laptop"
    }
  }
}
```

---

## 4. Get Inventory by Product ID

**GET** `/api/v1/inventory/product/:productId`

**Access:** All roles (Super Admin, Admin, Manager, Staff)

**Example:**
```
GET /api/v1/inventory/product/1
```

**Success Response (200):** Same as Get by ID

---

## 5. Update Inventory Quantity

**PATCH** `/api/v1/inventory/:id`

**Access:** Super Admin, Admin, Manager

**Request Body:**
```json
{
  "quantity": 150
}
```

**Example:**
```
PATCH /api/v1/inventory/1
```

**Success Response (200):**
```json
{
  "statusCode": 200,
  "message": "Inventory updated successfully",
  "data": {
    "id": 1,
    "productId": 1,
    "quantity": 150,
    "status": "in_stock",
    "createdBy": "super_admin",
    "updatedBy": "manager",
    "createdAt": "2024-01-08T10:00:00.000Z",
    "updatedAt": "2024-01-08T16:00:00.000Z",
    "product": {
      "id": 1,
      "name": "Laptop HP Pavilion",
      "price": "45999.99"
    }
  }
}
```

**Note:** Status automatically updates based on new quantity.

---

## 6. Buy Product (Purchase)

**POST** `/api/v1/inventory/:id/buy`

**Access:** ALL ROLES (Super Admin, Admin, Manager, Staff, User)

This is the key feature - any authenticated user can purchase products!

**Request Body:**
```json
{
  "quantity": 5
}
```

**Validation:**
- `quantity`: Required, positive integer, minimum 1

**Example:**
```
POST /api/v1/inventory/1/buy
```

**Success Response (200):**
```json
{
  "statusCode": 200,
  "message": "Successfully purchased 5 unit(s). Remaining stock: 90",
  "data": {
    "id": 1,
    "productId": 1,
    "quantity": 90,
    "status": "in_stock",
    "createdBy": "super_admin",
    "updatedBy": "system",
    "createdAt": "2024-01-08T10:00:00.000Z",
    "updatedAt": "2024-01-08T17:00:00.000Z",
    "product": {
      "id": 1,
      "name": "Laptop HP Pavilion",
      "price": "45999.99"
    }
  }
}
```

**Error Responses:**

400 Out of Stock:
```json
{
  "statusCode": 400,
  "message": "Product is out of stock",
  "error": "Bad Request"
}
```

400 Insufficient Stock:
```json
{
  "statusCode": 400,
  "message": "Insufficient stock. Available: 3, Requested: 5",
  "error": "Bad Request"
}
```

**Purchase Flow:**
1. Check if product status is "in_stock"
2. Check if requested quantity is available
3. Reduce inventory quantity by requested amount
4. Auto-update status if quantity becomes 0
5. Set updatedBy as "system"

---

## 7. Get Inventory Statistics

**GET** `/api/v1/inventory/stats`

**Access:** Super Admin, Admin, Manager

**Example:**
```
GET /api/v1/inventory/stats
```

**Success Response (200):**
```json
{
  "statusCode": 200,
  "message": "Inventory statistics retrieved successfully",
  "data": {
    "totalItems": 150,
    "inStockItems": 120,
    "outOfStockItems": 30,
    "totalQuantity": 5420,
    "averageQuantity": "36.13"
  }
}
```

---

## 8. Get Low Stock Items

**GET** `/api/v1/inventory/low-stock?threshold=10`

**Access:** Super Admin, Admin, Manager

**Query Parameters:**
- `threshold` (optional): Quantity threshold (default: 10)

**Example:**
```
GET /api/v1/inventory/low-stock?threshold=15
```

**Success Response (200):**
```json
{
  "statusCode": 200,
  "message": "Low stock items retrieved successfully",
  "data": [
    {
      "id": 5,
      "productId": 5,
      "quantity": 8,
      "status": "in_stock",
      "createdBy": "admin",
      "updatedBy": "manager",
      "createdAt": "2024-01-08T10:00:00.000Z",
      "updatedAt": "2024-01-08T15:00:00.000Z",
      "product": {
        "id": 5,
        "name": "Mouse Wireless",
        "price": "599.99"
      }
    },
    {
      "id": 12,
      "productId": 12,
      "quantity": 12,
      "status": "in_stock",
      "product": {
        "id": 12,
        "name": "Keyboard Mechanical",
        "price": "2499.99"
      }
    }
  ]
}
```

---

## 9. Delete Inventory

**DELETE** `/api/v1/inventory/:id`

**Access:** Super Admin, Admin only

**Example:**
```
DELETE /api/v1/inventory/1
```

**Success Response (200):**
```json
{
  "statusCode": 200,
  "message": "Inventory deleted successfully",
  "data": null
}
```

---

## Validation Rules

### Create Inventory
- **productId**: Required, positive integer, must reference existing product
- **quantity**: Required, integer >= 0

### Update Inventory
- **quantity**: Optional, integer >= 0

### Buy Product
- **quantity**: Required, positive integer, minimum 1

### Filter Query
- **search**: Optional, string
- **status**: Optional, enum (in_stock, out_of_stock)
- **minQuantity**: Optional, integer >= 0
- **maxQuantity**: Optional, integer >= 0
- **sortBy**: Optional, enum (id, product.name, quantity, status, createdAt, updatedAt)
- **sortOrder**: Optional, enum (ASC, DESC)
- **page**: Optional, integer >= 1
- **limit**: Optional, integer 1-100

---

## Testing Examples

### Using cURL

**1. Add Inventory:**
```bash
curl -X POST http://localhost:3000/api/v1/inventory \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "productId": 1,
    "quantity": 100
  }'
```

**2. Get In-Stock Items:**
```bash
curl -X GET "http://localhost:3000/api/v1/inventory?status=in_stock" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**3. Update Quantity:**
```bash
curl -X PATCH http://localhost:3000/api/v1/inventory/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "quantity": 150
  }'
```

**4. Buy Product:**
```bash
curl -X POST http://localhost:3000/api/v1/inventory/1/buy \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "quantity": 5
  }'
```

**5. Get Low Stock:**
```bash
curl -X GET "http://localhost:3000/api/v1/inventory/low-stock?threshold=10" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Common Use Cases

### 1. View All In-Stock Products
```
GET /inventory?status=in_stock&sortBy=quantity&sortOrder=DESC
```

### 2. Find Products Running Low
```
GET /inventory/low-stock?threshold=20
```

### 3. Search for Specific Product Inventory
```
GET /inventory?search=laptop
```

### 4. Get Products with Quantity Between 10-50
```
GET /inventory?minQuantity=10&maxQuantity=50
```

### 5. Customer Purchases Product
```
POST /inventory/1/buy
Body: { "quantity": 2 }
```

### 6. Restock Product
```
PATCH /inventory/1
Body: { "quantity": 200 }
```

### 7. View Recently Updated Inventory
```
GET /inventory?sortBy=updatedAt&sortOrder=DESC
```

---

## Key Features Summary

✅ **Automatic Status Management:** Status updates automatically based on quantity
✅ **Buy Functionality:** Any user can purchase if stock available
✅ **Stock Validation:** Prevents over-purchasing with clear error messages
✅ **Low Stock Alerts:** Identify products that need restocking
✅ **Comprehensive Filtering:** Search, status, quantity range
✅ **Multi-field Sorting:** Including createdAt and updatedAt
✅ **Pagination:** With complete metadata
✅ **Statistics Dashboard:** Total items, stock status breakdown
✅ **Role-Based Access:** Different permissions for different roles
✅ **Audit Trail:** CreatedBy and UpdatedBy tracking
✅ **Data Integrity:** Foreign keys, unique constraints
✅ **Performance:** Indexed fields for fast queries

---

## Setup Instructions

### 1. Add to app.module.ts

```typescript
import { InventoryModule } from './modules/inventory/inventory.module';

@Module({
  imports: [
    // ... existing modules
    InventoryModule,
  ],
})
```

### 2. Add Swagger Tag to main.ts

```typescript
.addTag('Inventory', 'Inventory management endpoints')
```

### 3. Run Migration

```bash
npm run build
npm run migration:run
```

### 4. Restart Application

```bash
npm run start:dev
```

---

## Complete! 🎉

Your inventory management system is ready with:
- Automatic stock status tracking
- Buy functionality for all users
- Complete CRUD with RBAC
- Advanced filtering and sorting
- Low stock alerts
- Statistics dashboard

Test at: `http://localhost:3000/api/docs`

Next steps: Cron Jobs for automated inventory tasks!