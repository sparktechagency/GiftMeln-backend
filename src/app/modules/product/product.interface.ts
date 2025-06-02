import { AVAILABILITY } from '../../../enums/availability';

export type IProduct = {
  productName: string;
  description: string;
  additionalInfo: string;
  category: string;
  size: string[];
  color: string[];
  tag: string[];
  feature: string;
  additional: string[];
  regularPrice: number;
  discountedPrice: number;
  availability: AVAILABILITY;
};
