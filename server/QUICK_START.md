# Quick Start Guide

## Prerequisites
- Node.js (v18 or higher)
- PostgreSQL database
- npm or yarn

## Setup Steps

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Create a `.env` file in the root directory and copy the contents from `ENV_TEMPLATE.txt`:

```env
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_DATABASE=smart_inventory
DB_SYNCHRONIZE=false
DB_LOGGING=false
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=24h
CORS_ORIGIN=http://localhost:3000
```

**Important:** Change the database credentials and JWT_SECRET to secure values!

### 3. Setup Database
Make sure PostgreSQL is running and create the database:
```sql
CREATE DATABASE smart_inventory;
```

### 4. Run Migrations (if needed)
```bash
npm run migration:run
```

### 5. Start the Server
```bash
# Development mode (with hot reload)
npm run start:dev

# Production mode
npm run start:prod
```

### 6. Access the API
- **API Base URL:** `http://localhost:3000/api`
- **Swagger Documentation:** `http://localhost:3000/api/docs`

## Testing with Postman

### Option 1: Import Collection
1. Open Postman
2. Click "Import" button
3. Select `postman_collection.json`
4. Import `postman_environment.json` as an environment
5. Select the imported environment from the dropdown

### Option 2: Manual Setup
1. Create a new environment in Postman
2. Add variables:
   - `base_url`: `http://localhost:3000/api`
   - `token`: (leave empty)
3. Create requests manually using the documentation in `API_DOCUMENTATION.md`

### Testing Flow
1. **Register** a new user (or **Login** if already registered)
2. The token will be automatically saved to the `token` variable (if using the collection)
3. Use the token in Authorization header for protected endpoints

## API Endpoints Summary

### Public Endpoints
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Protected Endpoints (Require JWT Token)
- `GET /api/auth/profile` - Get current user profile
- `POST /api/auth/create-user` - Create user (Admin only)
- `GET /api/users` - Get all users (Admin/Manager only)
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create user (Admin only)
- `PATCH /api/users/:id` - Update user (Admin only)
- `DELETE /api/users/:id` - Delete user (Admin only)
- `PATCH /api/users/:id/deactivate` - Deactivate user (Admin only)
- `PATCH /api/users/:id/activate` - Activate user (Admin only)

## Troubleshooting

### Database Connection Error
- Verify PostgreSQL is running
- Check database credentials in `.env`
- Ensure database exists

### JWT Token Errors
- Make sure `JWT_SECRET` is set in `.env`
- Token expires after 24 hours (default)
- Login again to get a new token

### Port Already in Use
- Change `PORT` in `.env` file
- Or stop the process using port 3000

## Next Steps
- Read `API_DOCUMENTATION.md` for detailed API documentation
- Check Swagger UI at `http://localhost:3000/api/docs` for interactive API testing


