/* eslint-disable prettier/prettier */

import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User, UserRole } from './entities/user.entity';

import { CreateUserByAdminDto, UpdateUserDto } from '../auth/dto/auth.dto';

import { FilterUserDto } from './dto/filter-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  /* ================= FIND BY EMAIL ================= */

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { email },
    });
  }

  /* ================= FIND BY ID ================= */

  async findById(id: number): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  /* ================= CREATE ================= */

  async create(
    createUserDto: CreateUserByAdminDto,
    createdBy?: string,
  ): Promise<User> {
    const existingUser = await this.findByEmail(createUserDto.email);

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const user = this.usersRepository.create({
      ...createUserDto,

      // If role is provided, preserve it.
      // Otherwise default to normal USER.
      role: createUserDto.role ?? UserRole.USER,

      createdBy: createdBy ?? null,

      isActive: createUserDto.isActive ?? true,
    });

    return this.usersRepository.save(user);
  }

  /* ================= FIND ALL ================= */

  async findAll(filterDto: FilterUserDto) {
    const { search, role, isActive, page = 1, limit = 10 } = filterDto;

    const query = this.usersRepository.createQueryBuilder('user');

    if (search) {
      query.andWhere('user.email ILIKE :search', {
        search: `%${search}%`,
      });
    }

    if (role) {
      query.andWhere('user.role = :role', {
        role,
      });
    }

    if (typeof isActive === 'boolean') {
      query.andWhere('user.isActive = :isActive', {
        isActive,
      });
    }

    query.skip((page - 1) * limit).take(limit);

    query.select([
      'user.id',
      'user.email',
      'user.role',
      'user.isActive',
      'user.createdBy',
      'user.updatedBy',
      'user.createdAt',
      'user.updatedAt',
    ]);

    const [data, total] = await query.getManyAndCount();

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
        hasPreviousPage: page > 1,
      },
    };
  }

  /* ================= UPDATE ================= */

  async update(
    id: number,
    updateUserDto: UpdateUserDto,
    updatedBy?: string,
  ): Promise<User> {
    const user = await this.findById(id);

    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingUser = await this.findByEmail(updateUserDto.email);

      if (existingUser) {
        throw new ConflictException('User with this email already exists');
      }
    }

    Object.assign(user, updateUserDto, {
      updatedBy,
    });

    return this.usersRepository.save(user);
  }

  /* ================= DELETE ================= */

  async remove(id: number): Promise<void> {
    const user = await this.findById(id);

    await this.usersRepository.remove(user);
  }

  /* ================= DEACTIVATE ================= */

  async deactivate(id: number): Promise<User> {
    const user = await this.findById(id);

    user.isActive = false;

    return this.usersRepository.save(user);
  }

  /* ================= ACTIVATE ================= */

  async activate(id: number): Promise<User> {
    const user = await this.findById(id);

    user.isActive = true;

    return this.usersRepository.save(user);
  }
}
