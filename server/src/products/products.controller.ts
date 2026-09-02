/* eslint-disable @typescript-eslint/no-unused-vars */

import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse as SwaggerResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { ProductsService } from './products.service';
import {
  CreateProductDto,
  UpdateProductDto,
  FilterProductDto,
} from './dto/product.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '../users/entities/user.entity';
import { ResponseUtil } from '../common/utils/response.util';
import { ResponseInterface } from '../common/interfaces/response.interface';

@ApiTags('Products')
@Controller('products')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new product',
    description: 'Only Super Admin and Admin can create products',
  })
  @SwaggerResponse({
    status: 201,
    description: 'Product created successfully',
  })
  @SwaggerResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  async create(
    @Body() createProductDto: CreateProductDto,
    @CurrentUser('role') role: UserRole,
  ): Promise<ResponseInterface<any>> {
    const product = await this.productsService.create(createProductDto, role);
    return ResponseUtil.success(product, 'Product created successfully', 201);
  }

  @Get()
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.ADMIN,
    UserRole.MANAGER,
    UserRole.STAFF,
    UserRole.USER,
  )
  @ApiOperation({
    summary: 'Get all products with filtering, sorting, and pagination',
    description: 'All roles can view products',
  })
  @SwaggerResponse({
    status: 200,
    description: 'Products retrieved successfully',
  })
  async findAll(
    @Query() filterDto: FilterProductDto,
  ): Promise<ResponseInterface<any>> {
    const result = await this.productsService.findAll(filterDto);
    return ResponseUtil.success(result, 'Products retrieved successfully', 200);
  }

  @Get('stats')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({
    summary: 'Get product statistics',
    description: 'Get total count, average price, min and max prices',
  })
  @SwaggerResponse({
    status: 200,
    description: 'Statistics retrieved successfully',
  })
  async getStats(): Promise<ResponseInterface<any>> {
    const stats = await this.productsService.getProductStats();
    return ResponseUtil.success(
      stats,
      'Product statistics retrieved successfully',
      200,
    );
  }

  @Get(':id')
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.ADMIN,
    UserRole.MANAGER,
    UserRole.STAFF,
    UserRole.USER,
  )
  @ApiOperation({
    summary: 'Get product by ID',
    description: 'All roles can view a single product',
  })
  @SwaggerResponse({
    status: 200,
    description: 'Product retrieved successfully',
  })
  @SwaggerResponse({
    status: 404,
    description: 'Product not found',
  })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ResponseInterface<any>> {
    const product = await this.productsService.findOne(id);
    return ResponseUtil.success(product, 'Product retrieved successfully', 200);
  }

  @Patch(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({
    summary: 'Update a product',
    description: 'Super Admin, Admin, and Manager can update products',
  })
  @SwaggerResponse({
    status: 200,
    description: 'Product updated successfully',
  })
  @SwaggerResponse({
    status: 404,
    description: 'Product not found',
  })
  @SwaggerResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProductDto: UpdateProductDto,
    @CurrentUser('role') role: UserRole,
  ): Promise<ResponseInterface<any>> {
    const product = await this.productsService.update(
      id,
      updateProductDto,
      role,
    );
    return ResponseUtil.success(product, 'Product updated successfully', 200);
  }

  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete a product',
    description: 'Only Super Admin and Admin can delete products',
  })
  @SwaggerResponse({
    status: 200,
    description: 'Product deleted successfully',
  })
  @SwaggerResponse({
    status: 404,
    description: 'Product not found',
  })
  @SwaggerResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  async remove(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ResponseInterface<null>> {
    await this.productsService.remove(id);
    return ResponseUtil.success<null>(
      null,
      'Product deleted successfully',
      200,
    );
  }
}
