import { Schema, model } from 'mongoose';
import { IEvent, EventModel } from './event.interface';

const eventSchema = new Schema<IEvent, EventModel>(
  {
    eventName: { type: String, required: true },
    // price: { type: Number, required: true },
    // sales: { type: String, enum: ['inStock', 'soldOut'], required: true },
    eventDate: { type: Date, required: true },
    RecipientName: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    preferences: {
      type: [String],
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    price: {
      type: Number,
      // required: true,
    },
    giftCreated: {
      type: Boolean,
      default: false,
    },
    address: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['push', 'active', 'completed'],
      default: 'active',
    },
  },
  {
    timestamps: true,
  },
);

export const Event = model<IEvent, EventModel>('Event', eventSchema);
