/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Inventory, InventoryStatus } from './entities/inventory.entity';
import {
  CreateInventoryDto,
  UpdateInventoryDto,
  FilterInventoryDto,
  InventorySortBy,
  SortOrder,
} from './dto/inventory.dto';
import { ProductsService } from '../products/products.service';

export interface PaginatedResult<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(Inventory)
    private inventoryRepository: Repository<Inventory>,
    private productsService: ProductsService,
  ) {}

  private updateInventoryStatus(inventory: Inventory): void {
    inventory.status =
      inventory.quantity > 0
        ? InventoryStatus.IN_STOCK
        : InventoryStatus.OUT_OF_STOCK;
  }

  async create(
    createInventoryDto: CreateInventoryDto,
    createdBy: string,
  ): Promise<Inventory> {
    const { productId, quantity } = createInventoryDto;

    // Check if product exists
    await this.productsService.findOne(productId);

    // Check if inventory already exists for this product
    const existingInventory = await this.inventoryRepository.findOne({
      where: { productId },
    });

    if (existingInventory) {
      throw new ConflictException(
        `Inventory already exists for product ID ${productId}`,
      );
    }

    const inventory = this.inventoryRepository.create({
      productId,
      quantity,
      createdBy,
    });

    this.updateInventoryStatus(inventory);

    return this.inventoryRepository.save(inventory);
  }

  async findAll(
    filterDto: FilterInventoryDto,
  ): Promise<PaginatedResult<Inventory>> {
    const {
      search,
      status,
      minQuantity,
      maxQuantity,
      sortBy = InventorySortBy.CREATED_AT,
      sortOrder = SortOrder.DESC,
      page = 1,
      limit = 10,
    } = filterDto;

    const query = this.inventoryRepository
      .createQueryBuilder('inventory')
      .leftJoinAndSelect('inventory.product', 'product');

    // Apply search filter
    if (search) {
      query.andWhere('product.name ILIKE :search', { search: `%${search}%` });
    }

    // Apply status filter
    if (status) {
      query.andWhere('inventory.status = :status', { status });
    }

    // Apply quantity filters
    if (minQuantity !== undefined && maxQuantity !== undefined) {
      query.andWhere(
        'inventory.quantity BETWEEN :minQuantity AND :maxQuantity',
        {
          minQuantity,
          maxQuantity,
        },
      );
    } else if (minQuantity !== undefined) {
      query.andWhere('inventory.quantity >= :minQuantity', { minQuantity });
    } else if (maxQuantity !== undefined) {
      query.andWhere('inventory.quantity <= :maxQuantity', { maxQuantity });
    }

    // Apply sorting
    const SORT_MAP: Record<InventorySortBy, string> = {
      [InventorySortBy.ID]: 'inventory.id',
      [InventorySortBy.PRODUCT_NAME]: 'product.name',
      [InventorySortBy.QUANTITY]: 'inventory.quantity',
      [InventorySortBy.STATUS]: 'inventory.status',
      [InventorySortBy.CREATED_AT]: 'inventory.createdAt',
      [InventorySortBy.UPDATED_AT]: 'inventory.updatedAt',
    };

    query.orderBy(SORT_MAP[sortBy] ?? 'inventory.createdAt', sortOrder);

    // Apply pagination
    const skip = (page - 1) * limit;
    query.skip(skip).take(limit);

    // Execute query
    const [data, total] = await query.getManyAndCount();

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  async findOne(id: number): Promise<Inventory> {
    const inventory = await this.inventoryRepository.findOne({
      where: { id },
      relations: ['product'],
    });

    if (!inventory) {
      throw new NotFoundException(`Inventory with ID ${id} not found`);
    }

    return inventory;
  }

  async findByProductId(productId: number): Promise<Inventory> {
    const inventory = await this.inventoryRepository.findOne({
      where: { productId },
      relations: ['product'],
    });

    if (!inventory) {
      throw new NotFoundException(
        `Inventory for product ID ${productId} not found`,
      );
    }

    return inventory;
  }

  async update(
    id: number,
    updateInventoryDto: UpdateInventoryDto,
    updatedBy: string,
  ): Promise<Inventory> {
    const inventory = await this.findOne(id);

    if (updateInventoryDto.quantity !== undefined) {
      inventory.quantity = updateInventoryDto.quantity;
    }

    inventory.updatedBy = updatedBy;
    this.updateInventoryStatus(inventory);

    return this.inventoryRepository.save(inventory);
  }

  async remove(id: number): Promise<void> {
    const inventory = await this.findOne(id);
    await this.inventoryRepository.remove(inventory);
  }

  async getInventoryStats() {
    const totalItems = await this.inventoryRepository.count();

    const inStockCount = await this.inventoryRepository.count({
      where: { status: InventoryStatus.IN_STOCK },
    });

    const outOfStockCount = await this.inventoryRepository.count({
      where: { status: InventoryStatus.OUT_OF_STOCK },
    });

    const totalQuantity = await this.inventoryRepository
      .createQueryBuilder('inventory')
      .select('SUM(inventory.quantity)', 'total')
      .getRawOne();

    const avgQuantity = await this.inventoryRepository
      .createQueryBuilder('inventory')
      .select('AVG(inventory.quantity)', 'average')
      .getRawOne();

    return {
      totalItems,
      inStockItems: inStockCount,
      outOfStockItems: outOfStockCount,
      totalQuantity: parseInt(totalQuantity?.total || 0),
      averageQuantity: parseFloat(avgQuantity?.average || 0).toFixed(2),
    };
  }

  async getLowStockItems(threshold: number = 20): Promise<Inventory[]> {
    return this.inventoryRepository
      .createQueryBuilder('inventory')
      .leftJoinAndSelect('inventory.product', 'product')
      .where('inventory.quantity > 0 AND inventory.quantity <= :threshold', {
        threshold,
      })
      .orderBy('inventory.quantity', 'ASC')
      .getMany();
  }
}
