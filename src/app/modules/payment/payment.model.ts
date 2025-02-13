import mongoose, { Schema, Types } from "mongoose";
import { IPayment, PaymentModel } from "./payment.interface";



const paymentSchema = new Schema<IPayment>(
  {
    customerId: {
      type: String,
      required: true
    },
    price: {
      type: Number,
      required: true
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    package: {
      type: Schema.Types.ObjectId,
      ref: "package",
      required: true
    },
    trxId: {
      type: String,
      required: true
    },
    subscriptionId: {
      type: String,
      required: true
    },
    currentPeriodStart: {
      type: String,
      required: true
    },
    currentPeriodEnd: {
      type: String,
      required: true
    },
    // remaining: {
    //   type: Number,
    //   required: true
    // },
    status: {
      type: String,
      enum: ["expired", "active", "cancel"],
      default: "active",
      required: true
    },

  },
  { timestamps: true }
);

export const Payment = mongoose.model<IPayment, PaymentModel>("payment", paymentSchema);