import { Schema, model } from 'mongoose';
import { IEventCategory, EventCategoryModel } from './eventcategory.interface';
import { EventCategoryConstant } from './eventcategory.constants';

const eventCategorySchema = new Schema<IEventCategory, EventCategoryModel>(
  {
    eventCategory: {
      type: String,
      required: true,
      enum: EventCategoryConstant,
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
