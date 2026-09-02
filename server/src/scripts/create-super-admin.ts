import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from '../users/entities/user.entity';

config();

async function createSuperAdmin() {
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE || 'smart_inventory',
    entities: [User],
    synchronize: false,
  });

  try {
    await dataSource.initialize();
    console.log('✅ Database connected');

    const userRepository = dataSource.getRepository(User);

    // Check if super admin already exists
    const existingSuperAdmin = await userRepository.findOne({
      where: { email: 'superadmin@example.com' },
    });

    if (existingSuperAdmin) {
      console.log('⚠️  Super admin already exists');
      await dataSource.destroy();
      return;
    }

    // Create super admin
    const hashedPassword = await bcrypt.hash('SuperAdmin@1234', 10);
    const superAdmin = userRepository.create({
      email: 'superadmin@example.com',
      password: hashedPassword,
      role: UserRole.SUPER_ADMIN,
      isActive: true,
      createdBy: 'system',
    });

    await userRepository.save(superAdmin);
    console.log('✅ Super admin created successfully!');
    console.log('📧 Email: superadmin@example.com');
    console.log('🔑 Password: SuperAdmin@1234');
    console.log('👤 Role: super_admin');

    await dataSource.destroy();
  } catch (error) {
    console.error('❌ Error creating super admin:', error);
    await dataSource.destroy();
    process.exit(1);
  }
}

createSuperAdmin();

//http://localhost:3000/api/auth/setup-super-admin
