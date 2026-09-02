import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateProductsTable1234567890124 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'products',
        columns: [
          {
            name: 'id',
            type: 'integer',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'name',
            type: 'varchar',
            length: '200',
            isNullable: false,
          },
          {
            name: 'price',
            type: 'decimal',
            precision: 10,
            scale: 2,
            isNullable: false,
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'createdBy',
            type: 'varchar',
            length: '50',
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
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    await queryRunner.query(
      `CREATE INDEX "IDX_PRODUCT_NAME" ON "products" ("name")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_PRODUCT_PRICE" ON "products" ("price")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_PRODUCT_CREATED_AT" ON "products" ("createdAt")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_PRODUCT_CREATED_AT"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_PRODUCT_PRICE"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_PRODUCT_NAME"`);

    await queryRunner.dropTable('products', true);
  }
}
