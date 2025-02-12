import { z } from "zod";


const createProductZodSchema = z.object({
    body: z.object({
        name: z.string({ required_error: "Package name is required" })
            .min(3, "Package name must be at least 3 characters long")
            .max(100, "Package name cannot exceed 100 characters"),

        price: z.string({ required_error: "Price is required" }).nonempty(),
        description: z.string({ required_error: "Description is required" }),

        duration: z.string({ required_error: "Duration is required" }),

        features: z.array(z.string().min(1, "Feature cannot be empty"))
            .min(1, "At least one feature is required").optional(),
    }),
});

export const packageValidation = { createProductZodSchema }

