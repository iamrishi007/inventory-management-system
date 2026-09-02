/* eslint-disable @typescript-eslint/no-unsafe-return */

import { IsOptional, IsEnum, IsInt, Min } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { UserRole } from '../entities/user.entity';

export class FilterUserDto {
  @IsOptional()
  search?: string;

  /* ============================
     ROLE FILTER (FIXED)
     Handles: role=, role=admin, role=user
  ============================ */
  @IsOptional()
  @Transform(({ value }) => {
    if (value === undefined || value === null || value === '') {
      return undefined;
    }
    return value;
  })
  @IsEnum(UserRole, {
    message: 'role must be one of: super_admin, admin, manager, staff, user',
  })
  role?: UserRole;

  /* ============================
     ACTIVE STATUS FILTER
     Handles: true / false / 1 / 0 / "true" / "false"
  ============================ */
  @IsOptional()
  @Transform(({ value }) => {
    if (value === undefined || value === null || value === '') {
      return undefined;
    }

    if (typeof value === 'boolean') {
      return value;
    }

    if (typeof value === 'string') {
      const normalized = value.toLowerCase().trim();

      // IMPORTANT: check false first
      if (normalized === 'false' || normalized === '0') {
        return false;
      }

      if (normalized === 'true' || normalized === '1') {
        return true;
      }

      return undefined;
    }

    if (typeof value === 'number') {
      return value === 1;
    }

    return undefined;
  })
  isActive?: boolean;

  /* ============================
     PAGINATION
  ============================ */
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;
}
