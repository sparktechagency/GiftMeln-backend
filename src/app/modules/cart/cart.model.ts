import { model, Schema, Types } from 'mongoose';
import { CartModel, ICart } from './cart.interface';

const CartSchema = new Schema<ICart>(
  {
    user: {
      type: Types.ObjectId,
      ref: 'User',
      required: true,
    },
    variations: [
      {
        product: {
          type: Schema.Types.ObjectId,
          ref: 'Product', // optional: if you have Product model
          required: true,
        },
        color: {
          type: String,
          required: true,
        },
        size: {
          type: String,
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
      },
    ],
  },
  {
    timestamps: true,
  },
);

export const Cart = model<ICart, CartModel>('Cart', CartSchema);
