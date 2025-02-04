import { Model } from 'mongoose';
import { CATEGORY } from '../../../enums/category';

export type IEvent = {
  // Define the interface for Event here
  eventName: string;
  price: number;
  sales: "inStock" | "soldOut";
  eventDate: Date;
  RecipientName: string
  category: CATEGORY
};

export type EventModel = Model<IEvent>;
