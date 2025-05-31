import { Schema, model } from 'mongoose';
import { IPayment } from './payment.interface';

const PaymentSchema = new Schema<IPayment>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  customerId: { type: String, required: true },
  package: { type: Schema.Types.ObjectId, ref: 'Package', required: true },
  balanceAmount: { type: Schema.Types.ObjectId, ref:"Subscription"},
  trxId: { type: String },
  subscriptionId: { type: String, required: true },
  currentPeriodStart: { type: Date, required: true },
  currentPeriodEnd: { type: Date, required: true },
  amountPaid: { type: Number, required: true },
  status: {
    type: String,
    enum: ['active', 'canceled', 'expired'],
    required: true,
  },
  paymentType: { type: String, enum: ['subscription'], required: true },
  balance: { type: Number , default: 0},
});

export const Subscription = model<IPayment>('Subscription', PaymentSchema);
