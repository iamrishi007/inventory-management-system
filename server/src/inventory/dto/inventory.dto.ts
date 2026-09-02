/* eslint-disable @typescript-eslint/no-unsafe-return */
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsPositive,
  IsOptional,
  Min,
  IsEnum,
  IsString,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { InventoryStatus } from '../entities/inventory.entity';

/* ============================
   CREATE INVENTORY DTO
============================ */

export class CreateInventoryDto {
  @ApiProperty({ example: 1, description: 'Product ID' })
  @IsInt({ message: 'Product ID must be an integer' })
  @IsPositive({ message: 'Product ID must be a positive number' })
  @IsNotEmpty({ message: 'Product ID is required' })
  productId: number;

  @ApiProperty({ example: 100, description: 'Initial quantity' })
  @IsInt({ message: 'Quantity must be an integer' })
  @Min(0, { message: 'Quantity cannot be negative' })
  @IsNotEmpty({ message: 'Quantity is required' })
  quantity: number;
}

/* ============================
   UPDATE INVENTORY DTO
============================ */

export class UpdateInventoryDto {
  @ApiPropertyOptional({ example: 150, description: 'Updated quantity' })
  @IsOptional()
  @IsInt({ message: 'Quantity must be an integer' })
  @Min(0, { message: 'Quantity cannot be negative' })
  quantity?: number;
}

/* ============================
   SORT & ORDER ENUMS
============================ */

export enum InventorySortBy {
  ID = 'id',
  PRODUCT_NAME = 'product.name',
  QUANTITY = 'quantity',
  STATUS = 'status',
  CREATED_AT = 'createdAt',
  UPDATED_AT = 'updatedAt',
}

export enum SortOrder {
  ASC = 'ASC',
  DESC = 'DESC',
}

/* ============================
   FILTER INVENTORY DTO
============================ */

export class FilterInventoryDto {
  @ApiPropertyOptional({
    example: 'Laptop',
    description: 'Search by product name',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    example: InventoryStatus.IN_STOCK,
    enum: InventoryStatus,
    description: 'Filter by inventory status',
  })
  @IsOptional()
  @Transform(({ value }) => (value === '' ? undefined : value))
  @IsEnum(InventoryStatus, { message: 'Invalid status' })
  status?: InventoryStatus;

  @ApiPropertyOptional({ example: 10, description: 'Minimum quantity filter' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  minQuantity?: number;

  @ApiPropertyOptional({ example: 100, description: 'Maximum quantity filter' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  maxQuantity?: number;

  @ApiPropertyOptional({
    example: InventorySortBy.QUANTITY,
    enum: InventorySortBy,
    description: 'Sort by field',
  })
  @IsOptional()
  @IsEnum(InventorySortBy, { message: 'Invalid sort field' })
  sortBy?: InventorySortBy;

  @ApiPropertyOptional({
    example: SortOrder.DESC,
    enum: SortOrder,
    description: 'Sort order',
  })
  @IsOptional()
  @IsEnum(SortOrder, { message: 'Sort order must be ASC or DESC' })
  sortOrder?: SortOrder;

  @ApiPropertyOptional({
    example: 1,
    description: 'Page number',
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1, { message: 'Page must be at least 1' })
  page?: number;

  @ApiPropertyOptional({
    example: 10,
    description: 'Items per page',
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1, { message: 'Limit must be at least 1' })
  limit?: number;
}
