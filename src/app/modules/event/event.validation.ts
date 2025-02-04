import { z } from 'zod';
import { CATEGORY } from '../../../enums/category';
const categoryValues = Object.values(CATEGORY) as [string, ...string[]];


const createEventValidation = {
    body: z.object({
        eventName: z.string({ required_error: 'Event Name is required' }),
        price: z.string({ required_error: 'Price is required' }).nonempty(),
        sales: z.enum(['inStock', 'soldOut']),
        eventDate: z
            .date()
            .refine((date) => date > new Date(), 'Event date must be in the future'),
        RecipientName: z.string({
            required_error: 'Recipient Name is required',
        }),
        category: z.enum(categoryValues, {
            message: 'Invalid category'
        }),
    }),
};


export const eventValidation = {
    createEventValidation
}
