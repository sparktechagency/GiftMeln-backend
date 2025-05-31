import { Model, Types } from 'mongoose';

export type ICheckout = {
  user: Types.ObjectId;
  country: string;
  city: string;
  streetAddress: string;
  postCode: string;
  message: string;
  orderSummary: Types.ObjectId;
};

export type CheckoutModel = Model<ICheckout>;
