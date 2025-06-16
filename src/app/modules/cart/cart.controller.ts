import { Request, Response, NextFunction } from 'express';
import { CartServices } from './cart.service';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';

//create cart constructor
const createCart = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.user!;
  const data = req.body;
  const result = await CartServices.createCartServiceIntoDB(id, data);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Cart created successfully',
    data: result,
  });
});
// get all cart items
const getAllCartItems = catchAsync(async (req: Request, res: Response) => {
  const id = req.user?.authId || req.user.id;

  const result = await CartServices.getAllCart(id);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'User cart items retrieved successfully',
    data: result,
  });
});

// update cart items quantity
const updateCartQuantity = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { cartItemId, quantity } = req.body;
    const userId = req.user.id;

    const updatedCart = await CartServices.updateQuantity(
      userId,
      cartItemId,
      quantity,
    );

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Cart item quantity updated successfully',
      data: updatedCart,
    });
  },
);

// delete cart items
const deleteCartItemController = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id;
    const { cartItemId } = req.params;

    if (!cartItemId) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Cart item ID is required');
    }

    const result = await CartServices.deleteCartItem(userId, cartItemId);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Cart item deleted successfully',
      data: result,
    });
  },
);
const clearCartAfterPayment = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user.id;

    // Call the service to clear the cart
    const result = await CartServices.clearCart(userId);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Cart cleared successfully after payment',
      data: result,
    });
  },
);

export const CartController = {
  createCart,
  getAllCartItems,
  updateCartQuantity,
  deleteCartItemController,
  clearCartAfterPayment,
};
