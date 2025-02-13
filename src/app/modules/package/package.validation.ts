import { z } from "zod";


const createPackageZodSchema = z.object({
    body: z.object({
        name: z.string({ required_error: "Package name is required" })
            .min(3, "Package name must be at least 3 characters long")
            .max(100, "Package name cannot exceed 100 characters"),

        price: z.number({ invalid_type_error: "Price must be a number" })
            .min(0, "Price cannot be negative")
            .optional(), // Required only for non-free packages

        description: z.string({ required_error: "Description is required" })
            .min(10, "Description must be at least 10 characters"),

        duration: z.enum(["7 days", "1 month", "1 year"], {
            required_error: "Duration is required",
        }),

        paymentType: z.enum(["Free", "Monthly", "Yearly"], {
            required_error: "Payment type is required",
        }),

        hasTrial: z.boolean().default(true),

        features: z.array(z.string().min(1, "Feature cannot be empty"))
            .min(1, "At least one feature is required")
            .optional(),

        category: z.enum(["Free Trial", "Budget Friendly", "Premium Plan", "Spoiling Myself"], {
            required_error: "Category is required",
        }),

        productId: z.string().optional(),
        paymentLink: z.string().url("Invalid payment link format").optional(),
    }),
});

export const packageValidation = { createPackageZodSchema };


