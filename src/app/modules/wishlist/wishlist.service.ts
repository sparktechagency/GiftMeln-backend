import { StatusCodes } from "http-status-codes";
import ApiError from "../../../errors/ApiError";
import { IwishlistItems } from "./wishlist.interface";
import { Wishlist } from "./wishlist.model";

const createWishListService = async (payload: IwishlistItems) => {
    const wishList = await Wishlist.create(payload);
    if (!wishList) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to create wishlist");
    }
    return wishList;
}


// get all wishlist items

const getAllWishlistItemsService = async () => {
    const wishlistItems = await Wishlist.find();
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