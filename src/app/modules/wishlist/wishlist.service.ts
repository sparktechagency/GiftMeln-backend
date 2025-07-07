import { StatusCodes } from "http-status-codes";
import ApiError from "../../../errors/ApiError";
import { IwishlistItems } from "./wishlist.interface";
import { Wishlist } from "./wishlist.model";

const createWishListService = async (payload: IwishlistItems) => {
    const existingWishList = await Wishlist.findOne({ user: payload.user, event: payload.product?._id || payload.product });
    if (existingWishList) {
        await Wishlist.findOneAndDelete({ user: payload.user, event: payload.product });
        return { message: "Wishlist item removed" };
    } else {
        const wishList = await Wishlist.create(payload);
        return { message: "Wishlist item added", data: wishList };
    }
};



// get all wishlist items

const getAllWishlistItemsService = async () => {
    const wishlistItems = await Wishlist.find().populate("event");
    if (!wishlistItems) {
        throw new ApiError(StatusCodes.NOT_FOUND, "Wishlist items not found");
    }
    return wishlistItems;
}


// get single wishlist item
const getSingleWishlistItemService = async (id: string) => {
    const wishlistItem = await Wishlist.findById(id);
    if (!wishlistItem) {
        throw new ApiError(StatusCodes.NOT_FOUND, "Wishlist item not found");
    }
    return wishlistItem;
}



export const WishListService = {
    createWishListService,
    getAllWishlistItemsService,
    getSingleWishlistItemService
}