import { Schema, model } from 'mongoose';
import { IPackage } from './package.interface';

const packageSchema = new Schema<IPackage>(
  {
    name: {
      type: String,
      required: [true, "Package name is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
    },
    price: {
      type: Number,
      required: function () {
        return this.paymentType !== 'Free';
      },
      min: [0, "Price cannot be negative"],
    },
    duration: {
      type: String,
      required: [true, "Duration is required"],
      enum: ["7 days", "month", "year"],
    },
    paymentType: {
      type: String,
      required: [true, "Payment type is required"],
      enum: ["Free", "Paid"],
    },
    trialEndsAt: {
      type: Date,

    },
    hasTrial: {
      type: Boolean,
      default: true, // Default: have trial by default
    },
    features: {
      type: [String],
      default: [],
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: ["Free Trial", "Budget Friendly", "Premium Plan", "Spoiling Myself"],
    },
    priceId: {
      type: String,
      default: null,
    },
    // For subscriptions and other payment related fields, consider using a separate schema or a plugin.
    productId: {
      type: String,
      default: null,
    },
    paymentLink: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

export const Package = model<IPackage>('Package', packageSchema);


