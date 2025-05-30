import { Types } from "mongoose";

export type IPayment ={
  user: Types.ObjectId | undefined;
  customerId: string;
  package: Types.ObjectId | undefined;
  trxId?: string;
  subscriptionId: string;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  amountPaid: number;
  status: "active" | "canceled" | "expired";
  paymentType: "subscription";
  balance?: number;
}

