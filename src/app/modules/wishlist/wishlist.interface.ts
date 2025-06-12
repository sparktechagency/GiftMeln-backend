import { Types } from 'mongoose';

export type IwishlistItems = {
  user: Types.ObjectId | undefined;
  product: Types.ObjectId | undefined;
};
