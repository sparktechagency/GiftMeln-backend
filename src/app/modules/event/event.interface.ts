import { Model } from 'mongoose';
import { CATEGORY } from '../../../enums/category';

export type IEvent = {
  eventName: string;
  price: number;
  sales: "inStock" | "soldOut";
  eventDate: Date;
  RecipientName: string
  category: CATEGORY
  giftPreferences: string[]
};

export type EventModel = Model<IEvent>;
