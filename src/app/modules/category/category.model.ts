import { model, Schema } from "mongoose";
import { ICategory } from "./category.interface";

const ProductSchema = new Schema<ICategory>(
    {
        categoryName: { type: String, required: true },
        image: { type: String, required: true }
    },
    { timestamps: true }
);

export const Category = model<ICategory>("Category", ProductSchema);