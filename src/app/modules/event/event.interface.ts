import { Model } from 'mongoose';
import { CATEGORY } from '../../../enums/category';
import { giftPreferences } from '../../../enums/giftPreferences';

export type IEvent = {
  eventName: string;
  price: number;
  sales: "inStock" | "soldOut";
  eventDate: Date;
  RecipientName: string
  category: CATEGORY
  giftPreferences: giftPreferences[]
};

export type EventModel = Model<IEvent>;
