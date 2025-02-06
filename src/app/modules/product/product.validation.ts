import { z } from "zod";

const ProductValidationSchema = z.object({
    body: z.object({
        productName: z.string({
            required_error: 'Product name is required',
            invalid_type_error: "Product name must be a string"
        }),
        description: z.string({
            required_error: 'Description is required',
            invalid_type_error: "Description must be a string"
        }),
        additionalInfo: z.string({
            required_error: 'Additional info is required',
            invalid_type_error: "Additional info must be a string"
        }),
        productCategory: z.enum(
            ["Birthday", "Anniversary", "Wedding", "Friendship Day", "Graduation", "Others"],
            { required_error: 'Product category is required' }
        ),
        size: z.enum(["S", "M", "L"], { required_error: 'Size is required' }),
        color: z.string({
            required_error: 'Color is required',
            invalid_type_error: "Color must be a string"
        }),
        tag: z.array(z.string(), {
            required_error: 'Tags are required'
        }).nonempty("At least one tag is required"),
        featureImage: z.string({
            required_error: 'Feature image is required',
            invalid_type_error: "Feature image must be a valid URL or string"
        }),
        additionalImages: z.array(z.string(), {
            required_error: 'Additional images are required'
        })
            .max(4, "You can add up to 4 images only")
            .nonempty("At least one additional image is required"),
        regularPrice: z.number({
            required_error: 'Regular price is required',
            invalid_type_error: "Regular price must be a number"
        }).positive("Regular price must be a positive number"),
        discountedPrice: z.number({
            required_error: 'Discounted price is required',
            invalid_type_error: "Discounted price must be a number"
        }).positive("Discounted price must be a positive number"),
        availability: z.enum(
            ["inStock", "outOfStock"],
            { required_error: 'Availability status is required' }
        ),
    })
});

export const productValidation = {
    ProductValidationSchema
};
