import { Model, Types } from 'mongoose';

export type IGiftCollection = {
  _id?: Types.ObjectId;
  product: Types.ObjectId[];
  user: Types.ObjectId;
  event: Types.ObjectId;
  status: 'pending' | 'send' | 'initial';
};

export type GiftCollectionModel = Model<IGiftCollection>;
