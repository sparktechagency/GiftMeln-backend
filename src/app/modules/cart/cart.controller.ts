import { Request, Response, NextFunction } from 'express';
import { CartServices } from './cart.service';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';


//create cart constructor
const createCart = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { user, variations } = req.body;

    // Ensure that the user and variations are provided in the request body
    if (!user || !variations || variations.length === 0) {
        return sendResponse(res, {
            success: false,
            statusCode: StatusCodes.BAD_REQUEST,
            message: 'User and at least one product variation are required',
            data: {},
        });
    }

    // Call service to create cart
    const result = await CartServices.createCartServiceIntoDB({ user, variations });

    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Cart created successfully',
        data: result,
    });
});



// get all cart items
const getAllCartItems = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user.id;

    const result = await CartServices.getAllCart(userId);

    sendResponse(res, {
        success: true,
        Total: result.length,
        statusCode: StatusCodes.OK,
        message: 'User cart items retrieved successfully',
        data: result,
    });
});


// update cart items quantity
const updateCartItemsQuantity = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user.id; // User ID from auth middleware
    const { quantity } = req.body;

    // Validate request body
    if (quantity === undefined) {
        return sendResponse(res, {
            success: false,
            statusCode: StatusCodes.BAD_REQUEST,
            message: 'Quantity is required',
            data: {},
        });
    }
    console.log("Quantity updated ======>>>>", quantity);
    // Call service function to update the cart
    const result = await CartServices.updateCartQuantity(userId, quantity);

    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Cart quantity updated successfully',
        data: result,
    });
});




export const CartController = {
    createCart,
    getAllCartItems,
    updateCartItemsQuantity
};
