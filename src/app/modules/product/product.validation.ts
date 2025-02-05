import { z } from "zod";
import { CATEGORY } from "../../../enums/category";
import { AVAILABILITY } from "../../../enums/availability";

export const ProductValidationSchema = z.object({
    body: z.object({
        productName: z.string({ required_error: 'Product is required' }),
        description: z.string({ required_error: 'Description is required' }),
        additionalInfo: z.string({ required_error: 'Additional info is required' }),
        productCategory: z.nativeEnum(CATEGORY),
        size: z.enum(["S", "M", "L"]),
        color: z.string(),
        tag: z.array(z.string()).optional(),
        featureImage: z.string().url("Feature image must be a valid URL"),
        additionalImages: z.array(z.string().url()).max(4, "You can add up to 4 images only"),
        regularPrice: z.number().positive("Regular price must be a positive number"),
        discountedPrice: z.number().positive("Discounted price must be a positive number"),
        availability: z.nativeEnum(AVAILABILITY),
    })
});