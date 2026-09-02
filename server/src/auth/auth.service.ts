/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prettier/prettier */
import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { UsersService } from '../users/users.service';
import {
  RegisterDto,
  LoginDto,
  CreateUserByAdminDto,
} from './dto/auth.dto';

import { User, UserRole } from '../users/entities/user.entity';
import { UserResponseDto } from '../users/dto/user-response.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  /* ================= REGISTER ================= */

  async register(
    registerDto: RegisterDto,
  ): Promise<{ user: UserResponseDto; accessToken: string }> {
    const existingUser = await this.usersService.findByEmail(
      registerDto.email,
    );

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const user = await this.usersService.create({
      ...registerDto,
      role: UserRole.USER,
      isActive: true,
    });

    const { password, ...userWithoutPassword } = user;
    const accessToken = this.generateToken(user);

    return {
      user: userWithoutPassword as UserResponseDto,
      accessToken,
    };
  }

  /* ================= LOGIN ================= */

  async login(
    loginDto: LoginDto,
  ): Promise<{ user: UserResponseDto; accessToken: string }> {
    const user = await this.usersService.findByEmail(loginDto.email);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await user.validatePassword(
      loginDto.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    const { password, ...userWithoutPassword } = user;
    const accessToken = this.generateToken(user);

    return {
      user: userWithoutPassword as UserResponseDto,
      accessToken,
    };
  }

  /* ================= SUPER ADMIN SETUP ================= */

  async setupSuperAdmin(): Promise<{
    user: UserResponseDto;
    accessToken: string;
  }> {
    const superAdminEmail = 'superadmin@example.com';

    const existingSuperAdmin =
      await this.usersService.findByEmail(superAdminEmail);

    if (existingSuperAdmin) {
      throw new ConflictException('Super admin already exists');
    }

    const user = await this.usersService.create(
      {
        email: superAdminEmail,
        password: 'SuperAdmin@1234',
        role: UserRole.SUPER_ADMIN,
        isActive: true,
      },
      'system',
    );

    const { password, ...userWithoutPassword } = user;
    const accessToken = this.generateToken(user);

    return {
      user: userWithoutPassword as UserResponseDto,
      accessToken,
    };
  }

  /* ================= ADMIN CREATES USER ================= */

  async createUserByAdmin(
    createUserDto: CreateUserByAdminDto,
    adminId: number,
  ): Promise<UserResponseDto> {
    const admin = await this.usersService.findById(adminId);

    const user = await this.usersService.create(
      createUserDto,
      admin.email,
    );

    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword as UserResponseDto;
  }

  /* ================= JWT ================= */

  private generateToken(user: User): string {
    const payload = {
      email: user.email,
      sub: user.id,
      role: user.role,
    };

    return this.jwtService.sign(payload);
  }
}
