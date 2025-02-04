import { Schema, model } from 'mongoose';
import { IEvent, EventModel } from './event.interface';
import { CATEGORY } from '../../../enums/category';
import { giftPreferences } from '../../../enums/giftPreferences';

const eventSchema = new Schema<IEvent, EventModel>({
  // Define schema fields here
  eventName: { type: String, required: true },
  price: { type: Number, required: true },
  sales: { type: String, enum: ['inStock', 'soldOut'], required: true },
  eventDate: { type: Date, required: true },
  RecipientName: { type: String, required: true },
  category: {
    type: String,
    enum: Object.values(CATEGORY),
    required: true,
  },
  giftPreferences: {
    type: [String],
    enum: Object.values(giftPreferences),
    required: true
  },
},
  {
    timestamps: true
  });

export const Event = model<IEvent, EventModel>('Event', eventSchema);
