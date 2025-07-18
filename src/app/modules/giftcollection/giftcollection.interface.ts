import { Model, Types } from 'mongoose';

export type IGiftCollection = {
  product: Types.ObjectId[];
  user: Types.ObjectId;
  event: Types.ObjectId;
  status: 'pending' | 'send' | 'delivery';
};

export type GiftCollectionModel = Model<IGiftCollection>;
