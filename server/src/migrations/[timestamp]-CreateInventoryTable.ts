/* eslint-disable prettier/prettier */
import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export class CreateInventoryTable1234567890125 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'inventory',
        columns: [
          {
            name: 'id',
            type: 'integer',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'productId',
            type: 'integer',
            isNullable: false,
          },
          {
            name: 'quantity',
            type: 'integer',
            default: 0,
            isNullable: false,
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['in_stock', 'out_of_stock'],
            default: "'out_of_stock'",
            isNullable: false,
          },
          {
            name: 'createdBy',
            type: 'varchar',
            length: '50',
            isNullable: false,
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

    // Create foreign key constraint
    const foreignKey = new TableForeignKey({
      columnNames: ['productId'],
      referencedColumnNames: ['id'],
      referencedTableName: 'products',
      onDelete: 'CASCADE',
    });

    await queryRunner.createForeignKey('inventory', foreignKey);

    // Create indexes for better query performance
    await queryRunner.query(
      `CREATE INDEX "IDX_INVENTORY_PRODUCT_ID" ON "inventory" ("productId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_INVENTORY_STATUS" ON "inventory" ("status")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_INVENTORY_QUANTITY" ON "inventory" ("quantity")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_INVENTORY_QUANTITY"`);
    await queryRunner.query(`DROP INDEX "IDX_INVENTORY_STATUS"`);
    await queryRunner.query(`DROP INDEX "IDX_INVENTORY_PRODUCT_ID"`);
    
    // Drop foreign key
    const table = await queryRunner.getTable('inventory');
    if (table) {
      const foreignKey = table.foreignKeys.find(
        (fk) => fk.columnNames.indexOf('productId') !== -1,
      );
      if (foreignKey) {
        await queryRunner.dropForeignKey('inventory', foreignKey);
      }
    }
    
    await queryRunner.dropTable('inventory');
  }
}
