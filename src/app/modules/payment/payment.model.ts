import { model, Schema, Types } from "mongoose";

const userSubscriptionSchema = new Schema(
  {
    user: { type: Types.ObjectId, ref: "User", required: true },
    subscriptions: [
      {
        package: { type: Types.ObjectId, ref: "Package", required: true },
        subscriptionId: { type: String, required: true },
        currentPeriodStart: { type: Date, required: true },
        currentPeriodEnd: { type: Date, required: true },
        amountPaid: { type: Number, required: true },
        status: {
          type: String,
          enum: ["active", "canceled", "expired"],
          default: "active",
        },
        paymentType: { type: String, default: "subscription" },
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const Subscription = model("Subscription", userSubscriptionSchema);
