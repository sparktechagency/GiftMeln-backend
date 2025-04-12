import { model, Schema, Types } from 'mongoose';
import { ICart } from './cart.interface';

const CartSchema = new Schema<any>(
  {
    user: {
      type: Types.ObjectId,
      ref: 'User',
      required: true,
    },
    products: [
      {
        title: {
          type: String,
          required: true,
        },
        vendor: {
          type: String,
        },
        handle: {
          type: String,
        },
        published_scope: {
          type: String,
        },
        image: {
          type: String,
        },
        price: {
          type: Number,
        },
        options: [
          {
            id: {
              type: Number,
            },
            product_id: {
              type: Number,
            },
            name: {
              type: String,
            },
            position: {
              type: Number,
            },
            values: {
              type: [String],
            },
          },
        ],
        variants: [
          {
            id: {
              type: Number,
            },
            product_id: {
              type: Number,
            },
            title: {
              type: String,
            },
            price: {
              type: Number,
            },
            taxable: {
              type: Boolean,
            },
            compare_at_price: {
              type: Number,
            },
          },
        ],
        tags: {
          type: String,
        },
      },
    ],
  },
  { timestamps: true }
);

export const Cart = model<ICart>('Cart', CartSchema);
