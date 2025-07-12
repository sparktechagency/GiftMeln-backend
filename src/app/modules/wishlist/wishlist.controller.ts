import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { WishListService } from './wishlist.service';
import ApiError from '../../../errors/ApiError';

const createWishList = catchAsync(async (req, res) => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment

  const wishListData = req.body;

  const result = await WishListService.createWishListService(wishListData);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Wishlist created successfully',
    data: result,
  });
});
const getAllWishLists = catchAsync(async (req, res) => {
  const result = await WishListService.getAllWishlistItemsService(
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    req.user.id || req.user.authId,
  );
  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'No wishlists found');
  }
  sendResponse(res, {
    Total: result?.length,
    success: true,
    statusCode: StatusCodes.OK,
    message: 'All wishlists retrieved successfully',
    data: result,
  });
});
// get single wishlist
const getSingleWishlist = catchAsync(async (req, res) => {
  const wishlistId = req.params.id;
  const result = await WishListService.getSingleWishlistItemService(wishlistId);
  if (!result) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Wishlist not found');
  }
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Single wishlist retrieved successfully',
    data: result,
  });
});

export const WishListController = {
  createWishList,
  getAllWishLists,
  getSingleWishlist,
};
