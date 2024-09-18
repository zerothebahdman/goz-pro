import mongoose, { Model } from 'mongoose';

import { Delivery } from './schema/delivery.schema';
import { DeliveryDTO } from './delivery.validator';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';

@Injectable()
export class DeliveriesService {
  @InjectModel(Delivery.name) private readonly delivery: Model<Delivery>;

  async create(dto: DeliveryDTO) {
    const { package_id: packageID, ...rest } = dto;
    return await this.delivery.create({ ...rest, package: packageID });
  }

  async findAll() {
    return await this.delivery.find<Delivery>().populate('package');
  }

  async findOne(id: string, eagerLoad = false, eagerLoadField?: string) {
    return eagerLoad
      ? await this.delivery.findOne({ _id: new mongoose.Types.ObjectId(id) }).populate(eagerLoadField)
      : await this.delivery.findById(new mongoose.Types.ObjectId(id));
  }

  async update(delivery: Delivery, dto: any) {
    delivery.set(dto);
    return await delivery.save();
  }

  async delete(id: string) {
    return await this.delivery.findByIdAndDelete(new mongoose.Types.ObjectId(id));
  }

  async deletePackageDeliveries(packageID: string) {
    return await this.delivery.deleteMany({ package: packageID });
  }
}
