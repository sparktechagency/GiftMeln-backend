import { model, Schema } from "mongoose";
import { IPayment } from "./payment.interface";



// Payment Schema
const paymentSchema = new Schema<IPayment>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  customerId: { type: String, required: true },
  package: { type: Schema.Types.ObjectId, ref: 'package', required: true },
  trxId: { type: String },
  subscriptionId: { type: String, required: true },
  currentPeriodStart: { type: Date, required: true },
  currentPeriodEnd: { type: Date, required: true },
  amountPaid: { type: Number, required: true },
  status: { type: String, enum: ['active', 'canceled', 'expired'], default: 'active' },
  paymentType: { type: String, default: 'subscription' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Middleware to update `updatedAt` on save
paymentSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

export const Payment = model('Subscription', paymentSchema);