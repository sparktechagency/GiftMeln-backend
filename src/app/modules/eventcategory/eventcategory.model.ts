import { Schema, model } from 'mongoose';
import { IEventCategory, EventCategoryModel } from './eventcategory.interface';

const eventCategorySchema = new Schema<IEventCategory, EventCategoryModel>(
  {
    eventCategory: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

export const EventCategory = model<IEventCategory, EventCategoryModel>(
  'EventCategory',
  eventCategorySchema,
);
