import { Prop, Schema, SchemaFactory, raw } from '@nestjs/mongoose';
import mongoose, { Document, HydratedDocument } from 'mongoose';

export type PackageDocument = HydratedDocument<Package>;

export interface PackageLocation {
  type: 'Point';
  coordinates: number[];
}

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
export class Package extends Document {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Delivery' })
  active_delivery: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  weight: number;

  @Prop({ required: true })
  width: number;

  @Prop({ required: true })
  height: number;

  @Prop({ required: true })
  depth: number;

  @Prop({ required: true })
  from_name: string;

  @Prop({ required: true })
  from_address: string;

  @Prop(
    raw({
      type: { type: String, default: 'Point', enum: ['Point'] },
      coordinates: { type: [Number], default: [0, 0] },
    }),
  )
  from_location: PackageLocation;

  @Prop({ required: true, type: String })
  to_name: string;

  @Prop({ required: true, type: String })
  to_address: string;

  @Prop(
    raw({
      type: { type: String, default: 'Point', enum: ['Point'] },
      coordinates: { type: [Number], default: [0, 0] },
    }),
  )
  to_location: PackageLocation;
}

export const PackageSchema = SchemaFactory.createForClass(Package);
