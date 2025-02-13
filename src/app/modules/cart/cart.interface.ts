import { Model, Types } from 'mongoose';

export type ICart = {
  // Define the interface for Cart here
  user: Types.ObjectId | undefined
  product: Types.ObjectId | undefined
};

export type CartModel = Model<ICart>;
