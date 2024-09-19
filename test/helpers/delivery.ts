import { DeliveryDTO } from '../../src/deliveries/delivery.validator';
import mongoose from 'mongoose';

export function newDeliveryDTO(extras?: Partial<DeliveryDTO>): DeliveryDTO {
  return {
    package_id: new mongoose.Types.ObjectId().toString(),
    status: 'open',
    ...extras,
  };
}

export async function createDelivery(dto: DeliveryDTO) {
  return await mongoose.connection.db.collection('deliveries').insertOne({
    ...dto,
    package: new mongoose.Types.ObjectId(dto.package_id),
  });
}
