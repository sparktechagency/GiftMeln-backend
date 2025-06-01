import { Model } from 'mongoose';

export type IEventCategory = {
  eventCategory: string;
};

export type EventCategoryModel = Model<IEventCategory>;
