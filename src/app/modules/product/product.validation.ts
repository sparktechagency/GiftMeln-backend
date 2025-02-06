// import { z } from "zod";

// const ProductValidationSchema = z.object({
//     productName: z.string().min(1, "Product name is required"),
//     description: z.string().min(1, "Description is required"),
//     additionalInfo: z.string().optional(),
//     productCategory: z.enum(["Anniversary", "Birthday", "Wedding", "FriendshipDay", "Graduation", "Other"]),
//   size: z.enum(["S", "M", "L"]),
//     color: z.string().min(1, "Color is required"),
//     tag: z.array(z.string()), // Ensures 'tag' is an array of strings
//     featureImage: z.string().url("Feature image must be a valid URL"),
//     additionalImages: z.array(z.string().url()).optional(),
//     regularPrice: z.number().positive("Regular price must be a positive number"),
//     discountedPrice: z
//         .number()
//         .positive("Discounted price must be a positive number"),
//     availability: z.enum(["inStock", "outOfStock"]),
// }).superRefine((data, ctx) => {
//     if (data.discountedPrice >= data.regularPrice) {
//         ctx.addIssue({
//             code: z.ZodIssueCode.custom,
//             message: "Discounted price must be less than the regular price",
//             path: ["discountedPrice"],
//         });
//     }
// });

// export const productValidation = {
//     ProductValidationSchema,
// };
