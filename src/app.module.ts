import { ConfigModule, ConfigService } from '@nestjs/config';
import { Delivery, DeliverySchema } from './deliveries';
import { Package, PackageSchema } from './packages';

import { DeliveriesController } from './deliveries/delivery.controller';
import { DeliveryGateway } from './deliveries/delivery.gateway';
import { DeliveryService } from './deliveries/delivery.service';
import LIB_TYPES from './common/inversify';
import { LoggerProvider } from './common/log';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PackagesController } from './packages/packages.controller';
import { PackagesService } from './packages/packages.service';
import { Queue } from './web-socket/queue';
import { RedisProvider } from './config/redis';
import { SocketIOProxy } from './web-socket/ws.gateway';
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
    DeliveryGateway,
    LoggerProvider(),
    RedisProvider(),
    { provide: LIB_TYPES.Env, useValue: ConfigService },
    { provide: TYPES.DeliveryService, useClass: DeliveryService },
    { provide: TYPES.PackageService, useClass: PackagesService },
    { provide: TYPES.SocketIO, useClass: SocketIOProxy },
    { provide: LIB_TYPES.Queue, useClass: Queue },
  ],
})
export class AppModule {}
