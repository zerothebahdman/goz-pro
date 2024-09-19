import { Inject, Injectable } from '@nestjs/common';
import { PaginationModel, PaginationOptions, paginate } from '../common/pagination-wrapper';
import mongoose, { Model } from 'mongoose';

import { Delivery, DeliveryDocument } from './schema/delivery.schema';
import { DeliveryDTO } from './delivery.validator';
import { InjectModel } from '@nestjs/mongoose';
import { SocketIOProxy } from '../web-socket/ws.gateway';
import TYPES from '../config/inversify.types';

@Injectable()
export class DeliveryService {
  @InjectModel(Delivery.name) private readonly delivery: Model<Delivery>;
  @Inject(TYPES.SocketIO) private readonly socket: SocketIOProxy;

  async create(dto: DeliveryDTO) {
    const { package_id: packageID, ...rest } = dto;
    return await this.delivery.create({ ...rest, package: packageID });
  }

  async findAll(filter: Partial<DeliveryDocument>, options?: Partial<PaginationOptions>, shouldPaginate = true) {
    Object.assign(options, { populate: 'package' });

    return shouldPaginate
      ? <PaginationModel<Delivery>>await paginate(filter, this.delivery, options)
      : await this.delivery.find(<mongoose.FilterQuery<Delivery>>filter).populate('package');
  }

  async findOne(id: string, eagerLoad = false, eagerLoadField?: string) {
    return eagerLoad
      ? await this.delivery.findOne({ _id: new mongoose.Types.ObjectId(id) }).populate(eagerLoadField)
      : await this.delivery.findById(new mongoose.Types.ObjectId(id));
  }

  async update(delivery: Delivery, dto: Partial<Delivery>) {
    delivery.set(dto);
    const updatedDelivery = await delivery.save();

    this.socket.broadcastEvent('delivery_updated', updatedDelivery);
    return updatedDelivery;
  }

  async delete(id: string) {
    return await this.delivery.findByIdAndDelete(new mongoose.Types.ObjectId(id));
  }

  async deletePackageDeliveries(packageID: string) {
    return await this.delivery.deleteMany({ package: packageID });
  }
}
