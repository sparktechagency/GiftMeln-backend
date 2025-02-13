import { model, Schema, Types } from "mongoose";
import { ICart } from "./cart.interface";

const CartSchema = new Schema<ICart>(
  {
    user: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },
    product: {
      type: Types.ObjectId,
      ref: "Product",
      required: true,
    },
  },
  { timestamps: true }
);


export const Cart = model<ICart>("cart", CartSchema);
