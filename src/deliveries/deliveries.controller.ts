import { Body, Controller, Delete, Get, Inject, Param, Patch, Post } from '@nestjs/common';

import { DeliveriesService } from './deliveries.service';
import TYPES from '../config/inversify.types';

@Controller('deliveries')
export class DeliveriesController {
  @Inject(TYPES.DeliveryService) private readonly deliveries: DeliveriesService;
}
