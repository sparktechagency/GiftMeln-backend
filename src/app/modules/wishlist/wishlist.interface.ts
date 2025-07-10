import { Types } from 'mongoose';

export type IwishlistItems = {
  user: Types.ObjectId ;
  product: Types.ObjectId ;
};
