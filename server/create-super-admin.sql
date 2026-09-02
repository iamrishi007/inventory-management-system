-- SQL Script to create Super Admin manually in PostgreSQL
-- Run this script in your PostgreSQL database

-- First, generate a bcrypt hash for password: SuperAdmin@1234
-- You can use online tools or Node.js: bcrypt.hash('SuperAdmin@1234', 10)
-- Example hash: $2b$10$rOzJ8K8qK8qK8qK8qK8qK8qK8qK8qK8qK8qK8qK8qK8qK8qK8qK8qK8qK8qK8qK

-- Insert Super Admin
INSERT INTO users (email, password, role, "isActive", "createdBy", "createdAt", "updatedAt")
VALUES (
  'superadmin@example.com',
  '$2b$10$rOzJ8K8qK8qK8qK8qK8qK8qK8qK8qK8qK8qK8qK8qK8qK8qK8qK8qK8qK8qK8qK', -- Replace with actual bcrypt hash
  'super_admin',
  true,
  'system',
  NOW(),
  NOW()
)
ON CONFLICT (email) DO NOTHING;

-- Verify the super admin was created
SELECT id, email, role, "isActive", "createdAt" FROM users WHERE email = 'superadmin@example.com';

-- Note: To generate the bcrypt hash, you can:
-- 1. Use Node.js: const bcrypt = require('bcrypt'); bcrypt.hash('SuperAdmin@1234', 10).then(console.log);
-- 2. Use online bcrypt generator: https://bcrypt-generator.com/
-- 3. Run the seed script: npm run seed:super-admin
