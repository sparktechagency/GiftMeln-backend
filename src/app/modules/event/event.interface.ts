import { Model, Types } from 'mongoose';
import { giftPreferences } from '../../../enums/giftPreferences';

export type IEvent = {
  _id?: Types.ObjectId;
  eventName: string;
  price?: number;
  user: Types.ObjectId;
  // sales: "inStock" | "soldOut";
  eventDate: Date;
  RecipientName: string;
  preferences: giftPreferences[];
  giftCreated?: boolean;
  address: string;
  phone: string;
  status: 'push' | 'active';
};

export type EventModel = Model<IEvent>;
