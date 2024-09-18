import { Prop, Schema, SchemaFactory, raw } from '@nestjs/mongoose';
import mongoose, { Document, HydratedDocument } from 'mongoose';

import { Package } from '../../packages';

export const deliveryStatus = <const>['open', 'picked-up', 'in-transit', 'delivered'];
export type DeliveryStatus = (typeof deliveryStatus)[number];

export interface DeliveryLocation {
  type: string;
  coordinates: [number, number];
}

export type DeliveryDocument = HydratedDocument<Delivery>;

@Schema({
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
  toJSON: {
    virtuals: true,
    transform: (doc, ret) => {
      delete ret._id;
      delete ret.__v;
      return ret;
    },
  },
})
export class Delivery extends Document {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Package' })
  package: Package;

  @Prop({ type: Date })
  pickup_time: Date;

  @Prop({ type: Date })
  start_time: Date;

  @Prop({ type: Date })
  end_time: Date;

  @Prop(
    raw({
      type: { type: String, default: 'Point', enum: ['Point'] },
      coordinates: { type: [Number], default: [0, 0] },
    }),
  )
  location: DeliveryLocation;

  @Prop({ required: true, type: String, enum: deliveryStatus, default: 'open' })
  status: DeliveryStatus;
}

export const DeliverySchema = SchemaFactory.createForClass(Delivery);
