import { model, Schema } from "mongoose";
import { IProduct } from "./product.interface";
import { CATEGORY } from "../../../enums/category";
import { AVAILABILITY } from "../../../enums/availability";

const ProductSchema = new Schema<IProduct>(
    {
        productName: { type: String, required: true },
        description: { type: String, required: true },
        additionalInfo: { type: String, required: false },
        productCategory: {
            type: Schema.Types.ObjectId,
            ref: 'Category',
            // required: true
        },
        size: { type: String, enum: ["S", "M", "L"], required: true },
        color: { type: String, required: true },
        tag: { type: [String], required: false },
        featureImage: { type: String, required: true },
        additionalImages: { type: [String], required: false },
        regularPrice: { type: Number, required: true },
        discountedPrice: { type: Number, required: true },
        availability: { type: String, enum: Object.values(AVAILABILITY), required: true },
    },
    { timestamps: true }
);

export const ProductModel = model<IProduct>("Product", ProductSchema);