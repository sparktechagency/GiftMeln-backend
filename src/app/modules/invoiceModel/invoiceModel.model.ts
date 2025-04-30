import mongoose from 'mongoose';

const invoiceSchema = new mongoose.Schema(
  {
    userEmail: { type: String, required: true },
    amount: { type: Number, required: true },
    invoiceUrl: { type: String, required: true },
    date: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

export const InvoiceModel = mongoose.model('Invoice', invoiceSchema);
