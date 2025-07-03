import { Schema, model } from 'mongoose';
import {
  IGiftCollection,
  GiftCollectionModel,
} from './giftcollection.interface';

const giftCollectionSchema = new Schema<IGiftCollection, GiftCollectionModel>(
  {
    product: {
      type: [Schema.Types.ObjectId],
      ref: 'Product',
      required: true,
    },
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    event: {
      type: Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'send', 'initial', "delivery"],
      default: 'initial',
    },
  },
  {
    timestamps: true,
  },
);

export const GiftCollection = model<IGiftCollection, GiftCollectionModel>(
  'GiftCollection',
  giftCollectionSchema,
);
