import { Model, Types } from "mongoose";

export type IPayment = {
  customerId: string;
  price: number;
  user: Types.ObjectId;
  package: Types.ObjectId;
  trxId: string;
  // remaining: number;
  subscriptionId: string;
  status: 'expired' | 'active' | 'cancel';
  currentPeriodStart: string;
  currentPeriodEnd: string;
}
export type PaymentModel = Model<IPayment, Record<string, never>>;