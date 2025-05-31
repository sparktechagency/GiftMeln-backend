import { model, Schema } from 'mongoose';
import { IProduct } from './product.interface';
import { AVAILABILITY } from '../../../enums/availability';

const ProductSchema = new Schema<IProduct>(
  {
    productName: { type: String, required: true },
    description: { type: String, required: true },
    additionalInfo: { type: String, required: false },
    productCategory: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
    size: { type: [String], required: true },
    color: { type: [String], required: true },
    tag: { type: [String], required: false },
    feature: { type: String, required: true },
    additional: { type: [String], required: true },
    regularPrice: { type: Number, required: true },
    discountedPrice: { type: Number, required: true },
    availability: {
      type: String,
      enum: Object.values(AVAILABILITY),
      required: true,
    },
    eventCategory: {
      type: Schema.Types.ObjectId,
      ref: 'EventCategory',
      required: true,
    },
  },
  { timestamps: true },
);

export const ProductModel = model<IProduct>('Product', ProductSchema);
