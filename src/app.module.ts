import { ConfigModule, ConfigService } from '@nestjs/config';
import { Delivery, DeliverySchema } from './deliveries';
import { Package, PackageSchema } from './packages';

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
        uri: configService.getOrThrow('database.mongo_uri'),
      }),
      inject: [ConfigService],
    }),
    MongooseModule.forFeature([
      { name: Delivery.name, schema: DeliverySchema },
      { name: Package.name, schema: PackageSchema },
    ]),
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
