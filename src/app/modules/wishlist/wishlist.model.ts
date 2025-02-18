import { model, Schema, Types } from "mongoose";
import { IwishlistItems } from "./wishlist.interface";

// Renaming schema to match wishlist context
const wishlistSchema = new Schema<IwishlistItems>({
    user: {
        type: Types.ObjectId,
        ref: 'User',
        required: true,
    },
    event: {
        type: Types.ObjectId,
        ref: 'Product',
        required: true
    }
}, {
    timestamps: true
});

// Renaming model to match wishlist context
export const Wishlist = model<IwishlistItems>('Wishlist', wishlistSchema);
