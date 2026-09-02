import { UserRole } from '../entities/user.entity';

export class UserResponseDto {
  id: number;
  email: string;
  role: UserRole;
  isActive: boolean;
  createdBy?: string;
  updatedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}
