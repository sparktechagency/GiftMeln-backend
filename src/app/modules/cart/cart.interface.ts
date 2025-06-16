import { Model, Types } from 'mongoose';

export type ICart = {
  user: Types.ObjectId | undefined;
  variations: {
    product: Types.ObjectId;
    color: string;
    size: string;
    quantity: number;
  };
};

export type CartModel = Model<ICart>;
