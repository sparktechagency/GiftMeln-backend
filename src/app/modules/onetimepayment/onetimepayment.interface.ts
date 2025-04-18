import { Schema, Model, Document } from 'mongoose';

export interface IOnetimePayment extends Document {
  user: Schema.Types.ObjectId;
  amountPaid?: number;
  trxId?: string;
  status: "pending" | "completed" | "failed";
  userName: string;
  userEmail: string;
  country: string;
  city: string;
  streetAddress: string;
  postCode: string;
  orderMessage?: string;

  products: Array<{
    id: string;
    name: string;
    quantity: number;
    price: number;
    color?: string;
    size?: string;
  }>;

  checkoutSessionId: string;
  paymentUrl: string;
}

export type OnetimePaymentModel = Model<IOnetimePayment>;
