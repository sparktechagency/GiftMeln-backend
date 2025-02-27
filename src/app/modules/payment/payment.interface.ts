import { Types } from "mongoose";

export interface IPayment {
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
}

