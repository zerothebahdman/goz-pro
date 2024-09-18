import { Controller, Get, Post, Body, Patch, Param, Delete, Inject } from '@nestjs/common';
import { DeliveriesService } from './deliveries.service';
import TYPES from '../config/inversify.types';

@Controller('deliveries')
export class DeliveriesController {
  @Inject(TYPES.DeliveryService) private readonly deliveries: DeliveriesService;

  @Post()
  create(@Body() createDeliveryDto: CreateDeliveryDto) {
    return this.deliveriesService.create(createDeliveryDto);
  }

  @Get()
  findAll() {
    return this.deliveriesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.deliveriesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDeliveryDto: UpdateDeliveryDto) {
    return this.deliveriesService.update(+id, updateDeliveryDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.deliveriesService.remove(+id);
  }
}
