import { Model, Types } from "mongoose";

export type IPayment = {
  customerId: string;
  package: Types.ObjectId | undefined;
  trxId?: string;
  subscriptionId: string;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  amountPaid: number;
  status: "active" | "canceled" | "expired";
  paymentType: "subscription";
  createdAt: Date;
  updatedAt: Date;
};

export type IUserSubscription = {
  user: Types.ObjectId;
  subscriptions: IPayment[];
};

export type Payment = Model<IUserSubscription>;
