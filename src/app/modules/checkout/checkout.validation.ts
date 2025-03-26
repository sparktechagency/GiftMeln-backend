import { z } from 'zod';
import { Types } from 'mongoose';

const checkoutValidator = z.object({
    body: z.object({
        user: z.instanceof(Types.ObjectId, { message: "Invalid User ID" }),
        country: z.string({ required_error: "Country is required" }),
        city: z.string({ required_error: "City is required" }),
        streetAddress: z.string({ required_error: "Street Address is required" }),
        postCode: z.string({ required_error: "Post Code is required" }),
        message: z.string().optional(),
        orderSummary: z.instanceof(Types.ObjectId, { message: "Invalid Order Summary ID" }),
    }),
});

export const CheckoutValidations = {
    checkoutValidator,
};
