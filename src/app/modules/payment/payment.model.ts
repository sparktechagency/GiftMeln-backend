import { model, Schema } from "mongoose";
import { productSize } from "../product/product.interface";

const orderDetailsSchema = new Schema({
  userName: String,
  userEmail: String,
  country: String,
  city: String,
  streetAddress: String,
  postCode: String,
  orderMessage: String
});

// Product Schema
const productSchema = new Schema({
  id: String,
  name: String,
  quantity: {
    type: Number,
    default: 1
  },
  price: Number,
  size: {
    type: String,
    enum: Object.values(productSize)
  },
  color: String
});

// Payment Schema
const paymentSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  paymentType: {
    type: String,
    enum: ['one-time', 'subscription'],
    required: true
  },
  amountPaid: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  },
  trxId: String,
  products: [productSchema],
  orderDetails: orderDetailsSchema,
  checkoutSessionId: String,
  paymentUrl: String,
  subscriptionId: String,
  subscriptionStatus: {
    type: String,
    enum: ['active', 'canceled', 'expired', null],
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Middleware to update `updatedAt` on save
paymentSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

export const Payment = model('Payment', paymentSchema);