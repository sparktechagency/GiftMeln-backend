import { Model, Types } from 'mongoose';
import { giftPreferences } from '../../../enums/giftPreferences';

export type IEvent = {
  eventName: string;
  price?: number;
  user: Types.ObjectId;
  // sales: "inStock" | "soldOut";
  eventDate: Date;
  RecipientName: string;
  category: string;
  preferences: giftPreferences[];
};

export type EventModel = Model<IEvent>;
