import { MessageBody, SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';

import { Inject, UseInterceptors } from '@nestjs/common';
import { WSLogger } from '../middlewares/ws.logger';
import TYPES from '../config/inversify.types';
import { SocketIOProxy } from '../web-socket/ws.gateway';
import { UpdateDeliveryLocationDTO, UpdateDeliveryStatusDTO } from './delivery.validator';
import { DeliveryService } from './delivery.service';
import { DeliveryLocation } from './schema/delivery.schema';

@WebSocketGateway({ namespace: 'ws/gateway', cors: { origin: '' } })
@UseInterceptors(WSLogger)
export class DeliveryGateway {
  @Inject(TYPES.SocketIO) private readonly socket: SocketIOProxy;
  @Inject(TYPES.DeliveryService) private readonly delivery: DeliveryService;

  @SubscribeMessage('status_changed')
  /**
   * Updates the status of a delivery.
   *
   * Emits an error event if the delivery is not found.
   *
   * @param dto The DTO containing the delivery ID and the new status.
   */
  async updateDeliveryStatus(@MessageBody() dto: UpdateDeliveryStatusDTO) {
    const delivery = await this.delivery.findOne(dto.delivery_id);
    if (!delivery) {
      this.socket.broadcastEvent('error', {
        status: 'error',
        message: 'Delivery not found',
      });
      return;
    }
    switch (dto.status) {
      case 'picked-up':
        await this.delivery.update(delivery, { status: 'picked-up', pickup_time: new Date() });
        break;
      case 'in-transit':
        await this.delivery.update(delivery, { status: 'in-transit', start_time: new Date() });
        break;
      case 'delivered':
      case 'failed':
        await this.delivery.update(delivery, { status: dto.status, end_time: new Date() });
        break;
      default:
        break;
    }
  }

  @SubscribeMessage('location_changed')
  async updateDeliveryLocation(@MessageBody() dto: UpdateDeliveryLocationDTO) {
    const delivery = await this.delivery.findOne(dto.delivery_id, true, 'package');
    if (!delivery) {
      this.socket.broadcastEvent('error', {
        status: 'error',
        message: 'Delivery not found',
      });
      return;
    }
    const location: DeliveryLocation = {
      type: 'Point',
      coordinates: dto.location,
    };
    await this.delivery.update(delivery, { location });
  }
}
