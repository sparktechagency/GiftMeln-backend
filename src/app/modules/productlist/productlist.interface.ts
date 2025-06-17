import { Model, Types } from 'mongoose';

export type IProductList = {
  product: Types.ObjectId[];
  user: Types.ObjectId;
};

export type ProductListModel = Model<IProductList>;
