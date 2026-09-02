/* eslint-disable prettier/prettier */
 

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

import { InventoryService } from './inventory.service';
import {
  CreateInventoryDto,
  UpdateInventoryDto,
  FilterInventoryDto,
} from './dto/inventory.dto';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '../users/entities/user.entity';

import { ResponseUtil } from '../common/utils/response.util';
import type { ResponseInterface } from '../common/interfaces/response.interface';

@Controller('inventory')
@UseGuards(JwtAuthGuard, RolesGuard)
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Post()
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createInventoryDto: CreateInventoryDto,
    @CurrentUser('role') role: UserRole,
  ): Promise<ResponseInterface<any>> {
    const inventory = await this.inventoryService.create(
      createInventoryDto,
      role,
    );

    return ResponseUtil.success(
      inventory,
      'Inventory created successfully',
      201,
    );
  }

  @Get()
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.ADMIN,
    UserRole.MANAGER,
    UserRole.STAFF,
    UserRole.USER
  )
  async findAll(
    @Query() filterDto: FilterInventoryDto,
  ): Promise<ResponseInterface<any>> {
    const result = await this.inventoryService.findAll(filterDto);

    return ResponseUtil.success(
      result,
      'Inventory retrieved successfully',
      200,
    );
  }

  @Get('stats')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER)
  async getStats(  ): Promise<ResponseInterface<any>> {
    const stats = await this.inventoryService.getInventoryStats();

    return ResponseUtil.success(
      stats,
      'Inventory statistics retrieved successfully',
      200,
    );
  }

  @Get('low-stock')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER)
  async getLowStockItems(
    @Query('threshold', new ParseIntPipe({ optional: true }))
    threshold?: number,
  ): Promise<ResponseInterface<any>> {
    const items = await this.inventoryService.getLowStockItems(threshold);

    return ResponseUtil.success(
      items,
      'Low stock items retrieved successfully',
      200,
    );
  }

  @Get('product/:productId')
  async findByProductId(
    @Param('productId', ParseIntPipe) productId: number,
  ): Promise<ResponseInterface<any>> {
    const inventory =
      await this.inventoryService.findByProductId(productId);

    return ResponseUtil.success(
      inventory,
      'Inventory retrieved successfully',
      200,
    );
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ResponseInterface<any>> {
    const inventory = await this.inventoryService.findOne(id);

    return ResponseUtil.success(
      inventory,
      'Inventory retrieved successfully',
      200,
    );
  }

  @Patch(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateInventoryDto: UpdateInventoryDto,
    @CurrentUser('role') role: UserRole,
  ): Promise<ResponseInterface<any>> {
    const inventory = await this.inventoryService.update(
      id,
      updateInventoryDto,
      role,
    );

    return ResponseUtil.success(
      inventory,
      'Inventory updated successfully',
      200,
    );
  }

  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  async remove(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ResponseInterface<null>> {
    await this.inventoryService.remove(id);

    return ResponseUtil.success(
      null,
      'Inventory deleted successfully',
      200,
    );
  }
}
