import { Model, Types } from 'mongoose';
import { giftPreferences } from '../../../enums/giftPreferences';

export type IEvent = {
  _id?: Types.ObjectId;
  eventName: string;
  price?: number;
  user: Types.ObjectId;
  category: string
  // sales: "inStock" | "soldOut";
  eventDate: Date;
  RecipientName: string;
  preferences: string[];
  giftCreated?: boolean;
  address: string;
  phone: string;
  status: 'push' | 'active' | 'completed';
};

export type EventModel = Model<IEvent>;