import { z } from "zod";

const createCategoryZodSchema = z.object({
    body: z.object({
        categoryName: z.string({ required_error: "Category name is required" }),
        image: z.string({ required_error: "Image URL is required" }),
    }),
});

// update category

const updateCategoryZodSchema = z.object({
    body: z.object({
        categoryName: z.string().optional(),
        image: z.string().optional(),
    }),
});

export const CategoryValidation = {
    createCategoryZodSchema,
    updateCategoryZodSchema,
}