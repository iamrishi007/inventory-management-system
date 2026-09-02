/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, Between, MoreThanOrEqual, LessThanOrEqual, Like } from 'typeorm';
import { Product } from './entities/product.entity';
import { CreateProductDto, UpdateProductDto, FilterProductDto, SortOrder, ProductSortBy } from './dto/product.dto';

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
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
  ) {}

  async create(createProductDto: CreateProductDto, createdBy: string): Promise<Product> {
    const product = this.productsRepository.create({
      ...createProductDto,
      createdBy,
    });

    return this.productsRepository.save(product);
  }

  async findAll(filterDto: FilterProductDto): Promise<PaginatedResult<Product>> {
    const {
      search,
      minPrice,
      maxPrice,
      sortBy = ProductSortBy.CREATED_AT,
      sortOrder = SortOrder.DESC,
      page = 1,
      limit = 10,
    } = filterDto;

    const query = this.productsRepository.createQueryBuilder('product');

    // Apply search filter
    if (search) {
      query.andWhere('product.name ILIKE :search', { search: `%${search}%` });
    }

    // Apply price filters
    if (minPrice !== undefined && maxPrice !== undefined) {
      query.andWhere('product.price BETWEEN :minPrice AND :maxPrice', {
        minPrice,
        maxPrice,
      });
    } else if (minPrice !== undefined) {
      query.andWhere('product.price >= :minPrice', { minPrice });
    } else if (maxPrice !== undefined) {
      query.andWhere('product.price <= :maxPrice', { maxPrice });
    }

    // Apply sorting
    query.orderBy(`product.${sortBy}`, sortOrder);

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

  async findOne(id: number): Promise<Product> {
    const product = await this.productsRepository.findOne({ where: { id } });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    return product;
  }

  async update(
    id: number,
    updateProductDto: UpdateProductDto,
    updatedBy: string,
  ): Promise<Product> {
    const product = await this.findOne(id);

    Object.assign(product, updateProductDto);
    product.updatedBy = updatedBy;

    return this.productsRepository.save(product);
  }

  async remove(id: number): Promise<void> {
    const product = await this.findOne(id);
    await this.productsRepository.remove(product);
  }

  async getProductStats() {
    const totalProducts = await this.productsRepository.count();
    
    const avgPrice = await this.productsRepository
      .createQueryBuilder('product')
      .select('AVG(product.price)', 'average')
      .getRawOne();

    const maxPrice = await this.productsRepository
      .createQueryBuilder('product')
      .select('MAX(product.price)', 'maximum')
      .getRawOne();

    const minPrice = await this.productsRepository
      .createQueryBuilder('product')
      .select('MIN(product.price)', 'minimum')
      .getRawOne();

    return {
      totalProducts,
      averagePrice: parseFloat(avgPrice?.average || 0).toFixed(2),
      maxPrice: parseFloat(maxPrice?.maximum || 0).toFixed(2),
      minPrice: parseFloat(minPrice?.minimum || 0).toFixed(2),
    };
  }
}