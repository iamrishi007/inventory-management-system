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

      // Neon PostgreSQL connection URL
      url: configService.get<string>('DATABASE_URL'),

      // Neon requires SSL
      ssl: {
        rejectUnauthorized: false,
      },

      entities: [__dirname + '/../**/*.entity{.ts,.js}'],

      autoLoadEntities: true,

      synchronize:
        configService.get<string>('DB_SYNCHRONIZE') === 'true',

      logging:
        configService.get<string>('DB_LOGGING') === 'true',
    };
  },
};