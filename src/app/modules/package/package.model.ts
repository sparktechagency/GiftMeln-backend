import { Schema, model } from 'mongoose';
import { IPackage } from './package.interface';

const packageSchema = new Schema<IPackage>(
  {

    name: {
      type: String,
      required: [true, "Name is required"],
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
    },
    duration: {
      type: String,
      required: [true, "Duration is required"],
      enum: ["1 month", "3 months", "6 months", "1 year"],
    },
    features: {
      type: [String],
      required: [true, "Features is required"],
    },
    paymentType: {
      type: String,
      required: [true, "Payment type is required"],
      enum: ["Monthly", "Yearly"],
    },
    productId: {
      type: String,
    },
    paymentLink: {
      type: String,
    },
  },
  { timestamps: true }
);

export const Package = model<IPackage>('package', packageSchema);
