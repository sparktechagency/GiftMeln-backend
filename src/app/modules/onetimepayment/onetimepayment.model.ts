import { Schema, model } from 'mongoose';
import { IOnetimePayment, OnetimePaymentModel } from './onetimepayment.interface';

const oneTimePaymentSchema = new Schema<IOnetimePayment, OnetimePaymentModel>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  amountPaid: { type: Number, required: true },
  trxId: { type: String },
  status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
  userName: { type: String, required: true },
  userEmail: { type: String, required: true },
  country: { type: String, required: true },
  city: { type: String, required: true },
  streetAddress: { type: String, required: true },
  postCode: { type: String, required: true },
  orderMessage: { type: String },
  products: [{
    id: { type: String, required: true },
    name: { type: String, required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
    color: { type: String },
    size: { type: String },
  }],
  checkoutSessionId: { type: String, required: true },
  paymentUrl: { type: String, required: true }
}, { timestamps: true });

export const OneTimePayment = model<IOnetimePayment>("OneTimePayment", oneTimePaymentSchema);
