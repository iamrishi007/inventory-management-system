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
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

import { UsersService } from './users.service';
import { CreateUserByAdminDto, UpdateUserDto } from '../auth/dto/auth.dto';
import { FilterUserDto } from './dto/filter-user.dto';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

import { User, UserRole } from './entities/user.entity';
import { ResponseUtil } from '../common/utils/response.util';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /* ================= GET ALL USERS ================= */
  /* Admin / Manager only + Filters + Pagination */

  @Get()
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({
    summary: 'Get all users with filtering and pagination',
  })
  @ApiResponse({ status: 200, description: 'Users retrieved successfully' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  })
  async findAll(@Query() filterDto: FilterUserDto) {
    const result = await this.usersService.findAll(filterDto);
    return ResponseUtil.success(result, 'Users retrieved successfully', 200);
  }

  /* ================= GET SINGLE USER ================= */
  /* User can see own profile, Admin/Manager can see anyone */

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiResponse({ status: 200, description: 'User retrieved successfully' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() currentUser: User,
  ) {
    const isAdmin =
      currentUser.role === UserRole.SUPER_ADMIN ||
      currentUser.role === UserRole.ADMIN ||
      currentUser.role === UserRole.MANAGER;

    if (currentUser.id !== id && !isAdmin) {
      return ResponseUtil.error('Access denied', 403);
    }

    const user = await this.usersService.findById(id);
    const { password, ...userWithoutPassword } = user;

    return ResponseUtil.success(
      userWithoutPassword,
      'User retrieved successfully',
      200,
    );
  }

  /* ================= CREATE USER ================= */
  /* Super Admin / Admin only */

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a new user (Admin only)' })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  async create(
    @Body() createUserDto: CreateUserByAdminDto,
    @CurrentUser() currentUser: User,
  ) {
    const user = await this.usersService.create(
      createUserDto,
      currentUser.email,
    );

    const { password, ...userWithoutPassword } = user;

    return ResponseUtil.success(
      userWithoutPassword,
      'User created successfully',
      201,
    );
  }

  /* ================= UPDATE USER ================= */
  /* Super Admin / Admin only */

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: 'Update user (Admin only)' })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
    @CurrentUser() currentUser: User,
  ) {
    const user = await this.usersService.update(
      id,
      updateUserDto,
      currentUser.email,
    );

    const { password, ...userWithoutPassword } = user;

    return ResponseUtil.success(
      userWithoutPassword,
      'User updated successfully',
      200,
    );
  }

  /* ================= DELETE USER ================= */
  /* Super Admin / Admin only */

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete user (Admin only)' })
  @ApiResponse({ status: 200, description: 'User deleted successfully' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.usersService.remove(id);
    return ResponseUtil.success(null, 'User deleted successfully', 200);
  }

  /* ================= DEACTIVATE USER ================= */

  @Patch(':id/deactivate')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: 'Deactivate user (Admin only)' })
  async deactivate(@Param('id', ParseIntPipe) id: number) {
    const user = await this.usersService.deactivate(id);
    const { password, ...userWithoutPassword } = user;

    return ResponseUtil.success(
      userWithoutPassword,
      'User deactivated successfully',
      200,
    );
  }

  /* ================= ACTIVATE USER ================= */

  @Patch(':id/activate')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: 'Activate user (Admin only)' })
  async activate(@Param('id', ParseIntPipe) id: number) {
    const user = await this.usersService.activate(id);
    const { password, ...userWithoutPassword } = user;

    return ResponseUtil.success(
      userWithoutPassword,
      'User activated successfully',
      200,
    );
  }
}
