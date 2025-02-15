import { Model, Types } from 'mongoose';

export type ICheckout = {
  user: Types.ObjectId
  country: String
  city: String;
  streetAddress: string
  postCode: String
  message: string;
  orderSummary: Types.ObjectId
};

export type CheckoutModel = Model<ICheckout>;
