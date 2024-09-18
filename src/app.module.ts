import { ConfigModule, ConfigService } from '@nestjs/config';

import { DeliveriesController } from './deliveries/deliveries.controller';
import { DeliveriesService } from './deliveries/deliveries.service';
import LIB_TYPES from './common/inversify';
import { LoggerProvider } from './common/log';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PackagesController } from './packages/packages.controller';
import { PackagesService } from './packages/packages.service';
import { RedisProvider } from './config/redis';
import TYPES from './config/inversify.types';
import env from './config/env';

@Module({
  imports: [
    ConfigModule.forRoot({ envFilePath: '../.env', isGlobal: true, load: [env] }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get('DATABASE_URL'),
      }),
      inject: [ConfigService],
    }),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  controllers: [PackagesController, DeliveriesController],
  providers: [
    LoggerProvider(),
    RedisProvider(),
    { provide: LIB_TYPES.Env, useValue: ConfigService },
    { provide: TYPES.DeliveryService, useClass: DeliveriesService },
    { provide: TYPES.PackageService, useClass: PackagesService },
  ],
})
export class AppModule {}
