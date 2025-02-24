import { Model, Schema, Types } from "mongoose";

export type IPayment = {
  // customerId: string;
  // price: number;
  // user: Types.ObjectId;
  // package: Types.ObjectId;
  // trxId: string;
  // // remaining: number;
  // subscriptionId: string;
  // status: 'expired' | 'active' | 'cancel';
  // currentPeriodStart: string;
  // currentPeriodEnd: string;
  user: Types.ObjectId;
  customerId: string;
  package: Types.ObjectId;
  trxId?: string;
  subscriptionId: string;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  amountPaid: number;
  status: "active" | "canceled" | "expired";
  paymentType: "subscription";
  createdAt: Date;
  updatedAt: Date;
}
export type PaymentModel = Model<IPayment, Record<string, never>>;