import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { Wishlist } from './wishlist.model';
import mongoose from 'mongoose';

const createWishListService = async ( payload: any) => {
  const productId = new mongoose.Types.ObjectId(payload);

  const existingWishList = await Wishlist.findOne({
    user: payload.user, // Assuming payload is the user ID
    product: productId,
  });

  if (existingWishList) {
    await Wishlist.deleteOne({
      user: payload.user,
      product: productId,
    });
    return { message: 'Wishlist item removed' };
  } else {
    const wishList = await Wishlist.create({
      user: payload.user, // Assuming payload contains user ID
      product: productId,
    });
    return { message: 'Wishlist item added', data: wishList };
  }
};


// get all wishlist items

const getAllWishlistItemsService = async () => {
  const wishlistItems = await Wishlist.find().populate('product');
  if (!wishlistItems) {
    return [];
  }
  return wishlistItems;
};

// get single wishlist item
const getSingleWishlistItemService = async (id: string) => {
  const wishlistItem = await Wishlist.findById(id);
  if (!wishlistItem) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Wishlist item not found');
  }
  return wishlistItem;
};

export const WishListService = {
  createWishListService,
  getAllWishlistItemsService,
  getSingleWishlistItemService,
};
