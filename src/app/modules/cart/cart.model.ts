import { model, Schema, Types } from "mongoose";
import { ICart } from "./cart.interface";

const CartSchema = new Schema<ICart>(
  {
    user: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },

    variations:
    {
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
      product: {
        type: [Schema.Types.ObjectId],
        ref: 'Product',
        required: true,
      },
    },

  },
  { timestamps: true }
);


export const Cart = model<ICart>("cart", CartSchema);
