/* eslint-disable prettier/prettier */
import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateUsersTable1234567890123 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'users',
        columns: [
          {
            name: 'id',
            type: 'integer',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'email',
            type: 'varchar',
            length: '100',
            isUnique: true,
            isNullable: false,
          },
          {
            name: 'password',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'role',
            type: 'enum',
            enum: ['super_admin', 'admin', 'manager', 'staff', 'user'],
            default: "'user'",
            isNullable: false,
          },
          {
            name: 'isActive',
            type: 'boolean',
            default: true,
            isNullable: false,
          },
          {
            name: 'createdBy',
            type: 'varchar',
            length: '50',
            isNullable: true,
          },
          {
            name: 'updatedBy',
            type: 'varchar',
            length: '50',
            isNullable: true,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
        ],
      }),
      true,
    );

    // Indexes
    await queryRunner.query(
      `CREATE INDEX "IDX_USER_EMAIL" ON "users" ("email")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_USER_ROLE" ON "users" ("role")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_USER_ACTIVE" ON "users" ("isActive")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_USER_ACTIVE"`);
    await queryRunner.query(`DROP INDEX "IDX_USER_ROLE"`);
    await queryRunner.query(`DROP INDEX "IDX_USER_EMAIL"`);
    await queryRunner.dropTable('users');
  }
}
