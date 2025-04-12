import { Model, Types } from 'mongoose';

export type ICart = {
  // Define the interface for Cart here
  user: Types.ObjectId | undefined
  variations: {
    product: string;
    color: string;
    size: string;
    quantity: number;
  };
};

export type CartModel = Model<ICart>;
