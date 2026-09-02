/* eslint-disable @typescript-eslint/require-await */
import { ConfigModule, ConfigService } from '@nestjs/config';
import {
  TypeOrmModuleAsyncOptions,
  TypeOrmModuleOptions,
} from '@nestjs/typeorm';

export const typeOrmAsyncConfig: TypeOrmModuleAsyncOptions = {
  imports: [ConfigModule],
  inject: [ConfigService],

  useFactory: async (
    configService: ConfigService,
  ): Promise<TypeOrmModuleOptions> => {
    return {
      type: 'postgres',

      url: configService.get<string>('DATABASE_URL'),

      ssl: {
        rejectUnauthorized: false,
      },

      autoLoadEntities: true,

      synchronize:
        configService.get<string>('DB_SYNCHRONIZE') === 'true',

      logging:
        configService.get<string>('DB_LOGGING') === 'true',
    };
  },
};