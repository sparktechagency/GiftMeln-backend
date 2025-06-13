import { z } from 'zod';
import { giftPreferences } from '../../../enums/giftPreferences';

const createEventValidation = z.object({
  eventName: z.string({ required_error: 'Event name is required' }),
  price: z
    .number({ required_error: 'Price is required' })
    .min(0, { message: 'Price must be a positive number' }),
  sales: z.enum(['inStock', 'soldOut'], {
    required_error: 'Sales status is required',
  }),
  eventDate: z.date({ required_error: 'Event date is required' }),
  RecipientName: z.string({ required_error: 'Recipient name is required' }),
  // category: z.enum(Object.values(CATEGORY) as [CATEGORY, ...CATEGORY[]], { required_error: "Category is required" }),
  preferences: z.array(
    z.enum(
      Object.values(giftPreferences) as [giftPreferences, ...giftPreferences[]],
    ),
    {
      required_error: 'At least one gift preference must be selected',
    },
  ),
});

export const eventValidation = {
  createEventValidation,
};
