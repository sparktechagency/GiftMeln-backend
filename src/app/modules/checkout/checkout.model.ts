import { Schema, model } from 'mongoose';
import { ICheckout, CheckoutModel } from './checkout.interface';

const checkoutSchema = new Schema<ICheckout, CheckoutModel>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    country: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    streetAddress: {
      type: String,
      required: true,
    },
    postCode: {
      type: String,
      required: true,
    },
    message: {
      type: String,
    },
    orderSummary: {
      type: Schema.Types.ObjectId,
      ref: 'cart',
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

export const Checkout = model<ICheckout, CheckoutModel>(
  'Checkout',
  checkoutSchema,
);
