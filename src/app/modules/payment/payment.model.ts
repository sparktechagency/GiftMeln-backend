import { Schema, model, Types } from "mongoose";
import { IPayment } from "./payment.interface";

const PaymentSchema = new Schema<IPayment>({
  user: { type: Types.ObjectId, ref: "User", required: true },
  customerId: { type: String, required: true },
  package: { type: Types.ObjectId, ref: "Package", required: true },
  trxId: { type: String },
  subscriptionId: { type: String, required: true },
  currentPeriodStart: { type: Date, required: true },
  currentPeriodEnd: { type: Date, required: true },
  amountPaid: { type: Number, required: true },
  status: { type: String, enum: ["active", "canceled", "expired"], required: true },
  paymentType: { type: String, enum: ["subscription"], required: true },
});



export const Subscription = model<IPayment>("Subscription", PaymentSchema);
