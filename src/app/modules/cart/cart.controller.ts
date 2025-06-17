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

const updateCartQuantity = catchAsync(async (req: Request, res: Response) => {
  const { cartId } = req.params;
  const { variationId, quantity } = req.body;
  const result = await CartServices.updateQuantity(
    cartId,
    variationId,
    quantity,
  );
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Cart item quantity updated successfully',
    data: result,
  });
});

// delete cart items
const deleteCartItemController = catchAsync(
  async (req: Request, res: Response) => {
    const user = req.user?.authId || req.user?.id;
    const { id } = req.params;
    const result = await CartServices.deleteCartItem(user, id);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Cart item deleted successfully',
      data: result,
    });
  },
);
const clearCartAfterPayment = catchAsync(
  async (req: Request, res: Response) => {
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
